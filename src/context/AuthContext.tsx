import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole, Shop } from '../types/database.types.ts';
import { getSupabaseClient } from '../lib/supabase.ts';
import { getProfiles, updateProfile, getShopByUserId, createShop } from '../lib/api.ts';
import { DEMO_PROFILES, INITIAL_SHOPS } from '../data/initialData.ts';

interface AuthContextType {
  user: Profile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSeller: boolean;
  sellerShop: Shop | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerSeller: (data: {
    fullName: string;
    email: string;
    password: string;
    shopName: string;
    shopDescription: string;
    phone: string;
    city: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loginAsDemoCustomer: () => void;
  loginAsDemoSeller1: () => void;
  loginAsDemoSeller2: () => void;
  loginAsDemoAdmin: () => void;
  updateUser: (updates: Partial<Profile>) => Promise<boolean>;
  refreshSellerShop: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_AUTH_KEY = 'mela_current_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [sellerShop, setSellerShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchShopForUser = async (userId: string) => {
    const shop = await getShopByUserId(userId);
    setSellerShop(shop);
  };

  useEffect(() => {
    async function loadUser() {
      setIsLoading(true);
      const savedUser = localStorage.getItem(LOCAL_AUTH_KEY);
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser) as Profile;
          setUser(parsed);
          if (parsed.role === 'seller') {
            await fetchShopForUser(parsed.id);
          }
        } catch (e) {
          localStorage.removeItem(LOCAL_AUTH_KEY);
        }
      } else {
        // Default to demo customer for immediate shopping, or allow switching
        setUser(DEMO_PROFILES[0]);
        localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(DEMO_PROFILES[0]));
      }

      setIsLoading(false);
    }

    loadUser();
  }, []);

  const refreshSellerShop = async () => {
    if (user && user.role === 'seller') {
      await fetchShopForUser(user.id);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const supabase = getSupabaseClient();

    // 1. Try real Supabase Auth if connected
    if (supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (authError && !authError.message.includes('Failed to fetch')) {
          console.warn('Supabase Auth sign-in message:', authError.message);
          // If explicitly wrong credentials on Supabase, alert the user unless demo profile exists
          const localProfiles = await getProfiles();
          const match = localProfiles.find((p) => p.email.toLowerCase() === cleanEmail);
          if (!match) {
            return { success: false, error: authError.message };
          }
        } else if (!authError && authData.user) {
          // Fetch user profile from Supabase
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (profileData) {
            setUser(profileData as Profile);
            localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(profileData));
            if (profileData.role === 'seller') {
              await fetchShopForUser(profileData.id);
            } else {
              setSellerShop(null);
            }
            return { success: true };
          }
        }
      } catch (err: any) {
        console.warn('Supabase auth exception:', err);
      }
    }

    // 2. High-performance persistent profile resolution
    const profiles = await getProfiles();
    const existing = profiles.find((p) => p.email.toLowerCase() === cleanEmail);

    if (existing) {
      setUser(existing);
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(existing));
      if (existing.role === 'seller') {
        await fetchShopForUser(existing.id);
      } else {
        setSellerShop(null);
      }
      return { success: true };
    }

    // If account not found in database or demo records
    const isAdm = cleanEmail.includes('admin');
    const isSel = cleanEmail.includes('seller') || cleanEmail.includes('vendor');
    const role: UserRole = isAdm ? 'admin' : isSel ? 'seller' : 'customer';

    const newProfile: Profile = {
      id: 'usr-' + Math.random().toString(36).substring(2, 9),
      email: cleanEmail,
      full_name: cleanEmail.split('@')[0],
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setUser(newProfile);
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(newProfile));
    return { success: true };
  };

  const register = async (fullName: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    // Prevent duplicate accounts
    const profiles = await getProfiles();
    if (profiles.some((p) => p.email.toLowerCase() === cleanEmail)) {
      return {
        success: false,
        error: 'An account with this email address already exists. Please log in instead.',
      };
    }

    let userId = 'usr-' + Math.random().toString(36).substring(2, 9);
    const supabase = getSupabaseClient();

    // Try Supabase Auth Registration
    if (supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { full_name: fullName, role: 'customer' },
          },
        });

        if (authError) {
          if (!authError.message.includes('Failed to fetch')) {
            return { success: false, error: authError.message };
          }
        } else if (authData.user) {
          userId = authData.user.id;
        }
      } catch (err: any) {
        console.warn('Supabase sign up warning:', err);
      }
    }

    const newProfile: Profile = {
      id: userId,
      email: cleanEmail,
      full_name: fullName,
      role: 'customer',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (supabase) {
      try {
        await supabase.from('profiles').upsert([newProfile]);
      } catch (e) {
        // fallback
      }
    }

    const raw = localStorage.getItem('mela_market_profiles');
    const list: Profile[] = raw ? JSON.parse(raw) : DEMO_PROFILES;
    list.push(newProfile);
    localStorage.setItem('mela_market_profiles', JSON.stringify(list));

    setUser(newProfile);
    setSellerShop(null);
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(newProfile));
    return { success: true };
  };

  const registerSeller = async (data: {
    fullName: string;
    email: string;
    password: string;
    shopName: string;
    shopDescription: string;
    phone: string;
    city: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = data.email.trim().toLowerCase();

    // 1. Prevent duplicate email registration
    const existingProfiles = await getProfiles();
    if (existingProfiles.some((p) => p.email.toLowerCase() === cleanEmail)) {
      return {
        success: false,
        error: 'An account with this email address already exists. Please sign in or use a different email address.',
      };
    }

    let userId = 'usr-' + Math.random().toString(36).substring(2, 9);
    const supabase = getSupabaseClient();

    // 2. Real Supabase Auth Registration if configured
    if (supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: data.password,
          options: {
            data: {
              full_name: data.fullName,
              phone: data.phone,
              city: data.city,
              role: 'seller',
            },
          },
        });

        if (authError) {
          if (!authError.message.includes('Failed to fetch')) {
            return { success: false, error: authError.message };
          }
        } else if (authData.user) {
          userId = authData.user.id;
        }
      } catch (err: any) {
        console.warn('Supabase seller registration warning:', err);
      }
    }

    const newProfile: Profile = {
      id: userId,
      email: cleanEmail,
      full_name: data.fullName,
      phone: data.phone,
      city: data.city,
      role: 'seller',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save profile to Supabase if connected
    if (supabase) {
      try {
        await supabase.from('profiles').upsert([newProfile]);
      } catch (e) {
        console.warn('Failed to upsert profile in Supabase:', e);
      }
    }

    // Save profile to local storage database
    const rawProfiles = localStorage.getItem('mela_market_profiles');
    const profileList: Profile[] = rawProfiles ? JSON.parse(rawProfiles) : DEMO_PROFILES;
    profileList.push(newProfile);
    localStorage.setItem('mela_market_profiles', JSON.stringify(profileList));

    setUser(newProfile);
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(newProfile));

    // 3. Create the vendor's shop in PostgreSQL / local store
    const slug = data.shopName
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const shop = await createShop({
      user_id: newProfile.id,
      name: data.shopName,
      slug: `${slug}-${Math.floor(Math.random() * 900 + 100)}`,
      description: data.shopDescription,
      logo_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=300&q=80',
      banner_url: 'https://images.unsplash.com/photo-1473187983305-f615310e7daa?auto=format&fit=crop&w=1200&q=80',
      phone: data.phone,
      email: cleanEmail,
      city: data.city,
      status: 'approved', // Auto-approved for seamless on-boarding & testing
    });

    setSellerShop(shop);
    return { success: true };
  };

  const logout = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        // Safe fallback
      }
    }
    setUser(null);
    setSellerShop(null);
    localStorage.removeItem(LOCAL_AUTH_KEY);
  };

  const loginAsDemoCustomer = () => {
    const customer = DEMO_PROFILES[0];
    setUser(customer);
    setSellerShop(null);
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(customer));
  };

  const loginAsDemoSeller1 = () => {
    const seller = DEMO_PROFILES[1]; // Abebe Kebede
    setUser(seller);
    const shop = INITIAL_SHOPS[0];
    setSellerShop(shop);
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(seller));
  };

  const loginAsDemoSeller2 = () => {
    const seller = DEMO_PROFILES[2]; // Almaz Desta
    setUser(seller);
    const shop = INITIAL_SHOPS[1];
    setSellerShop(shop);
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(seller));
  };

  const loginAsDemoAdmin = () => {
    const admin = DEMO_PROFILES[3]; // Marcus Vance
    setUser(admin);
    setSellerShop(null);
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(admin));
  };

  const updateUser = async (updates: Partial<Profile>): Promise<boolean> => {
    if (!user) return false;
    const updated = await updateProfile(user.id, updates);
    if (updated) {
      setUser(updated);
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(updated));
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isSeller: user?.role === 'seller',
        sellerShop,
        isLoading,
        login,
        register,
        registerSeller,
        logout,
        loginAsDemoCustomer,
        loginAsDemoSeller1,
        loginAsDemoSeller2,
        loginAsDemoAdmin,
        updateUser,
        refreshSellerShop,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

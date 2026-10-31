import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole, Shop } from '../types/database.types.ts';
import { getSupabaseClient } from '../lib/supabase.ts';
import { getProfiles, updateProfile, getShopByUserId, createShop } from '../lib/api.ts';

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
  updateUser: (updates: Partial<Profile>) => Promise<boolean>;
  refreshSellerShop: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_AUTH_KEY = 'mela_current_user';
const STORAGE_CREDENTIALS = 'mela_market_auth_credentials';
const STORAGE_PROFILES = 'mela_market_profiles';

interface StoredCredential {
  email: string;
  passwordHash: string;
  userId: string;
  role: UserRole;
}

// Secure client-side password hashing
async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password + ':mela_marketplace_secure_salt_2026');
  const hashBuf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Initialize default administrator credentials if none exist
async function ensureAdminCredentials() {
  if (typeof window === 'undefined') return;
  const rawCreds = localStorage.getItem(STORAGE_CREDENTIALS);
  let creds: Record<string, StoredCredential> = rawCreds ? JSON.parse(rawCreds) : {};

  if (!creds['admin@melamarket.et']) {
    const adminHash = await hashPassword('Admin@2026!');
    const adminId = 'usr-admin-master';
    creds['admin@melamarket.et'] = {
      email: 'admin@melamarket.et',
      passwordHash: adminHash,
      userId: adminId,
      role: 'admin',
    };
    localStorage.setItem(STORAGE_CREDENTIALS, JSON.stringify(creds));

    // Ensure admin profile exists in profiles table
    const rawProfiles = localStorage.getItem(STORAGE_PROFILES);
    const profiles: Profile[] = rawProfiles ? JSON.parse(rawProfiles) : [];
    if (!profiles.some((p) => p.email === 'admin@melamarket.et')) {
      profiles.push({
        id: adminId,
        email: 'admin@melamarket.et',
        full_name: 'System Administrator (ስርዓት አስተዳዳሪ)',
        role: 'admin',
        city: 'Addis Ababa (አዲስ አበባ)',
        created_at: new Date('2026-01-01').toISOString(),
        updated_at: new Date('2026-01-01').toISOString(),
      });
      localStorage.setItem(STORAGE_PROFILES, JSON.stringify(profiles));
    }
  }
}

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
      await ensureAdminCredentials();

      const savedUser = localStorage.getItem(LOCAL_AUTH_KEY);
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser) as Profile;
          // Verify that this profile actually exists in database
          const allProfiles = await getProfiles();
          const verified = allProfiles.find((p) => p.id === parsed.id && p.email === parsed.email);
          if (verified) {
            setUser(verified);
            if (verified.role === 'seller') {
              await fetchShopForUser(verified.id);
            } else {
              setSellerShop(null);
            }
          } else {
            // Invalid or deleted profile
            localStorage.removeItem(LOCAL_AUTH_KEY);
            setUser(null);
            setSellerShop(null);
          }
        } catch (e) {
          localStorage.removeItem(LOCAL_AUTH_KEY);
          setUser(null);
          setSellerShop(null);
        }
      } else {
        // Public visitor - NEVER auto-login as any demo user!
        setUser(null);
        setSellerShop(null);
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
    if (!cleanEmail || !password) {
      return { success: false, error: 'Please enter both email and password.' };
    }

    const supabase = getSupabaseClient();

    // 1. Try real Supabase Auth if connected
    if (supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (!authError && authData.user) {
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
        } else if (authError && !authError.message.includes('Failed to fetch')) {
          // If Supabase returned an explicit auth error, continue to verify local credentials before failing
        }
      } catch (err: any) {
        console.warn('Supabase auth exception:', err);
      }
    }

    // 2. Verified Local Database Credentials check
    const rawCreds = localStorage.getItem(STORAGE_CREDENTIALS);
    const creds: Record<string, StoredCredential> = rawCreds ? JSON.parse(rawCreds) : {};
    const inputHash = await hashPassword(password);

    const userCred = creds[cleanEmail];
    if (!userCred || userCred.passwordHash !== inputHash) {
      return {
        success: false,
        error: 'የተሳሳተ ኢሜይል ወይም የይለፍ ቃል (Invalid email or password). Please check your credentials or register a new account.',
      };
    }

    // Load profile associated with verified credential
    const profiles = await getProfiles();
    const matchedProfile = profiles.find((p) => p.id === userCred.userId || p.email.toLowerCase() === cleanEmail);

    if (!matchedProfile) {
      return {
        success: false,
        error: 'User profile record not found. Please register a new account.',
      };
    }

    setUser(matchedProfile);
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(matchedProfile));

    if (matchedProfile.role === 'seller') {
      await fetchShopForUser(matchedProfile.id);
    } else {
      setSellerShop(null);
    }

    return { success: true };
  };

  const register = async (fullName: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    if (!cleanName || cleanName.length < 2) {
      return { success: false, error: 'Please enter your full name.' };
    }
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    // Prevent duplicate accounts
    const profiles = await getProfiles();
    if (profiles.some((p) => p.email.toLowerCase() === cleanEmail)) {
      return {
        success: false,
        error: 'ይህ ኢሜይል አስቀድሞ ተመዝግቧል (An account with this email address already exists). Please log in instead.',
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
            data: { full_name: cleanName, role: 'customer' },
          },
        });

        if (authError && !authError.message.includes('Failed to fetch')) {
          return { success: false, error: authError.message };
        } else if (authData?.user) {
          userId = authData.user.id;
        }
      } catch (err: any) {
        console.warn('Supabase sign up warning:', err);
      }
    }

    const newProfile: Profile = {
      id: userId,
      email: cleanEmail,
      full_name: cleanName,
      role: 'customer',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (supabase) {
      try {
        await supabase.from('profiles').upsert([newProfile]);
      } catch (e) {
        // Safe fallback
      }
    }

    // Save profile to database
    const raw = localStorage.getItem(STORAGE_PROFILES);
    const list: Profile[] = raw ? JSON.parse(raw) : [];
    list.push(newProfile);
    localStorage.setItem(STORAGE_PROFILES, JSON.stringify(list));

    // Store verified credentials
    const passwordHash = await hashPassword(password);
    const rawCreds = localStorage.getItem(STORAGE_CREDENTIALS);
    const creds: Record<string, StoredCredential> = rawCreds ? JSON.parse(rawCreds) : {};
    creds[cleanEmail] = {
      email: cleanEmail,
      passwordHash,
      userId,
      role: 'customer',
    };
    localStorage.setItem(STORAGE_CREDENTIALS, JSON.stringify(creds));

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
    const cleanName = data.fullName.trim();
    const cleanShopName = data.shopName.trim();

    if (!cleanName || cleanName.length < 2) {
      return { success: false, error: 'Full name is required.' };
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'A valid email address is required.' };
    }
    if (!data.password || data.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }
    if (!cleanShopName || cleanShopName.length < 2) {
      return { success: false, error: 'Store / Shop name is required.' };
    }
    if (!data.phone || data.phone.length < 5) {
      return { success: false, error: 'Phone number is required.' };
    }
    if (!data.city || data.city.length < 2) {
      return { success: false, error: 'City is required.' };
    }

    // 1. Prevent duplicate email registration
    const existingProfiles = await getProfiles();
    if (existingProfiles.some((p) => p.email.toLowerCase() === cleanEmail)) {
      return {
        success: false,
        error: 'ይህ ኢሜይል አስቀድሞ ተመዝግቧል (An account with this email address already exists). Please sign in.',
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
              full_name: cleanName,
              phone: data.phone,
              city: data.city,
              role: 'seller',
            },
          },
        });

        if (authError && !authError.message.includes('Failed to fetch')) {
          return { success: false, error: authError.message };
        } else if (authData?.user) {
          userId = authData.user.id;
        }
      } catch (err: any) {
        console.warn('Supabase seller registration warning:', err);
      }
    }

    const newProfile: Profile = {
      id: userId,
      email: cleanEmail,
      full_name: cleanName,
      phone: data.phone,
      city: data.city,
      role: 'seller',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (supabase) {
      try {
        await supabase.from('profiles').upsert([newProfile]);
      } catch (e) {
        console.warn('Failed to upsert profile in Supabase:', e);
      }
    }

    // Save profile to database
    const rawProfiles = localStorage.getItem(STORAGE_PROFILES);
    const profileList: Profile[] = rawProfiles ? JSON.parse(rawProfiles) : [];
    profileList.push(newProfile);
    localStorage.setItem(STORAGE_PROFILES, JSON.stringify(profileList));

    // Store verified seller credentials
    const passwordHash = await hashPassword(data.password);
    const rawCreds = localStorage.getItem(STORAGE_CREDENTIALS);
    const creds: Record<string, StoredCredential> = rawCreds ? JSON.parse(rawCreds) : {};
    creds[cleanEmail] = {
      email: cleanEmail,
      passwordHash,
      userId,
      role: 'seller',
    };
    localStorage.setItem(STORAGE_CREDENTIALS, JSON.stringify(creds));

    setUser(newProfile);
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(newProfile));

    // 3. Create the vendor's shop in PostgreSQL / local store
    const slug = cleanShopName
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const shop = await createShop({
      user_id: newProfile.id,
      name: cleanShopName,
      slug: `${slug}-${Math.floor(Math.random() * 900 + 100)}`,
      description: data.shopDescription || `${cleanShopName} on MELA MARKET`,
      logo_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=300&q=80',
      banner_url: 'https://images.unsplash.com/photo-1473187983305-f615310e7daa?auto=format&fit=crop&w=1200&q=80',
      phone: data.phone,
      email: cleanEmail,
      city: data.city,
      status: 'approved',
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

  const updateUser = async (updates: Partial<Profile>): Promise<boolean> => {
    if (!user) return false;
    // Security check: users cannot self-escalate role
    const sanitizedUpdates = { ...updates };
    delete sanitizedUpdates.role;

    const updated = await updateProfile(user.id, sanitizedUpdates);
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

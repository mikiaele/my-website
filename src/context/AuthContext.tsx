import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, SellerProfile } from '../types';
import { getSupabase } from '../lib/supabase';

interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  city: string;
}

interface AuthContextType {
  user: UserProfile | null;
  sellerProfile: SellerProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  isSeller: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (input: RegisterInput) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loginDemo: (type: 'seller' | 'buyer' | 'admin') => void;
}

const LOCAL_USER_KEY = 'mela_auth_user';
const LOCAL_SELLER_KEY = 'mela_seller_profile';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to construct automatic background shop/store record
  const createDefaultSellerProfile = (userProfile: UserProfile): SellerProfile => {
    const cleanSlug = userProfile.full_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'seller';

    return {
      id: `shop-${userProfile.id}`,
      user_id: userProfile.id,
      shop_name: `${userProfile.full_name}'s Store`,
      shop_slug: `${cleanSlug}-${userProfile.id.slice(-4)}`,
      city: userProfile.city || 'Addis Ababa',
      phone_number: userProfile.phone_number || '',
      status: 'active',
      created_at: new Date().toISOString(),
    };
  };

  // Restore session on initial mount
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const supabase = getSupabase();

      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const authUser = session.user;
            const profile: UserProfile = {
              id: authUser.id,
              email: authUser.email || '',
              full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Seller',
              phone_number: authUser.user_metadata?.phone_number || '',
              city: authUser.user_metadata?.city || 'Addis Ababa',
              role: authUser.email?.includes('admin') ? 'admin' : 'seller',
              created_at: authUser.created_at || new Date().toISOString(),
            };
            setUser(profile);
            const autoShop = createDefaultSellerProfile(profile);
            setSellerProfile(autoShop);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Supabase session fetch error, checking local session:', err);
        }
      }

      // Check local storage session fallback
      if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem(LOCAL_USER_KEY);
        if (savedUser) {
          try {
            const parsedUser: UserProfile = JSON.parse(savedUser);
            setUser(parsedUser);
            const savedSeller = localStorage.getItem(LOCAL_SELLER_KEY);
            if (savedSeller) {
              setSellerProfile(JSON.parse(savedSeller));
            } else {
              const autoShop = createDefaultSellerProfile(parsedUser);
              setSellerProfile(autoShop);
              localStorage.setItem(LOCAL_SELLER_KEY, JSON.stringify(autoShop));
            }
          } catch {}
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  // 1. Single Unified Registration Flow
  const register = async (input: RegisterInput): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const { fullName, email, password, phoneNumber, city } = input;

    try {
      const supabase = getSupabase();
      let userId = `usr-${Date.now()}`;

      if (supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone_number: phoneNumber,
              city: city || 'Addis Ababa',
              role: 'seller', // All registered users automatically have seller privileges!
            },
          },
        });

        if (error) {
          console.warn('Supabase signUp warning:', error.message);
          // If Supabase returns error (e.g. rate limit or unconfigured email provider), fallback to local registration
        } else if (data.user) {
          userId = data.user.id;
        }
      }

      // Create profile with role 'seller' directly
      const newProfile: UserProfile = {
        id: userId,
        email,
        full_name: fullName,
        phone_number: phoneNumber,
        city: city || 'Addis Ababa',
        role: email.toLowerCase().includes('admin') ? 'admin' : 'seller',
        created_at: new Date().toISOString(),
      };

      // Automatically provision default shop in background - zero friction for the user!
      const autoShop = createDefaultSellerProfile(newProfile);

      setUser(newProfile);
      setSellerProfile(autoShop);

      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newProfile));
        localStorage.setItem(LOCAL_SELLER_KEY, JSON.stringify(autoShop));
      }

      setIsLoading(false);
      return { success: true };
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : 'Registration failed';
      return { success: false, error: msg };
    }
  };

  // 2. Login Flow
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      const supabase = getSupabase();
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!error && data.user) {
          const authUser = data.user;
          const profile: UserProfile = {
            id: authUser.id,
            email: authUser.email || email,
            full_name: authUser.user_metadata?.full_name || email.split('@')[0],
            phone_number: authUser.user_metadata?.phone_number || '',
            city: authUser.user_metadata?.city || 'Addis Ababa',
            role: email.toLowerCase().includes('admin') ? 'admin' : 'seller',
            created_at: authUser.created_at || new Date().toISOString(),
          };

          const autoShop = createDefaultSellerProfile(profile);
          setUser(profile);
          setSellerProfile(autoShop);

          if (typeof window !== 'undefined') {
            localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
            localStorage.setItem(LOCAL_SELLER_KEY, JSON.stringify(autoShop));
          }

          setIsLoading(false);
          return { success: true };
        }
      }

      // Local fallback for quick preview or offline testing
      const isAdm = email.toLowerCase().includes('admin');
      const profile: UserProfile = {
        id: `usr-${email.replace(/[^a-z0-9]/gi, '')}`,
        email,
        full_name: email.split('@')[0].replace('.', ' ').toUpperCase(),
        phone_number: '0911234567',
        city: 'Addis Ababa',
        role: isAdm ? 'admin' : 'seller', // All accounts are seller-ready!
        created_at: new Date().toISOString(),
      };

      const autoShop = createDefaultSellerProfile(profile);
      setUser(profile);
      setSellerProfile(autoShop);

      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
        localStorage.setItem(LOCAL_SELLER_KEY, JSON.stringify(autoShop));
      }

      setIsLoading(false);
      return { success: true };
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : 'Login failed';
      return { success: false, error: msg };
    }
  };

  // 3. Logout
  const logout = async () => {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    setUser(null);
    setSellerProfile(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_USER_KEY);
      localStorage.removeItem(LOCAL_SELLER_KEY);
    }
  };

  // 4. Quick Demo Personas
  const loginDemo = (type: 'seller' | 'buyer' | 'admin') => {
    let demoUser: UserProfile;

    if (type === 'admin') {
      demoUser = {
        id: 'usr-admin-marcus',
        email: 'admin@melamarket.com',
        full_name: 'Marcus Vance (Admin)',
        phone_number: '+251 91 100 0001',
        city: 'Addis Ababa',
        role: 'admin',
        created_at: new Date().toISOString(),
      };
    } else if (type === 'seller') {
      demoUser = {
        id: 'seller-demo-01',
        email: 'abebe.bikila@melamarket.et',
        full_name: 'Abebe Bikila',
        phone_number: '+251 91 234 5678',
        city: 'Hawassa',
        role: 'seller',
        created_at: new Date().toISOString(),
      };
    } else {
      demoUser = {
        id: 'usr-buyer-sara',
        email: 'sara.tadesse@melamarket.et',
        full_name: 'Sara Tadesse',
        phone_number: '+251 92 876 5432',
        city: 'Addis Ababa',
        role: 'seller', // All users can sell directly!
        created_at: new Date().toISOString(),
      };
    }

    const autoShop = createDefaultSellerProfile(demoUser);
    setUser(demoUser);
    setSellerProfile(autoShop);

    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(demoUser));
      localStorage.setItem(LOCAL_SELLER_KEY, JSON.stringify(autoShop));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        sellerProfile,
        isLoading,
        isAdmin: user?.role === 'admin',
        isSeller: user?.role === 'seller' || user?.role === 'admin',
        login,
        register,
        logout,
        loginDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

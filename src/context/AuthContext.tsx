import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  clearCurrentStoredUser,
  getCurrentStoredUser,
  isSupabaseConfigured,
  loginUser,
  registerUser,
  RegisterParams,
  supabase,
} from '../lib/supabase';
import { Profile, Shop } from '../types';

interface AuthContextType {
  user: Profile | null;
  shop: Shop | null;
  loading: boolean;
  isSeller: boolean;
  isAdmin: boolean;
  signUp: (params: RegisterParams) => Promise<void>;
  signIn: (email: string, password?: string) => Promise<void>;
  signOut: () => Promise<void>;
  switchDemoRole?: (role: 'seller' | 'admin' | 'customer') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize session
  useEffect(() => {
    async function initSession() {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            if (profile) {
              setUser(profile as Profile);
              const { data: userShop } = await supabase
                .from('shops')
                .select('*')
                .or(`user_id.eq.${session.user.id},seller_id.eq.${session.user.id}`)
                .maybeSingle();
              setShop(userShop as Shop | null);
            }
          }
        } else {
          // Local/development storage restore
          const stored = getCurrentStoredUser();
          if (stored) {
            setUser(stored);
          }
        }
      } catch (err) {
        console.error('Session initialization error:', err);
      } finally {
        setLoading(false);
      }
    }

    initSession();
  }, []);

  // Simplified Single Registration
  const signUp = async (params: RegisterParams) => {
    setLoading(true);
    try {
      const { profile, shop: newShop } = await registerUser(params);
      setUser(profile);
      setShop(newShop);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password?: string) => {
    setLoading(true);
    try {
      const { profile, shop: userShop } = await loginUser(email, password);
      setUser(profile);
      setShop(userShop);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
      clearCurrentStoredUser();
      setUser(null);
      setShop(null);
    } finally {
      setLoading(false);
    }
  };

  // Demo role toggle for testing purposes
  const switchDemoRole = (newRole: 'seller' | 'admin' | 'customer') => {
    if (user) {
      const updated: Profile = { ...user, role: newRole };
      setUser(updated);
      try {
        localStorage.setItem('mela_current_user_v1', JSON.stringify(updated));
      } catch {}
    }
  };

  // Every registered user can immediately sell products directly (no separate shop registration)
  const isSeller = Boolean(user);
  const isAdmin = Boolean(user && user.role === 'admin');

  return (
    <AuthContext.Provider
      value={{
        user,
        shop,
        loading,
        isSeller,
        isAdmin,
        signUp,
        signIn,
        signOut,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

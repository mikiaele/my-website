import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Language } from '../types';
import { translations, Translations } from '../translations';

interface AuthContextType {
  user: User | null;
  token: string | null;
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  isSellModalOpen: boolean;
  openSellModal: () => void;
  closeSellModal: () => void;
  isAdminModalOpen: boolean;
  openAdminModal: () => void;
  closeAdminModal: () => void;
  activeFilter: {
    category: string;
    region: string;
    search: string;
    condition: 'all' | 'new' | 'used';
  };
  setActiveFilter: React.Dispatch<React.SetStateAction<{
    category: string;
    region: string;
    search: string;
    condition: 'all' | 'new' | 'used';
  }>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [language, setLanguageState] = useState<Language>('am'); // Default to Amharic as required
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<{
    category: string;
    region: string;
    search: string;
    condition: 'all' | 'new' | 'used';
  }>({
    category: 'all',
    region: 'all',
    search: '',
    condition: 'all',
  });

  // Load language and auth session on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('mela_language') as Language;
    if (savedLang && (savedLang === 'am' || savedLang === 'en' || savedLang === 'ti')) {
      setLanguageState(savedLang);
    }

    const normalizeUser = (u: any): User => {
      if (!u) return u;
      const name = u.fullName || u.full_name || u.email || 'User';
      const photo = u.profilePhoto || u.profile_photo || '';
      return {
        ...u,
        fullName: name,
        full_name: name,
        profilePhoto: photo,
        profile_photo: photo,
      };
    };

    const savedToken = localStorage.getItem('mela_token');
    const savedUser = localStorage.getItem('mela_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        const parsed = JSON.parse(savedUser);
        setUser(normalizeUser(parsed));
        // Verify token with backend
        fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${savedToken}` },
        })
          .then(res => {
            if (res.ok) return res.json();
            throw new Error('Session expired');
          })
          .then(data => {
            if (data.user) {
              const normalized = normalizeUser(data.user);
              setUser(normalized);
              localStorage.setItem('mela_user', JSON.stringify(normalized));
            }
          })
          .catch(() => {
            // Clear invalid session
            logout();
          });
      } catch (err) {
        logout();
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('mela_language', lang);
    document.documentElement.lang = lang;
  };

  const login = (newToken: string, newUser: User) => {
    const normalized: User = {
      ...newUser,
      fullName: newUser.fullName || (newUser as any).full_name || newUser.email || 'User',
      profilePhoto: newUser.profilePhoto || (newUser as any).profile_photo || '',
    };
    setToken(newToken);
    setUser(normalized);
    localStorage.setItem('mela_token', newToken);
    localStorage.setItem('mela_user', JSON.stringify(normalized));
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('mela_token');
    localStorage.removeItem('mela_user');
    setIsAdminModalOpen(false);
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  const openSellModal = () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    setIsSellModalOpen(true);
  };

  const closeSellModal = () => setIsSellModalOpen(false);

  const openAdminModal = () => {
    if (user?.role === 'admin') {
      setIsAdminModalOpen(true);
    }
  };

  const closeAdminModal = () => setIsAdminModalOpen(false);

  const t = translations[language] || translations.am;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        language,
        t,
        setLanguage,
        login,
        logout,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        isSellModalOpen,
        openSellModal,
        closeSellModal,
        isAdminModalOpen,
        openAdminModal,
        closeAdminModal,
        activeFilter,
        setActiveFilter,
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

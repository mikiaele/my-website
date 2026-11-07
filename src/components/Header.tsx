import React, { useState } from 'react';
import { PlusCircle, User as UserIcon, LogOut, ShieldCheck, ChevronDown, Store, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Language } from '../types';

interface HeaderProps {
  onNavigateHome: () => void;
  onFilterCondition?: (condition: 'all' | 'new' | 'used') => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigateHome, onFilterCondition }) => {
  const {
    user,
    logout,
    language,
    setLanguage,
    t,
    openAuthModal,
    openSellModal,
    openAdminModal,
  } = useAuth();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const languages: { code: Language; label: string; short: string }[] = [
    { code: 'am', label: 'አማርኛ (Amharic)', short: 'አማ' },
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'ti', label: 'ትግርኛ (Tigrinya)', short: 'ትግ' },
  ];

  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      {/* Top Utility Strip: Support Contact & Language */}
      <div className="bg-emerald-800 text-emerald-50 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-wide text-emerald-200">WhatsApp:</span>
            <a
              href="https://wa.me/251911000000?text=Hello%20Mela%20Market%20Support%20@brmiki21"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-medium hover:underline flex items-center gap-1"
            >
              @brmiki21
            </a>
            <span className="hidden sm:inline text-emerald-300/80">· {t.officialSupportDesc}</span>
          </div>

          {/* Compact Header Language Selector */}
          <div className="relative">
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-900/60 hover:bg-emerald-900 text-emerald-100 text-xs font-medium transition-colors cursor-pointer border border-emerald-700/50"
              aria-label="Select language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-300" />
              <span>{currentLang.short}</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {isLangMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsLangMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1 w-36 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 py-1 z-20">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-emerald-50 transition-colors cursor-pointer ${
                        language === lang.code ? 'font-bold text-emerald-700 bg-emerald-50/50' : 'text-slate-700'
                      }`}
                    >
                      <span>{lang.label}</span>
                      {language === lang.code && <span className="text-emerald-600 font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:bg-emerald-700 transition-colors">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-emerald-900 tracking-tight">
                MELA
              </span>
              <span className="text-xl font-bold text-emerald-600">
                MARKET
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-500 block -mt-1">
              {language === 'am' ? 'መላ ማርኬት' : language === 'ti' ? 'መላ ማርኬት' : 'Ethiopian Marketplace'}
            </span>
          </div>
        </div>

        {/* Quick Section Nav (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => {
              onNavigateHome();
              if (onFilterCondition) onFilterCondition('all');
            }}
            className="hover:text-emerald-700 transition-colors cursor-pointer"
          >
            {t.allCategories}
          </button>
          <button
            onClick={() => {
              if (onFilterCondition) onFilterCondition('new');
              const el = document.getElementById('new-products-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-emerald-700 transition-colors cursor-pointer text-emerald-700 font-semibold"
          >
            {t.newProducts}
          </button>
          <button
            onClick={() => {
              if (onFilterCondition) onFilterCondition('used');
              const el = document.getElementById('used-products-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-emerald-700 transition-colors cursor-pointer"
          >
            {t.usedProducts}
          </button>
        </nav>

        {/* Actions Zone */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sell Product Button - Redirects to login if guest */}
          <button
            onClick={openSellModal}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition-all cursor-pointer whitespace-nowrap active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.sellProduct}</span>
          </button>

          {/* User Account / Auth */}
          {user ? (
            <div className="relative">
              {(() => {
                const displayName = user.fullName || (user as any).full_name || user.email || 'User';
                const firstName = (typeof displayName === 'string' && displayName.trim())
                  ? displayName.trim().split(' ')[0]
                  : 'User';
                const avatar = user.profilePhoto || (user as any).profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80';
                return (
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors cursor-pointer"
                  >
                    <img
                      src={avatar}
                      alt={displayName}
                      className="w-7 h-7 rounded-lg object-cover border border-emerald-600/30"
                    />
                    <span className="hidden sm:inline text-xs font-medium text-slate-800 max-w-[100px] truncate">
                      {firstName}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                );
              })()}

              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-20">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {user.fullName || (user as any).full_name || user.email}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user.phone}</p>
                    </div>

                    {/* ADMIN DASHBOARD: Displayed ONLY for authorized administrators, NEVER on public page */}
                    {user.role === 'admin' && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          openAdminModal();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-emerald-800 hover:bg-emerald-50 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>{t.adminDashboard}</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>{t.logout}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3 py-1.5 text-xs sm:text-sm font-medium text-emerald-900 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                {t.login}
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="px-3 py-1.5 text-xs sm:text-sm font-medium border border-emerald-600 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer hidden sm:inline-flex whitespace-nowrap"
              >
                {t.register}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

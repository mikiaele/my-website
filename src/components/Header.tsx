import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Language } from '../types';
import { Plus, User as UserIcon, Shield, LogOut, MessageCircle, ChevronDown, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenSellModal: () => void;
  onOpenAuthModal: (mode?: 'login' | 'register' | 'admin') => void;
  onNavigateSection: (section: 'all' | 'new' | 'used' | 'admin') => void;
  activeView: 'home' | 'admin';
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSellModal,
  onOpenAuthModal,
  onNavigateSection,
  activeView,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const languages: { code: Language; label: string; nativeName: string }[] = [
    { code: 'am', label: 'አማ', nativeName: 'አማርኛ' },
    { code: 'en', label: 'EN', nativeName: 'English' },
    { code: 'ti', label: 'ትግ', nativeName: 'ትግርኛ' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100/80 shadow-xs">
      {/* Top Banner Notice: Single Dedicated WhatsApp support */}
      <div className="bg-emerald-800 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-wide flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
              {t('siteName')} — {t('tagline')}
            </span>
          </div>

          {/* Official WhatsApp Contact - Only in this one clearly visible location */}
          <a
            href="https://wa.me/?text=Hello%20Mela%20Market%20Support"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-emerald-100 hover:text-white transition-colors bg-emerald-900/60 hover:bg-emerald-900 px-2.5 py-0.5 rounded-full font-medium"
            title="Official WhatsApp Support"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-300" />
            <span>{t('officialWhatsApp')}:</span>
            <span className="font-semibold text-white tracking-wide">{t('whatsappContact')}</span>
          </a>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark & Logo */}
        <div
          onClick={() => onNavigateSection('all')}
          className="cursor-pointer flex items-center gap-3 shrink-0 group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">
                {t('siteName')}
              </span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800">
                ET
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium tracking-tight block">
              Mela Market Ethiopia
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-700">
          <button
            onClick={() => onNavigateSection('all')}
            className={`whitespace-nowrap transition-colors hover:text-emerald-700 ${
              activeView === 'home' ? 'text-emerald-700 font-semibold' : ''
            }`}
          >
            {t('home')}
          </button>
          <button
            onClick={() => onNavigateSection('new')}
            className="whitespace-nowrap hover:text-emerald-700 transition-colors"
          >
            {t('newProducts')}
          </button>
          <button
            onClick={() => onNavigateSection('used')}
            className="whitespace-nowrap hover:text-emerald-700 transition-colors"
          >
            {t('usedProducts')}
          </button>
          {user?.role === 'admin' && (
            <button
              onClick={() => onNavigateSection('admin')}
              className={`flex items-center gap-1.5 whitespace-nowrap px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                activeView === 'admin'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              {t('adminDashboard')}
            </button>
          )}
        </nav>

        {/* Zone 3: Actions (Language Switcher, User Menu, Sell CTA) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setLangDropdownOpen(!langDropdownOpen);
                setUserDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors border border-slate-200"
              aria-label="Select language"
            >
              <span>{languages.find((l) => l.code === language)?.nativeName}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 transition-colors ${
                      language === l.code ? 'text-emerald-700 font-semibold bg-emerald-50/60' : 'text-slate-700'
                    }`}
                  >
                    <span>{l.nativeName}</span>
                    <span className="text-[10px] text-slate-400 font-mono uppercase">{l.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Account / Auth CTA */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setLangDropdownOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-xs font-medium text-slate-800 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px]">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate hidden sm:inline">{user.full_name}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900 truncate">{user.full_name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {user.role === 'admin' ? t('adminDashboard') : user.phone}
                    </span>
                  </div>

                  {user.role === 'admin' && (
                    <button
                      onClick={() => {
                        onNavigateSection('admin');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2"
                    >
                      <Shield className="w-3.5 h-3.5 text-emerald-600" />
                      {t('adminDashboard')}
                    </button>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {t('logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuthModal('login')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-colors whitespace-nowrap"
              >
                {t('login')}
              </button>
              <button
                onClick={() => onOpenAuthModal('register')}
                className="hidden sm:inline-flex px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200 whitespace-nowrap"
              >
                {t('register')}
              </button>
            </div>
          )}

          {/* Sell Product Primary Action Button */}
          <button
            onClick={onOpenSellModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-700/20 active:scale-95 transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{t('sellProduct')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

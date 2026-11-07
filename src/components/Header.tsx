import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Globe,
  PlusCircle,
  Shield,
  Store,
  LogOut,
  Menu,
  X,
  MessageCircle,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Language } from '../i18n/translations.ts';
import { buildAdminWhatsAppLink, DEFAULT_ADMIN_WHATSAPP } from '../lib/whatsapp.ts';

interface HeaderProps {
  onNavigate: (page: string, params?: any) => void;
  currentPage: string;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage, onOpenAuth }) => {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();

  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [adminWhatsApp, setAdminWhatsApp] = useState<string>(DEFAULT_ADMIN_WHATSAPP);

  // Fetch official administrator WhatsApp number or username
  useEffect(() => {
    fetch('/api/settings/public')
      .then((res) => res.json())
      .then((data) => {
        if (data.admin_whatsapp_number) {
          setAdminWhatsApp(data.admin_whatsapp_number);
        }
      })
      .catch((err) => console.error('Failed to load WhatsApp setting:', err));
  }, []);

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'am', label: 'Amharic', native: 'አማርኛ' },
    { code: 'en', label: 'English', native: 'English' },
    { code: 'ti', label: 'Tigrinya', native: 'ትግርኛ' },
  ];

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];

  const whatsAppLink = buildAdminWhatsAppLink(
    adminWhatsApp || DEFAULT_ADMIN_WHATSAPP,
    'ሰላም መላ ገበያ፣ ስለ እቃዎች መረጃ እፈልግ ነበር።'
  );

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md text-stone-900 border-b border-stone-200/90 shadow-2xs">
      {/* Main Single Ultra-Compact Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand / Logo */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-left group shrink-0"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-500 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition">
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="font-black text-base sm:text-lg tracking-tight text-stone-900 flex items-center gap-1.5 leading-none">
              <span>{t.appName}</span>
              <span className="text-emerald-800 text-[9px] font-extrabold bg-emerald-100 border border-emerald-300 px-1 py-0.2 rounded">
                ET
              </span>
            </div>
            <div className="text-[9px] sm:text-[10px] text-stone-500 font-semibold tracking-wider uppercase mt-0.5">
              Mela Market
            </div>
          </div>
        </button>

        {/* Desktop Quick Nav Links */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-stone-700">
          <button
            onClick={() => onNavigate('home')}
            className={`px-2.5 py-1.5 rounded-lg transition ${
              currentPage === 'home'
                ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                : 'hover:text-emerald-700 hover:bg-stone-100'
            }`}
          >
            {t.home}
          </button>

          <button
            onClick={() => onNavigate('browse')}
            className={`px-2.5 py-1.5 rounded-lg transition ${
              currentPage === 'browse'
                ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                : 'hover:text-emerald-700 hover:bg-stone-100'
            }`}
          >
            {t.browse}
          </button>

          <button
            onClick={() => onNavigate('browse', { condition: 'new' })}
            className="px-2.5 py-1.5 rounded-lg hover:text-emerald-700 hover:bg-stone-100 transition flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            {t.newProducts}
          </button>

          <button
            onClick={() => onNavigate('browse', { condition: 'used' })}
            className="px-2.5 py-1.5 rounded-lg hover:text-amber-700 hover:bg-stone-100 transition flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
            {t.usedProducts}
          </button>
        </nav>

        {/* Right Section: Official WhatsApp, Language, Post Item & Auth */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Official Administrator WhatsApp Link */}
          <a
            href={whatsAppLink}
            target="_blank"
            rel="noopener noreferrer"
            title="Official Admin WhatsApp (@brmiki21)"
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs transition shadow-2xs group"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600/30 group-hover:scale-110 transition" />
            <span className="hidden xl:inline text-[11px] font-semibold text-emerald-900">
              WhatsApp (@brmiki21)
            </span>
            <span className="hidden sm:inline xl:hidden text-[11px] font-semibold text-emerald-900">
              WhatsApp
            </span>
          </a>

          {/* Compact Language Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-1 text-stone-700 hover:text-stone-900 px-2 sm:px-2.5 py-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-xs font-semibold shadow-2xs transition"
              title="ቋንቋ ቀይር / Change Language"
            >
              <Globe className="w-3 h-3 text-emerald-600" />
              <span className="text-[11px]">{currentLangObj.native}</span>
              <ChevronDown className="w-2.5 h-2.5 text-stone-400" />
            </button>

            {isLangMenuOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-white border border-stone-200 rounded-xl shadow-xl py-1 z-50">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-stone-50 ${
                      language === l.code ? 'text-emerald-700 font-bold bg-emerald-50/60' : 'text-stone-700'
                    }`}
                  >
                    <span>{l.native}</span>
                    <span className="text-[10px] text-stone-400">{l.code.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add Product / Sell CTA */}
          <button
            onClick={() => {
              if (!user) {
                onOpenAuth('login');
              } else {
                onNavigate('seller-add-product');
              }
            }}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition active:scale-95 shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.addProduct}</span>
            <span className="sm:hidden">ሽጥ</span>
          </button>

          {/* User profile / Login */}
          {user ? (
            <div className="flex items-center gap-1 sm:gap-1.5">
              {user.role === 'admin' && (
                <button
                  onClick={() => onNavigate('admin-dashboard')}
                  className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition ${
                    currentPage.startsWith('admin')
                      ? 'bg-amber-500 text-stone-950 font-bold border-amber-600 shadow-2xs'
                      : 'bg-stone-50 hover:bg-stone-100 border-stone-300 text-amber-900'
                  }`}
                  title={t.adminDashboard}
                >
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden lg:inline text-[11px]">{t.adminDashboard}</span>
                </button>
              )}

              {(user.role === 'seller' || user.role === 'admin') && (
                <button
                  onClick={() => onNavigate('seller-dashboard')}
                  className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition ${
                    currentPage.startsWith('seller')
                      ? 'bg-emerald-600 text-white font-bold border-emerald-700 shadow-2xs'
                      : 'bg-stone-50 hover:bg-stone-100 border-stone-300 text-emerald-900'
                  }`}
                  title={t.sellerDashboard}
                >
                  <Store className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden lg:inline text-[11px]">{t.sellerDashboard}</span>
                </button>
              )}

              <button
                onClick={() => onNavigate('user-orders')}
                className="p-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs flex items-center gap-1 transition"
                title={t.myOrders}
              >
                <Clock className="w-3.5 h-3.5 text-stone-500" />
                <span className="hidden xl:inline text-[11px]">{t.myOrders}</span>
              </button>

              <button
                onClick={logout}
                className="p-1.5 rounded-lg bg-stone-50 hover:bg-red-50 hover:text-red-700 hover:border-red-300 border border-stone-200 text-stone-700 transition"
                title={t.logout}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition"
              >
                {t.login}
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white transition shadow-2xs"
              >
                {t.register}
              </button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100"
            aria-label="Toggle navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-stone-200 px-4 py-3 space-y-2.5">
          <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-stone-100">
            <button
              onClick={() => {
                onNavigate('home');
                setIsMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold"
            >
              {t.home}
            </button>
            <button
              onClick={() => {
                onNavigate('browse');
                setIsMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold"
            >
              {t.browse}
            </button>
            <button
              onClick={() => {
                onNavigate('browse', { condition: 'new' });
                setIsMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200"
            >
              {t.newProducts}
            </button>
            <button
              onClick={() => {
                onNavigate('browse', { condition: 'used' });
                setIsMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200"
            >
              {t.usedProducts}
            </button>
          </div>

          {/* Mobile WhatsApp Link */}
          <a
            href={whatsAppLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold text-xs"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600/30" />
            <span>ይፋዊ WhatsApp: @brmiki21</span>
          </a>

          {user && (
            <div className="pt-1 space-y-1.5">
              <div className="text-[11px] text-stone-500 px-1 font-bold uppercase">
                {user.name} ({user.role})
              </div>
              {user.role === 'admin' && (
                <button
                  onClick={() => {
                    onNavigate('admin-dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2"
                >
                  <Shield className="w-4 h-4 text-amber-600" />
                  {t.adminDashboard}
                </button>
              )}
              {(user.role === 'seller' || user.role === 'admin') && (
                <button
                  onClick={() => {
                    onNavigate('seller-dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2"
                >
                  <Store className="w-4 h-4 text-emerald-600" />
                  {t.sellerDashboard}
                </button>
              )}
              <button
                onClick={() => {
                  onNavigate('user-orders');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl bg-stone-50 text-stone-800 text-xs font-semibold flex items-center gap-2"
              >
                <Clock className="w-4 h-4 text-stone-500" />
                {t.myOrders}
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

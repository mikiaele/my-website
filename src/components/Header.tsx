import React, { useState } from 'react';
import {
  Phone,
  ShoppingCart,
  PlusCircle,
  Globe,
  MapPin,
  Store,
  Menu,
  X,
  User,
  Shield,
} from 'lucide-react';
import { Language } from '../types';
import { SUPPORT_PHONE } from '../data/mockData';
import { TRANSLATIONS } from '../data/translations';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  cartCount: number;
  onCartClick: () => void;
  onPostAdClick: () => void;
  onAuthClick: () => void;
  onAdminClick: () => void;
  isLoggedIn: boolean;
  userName?: string;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  cartCount,
  onCartClick,
  onPostAdClick,
  onAuthClick,
  onAdminClick,
  isLoggedIn,
  userName,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = TRANSLATIONS[language];

  const languages: { code: Language; label: string }[] = [
    { code: 'am', label: 'አማርኛ' },
    { code: 'ti', label: 'ትግርኛ' },
    { code: 'en', label: 'English' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs border-b border-slate-200">
      {/* Top micro-bar */}
      <div className="bg-emerald-900 text-white text-xs py-2 px-4 sm:px-6 lg:px-8 border-b border-emerald-950">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-emerald-200 font-medium">
              {t.siteTitle} – {t.tagline}
            </span>
            <div className="flex items-center gap-1.5 text-emerald-100">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.nationwideDelivery}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Quick Phone Clickable in Topbar */}
            <a
              href={`tel:${SUPPORT_PHONE}`}
              className="flex items-center gap-1.5 font-bold text-white hover:text-amber-300 transition-colors"
              title={`Call ${SUPPORT_PHONE}`}
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xs:inline">{SUPPORT_PHONE}</span>
            </a>

            {/* Desktop 3-Language Selector Buttons (Text only, NO flag icons) */}
            <div className="hidden sm:flex items-center bg-emerald-950/70 p-0.5 rounded-lg border border-emerald-700/60">
              <Globe className="w-3 h-3 text-emerald-300 ml-1.5 mr-1" />
              {languages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => onLanguageChange(l.code)}
                  className={`px-2 py-0.5 text-xs font-semibold rounded transition-all cursor-pointer ${
                    language === l.code
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                      : 'text-emerald-100 hover:text-white hover:bg-emerald-800/80'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Mobile language dropdown select (Text only, NO flag icons) */}
            <div className="sm:hidden flex items-center bg-emerald-950/80 rounded px-1.5 py-0.5 border border-emerald-700">
              <Globe className="w-3 h-3 text-emerald-300 mr-1" />
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value as Language)}
                className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
                aria-label="Language Selector"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code} className="bg-emerald-900 text-white">
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black text-xl shadow-xs group-hover:bg-emerald-600 transition-colors">
                <Store className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black tracking-tight text-emerald-800 flex items-center gap-1">
                  <span>{t.siteTitle}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    ET
                  </span>
                </div>
                <div className="text-[10px] sm:text-xs font-semibold text-slate-500 tracking-wider">
                  {t.tagline}
                </div>
              </div>
            </a>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct Call Button (Desktop) */}
            <a
              href={`tel:${SUPPORT_PHONE}`}
              className="hidden lg:inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold px-3 py-2 rounded-xl text-xs transition-all"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              <span>{SUPPORT_PHONE}</span>
            </a>

            {/* Admin Dashboard Button */}
            <button
              type="button"
              onClick={onAdminClick}
              className="hidden md:inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-emerald-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title={t.adminDashboard}
            >
              <Shield className="w-4 h-4 text-emerald-700" />
              <span>{t.adminDashboard}</span>
            </button>

            {/* Auth / Account Button */}
            {isLoggedIn ? (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 px-2.5 py-1.5 rounded-lg bg-slate-100 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                  {userName || t.myAccount}
                </span>
                <button
                  type="button"
                  onClick={onLogout}
                  className="text-xs font-medium text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                >
                  {t.logout}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onAuthClick}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-800 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <User className="w-4 h-4 text-slate-500" />
                <span>{t.login}</span>
              </button>
            )}

            {/* Post Ad Button */}
            <button
              type="button"
              onClick={onPostAdClick}
              className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span>{t.postFreeAd}</span>
            </button>

            {/* Cart Button */}
            <button
              type="button"
              onClick={onCartClick}
              className="relative p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
              aria-label={t.shoppingCart}
            >
              <ShoppingCart className="w-5 h-5 text-slate-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-xs font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile menu hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 sm:hidden rounded-lg bg-slate-100 text-slate-700 cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown panel */}
        {mobileMenuOpen && (
          <div className="sm:hidden pt-4 pb-3 border-t border-slate-200 mt-3 space-y-3">
            {/* Language Selection Buttons on Mobile */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Language / ቋንቋ
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      onLanguageChange(l.code);
                      setMobileMenuOpen(false);
                    }}
                    className={`py-2 text-xs font-bold rounded-lg border text-center transition-colors ${
                      language === l.code
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Navigation Links */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  onAdminClick();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-xl text-xs"
              >
                <Shield className="w-4 h-4 text-emerald-700" />
                <span>{t.adminDashboard}</span>
              </button>

              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-red-600 font-bold py-2.5 rounded-xl text-xs"
                >
                  <span>{t.logout}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onAuthClick();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-xl text-xs"
                >
                  <User className="w-4 h-4 text-slate-500" />
                  <span>{t.login}</span>
                </button>
              )}
            </div>

            <a
              href={`tel:${SUPPORT_PHONE}`}
              className="flex items-center justify-center gap-2 w-full bg-emerald-800 text-white font-bold py-2.5 rounded-xl text-xs shadow-xs"
            >
              <Phone className="w-3.5 h-3.5 text-amber-300" />
              <span>{SUPPORT_PHONE}</span>
            </a>
          </div>
        )}
      </div>
    </header>
  );
};

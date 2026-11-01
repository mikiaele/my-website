import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  ShoppingCart,
  User,
  Globe,
  PlusCircle,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Layers,
  Sparkles,
  PhoneCall,
  Store,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Category } from '../types';

interface NavbarProps {
  categories: Category[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (catId: string | null) => void;
  onOpenCategoriesModal: () => void;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
  onOpenSellerDashboard: () => void;
  onOpenAdminDashboard: () => void;
  onOpenOrdersModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  categories,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onOpenCategoriesModal,
  onOpenAuthModal,
  onOpenSellerDashboard,
  onOpenAdminDashboard,
  onOpenOrdersModal,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { user, isAdmin, isSeller, logout } = useAuth();
  const { totalItemsCount, setIsCartOpen } = useCart();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-emerald-100 shadow-xs">
      {/* 1. Top Bar */}
      <div className="bg-emerald-800 text-emerald-50 text-xs py-1.5 px-4 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 divide-x divide-emerald-600/60">
            <span className="flex items-center gap-1 font-medium text-emerald-200">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {language === 'am' ? 'በኢትዮጵያ ቀዳሚ የገበያ ቦታ' : "Ethiopia's Premier Marketplace"}
            </span>
            <span className="pl-3 hidden sm:inline text-emerald-100/90 flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5 inline text-emerald-300" />
              +251 91 100 2233
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="flex items-center bg-emerald-900/60 rounded-full p-0.5 border border-emerald-700/50">
              <button
                type="button"
                onClick={() => setLanguage('am')}
                className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-all ${
                  language === 'am'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                አማርኛ
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-all ${
                  language === 'en'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            {/* Quick sell link in topbar */}
            <button
              onClick={() => {
                if (user) {
                  onOpenSellerDashboard();
                } else {
                  onOpenAuthModal('register');
                }
              }}
              className="hidden md:flex items-center gap-1 text-emerald-200 hover:text-white font-medium hover:underline cursor-pointer"
            >
              <Store className="w-3.5 h-3.5" />
              {t.sell}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Brand Logo */}
          <div
            onClick={() => {
              setSelectedCategory(null);
              setSearchQuery('');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 cursor-pointer shrink-0 select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-emerald-900">
                  {language === 'am' ? 'ሜላ ገበያ' : 'MELA MARKET'}
                </span>
                <span className="hidden lg:inline-block text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                  ET
                </span>
              </div>
              <p className="text-[11px] text-emerald-700/80 font-medium hidden sm:block -mt-0.5">
                {t.brand_sub}
              </p>
            </div>
          </div>

          {/* Search Bar & Category Navigation dropdown */}
          <div className="flex-1 max-w-2xl relative">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-full focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all overflow-hidden shadow-xs">
              {/* Category dropdown toggle inside navigation */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                  className="hidden md:flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-700 bg-slate-100/70 border-r border-slate-200 shrink-0 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="max-w-[110px] truncate">
                    {selectedCategory
                      ? categories.find((c) => c.id === selectedCategory)?.[
                          language === 'am' ? 'name_am' : 'name_en'
                        ]
                      : t.categories}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isCatDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory(null);
                        setIsCatDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between hover:bg-emerald-50 ${
                        selectedCategory === null
                          ? 'text-emerald-700 font-bold bg-emerald-50/60'
                          : 'text-slate-700'
                      }`}
                    >
                      <span>{t.filter_all}</span>
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    </button>
                    <div className="border-t border-slate-100 my-1"></div>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setIsCatDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between hover:bg-emerald-50 ${
                          selectedCategory === cat.id
                            ? 'text-emerald-700 font-bold bg-emerald-50/60'
                            : 'text-slate-700'
                        }`}
                      >
                        <span>{language === 'am' ? cat.name_am : cat.name_en}</span>
                      </button>
                    ))}
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCatDropdownOpen(false);
                        onOpenCategoriesModal();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100/60 flex items-center gap-1.5"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      {t.all_categories}
                    </button>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="relative flex-1 flex items-center">
                <Search className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.search_placeholder}
                  className="w-full py-2.5 pl-2.5 pr-4 text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-hidden"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mr-3 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 w-5 h-5 rounded-full flex items-center justify-center cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Action Icons: Categories, Sell, Account, Cart */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Categories Navigation Button (Direct modal access) */}
            <button
              type="button"
              onClick={onOpenCategoriesModal}
              title={t.categories}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>{t.categories}</span>
            </button>

            {/* Direct Seller Dashboard Button */}
            <button
              type="button"
              onClick={() => {
                if (user) {
                  onOpenSellerDashboard();
                } else {
                  onOpenAuthModal('register');
                }
              }}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{user ? t.seller_dashboard : t.start_selling_now}</span>
            </button>

            {/* User Account / Profile Menu */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                      {user.full_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:inline font-semibold text-slate-800 max-w-[100px] truncate">
                      {user.full_name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{user.full_name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {user.role === 'admin' ? 'Administrator' : 'Verified Seller'}
                        </span>
                      </div>

                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenSellerDashboard();
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2"
                        >
                          <Store className="w-4 h-4 text-emerald-600" />
                          <span>{t.seller_dashboard}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenOrdersModal();
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2"
                        >
                          <ShoppingBag className="w-4 h-4 text-emerald-600" />
                          <span>{t.orders}</span>
                        </button>

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              onOpenAdminDashboard();
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2"
                          >
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>{t.admin_dashboard}</span>
                          </button>
                        )}
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{t.sign_out}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onOpenAuthModal('login')}
                    className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    {t.sign_in}
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenAuthModal('register')}
                    className="px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors cursor-pointer"
                  >
                    {t.register}
                  </button>
                </div>
              )}
            </div>

            {/* Shopping Cart Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer flex items-center justify-center"
              aria-label={t.cart}
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white">
                  {totalItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

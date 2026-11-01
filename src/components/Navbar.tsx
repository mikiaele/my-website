import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  ShoppingCart,
  User as UserIcon,
  Globe,
  PlusCircle,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { Category } from '../types';

interface NavbarProps {
  categories: Category[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenRegister: () => void;
  onOpenLogin: () => void;
  onOpenCategories: (categoryId?: string) => void;
  onOpenSellerDashboard: () => void;
  onOpenAdmin: () => void;
  currentView: 'home' | 'dashboard' | 'admin' | 'categories';
  onNavigateHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  categories,
  searchQuery,
  onSearchChange,
  onOpenRegister,
  onOpenLogin,
  onOpenCategories,
  onOpenSellerDashboard,
  onOpenAdmin,
  currentView,
  onNavigateHome,
}) => {
  const { user, isSeller, isAdmin, signOut } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'am' : 'en');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-xs">
      {/* Top micro-bar */}
      <div className="bg-emerald-900 text-emerald-100 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium">
              {language === 'am'
                ? 'የኢትዮጵያ ታማኝ የኦንላይን ገበያ • በአንድ ምዝገባ መግዛትና መሸጥ ይችላሉ'
                : 'Ethiopia’s Trusted Marketplace • Buy & Sell with One Single Account'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-xs font-medium bg-emerald-800/80 px-2 py-0.5 rounded"
              title="Toggle Amharic / English"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-300" />
              <span>{language === 'en' ? 'አማርኛ (Amharic)' : 'English'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          {/* Brand Logo */}
          <button
            onClick={() => {
              onNavigateHome();
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer shrink-0"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:bg-emerald-700 transition-colors">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">
                  Mela<span className="text-emerald-600">Market</span>
                </span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  መላ
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-700 hidden sm:block">
                {t('brandTagline')}
              </p>
            </div>
          </button>

          {/* Search Box */}
          <div className="flex-1 max-w-xl mx-2 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t('navSearchPlaceholder')}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Categories Navigation Dropdown (Categories stay in Nav, removed from Homepage section) */}
            <div className="relative">
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/60 rounded-lg transition-colors cursor-pointer"
              >
                <Layers className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">{t('navCategories')}</span>
              </button>

              {showCategoryDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowCategoryDropdown(false)}
                  />
                  <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-20 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {t('navCategories')}
                    </div>
                    <button
                      onClick={() => {
                        setShowCategoryDropdown(false);
                        onOpenCategories();
                      }}
                      className="w-full text-left px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center justify-between"
                    >
                      <span>{t('navAllProducts')}</span>
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">All</span>
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setShowCategoryDropdown(false);
                          onOpenCategories(cat.id);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                      >
                        {language === 'am' ? cat.name_am : cat.name_en}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Seller Action: Start Selling / Dashboard */}
            {user ? (
              <button
                onClick={onOpenSellerDashboard}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                  currentView === 'dashboard'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
                title={t('navDashboard')}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden md:inline">{t('navDashboard')}</span>
              </button>
            ) : (
              <button
                onClick={onOpenRegister}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                title={t('heroCtaSell')}
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span className="hidden md:inline">{t('navSell')}</span>
              </button>
            )}

            {/* Admin Portal (if admin role) */}
            {isAdmin && (
              <button
                onClick={onOpenAdmin}
                className={`flex items-center gap-1 px-2.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  currentView === 'admin'
                    ? 'bg-purple-700 text-white'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden lg:inline">{t('navAdmin')}</span>
              </button>
            )}

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/60 rounded-lg transition-colors cursor-pointer"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Auth Buttons or Menu */}
            {user ? (
              <div className="flex items-center gap-1.5 pl-1 sm:pl-2 border-l border-gray-200">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-gray-900 leading-tight">
                    {user.full_name}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-medium capitalize">
                    {user.role === 'admin' ? 'Platform Admin' : 'Active Seller'}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="p-2 text-gray-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title={t('navLogout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-gray-200">
                <button
                  onClick={onOpenLogin}
                  className="px-3 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  {t('navLogin')}
                </button>
                <button
                  onClick={onOpenRegister}
                  className="px-3.5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  {t('navRegister')}
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('navSearchPlaceholder')}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-2">
          <button
            onClick={() => {
              onNavigateHome();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-sm font-medium text-gray-800 hover:text-emerald-700"
          >
            {t('navHome')}
          </button>
          <button
            onClick={() => {
              onOpenCategories();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-sm font-medium text-gray-800 hover:text-emerald-700"
          >
            {t('navCategories')}
          </button>
          {user ? (
            <button
              onClick={() => {
                onOpenSellerDashboard();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 text-sm font-medium text-emerald-700"
            >
              {t('navDashboard')}
            </button>
          ) : (
            <button
              onClick={() => {
                onOpenRegister();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 text-sm font-medium text-emerald-700"
            >
              {t('navSell')}
            </button>
          )}
        </div>
      )}
    </header>
  );
};

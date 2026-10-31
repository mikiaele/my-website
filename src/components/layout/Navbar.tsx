import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Heart,
  User,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Package,
  Layers,
  Store,
  Database,
  Truck,
  Globe,
  Sparkles,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { useWishlist } from '../../context/WishlistContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { PageView } from '../../types/index.ts';
import { Category, Shop } from '../../types/database.types.ts';
import { getSupabaseClient } from '../../lib/supabase.ts';

interface NavbarProps {
  currentPage: PageView;
  setCurrentPage: (page: PageView) => void;
  categories: Category[];
  shops: Shop[];
  onSelectCategory: (slug: string) => void;
  onSelectShop: (shop: Shop) => void;
  onSearch: (query: string) => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  setCurrentPage,
  categories,
  shops,
  onSelectCategory,
  onSelectShop,
  onSearch,
  onOpenAuthModal,
}) => {
  const {
    user,
    isAuthenticated,
    isAdmin,
    isSeller,
    sellerShop,
    logout,
    loginAsDemoCustomer,
    loginAsDemoSeller1,
    loginAsDemoSeller2,
    loginAsDemoAdmin,
  } = useAuth();

  const { totalItems, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { language, setLanguage, t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isShopMenuOpen, setIsShopMenuOpen] = useState(false);

  const isSupabaseConfigured = !!getSupabaseClient();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setCurrentPage('shop');
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      
      {/* Top Announcement Bar */}
      <div className="bg-emerald-950 text-emerald-100 text-xs py-1.5 px-4 font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              {language === 'am' ? 'ባለብዙ ነጋዴ ገበያ' : 'Multi-Vendor'}
            </span>
            <span className="hidden sm:inline">{t('promoNotice')}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            {/* Language Switcher Button (Amharic / English) */}
            <div className="flex items-center gap-1 bg-emerald-900/90 border border-emerald-700/60 rounded-full p-0.5">
              <button
                type="button"
                onClick={() => setLanguage('am')}
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  language === 'am' ? 'bg-emerald-500 text-slate-950 shadow-xs' : 'text-emerald-200 hover:text-white'
                }`}
              >
                አማርኛ
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  language === 'en' ? 'bg-emerald-500 text-slate-950 shadow-xs' : 'text-emerald-200 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            <span className="opacity-40">|</span>

            {/* Quick Vendor Link */}
            {isSeller ? (
              <button
                onClick={() => setCurrentPage('seller-dashboard')}
                className="hover:text-emerald-300 flex items-center gap-1 text-emerald-300 font-bold transition-colors cursor-pointer"
              >
                <Store className="w-3.5 h-3.5" />
                <span>{t('sellerDashboard')}</span>
              </button>
            ) : (
              <button
                onClick={() => setCurrentPage('seller-register')}
                className="hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Store className="w-3.5 h-3.5" />
                <span>{t('becomeSeller')}</span>
              </button>
            )}

            <span className="opacity-40">|</span>

            <button
              onClick={() => setCurrentPage('admin')}
              className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Database className="w-3 h-3 text-emerald-400" />
              <span>{isSupabaseConfigured ? 'Supabase Live' : 'PostgreSQL'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                setCurrentPage('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 group cursor-pointer text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-800 via-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform">
                <span className="font-serif font-bold text-xl tracking-tighter">M</span>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {t('brandName')}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold -mt-0.5">
                  {t('brandTagline')}
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-600">
              <button
                onClick={() => setCurrentPage('home')}
                className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  currentPage === 'home' ? 'text-emerald-700 font-bold bg-emerald-50' : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {t('home')}
              </button>

              <button
                onClick={() => setCurrentPage('shop')}
                className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  currentPage === 'shop' ? 'text-emerald-700 font-bold bg-emerald-50' : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {t('shop')}
              </button>

              {/* Departments Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                  onMouseEnter={() => setIsCategoryMenuOpen(true)}
                  className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                    currentPage === 'categories' ? 'text-emerald-700 font-bold bg-emerald-50' : 'hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>{t('categories')}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </button>

                {isCategoryMenuOpen && (
                  <div
                    onMouseLeave={() => setIsCategoryMenuOpen(false)}
                    className="absolute left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                  >
                    <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {t('browseDepartments')}
                    </div>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          onSelectCategory(cat.slug);
                          setIsCategoryMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span className="truncate">{cat.name}</span>
                        {cat.item_count && (
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-mono">
                            {cat.item_count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Multi-Vendor Stores Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsShopMenuOpen(!isShopMenuOpen)}
                  onMouseEnter={() => setIsShopMenuOpen(true)}
                  className="px-3 py-2 rounded-lg transition-colors flex items-center gap-1 cursor-pointer hover:text-slate-900 hover:bg-slate-50"
                >
                  <Store className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('allSellers')}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </button>

                {isShopMenuOpen && (
                  <div
                    onMouseLeave={() => setIsShopMenuOpen(false)}
                    className="absolute left-0 mt-1 w-72 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                  >
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {language === 'am' ? 'የተረጋገጡ ገለልተኛ ሱቆች' : 'Independent Marketplace Stores'}
                    </div>
                    {shops.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          onSelectShop(s);
                          setIsShopMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 hover:bg-emerald-50 flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <img src={s.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover bg-slate-100 border border-slate-200" />
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-slate-900 truncate">{s.name}</p>
                          <span className="text-[10px] text-slate-400 block">{s.city}</span>
                        </div>
                      </button>
                    ))}

                    <div className="border-t border-slate-100 mt-2 pt-1">
                      <button
                        onClick={() => {
                          setCurrentPage('seller-register');
                          setIsShopMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t('openShop')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setCurrentPage('about')}
                className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  currentPage === 'about' ? 'text-emerald-700 font-bold bg-emerald-50' : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {t('about')}
              </button>

              <button
                onClick={() => setCurrentPage('contact')}
                className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  currentPage === 'contact' ? 'text-emerald-700 font-bold bg-emerald-50' : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {t('contact')}
              </button>
            </nav>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-sm mx-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-9 py-2 text-xs bg-slate-100/90 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white placeholder:text-slate-400"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Wishlist */}
            <button
              onClick={() => setCurrentPage('shop')}
              title={t('wishlist')}
              className="relative p-2.5 rounded-full text-slate-600 hover:text-emerald-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-full bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80 transition-all cursor-pointer group"
              title={t('cart')}
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform text-emerald-700" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-emerald-700 text-white rounded-full text-[10px] font-bold h-4 min-w-[16px] px-1 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-bold">{t('cart')}</span>
            </button>

            {/* User Account Dropdown */}
            <div className="relative">
              {isAuthenticated && user ? (
                <button
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 font-bold text-xs">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      user.full_name.charAt(0)
                    )}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
                </button>
              ) : (
                <button
                  onClick={onOpenAuthModal}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-500" />
                  <span>{t('signIn')}</span>
                </button>
              )}

              {/* Account Dropdown Menu */}
              {isAccountMenuOpen && user && (
                <div
                  onMouseLeave={() => setIsAccountMenuOpen(false)}
                  className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                >
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {language === 'am' ? 'የገቡበት መለያ' : 'Signed In'}
                    </p>
                    <p className="text-sm font-bold text-slate-900 truncate">{user.full_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-slate-500 truncate">{user.email}</span>
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md ${
                        user.role === 'admin'
                          ? 'bg-amber-100 text-amber-800'
                          : user.role === 'seller'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {user.role === 'admin' ? t('adminRole') : user.role === 'seller' ? t('sellerRole') : t('customerRole')}
                      </span>
                    </div>
                  </div>

                  <div className="py-1 text-xs">
                    <button
                      onClick={() => {
                        setCurrentPage('profile');
                        setIsAccountMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 cursor-pointer"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>{t('myProfile')}</span>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentPage('orders');
                        setIsAccountMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 cursor-pointer"
                    >
                      <Package className="w-4 h-4 text-slate-400" />
                      <span>{t('myOrders')}</span>
                    </button>

                    {/* Vendor Dashboard Link */}
                    {isSeller && (
                      <button
                        onClick={() => {
                          setCurrentPage('seller-dashboard');
                          setIsAccountMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 text-blue-800 font-bold flex items-center gap-2.5 cursor-pointer"
                      >
                        <Store className="w-4 h-4 text-blue-600" />
                        <span>{t('sellerDashboard')}</span>
                      </button>
                    )}

                    {/* Admin Dashboard Link */}
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setCurrentPage('admin');
                          setIsAccountMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-emerald-50 text-emerald-800 font-bold flex items-center gap-2.5 cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>{t('adminDashboard')}</span>
                      </button>
                    )}
                  </div>

                  {/* 4 Demo Switcher Buttons */}
                  <div className="border-t border-slate-100 px-4 py-2.5 bg-slate-50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      {t('switchPersona')}:
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                      <button
                        onClick={() => {
                          loginAsDemoCustomer();
                          setIsAccountMenuOpen(false);
                          setCurrentPage('home');
                        }}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 font-semibold text-slate-700 text-left"
                      >
                        {language === 'am' ? 'ሳራ (ደንበኛ)' : 'Sarah (Customer)'}
                      </button>
                      <button
                        onClick={() => {
                          loginAsDemoSeller1();
                          setIsAccountMenuOpen(false);
                          setCurrentPage('seller-dashboard');
                        }}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-500 font-semibold text-blue-800 text-left"
                      >
                        {language === 'am' ? 'አበበ (የቆዳ ሻጭ)' : 'Abebe (Leather Seller)'}
                      </button>
                      <button
                        onClick={() => {
                          loginAsDemoSeller2();
                          setIsAccountMenuOpen(false);
                          setCurrentPage('seller-dashboard');
                        }}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 font-semibold text-emerald-800 text-left"
                      >
                        {language === 'am' ? 'አልማዝ (የቡና ሻጭ)' : 'Almaz (Coffee Seller)'}
                      </button>
                      <button
                        onClick={() => {
                          loginAsDemoAdmin();
                          setIsAccountMenuOpen(false);
                          setCurrentPage('admin');
                        }}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 hover:border-amber-500 font-semibold text-amber-800 text-left"
                      >
                        {language === 'am' ? 'ማርከስ (አስተዳዳሪ)' : 'Marcus (Admin)'}
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={async () => {
                        await logout();
                        setIsAccountMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('signOut')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3">
          <div className="space-y-1 text-sm font-semibold">
            <button onClick={() => { setCurrentPage('home'); setIsMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50">
              {t('home')}
            </button>
            <button onClick={() => { setCurrentPage('shop'); setIsMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50">
              {t('shop')}
            </button>
            <button onClick={() => { setCurrentPage('categories'); setIsMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50">
              {t('categories')}
            </button>
            <button onClick={() => { setCurrentPage('seller-register'); setIsMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-emerald-800 font-bold bg-emerald-50">
              {t('openShop')}
            </button>
            <button onClick={() => { setCurrentPage('orders'); setIsMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50">
              {t('myOrders')}
            </button>
            <button onClick={() => { setCurrentPage('admin'); setIsMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-amber-800 font-bold bg-amber-50">
              {t('adminDashboard')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShoppingBag, 
  Search, 
  ShieldCheck, 
  Store, 
  Globe, 
  Layers, 
  User as UserIcon,
  LogOut,
  Sparkles
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    language, 
    setLanguage, 
    t, 
    activeTab, 
    setActiveTab, 
    cart, 
    setIsCartOpen, 
    currentUser, 
    isAdmin, 
    setIsAdminAuthModalOpen,
    logout,
    searchQuery,
    setSearchQuery,
    stats
  } = useApp();

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-emerald-100 shadow-xs">
      {/* Top Banner with Ethiopian Colors & Admin Highlight */}
      <div className="bg-emerald-900 text-emerald-100 text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Subtle Ethiopian Tricolor Accent */}
          <div className="flex h-3 w-6 rounded-xs overflow-hidden border border-emerald-700">
            <span className="w-1/3 bg-[#009A44]"></span>
            <span className="w-1/3 bg-[#FED100]"></span>
            <span className="w-1/3 bg-[#EF3340]"></span>
          </div>
          <span className="font-medium tracking-wide">
            {language === 'am' ? 'የኢትዮጵያ አስተማማኝ የገበያ መድረክ' : 'Ethiopia’s Premier Digital Marketplace'}
          </span>
          <span className="hidden md:inline text-emerald-400">|</span>
          <span className="hidden md:inline text-emerald-300">
            {language === 'am' ? 'በቴሌብር እና በሲቢኢ ብር ክፍያ' : 'Telebirr & CBE Birr Supported'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {isAdmin && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-700 text-amber-300 border border-emerald-600">
              <ShieldCheck className="w-3 h-3 text-amber-300" />
              {language === 'am' ? 'የአስተዳዳሪ ሁኔታ፡ ነቅቷል' : 'Admin: Active'}
            </span>
          )}

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
            className="flex items-center gap-1.5 text-xs text-emerald-200 hover:text-white transition-colors cursor-pointer font-medium"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="font-semibold">{language === 'en' ? 'አማርኛ' : 'English'}</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab('marketplace')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-md shadow-emerald-900/10 group-hover:scale-105 transition-transform">
              <span className="text-2xl font-black tracking-tighter text-amber-300">M</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute -top-1 -right-1" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-emerald-950">Mela</span>
                <span className="text-xl font-extrabold tracking-tight text-emerald-600">Market</span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium">
                {language === 'am' ? 'መላ ገበያ — የኢትዮጵያ ምርቶች' : 'Quality Ethiopian Products'}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-2 hidden sm:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.search_placeholder}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-xs text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Navigation Items & Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Marketplace Tab */}
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'marketplace'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs'
                  : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-50'
              }`}
            >
              {t.nav_marketplace}
            </button>

            {/* Categories Tab */}
            <button
              onClick={() => setActiveTab('categories')}
              className={`hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs'
                  : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-50'
              }`}
            >
              <Layers className="w-4 h-4" />
              {t.nav_categories}
            </button>

            {/* Seller Dashboard Button */}
            <button
              onClick={() => setActiveTab('seller')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'seller'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                  : 'bg-emerald-100/70 text-emerald-800 hover:bg-emerald-200/80'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>{t.nav_seller}</span>
            </button>

            {/* Admin Dashboard Portal Link */}
            <button
              onClick={() => {
                if (isAdmin) {
                  setActiveTab('admin');
                } else {
                  setIsAdminAuthModalOpen(true);
                }
              }}
              className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-gray-900 text-white shadow-md'
                  : isAdmin
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                  : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              title="Administrator Management Portal"
            >
              <ShieldCheck className={`w-4 h-4 ${isAdmin ? 'text-amber-700' : 'text-emerald-600'}`} />
              <span className="hidden sm:inline">{t.nav_admin}</span>
              {stats.pending_products > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-white text-[10px] font-bold rounded-full">
                  {stats.pending_products}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
              title="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* User Profile / Status */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <div className="hidden xl:block text-right">
                  <div className="text-xs font-bold text-gray-900 truncate max-w-[120px]">
                    {currentUser.full_name}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium capitalize">
                    {currentUser.role}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  title={t.nav_signout}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAdminAuthModalOpen(true)}
                className="p-2 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                title={t.nav_signin}
              >
                <UserIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 sm:hidden">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search_placeholder}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          </div>
        </div>
      </div>
    </header>
  );
};

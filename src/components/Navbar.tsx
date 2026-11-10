import React, { useState } from 'react';
import { ShoppingBag, Search, PlusCircle, User, ShieldCheck, Store, LogOut, Package, Menu, X, Globe, ShoppingCart, Phone, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { Category } from '../types/index.ts';

interface NavbarProps {
  categories: Category[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onOpenSellModal: () => void;
  onOpenAuthModal: (mode?: 'login' | 'register') => void;
  onOpenAdminPortal: () => void;
  onOpenSellerDashboard: () => void;
  onOpenMyOrders: () => void;
  onOpenChangePasswordModal?: () => void;
  contactPhone?: string;
  contactWhatsapp?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  categories,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onOpenSellModal,
  onOpenAuthModal,
  onOpenAdminPortal,
  onOpenSellerDashboard,
  onOpenMyOrders,
  onOpenChangePasswordModal,
  contactPhone = '0904503245',
  contactWhatsapp = '@brmiki21'
}) => {
  const { user, isSuperAdmin, isAdmin, isSeller, logout } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-emerald-100 shadow-sm">
      {/* Top Dedicated Contact Information Bar (Separate, appropriate contact location) */}
      <div className="bg-emerald-950 text-white text-xs py-2 px-3 sm:px-6 border-b border-emerald-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-center gap-2">
          {/* Centered Functional Contact Information */}
          <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap text-center mx-auto sm:mx-0">
            {/* Functional Phone Call Link */}
            <a
              href={`tel:${contactPhone.replace(/\s+/g, '')}`}
              className="inline-flex items-center gap-1.5 text-emerald-100 hover:text-amber-300 transition-colors py-0.5 px-2.5 rounded-lg bg-emerald-900/80 hover:bg-emerald-900 border border-emerald-700/60"
              title="ደውለው ይዘዙ (Call directly: 0904503245)"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>ስልክ:</span>
              <strong className="text-white font-mono tracking-wide">{contactPhone}</strong>
            </a>

            {/* Functional WhatsApp Link */}
            <a
              href="https://wa.me/251904503245"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-200 hover:text-amber-300 transition-colors py-0.5 px-2.5 rounded-lg bg-emerald-900/80 hover:bg-emerald-900 border border-emerald-700/60"
              title="በዋትስአፕ ያነጋግሩን (WhatsApp: @brmiki21)"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>WhatsApp:</span>
              <strong className="text-amber-300 font-semibold">{contactWhatsapp}</strong>
            </a>
          </div>

          {/* Regional Currency & Location Badge */}
          <div className="hidden sm:flex items-center gap-1.5 text-emerald-300 text-[11px]">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>አዲስ አበባ • ኢትዮጵያ (ETB / ብር)</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => {
                onSearchChange('');
                onSelectCategory('');
              }}
              className="flex items-center gap-2.5 text-left group flex-shrink-0"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform flex-shrink-0">
                <ShoppingBag className="w-6 h-6 text-amber-300" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg sm:text-2xl font-black text-emerald-900 tracking-tight">
                    MELA
                  </span>
                  <span className="text-lg sm:text-2xl font-light text-emerald-600">
                    MARKET
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-medium text-emerald-700 -mt-0.5 tracking-wider truncate max-w-[140px] xs:max-w-none">
                  መላ ማርኬት • የኢትዮጵያ የገበያ ቦታ
                </span>
              </div>
            </button>
          </div>

          {/* Search Bar (Clean and responsive without category dropdown) */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-4">
            <div className="relative flex w-full items-center rounded-xl border-2 border-emerald-600/40 focus-within:border-emerald-600 bg-emerald-50/30 overflow-hidden transition-all shadow-inner">
              <Search className="w-4 h-4 text-emerald-600 ml-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="ምን ይፈልጋሉ? ስልክ፣ ባህል ልብስ፣ ላፕቶፕ፣ መኪና... (Search products)"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full py-2.5 px-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="p-1 text-gray-400 hover:text-gray-600 mr-2 text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sell Product Button (Prominent Green) */}
            <button
              onClick={onOpenSellModal}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs sm:text-sm px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-md shadow-emerald-700/20 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span>እቃ ይሽጡ</span>
              <span className="hidden sm:inline font-normal opacity-90">/ Sell</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 sm:p-3 text-emerald-900 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
              title="የግዢ ጋሪ (Shopping Cart)"
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-emerald-950 font-black text-[11px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Super Admin Direct Button (Always visible when logged in as Super Admin) */}
            {isSuperAdmin && (
              <button
                onClick={onOpenAdminPortal}
                className="hidden sm:flex items-center gap-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-3 py-2 rounded-xl shadow transition-colors"
                title="Super Admin Control System"
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>Super Admin</span>
              </button>
            )}

            {/* User Account Menu */}
            <div className="relative">
              {user ? (
                <div className="flex items-center">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl border border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-left"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden md:flex flex-col leading-tight">
                      <span className="text-xs font-bold text-gray-800 truncate max-w-[110px]">
                        {user.fullName}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-600 uppercase">
                        {user.role}
                      </span>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-500">ተጠቃሚ / Signed in as</p>
                        <p className="text-sm font-bold text-gray-800 truncate">{user.fullName}</p>
                        <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          user.role === 'superadmin'
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === 'seller'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {user.role === 'superadmin' ? '⭐ Super Admin' : user.role === 'seller' ? '🏪 Verified Seller' : '👤 Customer'}
                        </span>
                      </div>

                      {isAdmin && (
                        <button
                          onClick={onOpenAdminPortal}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-purple-700 hover:bg-purple-50 flex items-center gap-2"
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-600" />
                          <span>Super Admin Dashboard</span>
                        </button>
                      )}

                      {isSeller && (
                        <button
                          onClick={onOpenSellerDashboard}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-amber-700 hover:bg-amber-50 flex items-center gap-2"
                        >
                          <Store className="w-4 h-4 text-amber-600" />
                          <span>የሻጭ ዳሽቦርድ (Seller Hub)</span>
                        </button>
                      )}

                      <button
                        onClick={onOpenMyOrders}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Package className="w-4 h-4 text-gray-500" />
                        <span>የትእዛዝ ሁኔታ (My Orders)</span>
                      </button>

                      {onOpenChangePasswordModal && (
                        <button
                          onClick={onOpenChangePasswordModal}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <span className="w-4 h-4 flex items-center justify-center text-gray-400">🔑</span>
                          <span>የይለፍ ቃል ቀይር (Change Password)</span>
                        </button>
                      )}

                      <div className="border-t border-gray-100 my-1"></div>

                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>ውጣ (Log Out)</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenAuthModal('login')}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 px-2.5 py-2 rounded-lg hover:bg-emerald-50 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>ግባ / Sign In</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-emerald-700 rounded-lg"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden pb-3">
          <div className="relative flex w-full items-center rounded-xl border border-emerald-300 bg-white overflow-hidden shadow-sm">
            <Search className="w-4 h-4 text-emerald-600 ml-3 flex-shrink-0" />
            <input
              type="text"
              placeholder="ምን ይፈልጋሉ? (Search Mela Market...)"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full py-2.5 px-3 text-xs text-gray-800 focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => onSearchChange('')} className="p-1 mr-2 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-emerald-100 bg-white px-4 py-4 space-y-4 animate-in fade-in slide-in-from-top-2 shadow-lg rounded-b-2xl">
            {/* Quick Contact Buttons on Mobile */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <a
                href="tel:0904503245"
                className="flex items-center justify-center gap-1.5 bg-emerald-50 text-emerald-900 border border-emerald-300 py-2.5 px-3 rounded-xl text-xs font-bold active:scale-95 transition-transform"
                title="ደውለው ይዘዙ (Call directly: 0904503245)"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                <span>0904503245</span>
              </a>
              <a
                href="https://wa.me/251904503245"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 bg-emerald-600 text-white py-2.5 px-3 rounded-xl text-xs font-bold active:scale-95 transition-transform shadow-xs"
                title="በዋትስአፕ ያነጋግሩን (@brmiki21)"
              >
                <MessageCircle className="w-3.5 h-3.5 text-amber-300" />
                <span>@brmiki21</span>
              </a>
            </div>

            {/* Quick Sell Button */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenSellModal();
              }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow-sm active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span>እቃ ይሽጡ / Sell Product</span>
            </button>

            {/* User Links */}
            <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs">
              {isAdmin && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAdminPortal();
                  }}
                  className="w-full text-left py-2.5 px-3 rounded-lg font-bold text-purple-700 bg-purple-50 flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Super Admin Dashboard</span>
                </button>
              )}

              {isSeller && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenSellerDashboard();
                  }}
                  className="w-full text-left py-2.5 px-3 rounded-lg font-bold text-amber-800 bg-amber-50 flex items-center gap-2"
                >
                  <Store className="w-4 h-4 text-amber-600" />
                  <span>የሻጭ ዳሽቦርድ (Seller Hub)</span>
                </button>
              )}

              {user ? (
                <>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenMyOrders();
                    }}
                    className="w-full text-left py-2.5 px-3 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Package className="w-4 h-4 text-gray-500" />
                    <span>የትእዛዝ ሁኔታ (My Orders)</span>
                  </button>
                  {onOpenChangePasswordModal && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenChangePasswordModal();
                      }}
                      className="w-full text-left py-2.5 px-3 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <span className="w-4 h-4 flex items-center justify-center text-gray-400">🔑</span>
                      <span>የይለፍ ቃል ቀይር (Change Password)</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left py-2.5 px-3 rounded-lg font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>ውጣ (Log Out)</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAuthModal('login');
                  }}
                  className="w-full text-center py-2.5 px-3 rounded-xl font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center gap-1.5"
                >
                  <User className="w-4 h-4" />
                  <span>መለያ ይክፈቱ ወይም ይግቡ (Sign In / Register)</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

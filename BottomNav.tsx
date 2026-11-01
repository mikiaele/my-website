import React from 'react';
import {
  Home,
  LayoutGrid,
  Plus,
  Heart,
  User,
  ShoppingBag,
  Store,
} from 'lucide-react';
import { PageView } from '../../types/index.ts';
import { useWishlist } from '../../context/WishlistContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface BottomNavProps {
  currentPage: PageView;
  setCurrentPage: (page: PageView) => void;
  onOpenAuthModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentPage,
  setCurrentPage,
  onOpenAuthModal,
}) => {
  const { wishlistCount } = useWishlist();
  const { user, isSeller } = useAuth();
  const { language } = useLanguage();

  const handleSellClick = () => {
    if (isSeller) {
      setCurrentPage('seller-dashboard');
    } else {
      setCurrentPage('seller-register');
    }
  };

  const handleAccountClick = () => {
    if (user) {
      setCurrentPage('profile');
    } else {
      onOpenAuthModal();
    }
  };

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 transition-all"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 items-center">
        
        {/* 1. Home */}
        <button
          onClick={() => setCurrentPage('home')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors cursor-pointer ${
            currentPage === 'home'
              ? 'text-emerald-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Home className={`w-5 h-5 ${currentPage === 'home' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight truncate">
            {language === 'am' ? 'መነሻ' : 'Home'}
          </span>
        </button>

        {/* 2. Categories */}
        <button
          onClick={() => setCurrentPage('categories')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors cursor-pointer ${
            currentPage === 'categories' || currentPage === 'category-products'
              ? 'text-emerald-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <LayoutGrid
            className={`w-5 h-5 ${
              currentPage === 'categories' || currentPage === 'category-products'
                ? 'stroke-[2.5]'
                : 'stroke-[1.8]'
            }`}
          />
          <span className="text-[10px] mt-0.5 tracking-tight truncate">
            {language === 'am' ? 'ምድቦች' : 'Categories'}
          </span>
        </button>

        {/* 3. Sell (Center Prominent Button) */}
        <div className="flex justify-center -mt-5">
          <button
            onClick={handleSellClick}
            title={language === 'am' ? 'እቃ ይሽጡ / ሱቅ ይክፈቱ' : 'Sell an item'}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-700/35 border-4 border-white flex flex-col items-center justify-center active:scale-95 transition-transform cursor-pointer"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
            <span className="text-[9px] font-extrabold uppercase tracking-tight -mt-0.5">
              {language === 'am' ? 'ይሽጡ' : 'Sell'}
            </span>
          </button>
        </div>

        {/* 4. Favorites */}
        <button
          onClick={() => setCurrentPage('favorites')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors relative cursor-pointer ${
            currentPage === 'favorites'
              ? 'text-emerald-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="relative">
            <Heart
              className={`w-5 h-5 ${
                currentPage === 'favorites'
                  ? 'fill-emerald-700 stroke-[2.5]'
                  : 'stroke-[1.8]'
              }`}
            />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {wishlistCount > 9 ? '9+' : wishlistCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight truncate">
            {language === 'am' ? 'ተወዳጆች' : 'Saved'}
          </span>
        </button>

        {/* 5. Account */}
        <button
          onClick={handleAccountClick}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors cursor-pointer ${
            currentPage === 'profile'
              ? 'text-emerald-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="relative">
            <User
              className={`w-5 h-5 ${currentPage === 'profile' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`}
            />
            {user && (
              <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight truncate">
            {language === 'am' ? 'መለያ' : 'Account'}
          </span>
        </button>

      </div>
    </nav>
  );
};

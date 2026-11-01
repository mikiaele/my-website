import React from 'react';
import { Heart, ArrowLeft, ShoppingBag, Sparkles } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { Product } from '../types/database.types.ts';
import { PageView } from '../types/index.ts';
import { ProductCard } from '../components/products/ProductCard.tsx';

interface FavoritesPageProps {
  setCurrentPage: (page: PageView) => void;
  onSelectProduct: (product: Product) => void;
  onSelectShop?: (shopId: string) => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({
  setCurrentPage,
  onSelectProduct,
  onSelectShop,
}) => {
  const { wishlist } = useWishlist();
  const { language } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage('home')}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {language === 'am' ? 'የተቀመጡ ተወዳጅ እቃዎች' : 'Saved Favorites'}
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {wishlist.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'am'
                ? 'በኋላ ለመግዛት ያስቀመጧቸው ምርቶች ዝርዝር'
                : 'Products you have bookmarked for quick purchasing later'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setCurrentPage('shop')}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors hidden sm:block cursor-pointer"
        >
          {language === 'am' ? 'ሁሉንም ምርቶች ያስሱ &rarr;' : 'Explore All Goods &rarr;'}
        </button>
      </div>

      {/* Grid or Empty State */}
      {wishlist.length === 0 ? (
        <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
          <div className="w-18 h-18 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-xs border border-rose-100">
            <Heart className="w-9 h-9" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {language === 'am' ? 'ምንም የተቀመጡ እቃዎች የሉም' : 'Your Wishlist is Empty'}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {language === 'am'
              ? 'የሚወዷቸውን እቃዎች በልብ ምልክቱ ላይ በመጫን በቀላሉ እዚህ ማስቀመጥ ይችላሉ።'
              : 'Tap the heart icon on any item while browsing to save it here for fast access and price updates.'}
          </p>
          <div className="pt-2">
            <button
              onClick={() => setCurrentPage('shop')}
              className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{language === 'am' ? 'ምርቶችን ያስሱ' : 'Browse Marketplace'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {wishlist.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onSelectShop={onSelectShop}
            />
          ))}
        </div>
      )}

    </div>
  );
};

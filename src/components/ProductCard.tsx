import React, { useState } from 'react';
import { ShoppingCart, Check, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelectProduct }) => {
  const { addToCart } = useCart();
  const { language, t } = useLanguage();
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  const isNew = product.condition === 'new';

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group bg-white rounded-2xl border border-gray-100 hover:border-emerald-300 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden cursor-pointer relative"
    >
      {/* Product Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Condition Tag (CRITICAL: Exactly 'አዲስ / Brand New' or 'ያገለገለ / Used') */}
        <div className="absolute top-2.5 left-2.5 z-10">
          {isNew ? (
            <span className="inline-flex items-center text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white shadow-xs backdrop-blur-xs">
              {t('conditionNew')}
            </span>
          ) : (
            <span className="inline-flex items-center text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500 text-gray-950 shadow-xs backdrop-blur-xs">
              {t('conditionUsed')}
            </span>
          )}
        </div>

        {/* Stock status indicator if low */}
        {product.stock <= 3 && product.stock > 0 && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-100 text-red-800">
              {language === 'am' ? `ቀሪ ${product.stock}` : `Only ${product.stock} left`}
            </span>
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Quiet Category & Seller */}
          <div className="text-[11px] text-gray-700 flex items-center justify-between mb-1">
            <span className="truncate">{product.category_name || (language === 'am' ? 'የገበያ እቃ' : 'General')}</span>
            {product.rating && (
              <span className="flex items-center gap-0.5 text-amber-500 font-medium">
                <Star className="w-3 h-3 fill-amber-400" />
                <span>{product.rating}</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
            {language === 'am' && product.title_am ? product.title_am : product.title}
          </h3>
        </div>

        {/* Pricing and Action */}
        <div className="mt-3 pt-2.5 border-t border-gray-100">
          <div className="flex items-baseline justify-between mb-2.5">
            <div>
              <span className="text-xs text-gray-700 font-medium mr-1">ETB</span>
              <span className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
                {product.price.toLocaleString()}
              </span>
            </div>
            <span className="text-[10px] text-emerald-700 font-medium">
              {product.stock > 0 ? t('inStock') : t('outOfStock')}
            </span>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              product.stock <= 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : justAdded
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white active:scale-98'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{t('addedToCart')}</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>{t('addToCart')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

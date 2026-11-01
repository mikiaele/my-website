import React, { useState } from 'react';
import { ShoppingCart, Star, Check, Sparkles, Tag } from 'lucide-react';
import { Product } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelectProduct }) => {
  const { language, formatPrice, t } = useLanguage();
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const title = language === 'am' ? product.title_am || product.title_en : product.title_en;
  const isUsed = product.condition === 'used';
  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group relative flex flex-col bg-white border border-slate-200/90 hover:border-emerald-500/80 rounded-2xl overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 cursor-pointer text-left"
    >
      {/* Image Container with Badges */}
      <div className="relative w-full aspect-square bg-slate-100 overflow-hidden">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e'}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Condition Badge (Critical Requirement: አዲስ / Brand New vs ያገለገለ / Used) */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm backdrop-blur-md ${
              isUsed
                ? 'bg-amber-500/90 text-white border border-amber-400'
                : 'bg-emerald-600/90 text-white border border-emerald-400'
            }`}
          >
            {isUsed ? (
              <>
                <Tag className="w-2.5 h-2.5" />
                <span>{language === 'am' ? 'ያገለገለ' : 'Used'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-2.5 h-2.5" />
                <span>{language === 'am' ? 'አዲስ' : 'New'}</span>
              </>
            )}
          </span>

          {hasDiscount && (
            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white shadow-xs">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Stock status indicator if low */}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-semibold px-2 py-0.5 rounded">
            {language === 'am' ? `${product.stock} ብቻ ቀርቷል` : `Only ${product.stock} left`}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          {/* Seller / Subtitle */}
          {product.seller_name && (
            <p className="text-[10px] font-semibold text-emerald-700 truncate tracking-wide">
              {product.seller_name}
            </p>
          )}

          {/* Title */}
          <h3 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
            {title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 text-[11px] text-amber-500">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="font-bold text-slate-700 text-xs">
              {product.rating ? product.rating.toFixed(1) : '5.0'}
            </span>
            {product.reviews_count ? (
              <span className="text-[10px] text-slate-400">({product.reviews_count})</span>
            ) : null}
          </div>
        </div>

        {/* Price & Action */}
        <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between gap-2">
          <div>
            <div className="text-sm sm:text-base font-extrabold text-emerald-800">
              {formatPrice(product.price)}
            </div>
            {hasDiscount && (
              <div className="text-[11px] text-slate-400 line-through -mt-1 font-medium">
                {formatPrice(product.original_price!)}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`p-2 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white'
            } ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={t.add_to_cart}
            aria-label={t.add_to_cart}
          >
            {justAdded ? (
              <Check className="w-4 h-4 text-white" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

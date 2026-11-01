import React, { useState } from 'react';
import { Heart, ShoppingBag, Star, Check, AlertCircle, Store, MapPin } from 'lucide-react';
import { Product } from '../../types/database.types.ts';
import { useCart } from '../../context/CartContext.tsx';
import { useWishlist } from '../../context/WishlistContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onSelectShop?: (shopId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect, onSelectShop }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { language } = useLanguage();
  const [isAddedRecently, setIsAddedRecently] = useState(false);

  const isFavorite = isInWishlist(product.id);
  const currentPrice = product.discount_price ?? product.price;
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discount_price!) / product.price) * 100)
    : 0;

  // Approximate ETB exchange reference (1 USD ~ 125 ETB)
  const etbPrice = Math.round(currentPrice * 125);
  const originalEtbPrice = Math.round(product.price * 125);

  const isOutOfStock = product.availability_status === 'out_of_stock' || product.stock_quantity === 0;
  const isLowStock = product.availability_status === 'low_stock' || (product.stock_quantity > 0 && product.stock_quantity <= 5);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
    setIsAddedRecently(true);
    setTimeout(() => setIsAddedRecently(false), 1500);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const sellerCity = product.shop?.city || (language === 'am' ? 'አዲስ አበባ' : 'Addis Ababa');

  return (
    <div
      onClick={() => onSelect(product)}
      className="group relative bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-lg hover:border-emerald-400 transition-all duration-200 flex flex-col cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out"
          loading="lazy"
        />

        {/* Badges on Top Left */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.condition === 'used' ? (
            <span className="bg-amber-500 text-slate-950 text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-xs uppercase tracking-wider">
              {language === 'am' ? 'ያገለገለ' : 'Used'}
            </span>
          ) : product.condition === 'refurbished' ? (
            <span className="bg-sky-600 text-white text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-xs uppercase tracking-wider">
              {language === 'am' ? 'የታደሰ' : 'Refurbished'}
            </span>
          ) : (
            <span className="bg-emerald-700 text-white text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-xs uppercase tracking-wider">
              {language === 'am' ? 'አዲስ' : 'New'}
            </span>
          )}
          {hasDiscount && (
            <span className="bg-rose-600 text-white text-[10px] sm:text-[11px] font-extrabold px-1.5 py-0.5 rounded shadow-xs tracking-wider">
              -{discountPercent}%
            </span>
          )}
          {product.is_trending && (
            <span className="bg-amber-400 text-slate-950 text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-xs uppercase tracking-wider">
              {language === 'am' ? 'ተወዳጅ' : 'Popular'}
            </span>
          )}
        </div>

        {/* Wishlist Button on Top Right */}
        <button
          onClick={handleWishlistToggle}
          title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          className={`absolute top-2 right-2 p-1.5 sm:p-2 rounded-full transition-all duration-150 z-10 cursor-pointer shadow-xs ${
            isFavorite
              ? 'bg-rose-50 text-rose-500 shadow-sm'
              : 'bg-white/90 backdrop-blur-xs text-slate-500 hover:text-rose-500 hover:bg-white'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
        </button>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/65 backdrop-blur-[2px] flex items-center justify-center p-3">
            <span className="bg-slate-900 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded border border-slate-700">
              {language === 'am' ? 'አልቋል' : 'Out of Stock'}
            </span>
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Multi-Vendor Shop & City Badge */}
          <div className="flex items-center justify-between gap-1 text-[10px] sm:text-[11px] text-slate-500 mb-1">
            <span className="flex items-center gap-1 font-semibold text-emerald-800 truncate">
              <Store className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate">{product.shop?.name || product.brand || 'MELA Market'}</span>
            </span>
            <span className="flex items-center gap-0.5 text-slate-400 shrink-0 text-[10px]">
              <MapPin className="w-2.5 h-2.5" />
              <span className="truncate max-w-[65px]">{sellerCity}</span>
            </span>
          </div>

          {/* Title */}
          <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
            {product.name}
          </h4>

          {/* Rating & Stock */}
          <div className="flex items-center justify-between gap-1 mt-1.5">
            <div className="flex items-center gap-1">
              <div className="flex items-center text-amber-400">
                <Star className="w-3 h-3 fill-amber-400" />
              </div>
              <span className="text-[11px] font-bold text-slate-800">{product.rating.toFixed(1)}</span>
              <span className="text-[10px] text-slate-400">({product.review_count})</span>
            </div>

            {isLowStock && (
              <span className="text-[10px] text-amber-600 font-bold">
                {language === 'am' ? `${product.stock_quantity} ቀርቷል` : `${product.stock_quantity} left`}
              </span>
            )}
          </div>
        </div>

        {/* Pricing & Add to Cart button */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
          <div className="min-w-0">
            {/* ETB primary price */}
            <div className="flex items-baseline gap-1">
              <span className="text-sm sm:text-base font-extrabold text-emerald-900 tracking-tight">
                {etbPrice.toLocaleString()} <span className="text-[10px] sm:text-xs font-semibold">{language === 'am' ? 'ብር' : 'ETB'}</span>
              </span>
            </div>
            {/* USD secondary reference */}
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <span>${currentPrice.toFixed(2)}</span>
              {hasDiscount && (
                <span className="line-through">${product.price.toFixed(2)}</span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            aria-label="Add to cart"
            className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : isAddedRecently
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-700'
            }`}
          >
            {isAddedRecently ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'am' ? 'ገብቷል' : 'Added'}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'am' ? 'ግዛ' : 'Add'}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};


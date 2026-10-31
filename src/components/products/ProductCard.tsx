import React, { useState } from 'react';
import { Heart, ShoppingBag, Star, Check, AlertCircle, Store } from 'lucide-react';
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

  return (
    <div
      onClick={() => onSelect(product)}
      className="group relative bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Badges on Top Left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {hasDiscount && (
            <span className="bg-rose-600 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-md shadow-xs tracking-wider">
              -{discountPercent}%
            </span>
          )}
          {product.is_trending && (
            <span className="bg-amber-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wider">
              {language === 'am' ? 'ተወዳጅ' : 'Trending'}
            </span>
          )}
        </div>

        {/* Wishlist Button on Top Right */}
        <button
          onClick={handleWishlistToggle}
          title={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 z-10 cursor-pointer ${
            isFavorite
              ? 'bg-rose-50 text-rose-500 shadow-sm'
              : 'bg-white/80 backdrop-blur-xs text-slate-500 hover:text-rose-500 hover:bg-white shadow-2xs'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
        </button>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-4">
            <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700">
              {language === 'am' ? 'አልቋል' : 'Out of Stock'}
            </span>
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Multi-Vendor Shop Badge */}
          {product.shop && (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-semibold mb-1 truncate">
              <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{product.shop.name}</span>
            </div>
          )}

          {/* Stock Status */}
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-slate-400 font-medium truncate">
              {product.brand || product.category?.name}
            </span>

            {isOutOfStock ? (
              <span className="text-rose-600 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {language === 'am' ? 'አልቋል' : 'Sold Out'}
              </span>
            ) : isLowStock ? (
              <span className="text-amber-600 font-semibold flex items-center gap-1">
                {language === 'am' ? `${product.stock_quantity} ብቻ ቀርቷል` : `Only ${product.stock_quantity} left`}
              </span>
            ) : (
              <span className="text-emerald-700 font-medium">
                {language === 'am' ? 'በክምችት አለ' : 'In Stock'}
              </span>
            )}
          </div>

          {/* Title */}
          <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
            {product.name}
          </h4>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
            <span className="text-xs font-bold text-slate-800">{product.rating.toFixed(1)}</span>
            <span className="text-xs text-slate-400">({product.review_count})</span>
          </div>
        </div>

        {/* Pricing & Add to Cart button */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-extrabold text-slate-900 font-mono">
                ${currentPrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-400 line-through font-mono">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
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
                <span className="hidden sm:inline">{language === 'am' ? 'ገብቷል' : 'Added!'}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'am' ? 'ጨምር' : 'Add'}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

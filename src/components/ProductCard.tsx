import React, { useState } from 'react';
import { Phone, MapPin, ShieldCheck, Star, ShoppingCart, Tag, Image as ImageIcon } from 'lucide-react';
import { Product, Language } from '../types';
import { SUPPORT_PHONE } from '../data/mockData';
import { TRANSLATIONS } from '../data/translations';

interface ProductCardProps {
  product: Product;
  language: Language;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  language,
  onQuickView,
  onAddToCart,
}) => {
  const t = TRANSLATIONS[language];
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const title =
    language === 'ti' ? product.titleTi : language === 'am' ? product.titleAm : product.titleEn;
  const description =
    language === 'ti'
      ? product.descriptionTi
      : language === 'am'
      ? product.descriptionAm
      : product.descriptionEn;
  const category =
    language === 'ti'
      ? product.categoryTi
      : language === 'am'
      ? product.categoryAm
      : product.category;
  const location =
    language === 'ti'
      ? product.locationTi
      : language === 'am'
      ? product.locationAm
      : product.location;
  const condition =
    language === 'ti'
      ? product.conditionTi
      : language === 'am'
      ? product.conditionAm
      : product.condition;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
      {/* Product Image Container (Restored & Preserved) */}
      <div
        onClick={() => onQuickView(product)}
        className="relative w-full h-48 bg-slate-100 overflow-hidden cursor-pointer"
      >
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-slate-400" />
          </div>
        )}

        {!imageError ? (
          <img
            src={product.imageUrl}
            alt={title}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-50 text-emerald-800">
            <ImageIcon className="w-8 h-8 opacity-60" />
            <span className="text-xs font-semibold mt-1">{category}</span>
          </div>
        )}

        {/* Condition Tag */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-900/80 text-white backdrop-blur-xs flex items-center gap-1 shadow-xs">
            <Tag className="w-3 h-3 text-amber-300" />
            <span>{condition}</span>
          </span>
        </div>

        {/* Verified Badge */}
        {product.isVerified && (
          <div className="absolute top-3 right-3">
            <span
              className="flex items-center gap-1 text-[11px] font-bold text-emerald-950 bg-emerald-400/90 px-2.5 py-1 rounded-full shadow-xs backdrop-blur-xs"
              title={t.verifiedMerchant}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-950" />
              <span className="hidden sm:inline">{t.verifiedSellers}</span>
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Location */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
            <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
              {category}
            </span>
            <div className="flex items-center gap-1 truncate max-w-[130px]" title={location}>
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onQuickView(product)}
            className="font-bold text-slate-900 text-sm sm:text-base leading-snug hover:text-emerald-700 cursor-pointer transition-colors line-clamp-2 mb-2"
          >
            {title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 text-xs text-slate-600 mb-2.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-slate-800">{product.rating}</span>
            <span className="text-slate-400">({product.reviewsCount})</span>
          </div>

          {/* Description snippet */}
          <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Price and Action Buttons */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-baseline gap-1.5 mb-3">
            <span className="text-xs font-semibold text-emerald-800">ETB</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs font-bold text-slate-500">{t.etbCurrency}</span>
            {product.originalPrice && (
              <span className="text-xs text-slate-400 line-through ml-1">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Direct Phone Call Button */}
            <a
              href={`tel:${product.sellerPhone || SUPPORT_PHONE}`}
              className="flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold py-2 px-3 rounded-xl text-xs border border-emerald-200 transition-colors cursor-pointer"
              title={`Call ${product.sellerPhone || SUPPORT_PHONE}`}
            >
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t.callDirect}</span>
            </a>

            {/* Add to Cart Button */}
            <button
              type="button"
              onClick={() => onAddToCart(product)}
              className="flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-3 rounded-xl text-xs transition-colors shadow-xs active:scale-95 cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-amber-300" />
              <span>{t.addToCart}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

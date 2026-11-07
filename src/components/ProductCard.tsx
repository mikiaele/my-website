import React from 'react';
import { MapPin, Eye, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';

export interface ProductItem {
  id: number;
  title: string;
  description: string;
  price: number;
  condition: 'new' | 'used';
  status: string;
  views: number;
  featured?: boolean;
  createdAt: string;
  categoryId?: number;
  categoryNameAm?: string;
  categoryNameEn?: string;
  categoryNameTi?: string;
  regionId?: number;
  regionNameAm?: string;
  regionNameEn?: string;
  regionNameTi?: string;
  woredaId?: number;
  woredaNameAm?: string;
  woredaNameEn?: string;
  woredaNameTi?: string;
  cityId?: number;
  cityNameAm?: string;
  cityNameEn?: string;
  cityNameTi?: string;
  sellerId: number;
  sellerName?: string;
  sellerPhone?: string;
  primaryImage: string;
  images?: string[];
}

interface ProductCardProps {
  product: ProductItem;
  onClick: (id: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const { t, getLocalized } = useLanguage();

  const isNew = product.condition === 'new';
  const categoryName = getLocalized(product.categoryNameAm, product.categoryNameEn, product.categoryNameTi);
  const regionName = getLocalized(product.regionNameAm, product.regionNameEn, product.regionNameTi);
  const woredaName = getLocalized(product.woredaNameAm, product.woredaNameEn, product.woredaNameTi);
  const cityName = getLocalized(product.cityNameAm, product.cityNameEn, product.cityNameTi);

  return (
    <div
      onClick={() => onClick(product.id)}
      className="group bg-white rounded-2xl border border-stone-200/80 hover:border-emerald-500/50 hover:shadow-xl transition-all duration-200 overflow-hidden cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Image Container with Badges */}
        <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden">
          <img
            src={product.primaryImage}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Condition Badge (REQUIRED) */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm flex items-center gap-1 ${
                isNew
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-600 text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              {isNew ? t.newBadge : t.usedBadge}
            </span>

            {product.featured && (
              <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-400 text-amber-950 shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Featured
              </span>
            )}
          </div>

          {/* Views count */}
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-stone-900/60 backdrop-blur-sm text-[10px] text-white flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{product.views}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2.5">
          {categoryName && (
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              {categoryName}
            </span>
          )}

          <h3 className="font-semibold text-stone-900 text-sm line-clamp-2 group-hover:text-emerald-700 transition leading-snug">
            {product.title}
          </h3>

          {/* Price */}
          <div className="pt-1 flex items-baseline gap-1">
            <span className="text-lg font-extrabold text-stone-900">
              {product.price.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-emerald-700">{t.currency}</span>
          </div>

          {/* Location Badge (Region, Woreda, City) */}
          <div className="pt-1 flex items-center gap-1 text-xs text-stone-500">
            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="truncate">
              {[cityName, woredaName, regionName].filter(Boolean).join(', ') || 'ኢትዮጵያ'}
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-4 py-3 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between text-xs">
        <span className="text-stone-500 truncate max-w-[140px]">
          {product.sellerName || t.seller}
        </span>
        <span className="text-emerald-700 font-semibold group-hover:underline">
          {t.viewDetails} →
        </span>
      </div>
    </div>
  );
};

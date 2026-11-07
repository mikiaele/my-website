import React from 'react';
import { Product } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onPreview?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onPreview,
}) => {
  const { t } = useLanguage();

  const formattedPrice = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(Number(product.price));

  const conditionLabel = product.condition === 'new' ? t('conditionNew') : t('conditionUsed');

  return (
    <div
      onClick={() => onSelect(product)}
      className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-950/5 transition-all duration-200 cursor-pointer flex flex-col h-full select-none"
    >
      {/* Product Image Container with strict proportion preservation */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            // Fallback placeholder image if upload or link is broken
            const target = e.currentTarget;
            target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';
          }}
        />

        {/* Condition Tag */}
        <div className="absolute top-2.5 left-2.5">
          <span
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase shadow-xs ${
              product.condition === 'new'
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-600 text-white'
            }`}
          >
            {conditionLabel}
          </span>
        </div>

        {/* Quick Preview Hover Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onPreview) onPreview(product);
            else onSelect(product);
          }}
          className="absolute bottom-2.5 right-2.5 p-2 rounded-lg bg-white/90 hover:bg-white text-slate-800 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[11px] font-semibold"
          title={t('preview')}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{t('preview')}</span>
        </button>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Location Kicker */}
          <div className="flex items-center gap-1 text-slate-400 text-xs mb-1">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{product.city || product.region}</span>
          </div>

          {/* Product Name */}
          <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
            {product.name}
          </h3>
        </div>

        {/* Price & Action */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-baseline justify-between">
          <div>
            <span className="text-base sm:text-lg font-bold text-emerald-700 tabular-nums">
              {formattedPrice}
            </span>{' '}
            <span className="text-xs font-semibold text-slate-600">{t('priceCurrency')}</span>
          </div>

          <span className="text-xs font-medium text-emerald-600 group-hover:underline">
            {t('viewDetails')} →
          </span>
        </div>
      </div>
    </div>
  );
};

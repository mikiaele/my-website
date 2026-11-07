import React from 'react';
import { MapPin, Eye, MessageSquare } from 'lucide-react';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onQuickPreview: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onQuickPreview,
}) => {
  const { t } = useAuth();

  const isNew = product.condition.toLowerCase() === 'new';

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden text-left">
      {/* Photo Container */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
        <img
          src={product.photoUrl}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Graceful fallback to styled neutral image if broken
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Condition Marker */}
        <div className="absolute top-2.5 left-2.5">
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs backdrop-blur-md ${
              isNew
                ? 'bg-emerald-600/90 text-white'
                : 'bg-slate-900/80 text-amber-200'
            }`}
          >
            {isNew ? t.conditionNew : t.conditionUsed}
          </span>
        </div>

        {/* Quick Preview Hover Trigger */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onQuickPreview(product);
          }}
          className="absolute bottom-2.5 right-2.5 p-2 rounded-xl bg-white/90 hover:bg-white text-slate-700 hover:text-emerald-700 shadow-md backdrop-blur-sm opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          title={t.quickPreview}
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Location */}
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-1.5">
            <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="truncate">{product.city || product.district}, {product.region.split(' / ')[0]}</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelect(product)}
            className="font-semibold text-slate-900 text-sm line-clamp-2 hover:text-emerald-700 cursor-pointer transition-colors leading-snug mb-2"
          >
            {product.title}
          </h3>
        </div>

        {/* Price & Primary Inquiry Action */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
          <div>
            <span className="text-[10px] text-slate-400 block">{t.price}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold text-emerald-800 tabular-nums">
                {product.price.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-emerald-700">{t.etb}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelect(product)}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{t.sendInquiry}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { ShoppingBag, Eye, Star, Tag, Check, Sparkles } from 'lucide-react';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { language, t, addToCart, setSelectedProduct, categories } = useApp();

  const category = categories.find(c => c.id === product.category_id);
  const displayTitle = language === 'am' ? product.title_am : product.title_en;
  const secondaryTitle = language === 'am' ? product.title_en : product.title_am;

  return (
    <div className="group bg-white rounded-2xl border border-gray-200/80 overflow-hidden hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-950/5 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Real Product Image Container */}
        <div className="relative aspect-4/3 w-full bg-gray-100 overflow-hidden cursor-pointer" onClick={() => setSelectedProduct(product)}>
          <img
            src={product.image_url}
            alt={displayTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800';
            }}
          />

          {/* Condition Tag */}
          <div className="absolute top-3 left-3">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide backdrop-blur shadow-xs ${
              product.condition === 'Brand New' 
                ? 'bg-emerald-600/90 text-white' 
                : 'bg-amber-500/90 text-white'
            }`}>
              {product.condition}
            </span>
          </div>

          {/* Quick View Floating Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProduct(product);
            }}
            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-gray-700 hover:text-emerald-700 rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur cursor-pointer"
            title={t.view_details}
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Stock Tag on Bottom */}
          <div className="absolute bottom-2.5 left-3">
            {product.stock > 0 ? (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-emerald-300 backdrop-blur">
                {product.stock} {t.in_stock}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-600/90 text-white backdrop-blur">
                {t.out_of_stock}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-700">
              <Tag className="w-3.5 h-3.5" />
              <span>{language === 'am' ? category?.name_am : category?.name_en}</span>
            </div>
            {product.rating && (
              <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Titles */}
          <h3 
            onClick={() => setSelectedProduct(product)}
            className="font-bold text-base text-gray-900 group-hover:text-emerald-800 transition-colors line-clamp-1 cursor-pointer"
            title={displayTitle}
          >
            {displayTitle}
          </h3>
          <p className="text-xs text-gray-400 line-clamp-1 mt-0.5" title={secondaryTitle}>
            {secondaryTitle}
          </p>

          {/* Seller */}
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
            <span className="text-[11px] font-medium">{t.seller_label}:</span>
            <span className="font-semibold text-gray-700 truncate">{product.seller_name}</span>
          </div>
        </div>
      </div>

      {/* Footer: Price & Add to Cart */}
      <div className="p-4 sm:p-5 pt-0">
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
              {t.field_price}
            </span>
            <div className="text-lg font-black text-emerald-900">
              {product.price.toLocaleString()}{' '}
              <span className="text-xs font-bold text-emerald-600">{t.currency}</span>
            </div>
          </div>

          <button
            onClick={() => addToCart(product, 1)}
            disabled={product.stock <= 0}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              product.stock > 0
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-800/15 hover:scale-102 active:scale-98'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{t.add_to_cart}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

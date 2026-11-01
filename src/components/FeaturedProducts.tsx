import React, { useState } from 'react';
import { Sparkles, Tag, Layers, Filter } from 'lucide-react';
import { Product, ProductCondition } from '../types';
import { ProductCard } from './ProductCard';
import { useLanguage } from '../context/LanguageContext';

interface FeaturedProductsProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  selectedCategory: string | null;
  onClearCategory: () => void;
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  products,
  onSelectProduct,
  selectedCategory,
  onClearCategory,
}) => {
  const { t, language } = useLanguage();
  const [conditionFilter, setConditionFilter] = useState<'all' | ProductCondition>('all');

  // Filter products by condition & category
  const filteredProducts = products.filter((product) => {
    if (selectedCategory && product.category_id !== selectedCategory) {
      return false;
    }
    if (conditionFilter !== 'all' && product.condition !== conditionFilter) {
      return false;
    }
    return true;
  });

  return (
    <section className="w-full my-8 text-left">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-emerald-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-6 bg-emerald-600 rounded-full inline-block" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {t.featured_products}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 pl-4.5">
            {t.featured_products_sub}
          </p>
        </div>

        {/* Condition Filter Chips (All, Brand New / አዲስ, Used / ያገለገለ) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setConditionFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              conditionFilter === 'all'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t.filter_all}
          </button>

          <button
            type="button"
            onClick={() => setConditionFilter('new')}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              conditionFilter === 'new'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <Sparkles className="w-3 h-3 text-emerald-300" />
            <span>{t.condition_new_full}</span>
          </button>

          <button
            type="button"
            onClick={() => setConditionFilter('used')}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              conditionFilter === 'used'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <Tag className="w-3 h-3 text-amber-300" />
            <span>{t.condition_used_full}</span>
          </button>
        </div>
      </div>

      {/* Active Category Indicator if filtered */}
      {selectedCategory && (
        <div className="flex items-center gap-2 mt-4 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-semibold w-fit border border-emerald-200">
          <Layers className="w-3.5 h-3.5" />
          <span>{language === 'am' ? 'በምድብ የተጣራ' : 'Filtered by Category'}</span>
          <button
            onClick={onClearCategory}
            className="ml-2 hover:text-emerald-950 font-bold bg-emerald-200 px-1.5 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Products Grid: Exactly 5 per row on desktop (lg:grid-cols-5) */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mt-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 mt-6">
          <p className="text-sm font-semibold text-slate-500">{t.no_products_found}</p>
          <button
            onClick={() => {
              setConditionFilter('all');
              onClearCategory();
            }}
            className="mt-3 text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
          >
            {language === 'am' ? 'ሁሉንም ማጣሪያዎች አጽዳ' : 'Reset all filters'}
          </button>
        </div>
      )}
    </section>
  );
};

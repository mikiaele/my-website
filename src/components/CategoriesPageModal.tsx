import React, { useState, useMemo } from 'react';
import { X, Filter, Sparkles, Search, Layers, RotateCcw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Category, Product, ProductCondition } from '../types';
import { ProductCard } from './ProductCard';

interface CategoriesPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  products: Product[];
  initialCategoryId?: string;
  onSelectProduct: (product: Product) => void;
}

export const CategoriesPageModal: React.FC<CategoriesPageModalProps> = ({
  isOpen,
  onClose,
  categories,
  products,
  initialCategoryId,
  onSelectProduct,
}) => {
  const { t, language } = useLanguage();

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryId || 'all');
  const [selectedCondition, setSelectedCondition] = useState<'all' | ProductCondition>('all');
  const [sortOrder, setSortOrder] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [modalSearch, setModalSearch] = useState('');

  // Update initial selected category if passed
  React.useEffect(() => {
    if (initialCategoryId) {
      setSelectedCategory(initialCategoryId);
    }
  }, [initialCategoryId]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'all' && p.category_id !== selectedCategory) {
        return false;
      }
      // Condition filter
      if (selectedCondition !== 'all' && p.condition !== selectedCondition) {
        return false;
      }
      // Search term
      if (modalSearch.trim()) {
        const query = modalSearch.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesTitleAm = p.title_am?.toLowerCase().includes(query);
        const matchesDesc = p.description.toLowerCase().includes(query);
        if (!matchesTitle && !matchesTitleAm && !matchesDesc) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortOrder === 'price-asc') return a.price - b.price;
      if (sortOrder === 'price-desc') return b.price - a.price;
      return 0;
    });
  }, [products, selectedCategory, selectedCondition, modalSearch, sortOrder]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-7xl w-full my-4 overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[92vh] animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 p-5 sm:p-6 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-200 font-semibold mb-1">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>{t('categoriesPageTitle')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {language === 'am' ? 'የኢትዮጵያ የገበያ ምድቦች' : 'Ethiopian Market Categories'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-emerald-200 hover:text-white rounded-full hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filter Navigation Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/70 shrink-0 space-y-3">
          {/* Horizontal Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-emerald-300'
              }`}
            >
              {language === 'am' ? 'ሁሉም ምድቦች' : 'All Categories'} ({products.length})
            </button>
            {categories.map((c) => {
              const count = products.filter((p) => p.category_id === c.id).length;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === c.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  {language === 'am' ? c.name_am : c.name_en} ({count})
                </button>
              );
            })}
          </div>

          {/* Condition, Sort, Search filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-gray-600">{t('filterByCondition')}</span>

              {/* All */}
              <button
                onClick={() => setSelectedCondition('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  selectedCondition === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {t('filterAllConditions')}
              </button>

              {/* Brand New */}
              <button
                onClick={() => setSelectedCondition('new')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  selectedCondition === 'new'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-emerald-800 border border-emerald-200'
                }`}
              >
                {t('filterBrandNew')}
              </button>

              {/* Used */}
              <button
                onClick={() => setSelectedCondition('used')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  selectedCondition === 'used'
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-amber-800 border border-amber-200'
                }`}
              >
                {t('filterUsed')}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="default">{language === 'am' ? 'መደበኛ ቅደም ተከተል' : 'Default Sorting'}</option>
                <option value="price-asc">{t('sortPriceAsc')}</option>
                <option value="price-desc">{t('sortPriceDesc')}</option>
              </select>

              {(selectedCategory !== 'all' || selectedCondition !== 'all' || modalSearch) && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedCondition('all');
                    setModalSearch('');
                    setSortOrder('default');
                  }}
                  className="p-1.5 text-gray-500 hover:text-red-600 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  title={t('clearFilters')}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('clearFilters')}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid (5 per row on desktop) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <p className="text-sm font-semibold">{t('noMatchingProducts')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onSelectProduct={(selected) => {
                    onSelectProduct(selected);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

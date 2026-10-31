import React, { useState, useMemo } from 'react';
import {
  Filter,
  SlidersHorizontal,
  X,
  Search,
  Grid,
  List,
  Star,
  RotateCcw,
  Tag,
  Check,
} from 'lucide-react';
import { Product, Category } from '../types/database.types.ts';
import { FilterState } from '../types/index.ts';
import { ProductCard } from '../components/products/ProductCard.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

interface ShopPageProps {
  products: Product[];
  categories: Category[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onSelectProduct: (product: Product) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  products,
  categories,
  filters,
  setFilters,
  onSelectProduct,
}) => {
  const { t, language } = useLanguage();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Maximum product price for slider boundary
  const maxAvailablePrice = useMemo(() => {
    return Math.max(...products.map((p) => p.price), 500);
  }, [products]);

  // Derived filtered products
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => p.approval_status !== 'rejected');

    // Search query
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.shop?.name.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (filters.categorySlug) {
      result = result.filter(
        (p) => p.category?.slug === filters.categorySlug || p.category_id === filters.categorySlug
      );
    }

    // Price range
    if (filters.minPrice !== undefined) {
      result = result.filter((p) => (p.discount_price ?? p.price) >= (filters.minPrice ?? 0));
    }
    if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
      result = result.filter((p) => (p.discount_price ?? p.price) <= (filters.maxPrice ?? 10000));
    }

    // In stock
    if (filters.inStockOnly) {
      result = result.filter((p) => p.availability_status !== 'out_of_stock' && p.stock_quantity > 0);
    }

    // On sale
    if (filters.onSaleOnly) {
      result = result.filter((p) => p.is_on_sale || (p.discount_price && p.discount_price < p.price));
    }

    // Rating
    if (filters.rating !== undefined && filters.rating > 0) {
      result = result.filter((p) => p.rating >= (filters.rating ?? 0));
    }

    // Sorting
    switch (filters.sortBy) {
      case 'price_asc':
        result.sort((a, b) => (a.discount_price ?? a.price) - (b.discount_price ?? b.price));
        break;
      case 'price_desc':
        result.sort((a, b) => (b.discount_price ?? b.price) - (a.discount_price ?? a.price));
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'featured':
      default:
        result.sort((a, b) => {
          if ((b.is_featured ? 1 : 0) !== (a.is_featured ? 1 : 0)) {
            return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
          }
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        break;
    }

    return result;
  }, [products, filters]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.categorySlug) count++;
    if (filters.minPrice && filters.minPrice > 0) count++;
    if (filters.maxPrice && filters.maxPrice < maxAvailablePrice) count++;
    if (filters.inStockOnly) count++;
    if (filters.onSaleOnly) count++;
    if (filters.rating) count++;
    if (filters.searchQuery) count++;
    return count;
  }, [filters, maxAvailablePrice]);

  const resetAllFilters = () => {
    setFilters({
      sortBy: 'featured',
      searchQuery: '',
      categorySlug: undefined,
      inStockOnly: false,
      onSaleOnly: false,
      rating: undefined,
      minPrice: 0,
      maxPrice: undefined,
    });
  };

  const selectedCategoryName = categories.find((c) => c.slug === filters.categorySlug)?.name;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Banner / Breadcrumb */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <span>{t('home')}</span>
          <span>/</span>
          <span className="text-slate-800 font-medium">
            {selectedCategoryName || t('shop')}
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {selectedCategoryName || t('shop')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {language === 'am' ? `${filteredProducts.length} ጥራት ያላቸው ምርቶች ታይተዋል` : `Showing ${filteredProducts.length} premium products`}
              {filters.searchQuery && ` ${language === 'am' ? 'ለፍለጋው' : 'matching'} "${filters.searchQuery}"`}
            </p>
          </div>

          {/* Controls: Search, View Mode, Sort */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Mobile Filter Trigger Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
              <span>{t('filters')} {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
            </button>

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 hidden sm:inline">{t('sortBy')}:</span>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }))}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs cursor-pointer"
              >
                <option value="featured">{t('sortFeatured')}</option>
                <option value="price_asc">{t('sortPriceAsc')}</option>
                <option value="price_desc">{t('sortPriceDesc')}</option>
                <option value="rating">{t('sortRating')}</option>
                <option value="newest">{t('sortNewest')}</option>
              </select>
            </div>

            {/* Grid / List View Toggle */}
            <div className="hidden sm:flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title={language === 'am' ? 'የፍርግርግ እይታ' : 'Grid View'}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title={language === 'am' ? 'የዝርዝር እይታ' : 'List View'}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs">
          <span className="text-slate-500 font-medium">{language === 'am' ? 'የተመረጡ ማጣሪያዎች፡' : 'Active filters:'}</span>

          {filters.categorySlug && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-emerald-900 border border-emerald-200 font-medium">
              {language === 'am' ? 'ምድብ' : 'Category'}: {selectedCategoryName || filters.categorySlug}
              <button
                onClick={() => setFilters((prev) => ({ ...prev, categorySlug: undefined }))}
                className="hover:text-rose-500 ml-1 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-emerald-900 border border-emerald-200 font-medium">
              {language === 'am' ? 'ፍለጋ' : 'Query'}: "{filters.searchQuery}"
              <button
                onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                className="hover:text-rose-500 ml-1 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.inStockOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-emerald-900 border border-emerald-200 font-medium">
              {t('inStockOnly')}
              <button
                onClick={() => setFilters((prev) => ({ ...prev, inStockOnly: false }))}
                className="hover:text-rose-500 ml-1 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.onSaleOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-emerald-900 border border-emerald-200 font-medium">
              {t('onSaleOnly')}
              <button
                onClick={() => setFilters((prev) => ({ ...prev, onSaleOnly: false }))}
                className="hover:text-rose-500 ml-1 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.rating && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-emerald-900 border border-emerald-200 font-medium">
              {filters.rating}★ {language === 'am' ? 'እና በላይ' : '& above'}
              <button
                onClick={() => setFilters((prev) => ({ ...prev, rating: undefined }))}
                className="hover:text-rose-500 ml-1 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.maxPrice && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-emerald-900 border border-emerald-200 font-medium">
              ${filters.maxPrice} {language === 'am' ? 'እና በታች' : 'or under'}
              <button
                onClick={() => setFilters((prev) => ({ ...prev, maxPrice: undefined }))}
                className="hover:text-rose-500 ml-1 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={resetAllFilters}
            className="text-xs text-rose-600 hover:text-rose-800 font-bold ml-auto flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> {t('clearFilters')}
          </button>
        </div>
      )}

      {/* Main Content: Sidebar + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-700" /> {t('filters')}
              </h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={resetAllFilters}
                  className="text-xs text-slate-400 hover:text-rose-600 font-medium cursor-pointer"
                >
                  {t('clearFilters')}
                </button>
              )}
            </div>

            {/* Department / Category Filter */}
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2.5">
                {t('categories')}
              </label>
              <div className="space-y-1">
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, categorySlug: undefined }))}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                    !filters.categorySlug
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{t('allCategories')}</span>
                  <span className="text-[11px] text-slate-400">{products.length}</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFilters((prev) => ({ ...prev, categorySlug: cat.slug }))}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                      filters.categorySlug === cat.slug
                        ? 'bg-emerald-50 text-emerald-800 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[11px] text-slate-400">{cat.item_count || ''}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter Slider */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                <span>{language === 'am' ? 'ከፍተኛ ዋጋ' : 'Max Price'}</span>
                <span className="text-emerald-700 font-mono text-sm">
                  ${filters.maxPrice ?? maxAvailablePrice}
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={Math.ceil(maxAvailablePrice)}
                step={10}
                value={filters.maxPrice ?? maxAvailablePrice}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))
                }
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                <span>$20</span>
                <span>${Math.ceil(maxAvailablePrice)}</span>
              </div>
            </div>

            {/* Quick Checkboxes */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                {language === 'am' ? 'የክምችት ሁኔታ እና ቅናሾች' : 'Availability & Offers'}
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!!filters.inStockOnly}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, inStockOnly: e.target.checked }))
                  }
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span>{t('inStockOnly')}</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!!filters.onSaleOnly}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, onSaleOnly: e.target.checked }))
                  }
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span>{t('onSaleOnly')}</span>
              </label>
            </div>

            {/* Minimum Rating Filter */}
            <div className="pt-4 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                {language === 'am' ? 'የደንበኞች ደረጃ' : 'Customer Rating'}
              </label>
              <div className="space-y-1.5">
                {[4.5, 4.0, 3.5].map((starVal) => (
                  <button
                    key={starVal}
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        rating: prev.rating === starVal ? undefined : starVal,
                      }))
                    }
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-colors cursor-pointer ${
                      filters.rating === starVal
                        ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                    </div>
                    <span>{starVal} {language === 'am' ? 'ኮከቦች እና ከዚያ በላይ' : 'stars & up'}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">{t('noMatchingProducts')}</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                {language === 'am'
                  ? 'ከተመረጠው ፍለጋ ጋር የሚስማማ እቃ አልተገኘም። እባክዎ የፍለጋ ቃሉን ወይም የዋጋ ገደቡን ያሻሽሉ።'
                  : "We couldn't find any items matching your active criteria. Try broadening your price range or clearing search keywords."}
              </p>
              <button
                onClick={resetAllFilters}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                {t('resetFilters')}
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={onSelectProduct}
                />
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-4">
              {filteredProducts.map((product) => {
                const currentPrice = product.discount_price ?? product.price;
                return (
                  <div
                    key={product.id}
                    onClick={() => onSelectProduct(product)}
                    className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col sm:flex-row gap-5 cursor-pointer"
                  >
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full sm:w-44 h-44 object-cover rounded-xl bg-slate-100 shrink-0"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                          <span>{product.brand || product.category?.name}</span>
                          <span className="flex items-center gap-1 text-amber-500 font-semibold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" /> {product.rating} ({product.review_count})
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                          {product.name}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                          {product.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-extrabold text-slate-900 font-mono">
                            ${currentPrice.toFixed(2)}
                          </span>
                          {product.discount_price && (
                            <span className="text-xs text-slate-400 line-through font-mono">
                              ${product.price.toFixed(2)}
                            </span>
                          )}
                        </div>

                        <span className="text-xs font-bold text-emerald-700 hover:text-emerald-900">
                          {language === 'am' ? 'ሙሉ ዝርዝር እይ' : 'View Details'} &rarr;
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

      </div>

      {/* Mobile Filters Drawer Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            onClick={() => setIsMobileFilterOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">{t('filters')}</h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Department */}
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                {t('categories')}
              </label>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, categorySlug: undefined }));
                    setIsMobileFilterOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs cursor-pointer ${
                    !filters.categorySlug ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600'
                  }`}
                >
                  {t('allCategories')}
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, categorySlug: c.slug }));
                      setIsMobileFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs cursor-pointer ${
                      filters.categorySlug === c.slug ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock and Sale */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!filters.inStockOnly}
                  onChange={(e) => setFilters((p) => ({ ...p, inStockOnly: e.target.checked }))}
                  className="rounded text-emerald-600"
                />
                <span>{t('inStockOnly')}</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!filters.onSaleOnly}
                  onChange={(e) => setFilters((p) => ({ ...p, onSaleOnly: e.target.checked }))}
                  className="rounded text-emerald-600"
                />
                <span>{t('onSaleOnly')}</span>
              </label>
            </div>

            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full py-3 bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              {language === 'am' ? `ማጣሪያዎችን ተግብር (${filteredProducts.length} ውጤቶች)` : `Apply Filters (${filteredProducts.length} Results)`}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

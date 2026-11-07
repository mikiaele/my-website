import React, { useState, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  MapPin,
  Tag,
  ChevronDown,
  Filter,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { ProductCard, ProductItem } from '../components/ProductCard.tsx';

interface BrowsePageProps {
  initialFilters?: {
    search?: string;
    condition?: string;
    categoryId?: string | number;
    regionId?: string | number;
  };
  onOpenProduct: (id: number) => void;
}

export const BrowsePage: React.FC<BrowsePageProps> = ({ initialFilters = {}, onOpenProduct }) => {
  const { t, getLocalized } = useLanguage();

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [regionsHierarchy, setRegionsHierarchy] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpenMobile, setIsFilterOpenMobile] = useState(false);

  // Filter criteria states
  const [search, setSearch] = useState(initialFilters.search || '');
  const [condition, setCondition] = useState(initialFilters.condition || '');
  const [categoryId, setCategoryId] = useState(initialFilters.categoryId ? String(initialFilters.categoryId) : '');
  const [regionId, setRegionId] = useState(initialFilters.regionId ? String(initialFilters.regionId) : '');
  const [woredaId, setWoredaId] = useState('');
  const [cityId, setCityId] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('newest');

  // Load categories and locations hierarchy
  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/locations/hierarchy').then((r) => r.json()),
    ])
      .then(([cats, locs]) => {
        setCategories(cats);
        setRegionsHierarchy(locs);
      })
      .catch((err) => console.error('Error loading filter metadata:', err));
  }, []);

  // Update whenever initialFilters change
  useEffect(() => {
    if (initialFilters.condition !== undefined) setCondition(initialFilters.condition);
    if (initialFilters.search !== undefined) setSearch(initialFilters.search);
    if (initialFilters.categoryId !== undefined) setCategoryId(String(initialFilters.categoryId));
    if (initialFilters.regionId !== undefined) setRegionId(String(initialFilters.regionId));
  }, [initialFilters]);

  // Fetch products with current filters
  const fetchFilteredProducts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (condition) params.append('condition', condition);
      if (categoryId) params.append('categoryId', categoryId);
      if (regionId) params.append('regionId', regionId);
      if (woredaId) params.append('woredaId', woredaId);
      if (cityId) params.append('cityId', cityId);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (sort) params.append('sort', sort);

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching filtered products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredProducts();
  }, [condition, categoryId, regionId, woredaId, cityId, sort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFilteredProducts();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCondition('');
    setCategoryId('');
    setRegionId('');
    setWoredaId('');
    setCityId('');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
  };

  // Find currently selected region and woreda for cascading dropdowns
  const selectedRegionObj = regionsHierarchy.find((r) => String(r.id) === String(regionId));
  const availableWoredas = selectedRegionObj ? selectedRegionObj.woredas : [];
  const selectedWoredaObj = availableWoredas.find((w: any) => String(w.id) === String(woredaId));
  const availableCities = selectedWoredaObj ? selectedWoredaObj.cities : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900">{t.browse}</h1>
            <p className="text-xs text-stone-500">
              {products.length} {products.length === 1 ? 'እቃ ተገኝቷል' : 'እቃዎች ተገኝተዋል'}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsFilterOpenMobile(!isFilterOpenMobile)}
              className="lg:hidden flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <Filter className="w-4 h-4 text-emerald-600" />
              <span>{t.filters}</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
              <span className="text-xs text-stone-500 hidden sm:inline">{t.sortBy}:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-300 font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="newest">{t.newest}</option>
                <option value="price_asc">{t.priceLowHigh}</option>
                <option value="price_desc">{t.priceHighLow}</option>
                <option value="popular">{t.mostViewed}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Text Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-9 pr-24 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="absolute right-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
          >
            {t.searchButton}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Filter Sidebar */}
        <aside
          className={`lg:block ${
            isFilterOpenMobile
              ? 'fixed inset-0 z-50 bg-stone-900/60 p-4 flex justify-center items-center'
              : 'hidden'
          }`}
        >
          <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-sm space-y-5 max-w-sm w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-stone-900 text-sm">{t.filters}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs text-stone-500 hover:text-red-600 flex items-center gap-1 font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t.clearFilters}</span>
                </button>
                {isFilterOpenMobile && (
                  <button
                    type="button"
                    onClick={() => setIsFilterOpenMobile(false)}
                    className="p-1 rounded-full text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Condition Filter (REQUIRED) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.condition}</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setCondition('')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium border text-center transition ${
                    condition === ''
                      ? 'bg-stone-900 text-white border-stone-900 font-bold'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {t.allConditions}
                </button>
                <button
                  type="button"
                  onClick={() => setCondition('new')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium border text-center transition ${
                    condition === 'new'
                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {t.newBadge}
                </button>
                <button
                  type="button"
                  onClick={() => setCondition('used')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium border text-center transition ${
                    condition === 'used'
                      ? 'bg-amber-600 text-white border-amber-600 font-bold'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {t.usedBadge}
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                {t.categories}
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">{t.allCategories}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {getLocalized(c.nameAm, c.nameEn, c.nameTi)}
                  </option>
                ))}
              </select>
            </div>

            {/* Structured Location Filters (Region, Woreda, City) - REQUIRED */}
            <div className="space-y-2.5 pt-1 border-t border-stone-100">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.location}</span>
              </label>

              {/* Region */}
              <div>
                <span className="text-[11px] text-stone-500 font-semibold mb-1 block">
                  1. {t.region} (ክልል)
                </span>
                <select
                  value={regionId}
                  onChange={(e) => {
                    setRegionId(e.target.value);
                    setWoredaId('');
                    setCityId('');
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">{t.allRegions}</option>
                  {regionsHierarchy.map((r) => (
                    <option key={r.id} value={r.id}>
                      {getLocalized(r.nameAm, r.nameEn, r.nameTi)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Woreda */}
              <div>
                <span className="text-[11px] text-stone-500 font-semibold mb-1 block">
                  2. {t.woreda} (ወረዳ)
                </span>
                <select
                  value={woredaId}
                  disabled={!regionId}
                  onChange={(e) => {
                    setWoredaId(e.target.value);
                    setCityId('');
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                >
                  <option value="">{t.allWoredas}</option>
                  {availableWoredas.map((w: any) => (
                    <option key={w.id} value={w.id}>
                      {getLocalized(w.nameAm, w.nameEn, w.nameTi)}
                    </option>
                  ))}
                </select>
              </div>

              {/* City / Town */}
              <div>
                <span className="text-[11px] text-stone-500 font-semibold mb-1 block">
                  3. {t.city} (ከተማ)
                </span>
                <select
                  value={cityId}
                  disabled={!woredaId}
                  onChange={(e) => setCityId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                >
                  <option value="">{t.allCities}</option>
                  {availableCities.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {getLocalized(c.nameAm, c.nameEn, c.nameTi)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-2 pt-1 border-t border-stone-100">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                {t.priceRange}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder={t.minPrice}
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="number"
                  placeholder={t.maxPrice}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                type="button"
                onClick={fetchFilteredProducts}
                className="w-full mt-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                {t.applyFilters}
              </button>
            </div>
          </div>
        </aside>

        {/* Product Cards Grid Area */}
        <main className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl h-80 animate-pulse border border-stone-200 p-4 space-y-4"
                >
                  <div className="bg-stone-200 rounded-xl aspect-4/3 w-full" />
                  <div className="h-4 bg-stone-200 rounded w-3/4" />
                  <div className="h-4 bg-stone-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200/80 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-stone-800 text-base">{t.noProductsFound}</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                እባክዎ የፍለጋ ቃልዎን ይቀይሩ ወይም ማጣሪያዎችን ያጽዱ።
              </p>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                {t.clearFilters}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} onClick={onOpenProduct} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

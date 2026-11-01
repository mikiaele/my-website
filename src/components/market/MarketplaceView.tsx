import React from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from './ProductCard';
import { 
  Sparkles, 
  Store, 
  Filter, 
  ArrowUpDown, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingUp,
  Layers,
  ShoppingBag
} from 'lucide-react';

export const MarketplaceView: React.FC = () => {
  const { 
    approvedProducts, 
    categories, 
    selectedCategory, 
    setSelectedCategory, 
    conditionFilter, 
    setConditionFilter, 
    sortBy, 
    setSortBy, 
    searchQuery, 
    setActiveTab, 
    language, 
    t 
  } = useApp();

  // Filter & Search Logic
  const filteredProducts = approvedProducts.filter(p => {
    // Category Filter
    if (selectedCategory && p.category_id !== selectedCategory) {
      return false;
    }
    // Condition Filter
    if (conditionFilter !== 'all' && p.condition !== conditionFilter) {
      return false;
    }
    // Search Query (Amharic or English)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchEn = p.title_en.toLowerCase().includes(q);
      const matchAm = p.title_am.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchSeller = p.seller_name.toLowerCase().includes(q);
      if (!matchEn && !matchAm && !matchDesc && !matchSeller) {
        return false;
      }
    }
    return true;
  });

  // Sorting Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price_low') return a.price - b.price;
    if (sortBy === 'price_high') return b.price - a.price;
    if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return (b.rating || 0) - (a.rating || 0); // featured
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Banner with Ethiopian Accents */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xl shadow-emerald-950/15">
        {/* Background decorative circles */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-emerald-700/30 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 w-60 h-60 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-700/80 border border-emerald-600/80 text-xs font-semibold text-amber-300 backdrop-blur">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{language === 'am' ? 'የኢትዮጵያ ምርቶች ማዕከል' : 'Authentic Ethiopian Marketplace'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            {t.hero_title}
          </h1>

          <p className="text-sm sm:text-base text-emerald-100 max-w-2xl leading-relaxed">
            {t.hero_subtitle}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                const el = document.getElementById('products-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-xl font-extrabold text-sm shadow-lg shadow-amber-400/20 transition-all cursor-pointer hover:scale-102"
            >
              {t.hero_cta}
            </button>

            <button
              onClick={() => setActiveTab('seller')}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm border border-white/20 backdrop-blur transition-all cursor-pointer"
            >
              {t.hero_seller_cta} →
            </button>
          </div>

          {/* Payment Guarantee badges */}
          <div className="pt-4 flex flex-wrap items-center gap-4 text-xs text-emerald-200">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Telebirr & CBE Birr</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Supabase Storage Photos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Store className="w-4 h-4 text-emerald-400" />
              <span>Admin Verified Sellers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              {t.all_categories}
            </h3>
          </div>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-xs text-emerald-700 hover:underline font-semibold cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === null
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t.all_categories} ({approvedProducts.length})
          </button>

          {categories.map((cat) => {
            const count = approvedProducts.filter(p => p.category_id === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {language === 'am' ? cat.name_am : cat.name_en} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Products Grid & Secondary Filters Header */}
      <div id="products-section" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-950">
              {t.products_heading}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Showing {sortedProducts.length} verified items
            </p>
          </div>

          {/* Condition and Sorting Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Condition Filter */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-bold">
              {(['all', 'Brand New', 'Used'] as const).map((cond) => (
                <button
                  key={cond}
                  onClick={() => setConditionFilter(cond)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    conditionFilter === cond
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {cond === 'all' ? t.filter_all : cond === 'Brand New' ? t.filter_new : t.filter_used}
                </button>
              ))}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-bold text-gray-800 focus:outline-none cursor-pointer"
              >
                <option value="featured">{t.sort_featured}</option>
                <option value="price_low">{t.sort_price_low}</option>
                <option value="price_high">{t.sort_price_high}</option>
                <option value="newest">{t.sort_newest}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {sortedProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-md mx-auto space-y-3">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-gray-800">{t.no_products_found}</h3>
            <p className="text-xs text-gray-500">
              Try adjusting your category selection, search keyword or condition filter.
            </p>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setConditionFilter('all');
              }}
              className="mt-2 px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

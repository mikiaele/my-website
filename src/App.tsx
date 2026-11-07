import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCarousel } from './components/ProductCarousel';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { AuthModal } from './components/AuthModal';
import { SellProductModal } from './components/SellProductModal';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { Product } from './types';
import { Sparkles, Filter, RefreshCw, X } from 'lucide-react';

const MarketplaceContent: React.FC = () => {
  const { t, activeFilter, setActiveFilter, language } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickPreviewProduct, setQuickPreviewProduct] = useState<Product | null>(null);

  // Fetch products from server
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeFilter.condition !== 'all') {
        params.append('condition', activeFilter.condition);
      }
      if (activeFilter.category !== 'all') {
        params.append('category', activeFilter.category);
      }
      if (activeFilter.region !== 'all') {
        params.append('region', activeFilter.region);
      }
      if (activeFilter.search) {
        params.append('search', activeFilter.search);
      }

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [activeFilter.condition, activeFilter.category, activeFilter.region]);

  const handleSearch = (search: string, category: string, region: string) => {
    fetchProducts();
  };

  const handleProductCreated = (newProd: Product) => {
    setProducts(prev => [newProd, ...prev]);
  };

  // Group products into New and Used
  const newProducts = products.filter(p => p.condition.toLowerCase() === 'new');
  const usedProducts = products.filter(p => p.condition.toLowerCase() === 'used');

  const hasActiveFilters =
    activeFilter.category !== 'all' ||
    activeFilter.region !== 'all' ||
    Boolean(activeFilter.search) ||
    activeFilter.condition !== 'all';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Header */}
      <Header
        onNavigateHome={() => {
          setActiveFilter({
            category: 'all',
            region: 'all',
            search: '',
            condition: 'all',
          });
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onFilterCondition={(cond) => {
          setActiveFilter(prev => ({ ...prev, condition: cond }));
        }}
      />

      <main className="flex-1">
        {/* Hero Banner with Multi-Criteria Search */}
        <Hero onSearch={handleSearch} />

        {/* Active Filter Bar (if filters are applied) */}
        {hasActiveFilters && (
          <div className="bg-emerald-50/80 border-b border-emerald-100 py-3 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-700" />
                <span className="font-bold text-emerald-900">Filter Applied:</span>
                {activeFilter.condition !== 'all' && (
                  <span className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-emerald-800 font-semibold">
                    {activeFilter.condition === 'new' ? t.conditionNew : t.conditionUsed}
                  </span>
                )}
                {activeFilter.category !== 'all' && (
                  <span className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-emerald-800 font-semibold">
                    Category: {activeFilter.category}
                  </span>
                )}
                {activeFilter.region !== 'all' && (
                  <span className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-emerald-800 font-semibold">
                    Region: {activeFilter.region}
                  </span>
                )}
                {activeFilter.search && (
                  <span className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-emerald-800 font-semibold">
                    "{activeFilter.search}"
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveFilter({
                    category: 'all',
                    region: 'all',
                    search: '',
                    condition: 'all',
                  });
                }}
                className="inline-flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-bold hover:underline cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>
          </div>
        )}

        {/* Content Section: When specific search or filters are active, show consolidated grid */}
        {hasActiveFilters ? (
          <section className="py-8 px-4 sm:px-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Filtered Marketplace Listings ({products.length})
              </h2>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 mb-2" />
                <p className="text-sm">Loading listings...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-12 text-center max-w-md mx-auto my-8">
                <p className="text-sm text-slate-600 font-medium mb-3">{t.noProductsFound}</p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter({
                      category: 'all',
                      region: 'all',
                      search: '',
                      condition: 'all',
                    });
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  View All Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={(p) => setSelectedProduct(p)}
                    onQuickPreview={(p) => setQuickPreviewProduct(p)}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            {/* SECTION 1: NEW PRODUCTS CAROUSEL */}
            <ProductCarousel
              id="new-products-section"
              title={t.newProducts}
              subtitle={
                language === 'am'
                  ? 'ከመደብሮች እና ከሻጮች በቀጥታ የሚቀርቡ አዳዲስ እቃዎች'
                  : language === 'ti'
                  ? 'ካብ ድኳናትን ሸየጥትን ብቐጥታ ዝቐርቡ ሓደስቲ ኣቑሑት'
                  : 'Brand new verified merchandise with factory seals and warranty'
              }
              condition="new"
              products={newProducts}
              onSelectProduct={(p) => setSelectedProduct(p)}
              onQuickPreview={(p) => setQuickPreviewProduct(p)}
            />

            {/* SECTION 2: USED PRODUCTS CAROUSEL */}
            <ProductCarousel
              id="used-products-section"
              title={t.usedProducts}
              subtitle={
                language === 'am'
                  ? 'በጥሩ ሁኔታ ላይ የሚገኙ ያገለገሉ እቃዎች በተመጣጣኝ ዋጋ'
                  : language === 'ti'
                  ? 'ብጽቡቕ ኩነታት ዝርከቡ ዝተጠቐምኩምሎም ኣቑሑት ብተመጣጣኒ ዋጋ'
                  : 'Inspected pre-owned goods, electronics, and vehicles at great rates'
              }
              condition="used"
              products={usedProducts}
              onSelectProduct={(p) => setSelectedProduct(p)}
              onQuickPreview={(p) => setQuickPreviewProduct(p)}
            />
          </>
        )}
      </main>

      {/* Modals */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {quickPreviewProduct && (
        <ProductDetailModal
          product={quickPreviewProduct}
          onClose={() => setQuickPreviewProduct(null)}
        />
      )}

      {/* Auth Modal (Login / Register with Camera) */}
      <AuthModal />

      {/* Sell Product Modal (Camera capture, protected) */}
      <SellProductModal onProductCreated={handleProductCreated} />

      {/* Admin Dashboard (Hidden from public, accessible strictly to admin) */}
      <AdminDashboard />

      {/* Footer with Single Owner WhatsApp Contact */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MarketplaceContent />
    </AuthProvider>
  );
}

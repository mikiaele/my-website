import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Product, Category } from './types';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCarousel } from './components/ProductCarousel';
import { ProductCard } from './components/ProductCard';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { SellProductModal } from './components/SellProductModal';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { Filter, X, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

function MarketplaceApp() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [appliedSearch, setAppliedSearch] = useState<string>('');

  // Active view
  const [activeView, setActiveView] = useState<'home' | 'admin'>('home');

  // Modals
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'admin'>('login');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedLocation !== 'all') params.append('city', selectedLocation);
      if (appliedSearch.trim() !== '') params.append('search', appliedSearch.trim());

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load products');
      const data = await res.json();
      setProducts(data);
    } catch (err: unknown) {
      console.error('Error fetching products:', err);
      setFetchError(err instanceof Error ? err.message : 'Error loading products');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, selectedLocation, appliedSearch]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleExecuteSearch = () => {
    setAppliedSearch(searchQuery);
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSelectedLocation('all');
    setSearchQuery('');
    setAppliedSearch('');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedLocation !== 'all' ||
    appliedSearch.trim() !== '';

  const newProducts = products.filter((p) => p.condition === 'new');
  const usedProducts = products.filter((p) => p.condition === 'used');

  const scrollToSection = (id: string) => {
    setActiveView('home');
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        onOpenSellModal={() => setSellModalOpen(true)}
        onOpenAuthModal={(mode = 'login') => {
          setAuthModalMode(mode);
          setAuthModalOpen(true);
        }}
        onNavigateSection={(sec) => {
          if (sec === 'admin') {
            setActiveView('admin');
          } else if (sec === 'new') {
            scrollToSection('section-new-products');
          } else if (sec === 'used') {
            scrollToSection('section-used-products');
          } else {
            setActiveView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        activeView={activeView}
      />

      {/* Main Content */}
      <main className="flex-1">
        {activeView === 'admin' ? (
          <AdminDashboard
            onBackToStore={() => setActiveView('home')}
            categories={categories}
            onRefreshCategories={fetchCategories}
          />
        ) : (
          <>
            {/* Hero Section with Search and Filters */}
            <Hero
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedLocation={selectedLocation}
              onLocationChange={setSelectedLocation}
              onExecuteSearch={handleExecuteSearch}
            />

            {/* Content Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {/* Active Filter Strip */}
              {hasActiveFilters && (
                <div className="mb-6 p-3.5 bg-emerald-50/70 border border-emerald-200/60 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Filter className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span className="font-semibold text-emerald-950">
                      {t('resultsFound')} ({products.length}):
                    </span>
                    {selectedCategory !== 'all' && (
                      <span className="px-2.5 py-0.5 bg-white rounded-lg border border-emerald-200 font-medium text-emerald-800">
                        {selectedCategory}
                      </span>
                    )}
                    {selectedLocation !== 'all' && (
                      <span className="px-2.5 py-0.5 bg-white rounded-lg border border-emerald-200 font-medium text-emerald-800">
                        {selectedLocation}
                      </span>
                    )}
                    {appliedSearch && (
                      <span className="px-2.5 py-0.5 bg-white rounded-lg border border-emerald-200 font-medium text-emerald-800">
                        "{appliedSearch}"
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleClearFilters}
                    className="flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-bold ml-2 underline shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>{t('clearFilters')}</span>
                  </button>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="py-20 text-center">
                  <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
                  <p className="text-xs text-slate-500 font-medium">Loading Ethiopian Marketplace...</p>
                </div>
              )}

              {/* Error State */}
              {fetchError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{fetchError}</span>
                  </div>
                  <button
                    onClick={fetchProducts}
                    className="font-bold underline text-rose-800"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* If products exist */}
              {!isLoading && products.length > 0 && (
                <div className="space-y-12">
                  {/* Section 1: New Products Horizontal Carousel */}
                  <div id="section-new-products">
                    <ProductCarousel
                      title={t('newSectionTitle')}
                      subtitle={t('newSectionSubtitle')}
                      badge={t('conditionNew')}
                      badgeColor="emerald"
                      products={newProducts}
                      onSelectProduct={(p) => setSelectedProduct(p)}
                      onPreviewProduct={(p) => setSelectedProduct(p)}
                    />
                  </div>

                  {/* Section 2: Used Products Horizontal Carousel */}
                  <div id="section-used-products">
                    <ProductCarousel
                      title={t('usedSectionTitle')}
                      subtitle={t('usedSectionSubtitle')}
                      badge={t('conditionUsed')}
                      badgeColor="amber"
                      products={usedProducts}
                      onSelectProduct={(p) => setSelectedProduct(p)}
                      onPreviewProduct={(p) => setSelectedProduct(p)}
                    />
                  </div>

                  {/* Complete Catalog Grid for Quick Browsing */}
                  <div className="pt-8 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                          {t('resultsFound')} ({products.length})
                        </h2>
                        <p className="text-xs text-slate-500">
                          Browse all available verified listings
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                      {products.map((prod, idx) => (
                        <ProductCard
                          key={prod.id ? `grid-prod-${prod.id}` : `grid-idx-${idx}`}
                          product={prod}
                          onSelect={(p) => setSelectedProduct(p)}
                          onPreview={(p) => setSelectedProduct(p)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && products.length === 0 && (
                <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 max-w-md mx-auto">
                  <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                    <Filter className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">
                    {t('noProductsFound')}
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Try adjusting your search query, category, or location filter.
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
                  >
                    {t('clearFilters')}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Product Details Modal (includes Customer Inquiry form) */}
      <ProductDetailsModal
        product={selectedProduct}
        categories={categories}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Sell Product Modal (Camera Only for photos) */}
      <SellProductModal
        isOpen={sellModalOpen}
        onClose={() => setSellModalOpen(false)}
        categories={categories}
        onProductCreated={() => {
          fetchProducts();
        }}
        onRequireAuth={() => {
          setAuthModalMode('login');
          setAuthModalOpen(true);
        }}
      />

      {/* Auth Modal (Login / Register / Admin Login) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={() => {
          fetchProducts();
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MarketplaceApp />
      </AuthProvider>
    </LanguageProvider>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { MarketplaceProvider, useMarketplace } from './context/MarketplaceContext';
import { useLanguage } from './context/LanguageContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CategoryProductSection } from './components/CategoryProductSection';
import { ProductModal } from './components/ProductModal';
import { CartModal } from './components/CartModal';
import { SellModal } from './components/SellModal';
import { AuthModal } from './components/AuthModal';
import { AdminPortal } from './components/AdminPortal';
import { AboutModal } from './components/AboutModal';
import { HelpCenterModal } from './components/HelpCenterModal';
import { Footer } from './components/Footer';
import { productCategories } from './data/categories';
import { RotateCcw, PackageSearch } from 'lucide-react';

const MarketplaceContent: React.FC = () => {
  const { t, localize } = useLanguage();
  const {
    filteredProducts,
    isProductsLoading,
    selectedCategory,
    searchQuery,
    selectedRegion,
    selectedZone,
    resetFilters,
  } = useMarketplace();

  // Route state: 'home' | 'admin-login' | 'admin'
  const [currentRoute, setCurrentRoute] = useState<'home' | 'admin-login' | 'admin'>(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    if (path === '/admin/login' || hash === '#admin/login' || hash === '#/admin/login') {
      return 'admin-login';
    }
    if (path === '/admin' || path.startsWith('/admin') || hash === '#admin' || hash === '#/admin') {
      return 'admin';
    }
    return 'home';
  });

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin/login' || hash === '#admin/login' || hash === '#/admin/login') {
        setCurrentRoute('admin-login');
      } else if (path === '/admin' || path.startsWith('/admin') || hash === '#admin' || hash === '#/admin') {
        setCurrentRoute('admin');
      } else {
        setCurrentRoute('home');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const handleReturnToMarketplace = () => {
    window.history.pushState(null, '', '/');
    setCurrentRoute('home');
  };

  // If directly accessing /admin/login (private admin login route) or /admin (dashboard)
  if (currentRoute === 'admin' || currentRoute === 'admin-login') {
    return (
      <AdminPortal
        onReturnToMarketplace={handleReturnToMarketplace}
        isExplicitLoginRoute={currentRoute === 'admin-login'}
      />
    );
  }

  // Active Category Name
  const currentCategory = productCategories.find((c) => c.id === selectedCategory);
  const activeCategoryTitle =
    selectedCategory === 'all'
      ? t('categories.all')
      : currentCategory
      ? localize(currentCategory.name)
      : t('categories.title');

  const isFiltering = Boolean(selectedCategory !== 'all' || searchQuery || selectedRegion || selectedZone);

  const knownCategoryIds = new Set(productCategories.map((c) => c.id));
  const populatedCategories =
    selectedCategory === 'all'
      ? productCategories
          .map((cat) => ({
            category: cat,
            items: filteredProducts.filter((p) => p.categoryId === cat.id),
          }))
          .filter((group) => group.items.length > 0)
      : currentCategory
      ? [{ category: currentCategory, items: filteredProducts }]
      : [];

  const uncategorizedItems =
    selectedCategory === 'all'
      ? filteredProducts.filter((p) => !knownCategoryIds.has(p.categoryId))
      : [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 overflow-x-hidden">
      
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <HeroSection />

      {/* Main Product Sections (Independent Horizontal Carousels) */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Active Filter Indicator & Reset */}
        {isFiltering && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-200/80 gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {activeCategoryTitle}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                {filteredProducts.length}
              </span>
            </div>

            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-700 bg-white text-xs font-bold text-slate-700 hover:text-emerald-900 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('filter.reset')}</span>
            </button>
          </div>
        )}

        {/* Product Carousels by Category */}
        {isProductsLoading && filteredProducts.length === 0 ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="shrink-0 w-[68%] min-w-[220px] sm:w-[46%] md:w-[31.5%] lg:w-[23.8%] bg-white rounded-2xl border border-slate-200/80 overflow-hidden animate-pulse"
              >
                <div className="w-full aspect-4/3 bg-slate-200" />
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-6 bg-slate-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="space-y-8 sm:space-y-10">
            {populatedCategories.map(({ category, items }) => (
              <CategoryProductSection
                key={category.id}
                category={category}
                products={items}
              />
            ))}

            {uncategorizedItems.length > 0 && (
              <CategoryProductSection
                category={{
                  id: 'other',
                  iconName: 'Layers',
                  name: {
                    en: 'Other Products',
                    am: 'ሌሎች እቃዎች',
                    ti: 'ካልኦት ኣቑሑት',
                  },
                }}
                products={uncategorizedItems}
              />
            )}
          </div>
        ) : (
          /* Empty Search / Filter State */
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200/70 shadow-xs max-w-lg mx-auto my-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <PackageSearch className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">
              {t('filter.noResults')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6">
              Try searching with broader terms or adjusting category filters to browse all available items.
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>{t('filter.reset')}</span>
            </button>
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Modals */}
      <ProductModal />
      <CartModal />
      <SellModal />
      <AuthModal />
      <AboutModal />
      <HelpCenterModal />

    </div>
  );
};

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error?.message || 'Unexpected rendering error' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-lg">
            <h2 className="text-lg font-black text-slate-900 mb-2">Mela Market</h2>
            <p className="text-xs text-slate-600 mb-4">{this.state.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl bg-emerald-800 text-white font-bold text-xs cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <MarketplaceProvider>
            <MarketplaceContent />
          </MarketplaceProvider>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

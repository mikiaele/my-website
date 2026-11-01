/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ProductCarousel } from './components/ProductCarousel';
import { ProductCard } from './components/ProductCard';
import { RegisterModal } from './components/RegisterModal';
import { LoginModal } from './components/LoginModal';
import { SellerDashboard } from './components/SellerDashboard';
import { AdminPortal } from './components/AdminPortal';
import { CategoriesPageModal } from './components/CategoriesPageModal';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { fetchCategories, fetchProducts } from './lib/supabase';
import { Category, Product } from './types';
import {
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  CheckCircle,
} from 'lucide-react';

function MarketplaceMain() {
  const { user, isSeller, isAdmin } = useAuth();
  const { t, language } = useLanguage();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Active view: 'home' | 'dashboard' | 'admin'
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'admin'>('home');

  // Search filter query
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [selectedCategoryForModal, setSelectedCategoryForModal] = useState<string | undefined>(undefined);
  const [selectedProductForDetails, setSelectedProductForDetails] = useState<Product | null>(null);

  // Load Categories & Products from Supabase / Storage
  const loadMarketData = async () => {
    try {
      setLoading(true);
      const [cats, prods] = await Promise.all([fetchCategories(), fetchProducts()]);
      setCategories(cats);
      setProducts(prods);
    } catch (err) {
      console.error('Error fetching marketplace data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketData();
  }, []);

  // Filtered by search bar
  const displayedProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        (p.title_am && p.title_am.toLowerCase().includes(query)) ||
        p.description.toLowerCase().includes(query) ||
        (p.category_name && p.category_name.toLowerCase().includes(query))
    );
  }, [products, searchQuery]);

  // Featured products for top carousel
  const featuredProducts = useMemo(() => {
    const featured = products.filter((p) => p.is_featured);
    return featured.length > 0 ? featured : products.slice(0, 8);
  }, [products]);

  // Condition split highlights (Brand New vs Used)
  const brandNewProducts = useMemo(() => {
    return products.filter((p) => p.condition === 'new');
  }, [products]);

  const usedProducts = useMemo(() => {
    return products.filter((p) => p.condition === 'used');
  }, [products]);

  // Navigation handlers
  const handleOpenCategories = (categoryId?: string) => {
    setSelectedCategoryForModal(categoryId);
    setIsCategoriesModalOpen(true);
  };

  const handleOpenSellerDashboard = () => {
    if (!user) {
      setIsRegisterOpen(true);
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleOpenAdmin = () => {
    if (isAdmin) {
      setCurrentView('admin');
    }
  };

  const handleRegisteredSuccess = () => {
    // Automatically switch to Seller Dashboard so seller can immediately add products!
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-gray-900 font-sans selection:bg-emerald-600 selection:text-white">
      {/* 1. Global Navigation Bar */}
      <Navbar
        categories={categories}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenCategories={handleOpenCategories}
        onOpenSellerDashboard={handleOpenSellerDashboard}
        onOpenAdmin={handleOpenAdmin}
        currentView={currentView === 'home' ? 'home' : currentView}
        onNavigateHome={() => setCurrentView('home')}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'dashboard' ? (
          /* SELLER DASHBOARD VIEW */
          <SellerDashboard
            categories={categories}
            onBackToShopping={() => setCurrentView('home')}
            onRefreshCatalog={loadMarketData}
          />
        ) : currentView === 'admin' ? (
          /* ADMIN PORTAL VIEW */
          <AdminPortal
            products={products}
            onBackToShopping={() => setCurrentView('home')}
            onRefreshProducts={loadMarketData}
          />
        ) : (
          /* HOMEPAGE VIEW */
          /* NOTE: Strictly compliant with Requirement 1:
             - NO product categories listing/grid section on homepage.
             - NO registered sellers list / directory on homepage.
             - NO shop listing section on homepage.
             - Categories remain accessible from navigation.
          */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            {/* Search active notification banner */}
            {searchQuery && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-bold text-emerald-900">
                    {language === 'am' ? 'የፍለጋ ውጤቶች ለ:' : 'Search results for:'}{' '}
                    <span className="text-emerald-700 font-black">"{searchQuery}"</span>
                  </p>
                  <p className="text-xs text-emerald-700">
                    {displayedProducts.length} {language === 'am' ? 'ምርቶች ተገኝተዋል' : 'items found'}
                  </p>
                </div>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-3 py-1 bg-white text-emerald-800 text-xs font-bold rounded-lg border border-emerald-300 hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  {language === 'am' ? 'ፍለጋን አጽዳ' : 'Clear Search'}
                </button>
              </div>
            )}

            {/* Promotional Hero Banner */}
            {!searchQuery && (
              <HeroBanner
                onExploreClick={() => {
                  const el = document.getElementById('marketplace-listings');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                onSellClick={handleOpenSellerDashboard}
              />
            )}

            {/* Marketplace Trust Features Bar */}
            {!searchQuery && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-8">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">
                      {language === 'am' ? 'የተረጋገጡ ሻጮች' : 'Verified Sellers'}
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      {language === 'am' ? 'ጥራት የተረጋገጠ' : '100% genuine products'}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">
                      {language === 'am' ? 'ፈጣን ማድረስ' : 'Fast Delivery'}
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      {language === 'am' ? 'በአዲስ አበባ እና ክልሎች' : 'Addis Ababa & Regions'}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">
                      {language === 'am' ? 'አስተማማኝ ክፍያ' : 'Secure ETB Pay'}
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      {language === 'am' ? 'ቴሌብር እና ንግድ ባንክ' : 'Telebirr & CBE Birr'}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">
                      {language === 'am' ? 'የደንበኞች ድጋፍ' : 'Seller Support'}
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      {language === 'am' ? 'በአንድ ምዝገባ መሸጥ' : 'Sell with 1 single registration'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Featured Products Section with Smooth Horizontal Carousel */}
            {!searchQuery && (
              <ProductCarousel
                title={t('featuredHeading')}
                subtitle={t('featuredSubheading')}
                products={featuredProducts}
                onSelectProduct={setSelectedProductForDetails}
              />
            )}

            {/* Main Product Catalog Section: 5 cards per row on desktop */}
            <section id="marketplace-listings" className="my-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    <span>{t('allProductsHeading')}</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    {language === 'am'
                      ? 'አዳዲስ እና ያገለገሉ እቃዎች በብር ዋጋ ከታማኝ ኢትዮጵያውያን ሻጮች'
                      : 'Authentic brand new and inspected pre-owned items listed in ETB'}
                  </p>
                </div>

                {/* Filter and View Full Categories shortcut */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenCategories()}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-gray-200 hover:border-emerald-500 hover:text-emerald-700 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{language === 'am' ? 'ሁሉንም በምድብ አስስ' : 'Browse Categories View'}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                      {categories.length}
                    </span>
                  </button>
                </div>
              </div>

              {/* 5-Card per Row Desktop Grid */}
              {displayedProducts.length === 0 ? (
                <div className="py-20 text-center text-gray-500 bg-white rounded-2xl border border-gray-100">
                  <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold">{t('noMatchingProducts')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {displayedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelectProduct={setSelectedProductForDetails}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Condition Highlights: Brand New & Used Showcase */}
            {!searchQuery && usedProducts.length > 0 && (
              <ProductCarousel
                title={language === 'am' ? 'ጥሩ ሁኔታ ላይ ያሉ ያገለገሉ እቃዎች' : 'Inspected Pre-Owned & Used Deals'}
                subtitle={language === 'am' ? 'ጥራታቸው የተረጋገጠ ያገለገሉ ስልኮች፣ ላፕቶፖች እና ሌሎች እቃዎች' : 'Tested used electronics, gadgets, and verified pre-owned items in Ethiopia'}
                products={usedProducts}
                onSelectProduct={setSelectedProductForDetails}
                showIcon={false}
              />
            )}
          </div>
        )}
      </main>

      {/* Global Footer */}
      <footer className="bg-emerald-950 text-emerald-100 border-t border-emerald-900 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-emerald-900/60">
            {/* Brand column */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="text-xl font-black text-white">
                  Mela<span className="text-emerald-400">Market</span>
                </span>
              </div>
              <p className="text-xs text-emerald-300/80 leading-relaxed">
                {language === 'am'
                  ? 'መላ ገበያ — የኢትዮጵያ ቀዳሚ የኦንላይን የገበያ መድረክ። አንድ ጊዜ በመመዝገብ መግዛትም ሆነ መሸጥ ይችላሉ።'
                  : 'Mela Market is Ethiopia’s premier e-commerce platform. Register once to buy and start selling products immediately.'}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                {language === 'am' ? 'ፈጣን ሊንኮች' : 'Quick Navigation'}
              </h4>
              <ul className="space-y-2 text-xs text-emerald-200">
                <li>
                  <button onClick={() => setCurrentView('home')} className="hover:text-white cursor-pointer">
                    {t('navHome')}
                  </button>
                </li>
                <li>
                  <button onClick={() => handleOpenCategories()} className="hover:text-white cursor-pointer">
                    {t('navCategories')}
                  </button>
                </li>
                <li>
                  <button onClick={handleOpenSellerDashboard} className="hover:text-white cursor-pointer">
                    {t('navDashboard')}
                  </button>
                </li>
              </ul>
            </div>

            {/* Selling on Mela */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                {language === 'am' ? 'በመላ ገበያ ይሽጡ' : 'Selling on Mela'}
              </h4>
              <p className="text-xs text-emerald-300/80 leading-relaxed mb-3">
                {language === 'am'
                  ? 'ተጨማሪ የሱቅ ምዝገባ አያስፈልግዎትም። መለያ ከፈጠሩ በኋላ ወዲያውኑ ምርቶችዎን በብር ይሽጡ።'
                  : 'No separate shop setup required. Simply create your account once and begin listing products immediately.'}
              </p>
              <button
                onClick={handleOpenSellerDashboard}
                className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                {t('heroCtaSell')}
              </button>
            </div>

            {/* Payments & Security */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                {language === 'am' ? 'የክፍያ አማራጮች' : 'Local Payment Methods'}
              </h4>
              <div className="space-y-2 text-xs text-emerald-300/90">
                <p>• Telebirr (ቴሌብር)</p>
                <p>• CBE Birr (የኢትዮጵያ ንግድ ባንክ)</p>
                <p>• Cash on Delivery (ሲደርስ የሚከፈል)</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-400/80 gap-3">
            <p>© {new Date().getFullYear()} Mela Market. All rights reserved.</p>
            <p className="flex items-center gap-1">
              <span>Made with care for Ethiopian commerce</span>
              <span>🇪🇹</span>
            </p>
          </div>
        </div>
      </footer>

      {/* ===================================================================== */}
      {/* MODALS & DRAWERS                                                      */}
      {/* ===================================================================== */}

      {/* Single-Step Seller/Customer Registration Modal */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
        onRegisteredSuccess={handleRegisteredSuccess}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
        onSuccess={() => {
          // If seller/admin, they can access dashboard immediately
        }}
      />

      {/* Dedicated Categories Browsing Modal (Accessible from Nav) */}
      <CategoriesPageModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
        categories={categories}
        products={products}
        initialCategoryId={selectedCategoryForModal}
        onSelectProduct={(p) => {
          setSelectedProductForDetails(p);
        }}
      />

      {/* Product Details Modal */}
      <ProductDetailsModal
        product={selectedProductForDetails}
        onClose={() => setSelectedProductForDetails(null)}
      />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Checkout Modal */}
      <CheckoutModal />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <MarketplaceMain />
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

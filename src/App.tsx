import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { FeaturedProducts } from './components/FeaturedProducts';
import { ProductCarouselSection } from './components/ProductCarouselSection';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { AuthModal } from './components/AuthModal';
import { SellerDashboard } from './components/SellerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { CategoriesModal } from './components/CategoriesModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrdersModal } from './components/OrdersModal';
import { Footer } from './components/Footer';

import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Category, Product } from './types';
import { api } from './lib/api';

const MainAppContent: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Modals & Drawers state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [isSellerDashboardOpen, setIsSellerDashboardOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);

  // Load initial data
  const loadData = async () => {
    try {
      const [cats, prods] = await Promise.all([
        api.getCategories(),
        api.getProducts(),
      ]);
      setCategories(cats);
      setProducts(prods);
    } catch (err) {
      console.error('Failed to load marketplace data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter products by search query
  const searchedProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const titleEn = p.title_en.toLowerCase();
    const titleAm = p.title_am.toLowerCase();
    const descEn = p.description_en.toLowerCase();
    const descAm = p.description_am.toLowerCase();
    return (
      titleEn.includes(query) ||
      titleAm.includes(query) ||
      descEn.includes(query) ||
      descAm.includes(query)
    );
  });

  // Hot deals / discounted products for carousel
  const hotDealsProducts = products.filter(
    (p) => p.original_price && p.original_price > p.price
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* 1. Header Navigation */}
      <Navbar
        categories={categories}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onOpenCategoriesModal={() => setIsCategoriesModalOpen(true)}
        onOpenAuthModal={(mode) => {
          setAuthMode(mode);
          setIsAuthModalOpen(true);
        }}
        onOpenSellerDashboard={() => {
          if (user) {
            setIsSellerDashboardOpen(true);
          } else {
            setAuthMode('register');
            setIsAuthModalOpen(true);
          }
        }}
        onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
        onOpenOrdersModal={() => setIsOrdersModalOpen(true)}
      />

      {/* 2. Main Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:py-8">
        {/* Search Results notification if active */}
        {searchQuery.trim() ? (
          <div className="mb-6">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
              <h2 className="text-lg font-bold text-slate-800">
                {language === 'am' ? 'የፍለጋ ውጤቶች ለ:' : 'Search results for:'}{' '}
                <span className="text-emerald-700">"{searchQuery}"</span>
              </h2>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                {language === 'am' ? 'ፍለጋ አጽዳ' : 'Clear search'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mt-6">
              {searchedProducts.map((p) => (
                <FeaturedProducts
                  key={p.id}
                  products={[p]}
                  onSelectProduct={setSelectedProduct}
                  selectedCategory={null}
                  onClearCategory={() => {}}
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* HERO BANNER (Wide pale-green with assurance highlights) */}
            <HeroBanner
              onBrowseClick={() => {
                const el = document.getElementById('featured-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onSellClick={() => {
                if (user) {
                  setIsSellerDashboardOpen(true);
                } else {
                  setAuthMode('register');
                  setIsAuthModalOpen(true);
                }
              }}
            />

            {/* FEATURED PRODUCTS (5 Cards Per Row on Desktop, Condition Filters) */}
            <div id="featured-section">
              <FeaturedProducts
                products={products}
                onSelectProduct={setSelectedProduct}
                selectedCategory={selectedCategory}
                onClearCategory={() => setSelectedCategory(null)}
              />
            </div>

            {/* SMOOTH HORIZONTAL PRODUCT CAROUSEL (Working Prev/Next Controls) */}
            {hotDealsProducts.length > 0 && (
              <ProductCarouselSection
                title={t.trending_deals}
                subtitle={t.trending_deals_sub}
                products={hotDealsProducts}
                onSelectProduct={setSelectedProduct}
              />
            )}
          </>
        )}
      </main>

      {/* 3. Footer */}
      <Footer />

      {/* 4. Modals & Drawers */}
      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
        onOpenSellerDashboard={() => setIsSellerDashboardOpen(true)}
      />

      <SellerDashboard
        isOpen={isSellerDashboardOpen}
        onClose={() => setIsSellerDashboardOpen(false)}
        categories={categories}
        allProducts={products}
        onProductCreatedOrUpdated={loadData}
      />

      <AdminDashboard
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        products={products}
        onRefreshData={loadData}
      />

      <CategoriesModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <CartDrawer onOpenCheckout={() => setIsCheckoutModalOpen(true)} />

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onOrderCompleted={loadData}
      />

      <OrdersModal
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <MainAppContent />
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

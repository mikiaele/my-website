import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { WishlistProvider } from './context/WishlistContext.tsx';
import { PageView, FilterState } from './types/index.ts';
import { Product, Category, Order, Shop } from './types/database.types.ts';
import { getProducts, getCategories, getShops } from './lib/api.ts';

import { Navbar } from './components/layout/Navbar.tsx';
import { Footer } from './components/layout/Footer.tsx';
import { CartDrawer } from './components/layout/CartDrawer.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';

import { HomePage } from './pages/HomePage.tsx';
import { ShopPage } from './pages/ShopPage.tsx';
import { ProductDetailsPage } from './pages/ProductDetailsPage.tsx';
import { CategoriesPage } from './pages/CategoriesPage.tsx';
import { CartPage } from './pages/CartPage.tsx';
import { CheckoutPage } from './pages/CheckoutPage.tsx';
import { OrdersPage } from './pages/OrdersPage.tsx';
import { OrderDetailsPage } from './pages/OrderDetailsPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { AdminDashboard } from './pages/admin/AdminDashboard.tsx';
import { SellerRegisterPage } from './pages/seller/SellerRegisterPage.tsx';
import { SellerDashboard } from './pages/seller/SellerDashboard.tsx';
import { ShopProfilePage } from './pages/seller/ShopProfilePage.tsx';

function MainApp() {
  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    sortBy: 'featured',
    searchQuery: '',
    minPrice: 0,
    inStockOnly: false,
    onSaleOnly: false,
  });

  const refreshCatalogData = async () => {
    const [prods, cats, shps] = await Promise.all([
      getProducts(),
      getCategories(),
      getShops(),
    ]);
    setProducts(prods);
    setCategories(cats);
    setShops(shps);
  };

  useEffect(() => {
    refreshCatalogData();

    const handleProductsUpdated = () => {
      refreshCatalogData();
    };

    window.addEventListener('mela:products-updated', handleProductsUpdated);
    return () => {
      window.removeEventListener('mela:products-updated', handleProductsUpdated);
    };
  }, []);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('product-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectShop = (shop: Shop) => {
    setSelectedShop(shop);
    setCurrentPage('seller-shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (slug: string) => {
    setFilters((prev) => ({
      ...prev,
      categorySlug: slug,
      searchQuery: '',
    }));
    setCurrentPage('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (query: string) => {
    setFilters((prev) => ({
      ...prev,
      searchQuery: query,
      categorySlug: undefined,
    }));
    setCurrentPage('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setCurrentPage('order-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderCompleted = (order: Order) => {
    setSelectedOrder(order);
    refreshCatalogData();
  };

  const navigateToPage = (page: PageView) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (page === 'home' || page === 'shop' || page === 'seller-shop') {
      refreshCatalogData();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white font-sans">
      {/* Navigation */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={navigateToPage}
        categories={categories}
        shops={shops}
        onSelectCategory={handleSelectCategory}
        onSelectShop={handleSelectShop}
        onSearch={handleSearch}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            products={products}
            categories={categories}
            shops={shops}
            setCurrentPage={navigateToPage}
            onSelectProduct={handleSelectProduct}
            onSelectCategory={handleSelectCategory}
            onSelectShop={handleSelectShop}
          />
        )}

        {currentPage === 'shop' && (
          <ShopPage
            products={products}
            categories={categories}
            filters={filters}
            setFilters={setFilters}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentPage === 'product-details' && selectedProduct && (
          <ProductDetailsPage
            product={selectedProduct}
            allProducts={products}
            setCurrentPage={navigateToPage}
            onSelectProduct={handleSelectProduct}
            onSelectCategory={handleSelectCategory}
            onSelectShop={handleSelectShop}
          />
        )}

        {currentPage === 'categories' && (
          <CategoriesPage
            categories={categories}
            products={products}
            setCurrentPage={navigateToPage}
            onSelectCategory={handleSelectCategory}
          />
        )}

        {currentPage === 'cart' && (
          <CartPage setCurrentPage={navigateToPage} />
        )}

        {currentPage === 'checkout' && (
          <CheckoutPage
            setCurrentPage={navigateToPage}
            onOrderCompleted={handleOrderCompleted}
          />
        )}

        {currentPage === 'orders' && (
          <OrdersPage
            setCurrentPage={navigateToPage}
            onSelectOrder={handleSelectOrder}
          />
        )}

        {currentPage === 'order-details' && selectedOrder && (
          <OrderDetailsPage
            order={selectedOrder}
            setCurrentPage={navigateToPage}
          />
        )}

        {currentPage === 'profile' && (
          <ProfilePage setCurrentPage={navigateToPage} />
        )}

        {currentPage === 'about' && (
          <AboutPage setCurrentPage={navigateToPage} />
        )}

        {currentPage === 'contact' && (
          <ContactPage />
        )}

        {currentPage === 'seller-register' && (
          <SellerRegisterPage setCurrentPage={navigateToPage} />
        )}

        {currentPage === 'seller-dashboard' && (
          <SellerDashboard
            setCurrentPage={navigateToPage}
            onSelectShopPreview={handleSelectShop}
            onRefreshData={refreshCatalogData}
          />
        )}

        {currentPage === 'seller-shop' && (selectedShop || shops[0]) && (
          <ShopProfilePage
            shop={selectedShop || shops[0]}
            setCurrentPage={navigateToPage}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentPage === 'admin' && (
          <AdminDashboard
            setCurrentPage={navigateToPage}
            onRefreshData={refreshCatalogData}
          />
        )}
      </main>

      {/* Slide-over Cart Drawer */}
      <CartDrawer setCurrentPage={navigateToPage} />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Footer */}
      <Footer
        setCurrentPage={navigateToPage}
        onSelectCategory={handleSelectCategory}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <MainApp />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

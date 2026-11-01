import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { MarketplaceView } from './components/market/MarketplaceView';
import { SellerDashboard } from './components/seller/SellerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CategoriesView } from './components/market/CategoriesView';
import { CartDrawer } from './components/cart/CartDrawer';
import { ProductDetailModal } from './components/market/ProductDetailModal';
import { AdminAuthModal } from './components/admin/AdminAuthModal';
import { Footer } from './components/Footer';

const AppContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 selection:bg-emerald-600 selection:text-white">
      {/* Navigation */}
      <Navbar />

      {/* Main View Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'marketplace' && <MarketplaceView />}
        {activeTab === 'seller' && <SellerDashboard />}
        {activeTab === 'admin' && <AdminDashboard />}
        {activeTab === 'categories' && <CategoriesView />}
      </main>

      {/* Global Modals & Drawers */}
      <CartDrawer />
      <ProductDetailModal />
      <AdminAuthModal />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

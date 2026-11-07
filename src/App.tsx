import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { BrowsePage } from './pages/BrowsePage.tsx';
import { ProductDetailPage } from './pages/ProductDetailPage.tsx';
import { SellerDashboard } from './pages/SellerDashboard.tsx';
import { AdminDashboard } from './pages/AdminDashboard.tsx';
import { UserOrdersPage } from './pages/UserOrdersPage.tsx';

function MainLayout() {
  const { user } = useAuth();

  const [currentPage, setCurrentPage] = useState<string>('home');
  const [navParams, setNavParams] = useState<any>({});
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; message: string; secrets?: any } | null>(null);

  useEffect(() => {
    fetch('/api/admin/db-health')
      .then((res) => res.json())
      .then((data) => setDbStatus(data))
      .catch((err) => console.error('DB health check error:', err));
  }, []);

  const handleNavigate = (page: string, params: any = {}) => {
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPage(page);
    setNavParams(params);
  };

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleOpenProduct = (id: number) => {
    handleNavigate('product-detail', { productId: id });
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans selection:bg-emerald-600 selection:text-white">
      {/* Neon DB configuration notice if DATABASE_URL is not yet set in Google AI Studio Secrets */}
      {dbStatus && !dbStatus.secrets?.DATABASE_URL && (
        <div className="bg-amber-100 border-b border-amber-300 px-4 py-2 text-xs text-amber-950 font-semibold flex items-center justify-between">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping shrink-0" />
            <span>
              <strong>Neon Database Required:</strong> Please configure <code>DATABASE_URL</code> in Google AI Studio Secrets with your Neon PostgreSQL connection string.
            </span>
          </div>
        </div>
      )}

      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
      />

      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage onNavigate={handleNavigate} onOpenProduct={handleOpenProduct} />
        )}

        {currentPage === 'browse' && (
          <BrowsePage initialFilters={navParams} onOpenProduct={handleOpenProduct} />
        )}

        {currentPage === 'product-detail' && navParams.productId && (
          <ProductDetailPage
            productId={navParams.productId}
            onBack={() => handleNavigate('browse')}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentPage === 'seller-dashboard' && (
          <SellerDashboard onOpenProduct={handleOpenProduct} />
        )}

        {currentPage === 'seller-add-product' && (
          <SellerDashboard onOpenProduct={handleOpenProduct} />
        )}

        {currentPage === 'admin-dashboard' && <AdminDashboard />}

        {currentPage === 'user-orders' && (
          <UserOrdersPage
            onBrowse={() => handleNavigate('browse')}
            onOpenProduct={handleOpenProduct}
          />
        )}
      </main>

      <Footer onNavigate={handleNavigate} />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </LanguageProvider>
  );
}

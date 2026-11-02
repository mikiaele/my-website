/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Phone,
  ShoppingBag,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { Language, Product, CartItem, User } from './types';
import { PRODUCTS, CATEGORIES, SUPPORT_PHONE } from './data/mockData';
import { TRANSLATIONS } from './data/translations';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartModal } from './components/CartModal';
import { SellModal } from './components/SellModal';
import { AuthModal } from './components/AuthModal';
import { AdminModal } from './components/AdminModal';
import { Footer } from './components/Footer';

const STORAGE_LANG_KEY = 'mela_market_lang';

export default function App() {
  // Default language: Amharic ('am'), unless user previously selected another language
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_LANG_KEY);
      if (saved === 'en' || saved === 'am' || saved === 'ti') {
        return saved;
      }
    }
    return 'am';
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSellOpen, setIsSellOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const t = TRANSLATIONS[language];

  // Save selected language to localStorage whenever it changes
  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_LANG_KEY, newLang);
    }
  };

  // Filter products based on search term, category, and city
  const filteredProducts = useMemo(() => {
    return productsList.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // City filter
      if (selectedCity !== 'all') {
        const cityLower = selectedCity.toLowerCase();
        const locLower = item.location.toLowerCase();
        if (cityLower === 'addis' && !locLower.includes('addis')) return false;
        if (cityLower === 'hawassa' && !locLower.includes('hawassa')) return false;
        if (cityLower === 'bahirdar' && !locLower.includes('bahir dar')) return false;
        if (cityLower === 'adama' && !locLower.includes('adama')) return false;
        if (cityLower === 'diredawa' && !locLower.includes('dire dawa')) return false;
        if (cityLower === 'mekelle' && !locLower.includes('mekelle')) return false;
      }

      // Search term filter across all 3 languages
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase();
        const matchEn =
          item.titleEn.toLowerCase().includes(q) ||
          item.descriptionEn.toLowerCase().includes(q);
        const matchAm =
          item.titleAm.toLowerCase().includes(q) ||
          item.descriptionAm.toLowerCase().includes(q);
        const matchTi =
          item.titleTi.toLowerCase().includes(q) ||
          item.descriptionTi.toLowerCase().includes(q);
        const matchCat = item.category.toLowerCase().includes(q);
        const matchLoc = item.location.toLowerCase().includes(q);
        return matchEn || matchAm || matchTi || matchCat || matchLoc;
      }

      return true;
    });
  }, [productsList, searchTerm, selectedCategory, selectedCity]);

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleDeleteProduct = (id: string) => {
    setProductsList((prev) => prev.filter((p) => p.id !== id));
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans antialiased text-slate-900">
      {/* Website Header with 3-language selector, search, cart, auth */}
      <Header
        language={language}
        onLanguageChange={handleLanguageChange}
        cartCount={totalCartCount}
        onCartClick={() => setIsCartOpen(true)}
        onPostAdClick={() => setIsSellOpen(true)}
        onAuthClick={() => setIsAuthOpen(true)}
        onAdminClick={() => setIsAdminOpen(true)}
        isLoggedIn={Boolean(currentUser)}
        userName={currentUser?.name}
        onLogout={() => setCurrentUser(null)}
      />

      {/* Main Homepage Hero: Green background, exact 3-language heading, small phone contact section */}
      <HeroSection
        language={language}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
        onPostAdClick={() => setIsSellOpen(true)}
      />

      {/* Category Navigation Strip */}
      <section className="bg-white border-b border-slate-200 sticky top-[73px] z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const catName =
                language === 'ti'
                  ? cat.nameTi
                  : language === 'am'
                  ? cat.nameAm
                  : cat.nameEn;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{catName}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-emerald-800 text-emerald-100'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>{t.featuredListings}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {selectedCategory === 'all'
                ? t.allCategories
                : CATEGORIES.find((c) => c.id === selectedCategory)?.[
                    language === 'ti'
                      ? 'nameTi'
                      : language === 'am'
                      ? 'nameAm'
                      : 'nameEn'
                  ]}
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
            <span>
              {t.showingItems} {filteredProducts.length}
            </span>
            {(selectedCategory !== 'all' || selectedCity !== 'all' || searchTerm !== '') && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedCity('all');
                  setSearchTerm('');
                }}
                className="text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
              >
                {t.resetFilters}
              </button>
            )}
          </div>
        </div>

        {/* Product Grid with preserved product photos */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs max-w-md mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-1">{t.noItemsFound}</h3>
            <p className="text-xs text-slate-500 mb-6">{t.noItemsDesc}</p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedCity('all');
                setSearchTerm('');
              }}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-colors cursor-pointer"
            >
              {t.viewAllListings}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                language={language}
                onQuickView={setSelectedProduct}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}

        {/* Mid-Page Hotline & Support Section */}
        <section className="mt-14 bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t.directSupport}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">{t.needHelp}</h3>
              <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">{t.needHelpDesc}</p>
            </div>

            {/* Clickable Phone Number */}
            <div className="shrink-0">
              <a
                href={`tel:${SUPPORT_PHONE}`}
                className="inline-flex items-center gap-3 bg-white text-emerald-900 hover:bg-amber-300 hover:text-slate-950 px-5 py-3 rounded-2xl font-black text-lg sm:text-xl shadow-xl transition-all duration-200 active:scale-95"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center">
                  <Phone className="w-4 h-4 text-amber-300" />
                </div>
                <span>{SUPPORT_PHONE}</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Action Call Button for Mobile */}
      <aside aria-label="Quick contact" className="fixed bottom-5 right-5 z-40 sm:hidden">
        <a
          href={`tel:${SUPPORT_PHONE}`}
          className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold px-3.5 py-2.5 rounded-full shadow-2xl border-2 border-white transition-all active:scale-95"
          aria-label="Direct Call"
        >
          <Phone className="w-4 h-4" />
          <span className="text-xs">{SUPPORT_PHONE}</span>
        </a>
      </aside>

      {/* Footer */}
      <Footer language={language} />

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        language={language}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Shopping Cart Drawer / Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        language={language}
      />

      {/* Sell Product Modal */}
      <SellModal
        isOpen={isSellOpen}
        onClose={() => setIsSellOpen(false)}
        language={language}
      />

      {/* User Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        language={language}
        onLoginSuccess={(name, email) => {
          setCurrentUser({
            id: 'u-1',
            name,
            email,
            phone: '0904503245',
            role: 'user',
          });
        }}
      />

      {/* Admin Dashboard Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        language={language}
        products={productsList}
        onDeleteProduct={handleDeleteProduct}
      />
    </div>
  );
}

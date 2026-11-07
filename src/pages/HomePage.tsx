import React, { useEffect, useState } from 'react';
import {
  Search,
  Sparkles,
  ShieldCheck,
  Camera,
  MapPin,
  ArrowRight,
  TrendingUp,
  Tag,
  PackageCheck,
  CheckCircle,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { ProductCard, ProductItem } from '../components/ProductCard.tsx';
import { ProductCarousel } from '../components/ProductCarousel.tsx';

interface HomePageProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenProduct: (id: number) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenProduct }) => {
  const { t, getLocalized } = useLanguage();

  const [categories, setCategories] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductItem[]>([]);
  const [newProducts, setNewProducts] = useState<ProductItem[]>([]);
  const [usedProducts, setUsedProducts] = useState<ProductItem[]>([]);
  const [recentProducts, setRecentProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    const loadHomeData = async () => {
      setIsLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products?limit=50'),
        ]);

        if (catRes.ok) {
          const cats = await catRes.json();
          setCategories(cats);
        }

        if (prodRes.ok) {
          const prods: ProductItem[] = await prodRes.json();
          setRecentProducts(prods.slice(0, 8));
          setFeaturedProducts(prods.filter((p) => p.featured).slice(0, 4));
          setNewProducts(prods.filter((p) => p.condition === 'new'));
          setUsedProducts(prods.filter((p) => p.condition === 'used'));
        }
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('browse', {
      search: searchQuery,
      condition: selectedCondition,
      categoryId: selectedCategory,
    });
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-stone-50 to-white text-stone-900 pt-8 pb-14 px-4 sm:px-6 rounded-b-3xl border-b border-stone-200/90 shadow-xs">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/90 border border-emerald-300 text-emerald-900 text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{t.tagline}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-stone-950 leading-tight">
            {t.appName}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-emerald-600 to-amber-600 mt-2">
              አዲስ እና ያገለገሉ እቃዎች መገበያያ
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-stone-600 text-sm sm:text-base leading-relaxed font-medium">
            በቀጥታ በካሜራ በተነሱ እውነተኛ ፎቶዎች፣ በክልል፣ ወረዳና ከተማ ተለይተው የቀረቡ ጥራት ያላቸው አዳዲስና ያገለገሉ እቃዎችን ይግዙ ወይም ይሽጡ።
          </p>

          {/* Search Card */}
          <form
            onSubmit={handleHeroSearch}
            className="max-w-3xl mx-auto bg-white p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl shadow-xl border border-stone-200 text-stone-900 grid grid-cols-1 sm:grid-cols-12 gap-2"
          >
            <div className="sm:col-span-5 relative flex items-center">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div className="sm:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-stone-700"
              >
                <option value="">{t.allCategories}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {getLocalized(c.nameAm, c.nameEn, c.nameTi)}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-stone-700"
              >
                <option value="">{t.allConditions}</option>
                <option value="new">{t.newProducts}</option>
                <option value="used">{t.usedProducts}</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                <span>{t.searchButton}</span>
              </button>
            </div>
          </form>

          {/* Quick Condition Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
            <span className="text-stone-500 font-semibold">ፈጣን ምርጫ፡</span>
            <button
              onClick={() => onNavigate('browse', { condition: 'new' })}
              className="px-3.5 py-1 rounded-full bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold flex items-center gap-1.5 shadow-2xs transition"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              {t.newProducts}
            </button>
            <button
              onClick={() => onNavigate('browse', { condition: 'used' })}
              className="px-3.5 py-1 rounded-full bg-white hover:bg-amber-50 border border-amber-300 text-amber-900 font-bold flex items-center gap-1.5 shadow-2xs transition"
            >
              <Tag className="w-3.5 h-3.5 text-amber-600" />
              {t.usedProducts}
            </button>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-stone-900 text-sm">የካሜራ ፎቶ ብቻ (Camera Only)</h4>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                የውሸት ወይም የኢንተርኔት ፎቶዎች አይፈቀዱም። ሁሉም እቃዎች በሻጩ ካሜራ በቀጥታ የተነሱ ናቸው።
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-stone-900 text-sm">አዲስ እና ያገለገሉ እቃዎች (New & Used)</h4>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                እያንዳንዱ እቃ ይዞታው በግልጽ ተለይቶ የተቀመጠ በመሆኑ በቀላሉ ማጣራት ይችላሉ።
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-700 shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-stone-900 text-sm">ትክክለኛ አካባቢ (Location Verified)</h4>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                በክልል፣ ወረዳ እና ከተማ የተደራጀ በመሆኑ በአቅራቢያዎ ያሉ እቃዎችን በፍጥነት ያግኙ።
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-stone-900">{t.categories}</h2>
            <p className="text-xs text-stone-500">የሚፈልጉትን የምርት ምድብ ይምረጡ</p>
          </div>
          <button
            onClick={() => onNavigate('browse')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>{t.allCategories}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => onNavigate('browse', { categoryId: c.id })}
              className="p-3 bg-white hover:bg-emerald-50/60 rounded-2xl border border-stone-200/80 hover:border-emerald-500 text-center transition group shadow-sm flex flex-col items-center justify-center space-y-2"
            >
              <div className="w-10 h-10 rounded-xl bg-stone-100 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center text-stone-700 transition">
                <PackageCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-stone-800 line-clamp-1 group-hover:text-emerald-700">
                {getLocalized(c.nameAm, c.nameEn, c.nameTi)}
              </span>
              <span className="text-[10px] text-stone-400">
                {c.productCount} {t.currency}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-extrabold text-stone-900">{t.featuredProducts}</h2>
            </div>
            <button
              onClick={() => onNavigate('browse')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>{t.browse}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} onClick={onOpenProduct} />
            ))}
          </div>
        </section>
      )}

      {/* New Products Carousel Section (Requirement 4: Auto-slide, Next/Prev & Preview controls below photos) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <ProductCarousel
          title="አዲስ እቃዎች (New Products)"
          subtitle="በካርቶኑ ያልተከፈቱና በዋስትና የሚሸጡ አዳዲስ ምርቶች በካሜራ ፎቶ"
          condition="new"
          products={newProducts}
          onOpenProduct={onOpenProduct}
          onViewAll={() => onNavigate('browse', { condition: 'new' })}
          autoSlideInterval={3500}
        />
      </section>

      {/* Used Products Carousel Section (Requirement 5: Auto-slide, Next/Prev & Preview controls below photos) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <ProductCarousel
          title="ያገለገሉ እቃዎች (Used Products)"
          subtitle="በጥሩ ይዞታ ላይ የሚገኙ ንጹህና አስተማማኝ ያገለገሉ እቃዎች በተመጣጣኝ ዋጋ"
          condition="used"
          products={usedProducts}
          onOpenProduct={onOpenProduct}
          onViewAll={() => onNavigate('browse', { condition: 'used' })}
          autoSlideInterval={4000}
        />
      </section>

      {/* Recently Added Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-extrabold text-stone-900">{t.recentProducts}</h2>
          </div>
          <button
            onClick={() => onNavigate('browse')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>{t.browse}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {recentProducts.map((p) => (
            <ProductCard key={p.id} product={p} onClick={onOpenProduct} />
          ))}
        </div>
      </section>
    </div>
  );
};

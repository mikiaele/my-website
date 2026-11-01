import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Sparkles,
  Flame,
  Clock,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  Layers,
  Store,
  MapPin,
  BadgeCheck,
  Search,
  PackagePlus,
  Tag,
  ThumbsUp,
  Award,
  PhoneCall,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';
import { Product, Category, Shop } from '../types/database.types.ts';
import { PageView, FilterState } from '../types/index.ts';
import { ProductCarouselSection } from '../components/products/ProductCarouselSection.tsx';
import { ProductCard } from '../components/products/ProductCard.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface HomePageProps {
  products: Product[];
  categories: Category[];
  shops?: Shop[];
  setCurrentPage: (page: PageView) => void;
  onSelectProduct: (product: Product) => void;
  onSelectCategory: (slug: string) => void;
  onSelectShop?: (shop: Shop) => void;
  onFilterShop?: (filter: Partial<FilterState>) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  categories,
  shops = [],
  setCurrentPage,
  onSelectProduct,
  onSelectCategory,
  onSelectShop,
  onFilterShop,
}) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');

  // Flash Sale Countdown Timer state
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Filter approved products visible to buyers
  const approvedProducts = products.filter((p) => p.approval_status !== 'rejected');
  const flashDealProduct = approvedProducts.find((p) => p.is_on_sale) || approvedProducts[0] || products[0];

  const handleMobileSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileSearchQuery.trim()) {
      if (onFilterShop) {
        onFilterShop({ searchQuery: mobileSearchQuery.trim(), categorySlug: undefined });
      } else {
        setCurrentPage('shop');
      }
    }
  };

  const handleNavigateWithFilter = (filterUpdates: Partial<FilterState>) => {
    if (onFilterShop) {
      onFilterShop(filterUpdates);
    } else {
      setCurrentPage('shop');
    }
  };

  // 1. New Arrivals: Sorted by newest creation date
  const newArrivals = [...approvedProducts].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 10);

  // 2. Used Products: Products marked as used or refurbished
  const usedProducts = approvedProducts.filter(
    (p) =>
      p.condition === 'used' ||
      p.condition === 'refurbished' ||
      p.name.includes('ያገለገለ') ||
      p.tags?.includes('used')
  );

  // 3. Brand New Products: Brand new or factory sealed
  const brandNewProducts = approvedProducts.filter(
    (p) => p.condition === 'brand_new' || (!p.condition && !p.name.includes('ያገለገለ'))
  );

  // 4. Popular Products: Highly rated with top reviews / trending
  const popularProducts = [...approvedProducts].sort(
    (a, b) => (b.review_count * b.rating) - (a.review_count * a.rating)
  ).slice(0, 10);

  // 5. Featured Products: Curated selection
  const featuredProducts = approvedProducts.filter((p) => p.is_featured !== false);

  return (
    <div className="space-y-10 sm:space-y-16 pb-20">
      
      {/* ============================================================== */}
      {/* 1. Mobile-First Instant Discovery Bar (< lg) */}
      {/* ============================================================== */}
      <div className="lg:hidden bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 px-4 pt-3.5 pb-4 text-white shadow-md">
        {/* Location & Trust */}
        <div className="flex items-center justify-between text-xs mb-2.5">
          <div className="flex items-center gap-1.5 text-emerald-200">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-semibold truncate">
              {language === 'am' ? 'አዲስ አበባ፣ ኢትዮጵያ' : 'Addis Ababa, Ethiopia'}
            </span>
          </div>
          <span className="text-[11px] text-emerald-300 font-medium">
            {language === 'am' ? 'የታመነ የገበያ መድረክ' : 'Verified Marketplace'}
          </span>
        </div>

        {/* Search Input */}
        <form onSubmit={handleMobileSearchSubmit} className="relative">
          <input
            type="text"
            value={mobileSearchQuery}
            onChange={(e) => setMobileSearchQuery(e.target.value)}
            placeholder={language === 'am' ? 'ምን መግዛት ይፈልጋሉ? (ስልክ፣ ቡና፣ ቦርሳ...)' : 'What are you looking for today?'}
            className="w-full pl-10 pr-24 py-2.5 bg-white text-slate-900 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-inner"
          />
          <Search className="w-4 h-4 text-emerald-700 absolute left-3 top-3" />
          <button
            type="submit"
            className="absolute right-1 top-1 bottom-1 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors"
          >
            {language === 'am' ? 'ፈልግ' : 'Search'}
          </button>
        </form>
      </div>

      {/* 2. Clean marketplace hero — aligned with the supplied Mela Market reference */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3">
        <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-green-100 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center min-h-[250px] sm:min-h-[300px]">
            <div className="p-6 sm:p-10 space-y-4 relative z-10">
              <p className="text-xs sm:text-sm font-bold tracking-wide text-emerald-700">
                {language === 'am' ? 'ጥራት ያላቸው ምርቶች • ተመጣጣኝ ዋጋ • ቀላል ግዢ' : 'Quality Products • Great Prices • Easy Shopping'}
              </p>
              <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight text-emerald-900">
                Mela Market
                <span className="block text-xl sm:text-2xl mt-2 text-slate-800 font-bold">
                  {language === 'am' ? 'የሚፈልጉትን በቀላሉ ያግኙ' : 'Find what you need, all in one place'}
                </span>
              </h1>
              <p className="text-sm text-slate-600 max-w-lg">
                {language === 'am' ? 'ከተለያዩ ምድቦች ምርቶችን ይመልከቱ፣ ዋጋዎችን ያወዳድሩ እና በቀላሉ ይግዙ።' : 'Explore products across categories, compare prices, and shop with ease.'}
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <button onClick={() => setCurrentPage('shop')} className="px-5 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold shadow-sm transition-colors cursor-pointer">
                  {language === 'am' ? 'ምርቶችን ይመልከቱ' : 'Explore Products'} <ArrowRight className="inline w-4 h-4 ml-1" />
                </button>
                <button onClick={() => handleNavigateWithFilter({ condition: 'used' })} className="px-5 py-2.5 rounded-full border border-emerald-200 bg-white text-emerald-800 text-sm font-semibold hover:bg-emerald-50 transition-colors cursor-pointer">
                  {language === 'am' ? 'ያገለገሉ ምርቶች' : 'Used Products'}
                </button>
              </div>
            </div>
            <div className="relative h-48 sm:h-64 lg:h-full min-h-[220px]">
              <img src="https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&q=85" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&q=85'; }} alt="Shopping products" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-transparent to-transparent lg:bg-gradient-to-r lg:from-emerald-50/70 lg:via-transparent lg:to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. Section: New Arrivals (አዲስ የገቡ ምርቶች) */}
      {/* ============================================================== */}
      <ProductCarouselSection
        id="new-arrivals"
        title={language === 'am' ? 'አዲስ የገቡ ምርቶች (New Arrivals)' : 'New Arrivals'}
        subtitle={language === 'am' ? 'በቅርቡ በሻጮች የተጫኑ አዳዲስ እቃዎች' : 'Freshly published items from sellers across Ethiopia'}
        badge={language === 'am' ? 'አዲስ ዝርዝር' : 'Just Listed'}
        icon={Sparkles}
        badgeColor="bg-emerald-100 text-emerald-900 border-emerald-300"
        products={newArrivals}
        onSelectProduct={onSelectProduct}
        onViewAll={() => handleNavigateWithFilter({ sortBy: 'newest' })}
        viewAllText={language === 'am' ? 'ሁሉንም አዲስ እቃዎች እይ' : 'View All New'}
      />

      {/* ============================================================== */}
      {/* 5. Section: Used Products (ያገለገሉ / ሰከንድ ሃንድ ምርቶች) */}
      {/* ============================================================== */}
      <ProductCarouselSection
        id="used-products"
        title={language === 'am' ? 'ያገለገሉ እቃዎች (Used & Pre-Owned)' : 'Used & Pre-Owned Products'}
        subtitle={language === 'am' ? 'በጥሩ ሁኔታ ላይ ያሉ፣ የተፈተሹ እና ተመጣጣኝ ዋጋ ያላቸው እቃዎች' : 'Verified, tested pre-owned items with attractive discounts'}
        badge={language === 'am' ? 'ያገለገሉ እቃዎች' : 'Pre-Owned Deals'}
        icon={Tag}
        badgeColor="bg-amber-100 text-amber-900 border-amber-300"
        products={usedProducts.length > 0 ? usedProducts : approvedProducts.slice(0, 6)}
        onSelectProduct={onSelectProduct}
        onViewAll={() => handleNavigateWithFilter({ condition: 'used' })}
        viewAllText={language === 'am' ? 'ሁሉንም ያገለገሉ እይ' : 'View All Used'}
      />

      {/* ============================================================== */}
      {/* 7. Section: Brand New Products (አዲስ / ያልተከፈቱ ምርቶች) */}
      {/* ============================================================== */}
      <ProductCarouselSection
        id="brand-new"
        title={language === 'am' ? 'አዲስ ያልተከፈቱ ምርቶች (Brand New)' : 'Brand New In Box'}
        subtitle={language === 'am' ? '100% ኦሪጅናል ፋብሪካ ያልተከፈቱ እና አዲስ ምርቶች' : 'Factory-sealed original products with full manufacturer warranty'}
        badge={language === 'am' ? '100% አዲስ' : '100% Brand New'}
        icon={Award}
        badgeColor="bg-emerald-100 text-emerald-900 border-emerald-300"
        products={brandNewProducts.length > 0 ? brandNewProducts : approvedProducts}
        onSelectProduct={onSelectProduct}
        onViewAll={() => handleNavigateWithFilter({ condition: 'brand_new' })}
        viewAllText={language === 'am' ? 'ሁሉንም አዲስ እይ' : 'View All Brand New'}
      />

      {/* ============================================================== */}
      {/* 8. Section: Popular Products (ተወዳጅ እና ተፈላጊ ምርቶች) */}
      {/* ============================================================== */}
      <ProductCarouselSection
        id="popular-products"
        title={language === 'am' ? 'ተወዳጅና ተፈላጊ ምርቶች (Popular & Trending)' : 'Most Popular Products'}
        subtitle={language === 'am' ? 'በደንበኞች ከፍተኛ ደረጃ የተሰጣቸው እና በብዛት የተሸመቱ' : 'Top rated by buyers with stellar verified reviews'}
        badge={language === 'am' ? 'ከፍተኛ ተፈላጊነት' : 'Trending Now'}
        icon={TrendingUp}
        badgeColor="bg-amber-100 text-amber-900 border-amber-300"
        products={popularProducts}
        onSelectProduct={onSelectProduct}
        onViewAll={() => handleNavigateWithFilter({ sortBy: 'rating' })}
        viewAllText={language === 'am' ? 'ሁሉንም ተወዳጅ እይ' : 'View All Popular'}
      />

      {/* ============================================================== */}
      {/* 9. Section: Featured Products (ተለይተው የቀረቡ ምርቶች) */}
      {/* ============================================================== */}
      <ProductCarouselSection
        id="featured-products"
        title={language === 'am' ? 'ተለይተው የቀረቡ ምርቶች (Featured Goods)' : 'Featured Marketplace Collection'}
        subtitle={language === 'am' ? 'በሜላ ገበያ በጥንቃቄ የተመረጡ ልዩ ምርቶች' : 'Curated premium selection hand-picked by our marketplace editors'}
        badge={language === 'am' ? 'ተለይቶ የቀረበ' : 'Editor Choice'}
        icon={ThumbsUp}
        badgeColor="bg-emerald-100 text-emerald-900 border-emerald-300"
        products={featuredProducts}
        onSelectProduct={onSelectProduct}
        onViewAll={() => handleNavigateWithFilter({ sortBy: 'featured' })}
        viewAllText={language === 'am' ? 'ሁሉንም ስብስቦች እይ' : 'View All Featured'}
      />

    </div>
  );
};

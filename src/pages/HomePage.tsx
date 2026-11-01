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

      {/* ============================================================== */}
      {/* 2. Hero Presentation Banner */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white py-10 sm:py-20">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-emerald-600/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-teal-600/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/40 border border-emerald-700/50 text-emerald-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'am' ? 'የኢትዮጵያ ቀዳሚ የገበያ መድረክ' : 'Premier Ethiopian Marketplace'}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
                {t('heroTitle1')}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
                  {t('heroTitle2')}
                </span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-lg max-w-xl leading-relaxed">
                {language === 'am'
                  ? 'ከአዲስና ያገለገሉ ስልኮችና ላፕቶፖች፣ እስከ ምርጥ የይርጋጨፌ ቡና እና የሀበሻ የቆዳ ውጤቶች በቀጥታ ከታመኑ ነጋዴዎች ጋር ይገበያዩ።'
                  : 'Buy and sell brand-new and pre-owned electronics, specialty highland coffee, bespoke leathercraft, and authentic goods directly with verified local sellers.'}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  onClick={() => setCurrentPage('shop')}
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-900/30 flex items-center gap-2 cursor-pointer group"
                >
                  <span>{t('exploreCatalog')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => handleNavigateWithFilter({ condition: 'used' })}
                  className="px-5 py-3.5 bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Tag className="w-4 h-4 text-amber-400" />
                  <span>{language === 'am' ? 'ያገለገሉ እቃዎችን እይ' : 'Used & Pre-Owned'}</span>
                </button>

                <button
                  onClick={() => setCurrentPage(user?.role === 'seller' ? 'seller-dashboard' : 'seller-register')}
                  className="px-5 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <PackagePlus className="w-4 h-4 text-slate-950" />
                  <span>{language === 'am' ? 'እቃዎን ይሽጡ' : 'Sell Your Item'}</span>
                </button>
              </div>

              {/* Quick Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 text-xs text-slate-400">
                <div>
                  <p className="font-bold text-white text-base">45,000+</p>
                  <p>{language === 'am' ? 'ገዢዎችና ሻጮች' : 'Active Members'}</p>
                </div>
                <div>
                  <p className="font-bold text-white text-base">100%</p>
                  <p>{language === 'am' ? 'የተረጋገጡ ሻጮች' : 'Verified Sellers'}</p>
                </div>
                <div>
                  <p className="font-bold text-white text-base">{language === 'am' ? 'ቀጥታ' : 'Direct'}</p>
                  <p>{language === 'am' ? 'የስልክና SMS ግንኙነት' : 'Call & SMS Contact'}</p>
                </div>
              </div>
            </div>

            {/* Right Hero Showcase Product Feature */}
            <div className="lg:col-span-5">
              <div className="relative bg-gradient-to-tr from-slate-800/90 to-slate-900/90 rounded-3xl p-5 sm:p-6 border border-slate-700/80 shadow-2xl backdrop-blur-md">
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-800 mb-5">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80"
                    alt="Featured hero product"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-emerald-600 text-white font-extrabold text-xs px-2.5 py-1 rounded shadow-md uppercase tracking-wider">
                    {language === 'am' ? 'አዲስ ኦሪጅናል' : 'Brand New In Box'}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                    <span>{language === 'am' ? 'ተለይቶ የቀረበ ምርት' : 'Featured Highlight'}</span>
                    <span className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> 4.9 (142 {language === 'am' ? 'አስተያየቶች' : 'reviews'})
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    {language === 'am' ? 'ኤተር ፕሮ ዋየርለስ የጆሮ ማዳመጫ' : 'Aether Pro Wireless ANC Headphones'}
                  </h3>

                  <p className="text-slate-400 text-xs line-clamp-2">
                    {language === 'am'
                      ? 'የላቀ የድምፅ ጥራት፣ የውጭ ጩኸት የሚቀንስ ዘመናዊ ቴክኖሎጂ እና ለ45 ሰዓታት የሚቆይ ባትሪ።'
                      : 'Studio titanium drivers with hybrid ANC and 45h playtime.'}
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="text-xl sm:text-2xl font-extrabold text-white font-mono">
                        {(199.99 * 125).toLocaleString()} {language === 'am' ? 'ብር' : 'ETB'}
                      </span>
                      <span className="text-xs text-slate-400 block font-mono">($199.99)</span>
                    </div>

                    <button
                      onClick={() => {
                        const target = products.find((p) => p.id === 'prod-1') || products[0];
                        if (target) onSelectProduct(target);
                      }}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      {language === 'am' ? 'ዝርዝር እይ' : 'View Details'}
                    </button>
                  </div>
                </div>

              </div>
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
      {/* 6. PROMINENT "SELL YOUR PRODUCT" AREA */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-6 sm:p-10 border border-emerald-800 shadow-xl">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-extrabold uppercase tracking-wider">
                <Store className="w-3.5 h-3.5" />
                <span>{language === 'am' ? 'ምርትዎን በቀላሉ ይሽጡ' : 'Sell Your Products Online'}</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                {language === 'am'
                  ? 'በሜላ ገበያ ላይ እቃዎችዎን በፍጥነት ይሽጡ!'
                  : 'Sell Your Products Fast on MELA MARKET!'}
              </h2>

              <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed max-w-2xl">
                {language === 'am'
                  ? 'ስልክ፣ ላፕቶፕ፣ የቆዳ ውጤቶች፣ አልባሳት፣ ቡና ወይም ማንኛውንም እቃ በነፃ ይጫኑ። በኢትዮጵያ ውስጥ ለሚገኙ በሺዎች ለሚቆጠሩ ገዢዎች ያቅርቡ። ገዢዎች በቀጥታ በስልክና በኤስኤምኤስ ያገኙዎታል!'
                  : 'List brand new or used electronics, smartphones, apparel, specialty coffee, or handmade crafts. Connect with thousands of verified Ethiopian buyers with direct phone and SMS inquiry.'}
              </p>

              {/* Three Value Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-emerald-200">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{language === 'am' ? '0% የኮሚሽን ክፍያ (ነፃ ምዝገባ)' : '0% Listing Fee'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{language === 'am' ? 'ቀጥታ የደንበኛ ስልክና SMS' : 'Direct Buyer Calls & SMS'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{language === 'am' ? 'የራስዎ ዲጂታል ሱቅ' : 'Personal Verified Shop'}</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button
                  onClick={() =>
                    setCurrentPage(user?.role === 'seller' ? 'seller-dashboard' : 'seller-register')
                  }
                  className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-extrabold text-sm transition-all shadow-lg cursor-pointer flex items-center gap-2"
                >
                  <PackagePlus className="w-4 h-4" />
                  <span>
                    {user?.role === 'seller'
                      ? (language === 'am' ? 'ወደ ሻጭ ዳሽቦርድ ይሂዱ' : 'Go to Seller Dashboard')
                      : (language === 'am' ? 'እቃ ለመሸጥ አሁኑኑ ይመዝገቡ' : 'Start Selling Today')}
                  </span>
                </button>

                {!user && (
                  <button
                    onClick={() => setCurrentPage('seller-register')}
                    className="px-5 py-3.5 bg-emerald-800/80 hover:bg-emerald-700/80 text-white border border-emerald-600 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer"
                  >
                    {language === 'am' ? 'የሻጭ መለያ አለኝ (መግቢያ)' : 'Seller Log In'}
                  </button>
                )}
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="p-6 bg-emerald-950/70 border border-emerald-700/60 rounded-3xl text-center space-y-3 max-w-xs shadow-inner">
                <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto shadow-md">
                  <Store className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-white text-base">
                  {language === 'am' ? 'በቀላሉ ሱቅዎን ይክፈቱ' : 'Create Your Shop in 2 Mins'}
                </h4>
                <p className="text-[11px] text-emerald-200">
                  {language === 'am'
                    ? 'ስምዎን፣ የሱቅዎን መረጃ እና ስልክዎን ያስገቡ፤ እቃዎችዎን ወዲያውኑ መሸጥ ይጀምሩ።'
                    : 'Add your shop info, upload product photos, and start receiving buyer calls immediately.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

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

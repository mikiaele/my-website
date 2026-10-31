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
  Smartphone,
  CheckCircle2,
  Store,
  MapPin,
  BadgeCheck,
} from 'lucide-react';
import { Product, Category, Shop } from '../types/database.types.ts';
import { PageView } from '../types/index.ts';
import { ProductCard } from '../components/products/ProductCard.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

interface HomePageProps {
  products: Product[];
  categories: Category[];
  shops?: Shop[];
  setCurrentPage: (page: PageView) => void;
  onSelectProduct: (product: Product) => void;
  onSelectCategory: (slug: string) => void;
  onSelectShop?: (shop: Shop) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  categories,
  shops = [],
  setCurrentPage,
  onSelectProduct,
  onSelectCategory,
  onSelectShop,
}) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'all' | 'featured' | 'trending' | 'sale'>('all');

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

  // Approved products visible to buyers
  const approvedProducts = products.filter((p) => p.approval_status !== 'rejected');
  const flashDealProduct = approvedProducts.find((p) => p.is_on_sale) || approvedProducts[0] || products[0];

  const filteredProducts = approvedProducts.filter((p) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'trending') return p.is_trending;
    if (activeTab === 'sale') return p.is_on_sale || (p.discount_price && p.discount_price < p.price);
    // 'featured' tab: include any product marked as featured or newly published
    return p.is_featured !== false;
  });

  const productsToDisplay = filteredProducts.length > 0 ? filteredProducts : approvedProducts;

  return (
    <div className="space-y-16 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white py-16 sm:py-24">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-emerald-600/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-teal-600/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/40 border border-emerald-700/50 text-emerald-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('heroBadge')}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
                {t('heroTitle1')}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
                  {t('heroTitle2')}
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed">
                {t('heroSubtitle')}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => setCurrentPage('shop')}
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-900/30 flex items-center gap-2 cursor-pointer group"
                >
                  <span>{t('exploreCatalog')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => {
                    const dealsSection = document.getElementById('flash-deals');
                    dealsSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>{t('limitedDeals')}</span>
                </button>
              </div>

              {/* Quick Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 text-xs text-slate-400">
                <div>
                  <p className="font-bold text-white text-base">45,000+</p>
                  <p>{t('satisfiedCustomers')}</p>
                </div>
                <div>
                  <p className="font-bold text-white text-base">4.9 / 5.0</p>
                  <p>{t('verifiedReviews')}</p>
                </div>
                <div>
                  <p className="font-bold text-white text-base">2-3 {language === 'am' ? 'ቀናት' : 'Days'}</p>
                  <p>{t('fastDispatch')}</p>
                </div>
              </div>
            </div>

            {/* Right Hero Showcase Product Feature */}
            <div className="lg:col-span-5">
              <div className="relative bg-gradient-to-tr from-slate-800/90 to-slate-900/90 rounded-3xl p-6 border border-slate-700/80 shadow-2xl backdrop-blur-md">
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-800 mb-6">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80"
                    alt="Hero featured product"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-rose-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider">
                    {language === 'am' ? 'ልዩ ቅናሽ -20%' : 'Special Offer -20%'}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                    <span>{language === 'am' ? 'ተለይቶ የቀረበ አዲስ ምርት' : 'Spotlight Release'}</span>
                    <span className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> 4.9 (142 {language === 'am' ? 'አስተያየቶች' : 'reviews'})
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white">
                    {language === 'am' ? 'ኤተር ፕሮ ዋየርለስ የጆሮ ማዳመጫ' : 'Aether Pro Wireless ANC Headphones'}
                  </h3>

                  <p className="text-slate-400 text-xs line-clamp-2">
                    {language === 'am'
                      ? 'የላቀ የድምፅ ጥራት፣ የውጭ ጩኸት የሚቀንስ ዘመናዊ ቴክኖሎጂ እና ለ45 ሰዓታት የሚቆይ ባትሪ።'
                      : 'Custom 40mm titanium drivers with studio hybrid ANC and 45h playtime.'}
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-white font-mono">$199.99</span>
                      <span className="text-sm text-slate-500 line-through font-mono">$249.99</span>
                    </div>

                    <button
                      onClick={() => {
                        const target = products.find((p) => p.id === 'prod-1') || products[0];
                        if (target) onSelectProduct(target);
                      }}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
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

      {/* Featured Departments / Category Scroller */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block">
              {t('marketCatalog')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              {t('shopByDepartment')}
            </h2>
          </div>

          <button
            onClick={() => setCurrentPage('categories')}
            className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>{t('allCategories')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className="group bg-white rounded-2xl border border-slate-200/80 p-4 hover:border-emerald-300 hover:shadow-lg transition-all duration-200 text-center flex flex-col items-center cursor-pointer"
            >
              <div className="w-20 h-20 rounded-full overflow-hidden mb-3 bg-slate-100 border border-slate-200 group-hover:scale-105 transition-transform duration-300">
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm group-hover:text-emerald-700 transition-colors line-clamp-1">
                {cat.name}
              </h4>
              <span className="text-[11px] text-slate-400 mt-0.5">
                {cat.item_count ? `${cat.item_count} ${t('itemsCount')}` : t('explore')}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Flash Deals with Live Countdown */}
      {flashDealProduct && (
        <section id="flash-deals" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl text-white p-6 sm:p-10 shadow-xl overflow-hidden relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-slate-950 font-extrabold text-xs px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> {t('dealOfTheDay')}
                  </span>
                  <span className="text-emerald-200 text-xs font-semibold">{t('limitedQuantity')}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {flashDealProduct.name}
                </h2>

                <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed max-w-xl">
                  {flashDealProduct.description}
                </p>

                {/* Countdown Timer Blocks */}
                <div className="pt-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-emerald-200 mb-2">
                    <Clock className="w-3.5 h-3.5" /> {t('promotionEndsIn')}
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <div className="bg-emerald-950/80 px-3 py-2 rounded-xl text-center border border-emerald-700 min-w-[56px]">
                      <span className="text-xl font-extrabold text-white block">
                        {String(timeLeft.hours).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] text-emerald-300 uppercase">{t('hours')}</span>
                    </div>
                    <span className="text-xl font-bold text-emerald-300">:</span>
                    <div className="bg-emerald-950/80 px-3 py-2 rounded-xl text-center border border-emerald-700 min-w-[56px]">
                      <span className="text-xl font-extrabold text-white block">
                        {String(timeLeft.minutes).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] text-emerald-300 uppercase">{t('mins')}</span>
                    </div>
                    <span className="text-xl font-bold text-emerald-300">:</span>
                    <div className="bg-emerald-950/80 px-3 py-2 rounded-xl text-center border border-emerald-700 min-w-[56px]">
                      <span className="text-xl font-extrabold text-white block">
                        {String(timeLeft.seconds).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] text-emerald-300 uppercase">{t('secs')}</span>
                    </div>
                  </div>
                </div>

                {/* Price and CTA */}
                <div className="flex items-center gap-4 pt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white font-mono">
                      ${(flashDealProduct.discount_price ?? flashDealProduct.price).toFixed(2)}
                    </span>
                    {flashDealProduct.discount_price && (
                      <span className="text-base text-emerald-300 line-through font-mono">
                        ${flashDealProduct.price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => onSelectProduct(flashDealProduct)}
                    className="px-6 py-3 bg-white hover:bg-emerald-50 text-emerald-900 rounded-xl text-sm font-bold transition-all shadow-md cursor-pointer"
                  >
                    {t('claimDealNow')}
                  </button>
                </div>
              </div>

              {/* Product Visual */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-700/50">
                  <img
                    src={flashDealProduct.image_url}
                    alt={flashDealProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* Product Showcase Tabs (Featured, Trending, On Sale) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block">
              {t('curatedSelection')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              {t('featuredCollections')}
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'am' ? 'ሁሉም ምርቶች' : 'All Products'}
            </button>
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'featured'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('featuredGoods')}
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'trending'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('trendingNow')}
            </button>
            <button
              onClick={() => setActiveTab('sale')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'sale'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('specialOffers')}
            </button>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {productsToDisplay.slice(0, 12).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => setCurrentPage('shop')}
            className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-sm font-bold transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <span>{language === 'am' ? `ሁሉንም ${products.length} ምርቶች ይመልከቱ` : `View All ${products.length} Products`}</span>
            <ArrowRight className="w-4 h-4 text-emerald-700" />
          </button>
        </div>
      </section>

      {/* Dual Split Promotional Story Banners */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Promo Card 1: Ethiopian Single Origin Coffee */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white min-h-[380px] flex flex-col justify-end p-8 group">
            <img
              src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80"
              alt="Artisan coffee beans"
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="relative z-10 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                {language === 'am' ? 'ከቀጥታ ምንጭ የቀረበ' : 'Direct Origin Series'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {language === 'am' ? 'ይርጋጨፌ ከፍተኛ ተራራማ ቡና' : 'Highland Reserve Yirgacheffe'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md">
                {language === 'am'
                  ? 'ከ 2,100 ሜትር በላይ ከፍታ ባለው የእሳተ ገሞራ አፈር ላይ የተመረተ። በእጅ የተለቀመ፣ የታጠበና በፀሐይ የደረቀ ምርጥ የኢትዮጵያ ቡና።'
                  : 'Grown above 2,100 meters on volcanic soils. Hand-picked, washed, and sun-cured with notes of citrus bergamot.'}
              </p>
              <button
                onClick={() => onSelectCategory('organic-gourmet')}
                className="mt-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <span>{language === 'am' ? 'ልዩ የይርጋጨፌ ቡና ይሸምቱ' : 'Shop Specialty Coffee'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Promo Card 2: Minimalist Living & Ceramics */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white min-h-[380px] flex flex-col justify-end p-8 group">
            <img
              src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80"
              alt="Ceramics and home goods"
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="relative z-10 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                {language === 'am' ? 'የእደ-ጥበብ ስብስብ' : 'Atelier Collection'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {language === 'am' ? 'ሴራሚክስ እና የቤት ማስዋቢያ' : 'Nordic Stoneware & Living'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md">
                {language === 'am'
                  ? 'በእጅ የተሰሩ የሸክላና ሴራሚክ ውጤቶች እንዲሁም ዘመናዊ የቢሮ እና የመኖሪያ ቤት መገልገያዎች።'
                  : 'Hand-thrown ceramics with matte reactive glazes and solid black walnut workspace goods.'}
              </p>
              <button
                onClick={() => onSelectCategory('home-living')}
                className="mt-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <span>{language === 'am' ? 'የቤት እቃዎችን ያስሱ' : 'Explore Home Goods'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* Featured Independent Marketplace Vendors Section */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider mb-2">
              <Store className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t('verifiedVendors')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('shopDirectFromMerchants')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              {t('shopDirectDesc')}
            </p>
          </div>

          <button
            onClick={() => setCurrentPage('seller-register')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Store className="w-4 h-4" />
            <span>{t('openOwnShopBtn')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {shops.slice(0, 4).map((shop) => {
            const shopProds = products.filter((p) => p.seller_id === shop.id);
            return (
              <div
                key={shop.id}
                onClick={() => onSelectShop && onSelectShop(shop)}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 cursor-pointer flex flex-col group"
              >
                <div className="relative h-28 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={shop.banner_url}
                    alt={shop.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                  <div className="absolute -bottom-4 left-4">
                    <img
                      src={shop.logo_url}
                      alt={shop.name}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-md bg-white"
                    />
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className="bg-white/95 text-slate-800 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {shop.rating?.toFixed(1) || '5.0'}
                    </span>
                  </div>
                </div>

                <div className="p-4 pt-6 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors line-clamp-1">
                        {shop.name}
                      </h4>
                      {shop.verified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {shop.city || 'Addis Ababa'}
                    </p>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {shop.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px] font-medium">
                      {shopProds.length} {t('itemsCount')}
                    </span>
                    <span className="text-emerald-700 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      {t('visitShop')} &rarr;
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Android Application Readiness Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-700 text-emerald-400 text-xs font-semibold">
              <Smartphone className="w-3.5 h-3.5" />
              <span>{language === 'am' ? 'ለአንድሮይድ መተግበሪያ የተዘጋጀ' : 'Full-Stack Android Ready'}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {language === 'am' ? 'ለድረ-ገጽ እና ለሞባይል አንድ ወጥ ሱፓቤዝ (Supabase) ጀርባ' : 'One Unified Supabase Backend for Web & Mobile'}
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              {language === 'am'
                ? 'ሜላ ገበያ በጋራ ታይፕስክሪፕት ሞዴሎች፣ የZod ማረጋገጫዎች እና በማዕከላዊ የሱፓቤዝ REST/PostgreSQL ኤፒአይ የተገነባ ነው። ለወደፊቱ የሚሰራው የ React Native + Expo አንድሮይድ አፕሊኬሽን ያለ ምንም የጀርባ ለውጥ በቀጥታ ይገናኛል።'
                : 'MELA MARKET is architected with shared TypeScript models, Zod validation schemas, and a centralized Supabase REST/PostgreSQL API. Your future React Native + Expo Android application connects out of the box with zero backend rewrites.'}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {language === 'am' ? 'የፖስትግሬስ ዳታቤዝ ሰንጠረዦች ዝግጁ ናቸው' : 'PostgreSQL Schemas Ready'}
              </span>
              <span className="flex items-center gap-1.5 text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {language === 'am' ? 'የሱፓቤዝ ማረጋገጫ እና RLS ጥበቃ' : 'Supabase Auth RLS'}
              </span>
              <span className="flex items-center gap-1.5 text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {language === 'am' ? 'የጋራ ታይፕስክሪፕት አይነቶች' : 'Shared TypeScript Types'}
              </span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setCurrentPage('admin')}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-colors cursor-pointer"
            >
              {language === 'am' ? 'የቴክኖሎጂ እና የሞባይል ዝርዝር እይ' : 'View Supabase & Mobile Specs'}
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

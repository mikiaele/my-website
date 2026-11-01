import React, { useState } from 'react';
import { ArrowRight, Layers, Search, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import { Category, Product } from '../types/database.types.ts';
import { PageView } from '../types/index.ts';
import { useLanguage } from '../context/LanguageContext.tsx';
import { ProductCard } from '../components/products/ProductCard.tsx';

interface CategoriesPageProps {
  categories: Category[];
  products: Product[];
  setCurrentPage: (page: PageView) => void;
  onSelectCategory: (slug: string) => void;
  onSelectProduct?: (product: Product) => void;
}

interface CategoryDetails {
  slug: string;
  subcategories: { nameAm: string; nameEn: string; query: string }[];
}

const CATEGORY_TAXONOMY: Record<string, { nameAm: string; nameEn: string; query: string }[]> = {
  electronics: [
    { nameAm: 'የጆሮ ማዳመጫዎች (Headphones & Audio)', nameEn: 'Headphones & Audio', query: 'headphone' },
    { nameAm: 'ስማርት ሰዓቶች (Smartwatches & Bands)', nameEn: 'Smartwatches', query: 'smartwatch' },
    { nameAm: 'ስልኮችና ታብሌቶች (Phones & Tablets)', nameEn: 'Phones & Tablets', query: 'phone' },
    { nameAm: 'ላፕቶፖችና ኮምፒውተር (Laptops & PC)', nameEn: 'Laptops & Computers', query: 'laptop' },
    { nameAm: 'ካሜራና ፎቶግራፊ (Cameras & Optics)', nameEn: 'Cameras & Optics', query: 'camera' },
  ],
  apparel: [
    { nameAm: 'የቆዳ ቦርሳዎች (Leather Messenger & Bags)', nameEn: 'Leather Bags', query: 'bag' },
    { nameAm: 'የኪስ ቦርሳና ቀበቶ (Wallets & Accessories)', nameEn: 'Wallets & Belts', query: 'wallet' },
    { nameAm: 'የሀበሻ ባህላዊ አልባሳት (Traditional Attire)', nameEn: 'Traditional Attire', query: 'traditional' },
    { nameAm: 'የቆዳ ጫማዎች (Artisan Shoes)', nameEn: 'Artisan Shoes', query: 'shoes' },
    { nameAm: 'የወንዶችና የሴቶች ልብሶች (Apparel)', nameEn: 'Apparel', query: 'jacket' },
  ],
  'home-living': [
    { nameAm: 'ጀበናና ሲኒዎች (Jebena & Coffee Sets)', nameEn: 'Jebena & Coffee Sets', query: 'jebena' },
    { nameAm: 'የሴራሚክ ሳህኖች (Ceramic Dinnerware)', nameEn: 'Ceramic Dinnerware', query: 'ceramic' },
    { nameAm: 'የቤት ማስዋቢያዎች (Living Room Decor)', nameEn: 'Home Accents', query: 'decor' },
    { nameAm: 'የቢሮና የጠረጴዛ እቃዎች (Desk Accessories)', nameEn: 'Desk Accessories', query: 'desk' },
  ],
  'organic-gourmet': [
    { nameAm: 'ይርጋጨፌ ስፔሻሊቲ ቡና (Yirgacheffe Coffee)', nameEn: 'Yirgacheffe Coffee', query: 'yirgacheffe' },
    { nameAm: 'የተፈጥሮ ተራራማ ማር (Raw Mountain Honey)', nameEn: 'Raw Wildflower Honey', query: 'honey' },
    { nameAm: 'ሲዳማና ሃረር ቡና (Sidama & Harar)', nameEn: 'Sidama Coffee', query: 'coffee' },
    { nameAm: 'ኦርጋኒክ ቅመሞች (Organic Spices)', nameEn: 'Organic Spices', query: 'spices' },
  ],
  'beauty-wellness': [
    { nameAm: 'የተፈጥሮ ዘይቶች (Botanical Oils)', nameEn: 'Botanical Oils', query: 'oil' },
    { nameAm: 'የዕፅዋት ሳሙናና ክሬም (Natural Skincare)', nameEn: 'Herbal Skincare', query: 'soap' },
    { nameAm: 'የፀጉር እንክብካቤ (Natural Haircare)', nameEn: 'Natural Haircare', query: 'hair' },
  ],
  'sports-adventure': [
    { nameAm: 'የእግር ጉዞና ካምፒንግ (Hiking & Trekking)', nameEn: 'Hiking & Outdoors', query: 'hiking' },
    { nameAm: 'የስፖርት ሰዓትና ጂፒኤስ (Sports GPS Watches)', nameEn: 'GPS & Trackers', query: 'gps' },
    { nameAm: 'የስፖርት አልባሳት (Athletic Gear)', nameEn: 'Athletic Wear', query: 'fitness' },
  ],
};

export const CategoriesPage: React.FC<CategoriesPageProps> = ({
  categories,
  products,
  setCurrentPage,
  onSelectCategory,
  onSelectProduct,
}) => {
  const { t, language } = useLanguage();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  // Filter categories by search
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  // Products belonging to the selected category (if any)
  const activeCategory = categories.find((c) => c.slug === selectedSlug);
  const activeProducts = selectedSlug
    ? products.filter((p) => p.category?.slug === selectedSlug || p.category_id === selectedSlug)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-200">
          <Layers className="w-3.5 h-3.5 text-emerald-700" />
          <span>{language === 'am' ? 'የምርት ክፍሎች እና ንዑስ ምድቦች' : 'Categories & Subcategories'}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {language === 'am' ? 'ሜላ ገበያን በምርት ምድቦች ያስሱ' : 'Browse All Categories on MELA MARKET'}
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
          {language === 'am'
            ? 'ከአዲስና ያገለገሉ ስልኮችና ላፕቶፖች፣ እስከ እውነተኛ የኢትዮጵያ ሌዘር፣ የይርጋጨፌ ቡና እና የባህል እቃዎች በቀላሉ ያግኙ።'
            : 'Explore brand-new & verified pre-owned phones, electronics, artisan leather goods, specialty coffee, and traditional crafts organized by department.'}
        </p>

        {/* Quick Search in Categories */}
        <div className="pt-2 max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder={language === 'am' ? 'ምድብ ፈልግ (ኤሌክትሮኒክስ፣ ቡና፣ ሌዘር...)' : 'Search categories...'}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>
      </div>

      {/* Categories Grid with Subcategories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((cat) => {
          const count = products.filter(
            (p) => p.category_id === cat.id || p.category?.slug === cat.slug
          ).length;
          const subcats = CATEGORY_TAXONOMY[cat.slug] || [];
          const isSelected = selectedSlug === cat.slug;

          return (
            <div
              key={cat.id}
              className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-lg'
                  : 'border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300'
              }`}
            >
              {/* Image Banner */}
              <div
                onClick={() => onSelectCategory(cat.slug)}
                className="relative aspect-16/9 w-full overflow-hidden bg-slate-100 cursor-pointer group"
              >
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
                <div className="absolute bottom-3.5 left-4 right-4 text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-extrabold">
                      {count} {t('itemsCount')}
                    </span>
                    <span className="text-[11px] text-white/80 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 font-bold">
                      {language === 'am' ? 'ሁሉንም እይ' : 'View All'} &rarr;
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mt-0.5">{cat.name}</h3>
                </div>
              </div>

              {/* Subcategories & Details */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-slate-500 line-clamp-2">
                  {cat.description || (language === 'am' ? 'በዚህ ክፍል ውስጥ የተካተቱ የተመረጡ ጥራት ያላቸውን ምርቶች ያስሱ።' : 'Explore hand-selected merchandise in this department.')}
                </p>

                {/* Subcategories Chips */}
                {subcats.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      {language === 'am' ? 'ንዑስ ክፍሎች / Subcategories' : 'Subcategories'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {subcats.map((sub, sidx) => (
                        <button
                          key={sidx}
                          onClick={() => onSelectCategory(cat.slug)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200/80 rounded-lg text-[11px] font-medium text-slate-700 transition-colors cursor-pointer text-left"
                        >
                          {language === 'am' ? sub.nameAm : sub.nameEn}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick actions row */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedSlug(isSelected ? null : cat.slug)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-700 text-white'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    {isSelected
                      ? (language === 'am' ? 'ምርቶችን ዝጋ' : 'Hide Products')
                      : (language === 'am' ? `ምርቶችን እዚህ እይ (${count})` : `Show Items (${count})`)}
                  </button>

                  <button
                    onClick={() => onSelectCategory(cat.slug)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{language === 'am' ? 'ሱቁን ክፈት' : 'Open Catalog'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Category Inline Products Showcase */}
      {selectedSlug && activeCategory && (
        <div className="p-6 bg-slate-50/80 rounded-3xl border border-emerald-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block">
                {language === 'am' ? 'በምድቡ ውስጥ የተገኙ ምርቶች' : 'Products In This Category'}
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                {activeCategory.name}
              </h3>
            </div>

            <button
              onClick={() => onSelectCategory(activeCategory.slug)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <span>{language === 'am' ? 'ሁሉንም በሱቅ ውስጥ እይ' : 'View In Shop'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeProducts.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              {language === 'am' ? 'በዚህ ምድብ ውስጥ እስካሁን ምንም ምርት አልተጨመረም።' : 'No items found in this department yet.'}
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {activeProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onSelect={onSelectProduct || (() => {})}
                />
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

import React from 'react';
import { ArrowRight, Layers } from 'lucide-react';
import { Category, Product } from '../types/database.types.ts';
import { PageView } from '../types/index.ts';
import { useLanguage } from '../context/LanguageContext.tsx';

interface CategoriesPageProps {
  categories: Category[];
  products: Product[];
  setCurrentPage: (page: PageView) => void;
  onSelectCategory: (slug: string) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({
  categories,
  products,
  setCurrentPage,
  onSelectCategory,
}) => {
  const { t, language } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5" />
          <span>{language === 'am' ? 'የምርት ክፍሎች እና ስብስቦች' : 'Departments & Collections'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {language === 'am' ? 'ሜላ ገበያን በምርት ምድቦች ያስሱ' : 'Explore MELA MARKET by Category'}
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          {language === 'am'
            ? 'ከልዩ የይርጋጨፌ ቡና እስከ እውነተኛ የኢትዮጵያ ሌዘር ውጤቶች፣ ዘመናዊ ኤሌክትሮኒክስ እና የቤት ማስዋቢያ እቃዎች በምድብ ተዘጋጅተው የቀረቡ።'
            : 'From micro-lot Ethiopian coffees to bespoke leathercraft, aerospace smartwatches, and sustainable apparel, discover premium goods organized by department.'}
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat) => {
          const count = products.filter((p) => p.category_id === cat.id || p.category?.slug === cat.slug).length;

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className="group relative bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col cursor-pointer"
            >
              <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-xs uppercase tracking-widest text-emerald-300 font-bold">
                    {count} {t('itemsCount')}
                  </span>
                  <h3 className="text-xl font-bold">{cat.name}</h3>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {cat.description || (language === 'am' ? 'በዚህ ክፍል ውስጥ የተካተቱ የተመረጡ ጥራት ያላቸውን ምርቶች ያስሱ።' : 'Explore our hand-selected assortment in this premier department.')}
                </p>

                <div className="pt-2 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
                  <span>{language === 'am' ? 'ምድቡን ያስሱ' : 'Browse Department'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

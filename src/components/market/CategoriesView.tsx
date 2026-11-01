import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Coffee, 
  Shirt, 
  Smartphone, 
  Palette, 
  Wheat, 
  Sparkles, 
  Tag, 
  ArrowRight 
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Coffee: <Coffee className="w-8 h-8" />,
  Shirt: <Shirt className="w-8 h-8" />,
  Smartphone: <Smartphone className="w-8 h-8" />,
  Palette: <Palette className="w-8 h-8" />,
  Wheat: <Wheat className="w-8 h-8" />,
  Sparkles: <Sparkles className="w-8 h-8" />,
};

export const CategoriesView: React.FC = () => {
  const { categories, products, setSelectedCategory, setActiveTab, language, t } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950">
          {language === 'am' ? 'የገበያ ምድቦች' : 'Marketplace Categories'}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          {language === 'am' 
            ? 'ከቡና እና ቅመማቅመም እስከ ባህላዊ አልባሳት እና ኤሌክትሮኒክስ ያሉትን ምርቶች ያስሱ።' 
            : 'Explore authentic Ethiopian merchandise organized by verified product category.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const count = products.filter(p => p.category_id === cat.id && p.status === 'approved').length;
          const icon = iconMap[cat.icon] || <Tag className="w-8 h-8" />;

          return (
            <div
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setActiveTab('marketplace');
              }}
              className="group bg-white rounded-3xl border border-gray-200 p-6 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-950/5 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-700 group-hover:text-amber-300 transition-all shadow-xs">
                  {icon}
                </div>

                <div>
                  <h3 className="text-lg font-black text-gray-950 group-hover:text-emerald-800 transition-colors">
                    {language === 'am' ? cat.name_am : cat.name_en}
                  </h3>
                  <p className="text-xs text-gray-400 font-semibold mt-0.5">
                    {language === 'am' ? cat.name_en : cat.name_am}
                  </p>
                  {cat.description && (
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  {count} {language === 'am' ? 'ምርቶች' : 'Products'}
                </span>

                <span className="font-bold text-gray-500 group-hover:text-emerald-700 flex items-center gap-1 transition-colors">
                  <span>Browse</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

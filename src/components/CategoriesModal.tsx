import React from 'react';
import { X, Layers, ArrowRight, Sparkles } from 'lucide-react';
import { Category } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface CategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export const CategoriesModal: React.FC<CategoriesModalProps> = ({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const { t, language } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-left flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold tracking-tight">
                {t.categories}
              </h3>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                {language === 'am'
                  ? 'በምርት ክፍሎች ያስሱ እና የሚፈልጉትን ያግኙ'
                  : 'Browse catalog departments and curated collections'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-emerald-900/50 hover:bg-emerald-900 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3">
          {/* View All Option */}
          <button
            type="button"
            onClick={() => {
              onSelectCategory(null);
              onClose();
            }}
            className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
              selectedCategory === null
                ? 'border-emerald-600 bg-emerald-50/80 shadow-xs'
                : 'border-slate-200 hover:border-emerald-400 bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">{t.filter_all}</h4>
                <p className="text-xs text-slate-500">
                  {language === 'am' ? 'ሁሉንም የምርት ክፍሎች በአንድ ላይ ይመልከቱ' : 'Show all products from all departments'}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-600" />
          </button>

          {/* Individual Categories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const name = language === 'am' ? cat.name_am : cat.name_en;
              const desc = language === 'am' ? cat.description_am : cat.description_en;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    onSelectCategory(cat.id);
                    onClose();
                  }}
                  className={`p-3.5 rounded-2xl border-2 text-left flex items-start gap-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/80 shadow-xs'
                      : 'border-slate-200 hover:border-emerald-400 bg-white'
                  }`}
                >
                  <img
                    src={cat.image_url || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e'}
                    alt={name}
                    className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {name}
                    </h4>
                    {desc && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                        {desc}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

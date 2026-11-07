import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Category } from '../types';
import { Search, MapPin, Sparkles, Filter } from 'lucide-react';

interface HeroProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedLocation: string;
  onLocationChange: (loc: string) => void;
  onExecuteSearch: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  selectedLocation,
  onLocationChange,
  onExecuteSearch,
}) => {
  const { language, t } = useLanguage();

  const LOCATIONS = [
    { value: 'all', label: t('allLocations') },
    { value: 'Addis Ababa', label: 'Addis Ababa (አዲስ አበባ)' },
    { value: 'Oromia', label: 'Oromia (ኦሮሚያ)' },
    { value: 'Amhara', label: 'Amhara (አማራ)' },
    { value: 'Tigray', label: 'Tigray (ትግራይ)' },
    { value: 'Hawassa', label: 'Hawassa (ሀዋሳ)' },
    { value: 'Dire Dawa', label: 'Dire Dawa (ድሬዳዋ)' },
    { value: 'Bahir Dar', label: 'Bahir Dar (ባህር ዳር)' },
    { value: 'Mekelle', label: 'Mekelle (መቐለ)' },
  ];

  const getCategoryName = (cat: Category) => {
    if (language === 'ti') return cat.name_ti;
    if (language === 'en') return cat.name_en;
    return cat.name_am;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExecuteSearch();
  };

  return (
    <div className="relative bg-gradient-to-b from-emerald-50/70 via-white to-slate-50 border-b border-emerald-100/60 py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* Brand Kicker */}
        <p className="text-xs font-semibold tracking-wider uppercase text-emerald-800 mb-2">
          {t('siteName')} · Ethiopian Marketplace
        </p>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight text-balance">
          {t('subtagline')}
        </h1>

        {/* Search Bar Form */}
        <form onSubmit={handleSubmit} className="mt-8 max-w-3xl mx-auto">
          <div className="bg-white p-2 rounded-2xl shadow-lg shadow-emerald-950/5 border border-emerald-100 flex flex-col sm:flex-row items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 w-full flex items-center pl-3">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
              />
            </div>

            {/* Location Selector */}
            <div className="relative w-full sm:w-56 flex items-center pl-3 sm:border-l sm:border-slate-200">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <select
                value={selectedLocation}
                onChange={(e) => onLocationChange(e.target.value)}
                className="w-full px-2 py-2.5 text-xs text-slate-700 font-medium bg-transparent focus:outline-none cursor-pointer"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc.value} value={loc.value}>
                    {loc.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm shadow-emerald-700/20 active:scale-95 shrink-0"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
              <span>{t('search')}</span>
            </button>
          </div>
        </form>

        {/* Category Horizontal Filter Pills/Buttons */}
        <div className="mt-6 flex items-center justify-center flex-wrap gap-2 text-xs">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-3 py-1.5 rounded-full font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200'
            }`}
          >
            {t('allCategories')}
          </button>
          {categories.slice(0, 7).map((cat, idx) => {
            const catKey = cat.slug || String(cat.id || `cat-${idx}`);
            return (
              <button
                key={catKey}
                onClick={() => onSelectCategory(cat.slug || String(cat.id))}
                className={`px-3 py-1.5 rounded-full font-medium transition-all ${
                  selectedCategory === (cat.slug || String(cat.id))
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200'
                }`}
              >
                {getCategoryName(cat)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

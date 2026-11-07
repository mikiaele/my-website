import React from 'react';
import { Search, MapPin, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { categoriesList, regionsList } from '../translations';

interface HeroProps {
  onSearch: (query: string, category: string, region: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onSearch }) => {
  const { t, language, activeFilter, setActiveFilter } = useAuth();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(activeFilter.search, activeFilter.category, activeFilter.region);
  };

  return (
    <section className="relative bg-gradient-to-b from-emerald-50/70 via-white to-slate-50 border-b border-emerald-100/60 py-8 md:py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Message & Search System */}
          <div className="lg:col-span-7">
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>{t.tagline}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
              {language === 'am' ? (
                <>
                  የኢትዮጵያ ታማኝ የገበያ መድረክ <span className="text-emerald-700">መላ ማርኬት</span>
                </>
              ) : language === 'ti' ? (
                <>
                  ናይ ኢትዮጵያ ሕጋውን እሙንን ዕዳጋ <span className="text-emerald-700">መላ ማርኬት</span>
                </>
              ) : (
                <>
                  Buy & Sell with Trust on <span className="text-emerald-700">Mela Market</span>
                </>
              )}
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 max-w-xl">
              {language === 'am'
                ? 'አዳዲስ እና ያገለገሉ እቃዎችን በቀጥታ በካሜራ ፎቶ በማንሳት ይሽጡ ወይም ይግዙ። በቀጥታ ከሻጩ ጋር ይገናኙ።'
                : language === 'ti'
                ? 'ሓደሽትን ዝተጠቐምኩምሎም ኣቑሑትን ብቐጥታ ብካሜራ ስእሊ ብምልዓል ሽጡ ወይ ዓድጉ። ብቐጥታ ምስ ሸየጥቲ ተራኸቡ።'
                : 'Browse verified listings across all Ethiopian regions. Authentic camera-captured photos, clear pricing, and direct inquiries.'}
            </p>

            {/* Consolidated Search Form */}
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white p-2 sm:p-2.5 rounded-2xl shadow-lg shadow-emerald-950/5 border border-slate-200 flex flex-col md:flex-row gap-2 max-w-2xl"
            >
              {/* Keyword Input */}
              <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50/80 rounded-xl border border-slate-100">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={activeFilter.search}
                  onChange={(e) => setActiveFilter(prev => ({ ...prev, search: e.target.value }))}
                  placeholder={t.searchPlaceholder}
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden"
                />
              </div>

              {/* Category Dropdown */}
              <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50/80 rounded-xl border border-slate-100 md:w-44">
                <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={activeFilter.category}
                  onChange={(e) => {
                    const cat = e.target.value;
                    setActiveFilter(prev => ({ ...prev, category: cat }));
                    onSearch(activeFilter.search, cat, activeFilter.region);
                  }}
                  className="w-full bg-transparent text-xs font-medium text-slate-700 focus:outline-hidden cursor-pointer"
                >
                  <option value="all">{t.allCategories}</option>
                  {categoriesList.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {language === 'am' ? cat.am : language === 'ti' ? cat.ti : cat.en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Region Dropdown */}
              <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50/80 rounded-xl border border-slate-100 md:w-44">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={activeFilter.region}
                  onChange={(e) => {
                    const reg = e.target.value;
                    setActiveFilter(prev => ({ ...prev, region: reg }));
                    onSearch(activeFilter.search, activeFilter.category, reg);
                  }}
                  className="w-full bg-transparent text-xs font-medium text-slate-700 focus:outline-hidden cursor-pointer"
                >
                  <option value="all">{t.allRegions}</option>
                  {regionsList.map((reg, idx) => (
                    <option key={idx} value={reg.split(' / ')[0]}>
                      {language === 'am' ? reg.split(' / ')[1] || reg : language === 'ti' ? reg.split(' / ')[2] || reg : reg.split(' / ')[0]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{t.searchBtn}</span>
              </button>
            </form>

            {/* Quick Condition Tabs */}
            <div className="flex items-center gap-2 mt-4 text-xs font-medium text-slate-500">
              <span>{t.filterBy}:</span>
              <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter(prev => ({ ...prev, condition: 'all' }));
                  }}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    activeFilter.condition === 'all'
                      ? 'bg-white text-emerald-800 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.allCategories}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter(prev => ({ ...prev, condition: 'new' }));
                    const el = document.getElementById('new-products-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    activeFilter.condition === 'new'
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-emerald-800'
                  }`}
                >
                  {t.conditionNew} ({t.newProducts})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter(prev => ({ ...prev, condition: 'used' }));
                    const el = document.getElementById('used-products-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    activeFilter.condition === 'used'
                      ? 'bg-slate-800 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.conditionUsed} ({t.usedProducts})
                </button>
              </div>
            </div>
          </div>

          {/* Right Hero Showcase Banner */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-emerald-100 bg-white">
              <img
                src="/src/assets/images/mela_market_hero_1794060982291.jpg"
                alt="Mela Market Marketplace Showcase"
                className="w-full aspect-16/10 object-cover"
                loading="eager"
              />
              <div className="p-4 bg-white/95 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-emerald-800">
                    {language === 'am' ? 'በቀጥታ በካሜራ ፎቶ ያንሱ' : language === 'ti' ? 'ብቐጥታ ብካሜራ ስእሊ ኣልዕሉ' : 'Live Camera Upload'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {language === 'am' ? 'እውነተኛ ፎቶዎች ብቻ · አስተማማኝ ገበያ' : language === 'ti' ? 'ሓቀኛ ስእልታት ጥራይ · እሙን ዕዳጋ' : 'Verified authentic product photography'}
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800">
                  Mela 2026
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

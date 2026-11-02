import React from 'react';
import { Phone, Search, MapPin, ShieldCheck, Zap, Truck, PlusCircle } from 'lucide-react';
import { Language } from '../types';
import { SUPPORT_PHONE, ETHIOPIAN_CITIES } from '../data/mockData';
import { TRANSLATIONS } from '../data/translations';

interface HeroSectionProps {
  language: Language;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedCity: string;
  onCityChange: (val: string) => void;
  onPostAdClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  language,
  searchTerm,
  onSearchChange,
  selectedCity,
  onCityChange,
  onPostAdClick,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <section className="bg-emerald-800 text-white relative overflow-hidden transition-colors">
      {/* Subtle background texture */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.4) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.4) 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Small compact phone contact section in place of removed promotional section */}
          <div className="mb-5 flex justify-center">
            <a
              href={`tel:${SUPPORT_PHONE}`}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/80 hover:bg-emerald-950 border border-emerald-500/50 text-white text-xs sm:text-sm font-semibold transition-all duration-150 active:scale-95 shadow-xs"
              title={`Call ${SUPPORT_PHONE}`}
              aria-label={`Call ${SUPPORT_PHONE}`}
            >
              <Phone className="w-3.5 h-3.5 text-white shrink-0" />
              <span className="tracking-wide">{SUPPORT_PHONE}</span>
            </a>
          </div>

          {/* Main Homepage Heading (Exact per language requirement) */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight mb-4">
            {t.heroHeading}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-emerald-100 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            {t.heroSubheading}
          </p>

          {/* Search and Filter Box */}
          <div className="bg-white p-2.5 sm:p-3 rounded-2xl shadow-xl max-w-3xl mx-auto mb-8 border border-emerald-600/30">
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              {/* Keyword Search Input */}
              <div className="relative flex-1 flex items-center">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border-0 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm focus:ring-2 focus:ring-emerald-600 outline-none transition-all"
                />
              </div>

              {/* City Selection Dropdown */}
              <div className="relative sm:w-56 flex items-center">
                <MapPin className="w-4 h-4 text-emerald-700 absolute left-3.5 pointer-events-none z-10" />
                <select
                  value={selectedCity}
                  onChange={(e) => onCityChange(e.target.value)}
                  className="w-full pl-10 pr-8 py-3 bg-slate-100/80 hover:bg-slate-100 border-0 rounded-xl text-slate-800 text-sm font-medium focus:ring-2 focus:ring-emerald-600 outline-none appearance-none cursor-pointer transition-all"
                >
                  {ETHIOPIAN_CITIES.map((city) => {
                    const cityName =
                      language === 'ti'
                        ? city.nameTi
                        : language === 'am'
                        ? city.nameAm
                        : city.nameEn;
                    return (
                      <option key={city.id} value={city.id}>
                        {cityName}
                      </option>
                    );
                  })}
                </select>
                <span className="absolute right-3 pointer-events-none text-slate-400 text-xs">▼</span>
              </div>

              {/* Post Ad button */}
              <button
                type="button"
                onClick={onPostAdClick}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-[0.98] cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-slate-900" />
                <span>{t.postFreeAd}</span>
              </button>
            </div>
          </div>

          {/* Quick Trust Badges Strip (No flags) */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs sm:text-sm text-emerald-100 font-medium pt-1">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{t.verifiedSellers}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{t.securePayments}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{t.fastDelivery}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

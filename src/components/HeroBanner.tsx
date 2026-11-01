import React from 'react';
import { ArrowRight, ShoppingCart, Sparkles, Store, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HeroBannerProps {
  onExploreClick: () => void;
  onSellClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExploreClick, onSellClick }) => {
  const { t, language } = useLanguage();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white rounded-3xl my-6 shadow-xl border border-emerald-700/30">
      {/* Decorative Ethiopian cultural motif background glow */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-12 sm:px-12 sm:py-16 lg:py-20 flex flex-col lg:flex-row items-center justify-between gap-10">
        {/* Content Column */}
        <div className="max-w-2xl text-center lg:text-left">
          {/* Micro pill badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-600/40 text-emerald-200 text-xs sm:text-sm font-medium mb-6 backdrop-blur-xs">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{t('heroBadge')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black tracking-tight leading-tight text-white mb-4">
            {t('heroTitle')}
          </h1>

          <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed mb-8 max-w-xl">
            {t('heroSubtitle')}
          </p>

          {/* Quick trust metrics */}
          <div className="grid grid-cols-3 gap-3 mb-8 py-3 border-y border-emerald-700/40 text-left">
            <div>
              <p className="text-xl sm:text-2xl font-black text-amber-300">100%</p>
              <p className="text-[11px] sm:text-xs text-emerald-200">
                {language === 'am' ? 'የተረጋገጡ ሻጮች' : 'Verified Sellers'}
              </p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-white">0 ETB</p>
              <p className="text-[11px] sm:text-xs text-emerald-200">
                {language === 'am' ? 'የሱቅ ምዝገባ ክፍያ የለም' : 'No Shop Setup Fee'}
              </p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-white">Telebirr & CBE</p>
              <p className="text-[11px] sm:text-xs text-emerald-200">
                {language === 'am' ? 'ቀላል የኢትዮጵያ ክፍያ' : 'Local Payments'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
            <button
              onClick={onExploreClick}
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-xl shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{t('heroCtaShop')}</span>
            </button>

            <button
              onClick={onSellClick}
              className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm backdrop-blur-xs"
            >
              <Store className="w-4 h-4 text-emerald-300" />
              <span>{t('heroCtaSell')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Visual Showcase Card */}
        <div className="w-full lg:w-96 shrink-0">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-2xl relative">
            <div className="relative h-60 rounded-xl overflow-hidden mb-3">
              <img
                src="https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=800&q=80"
                alt="Ethiopian Coffee & Goods"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-emerald-900/90 text-emerald-200 text-xs font-semibold rounded-lg backdrop-blur-xs">
                {t('conditionNew')}
              </div>
              <div className="absolute bottom-2.5 right-2.5 px-3 py-1 bg-black/75 text-white font-bold text-sm rounded-lg backdrop-blur-xs">
                950 {t('priceEtb')}
              </div>
            </div>

            <div className="text-white">
              <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{language === 'am' ? 'ቀዳሚ የተመረጠ ምርት' : 'Top Featured Marketplace Pick'}</span>
              </div>
              <h3 className="font-bold text-sm text-white line-clamp-1">
                {language === 'am'
                  ? 'የይርጋጨፌ አንደኛ ደረጃ የቆላ ቡና'
                  : 'Yirgacheffe Grade 1 Specialty Roast (1kg)'}
              </h3>
              <p className="text-xs text-emerald-100/80 mt-1 line-clamp-1">
                {language === 'am'
                  ? 'ከአበባ እና ሎሚ ጣዕም ጋር በአዲስ አበባ የተቆላ'
                  : 'Freshly roasted whole beans packed in Addis Ababa'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

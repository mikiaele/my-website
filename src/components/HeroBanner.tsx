import React from 'react';
import { ArrowRight, Truck, CheckCircle2, ShieldCheck, Headphones, Store, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HeroBannerProps {
  onBrowseClick: () => void;
  onSellClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onBrowseClick, onSellClick }) => {
  const { t, language } = useLanguage();

  return (
    <div className="w-full mb-8">
      {/* 1. Main Wide Pale-Green Hero Container */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-emerald-100/40 to-white border border-emerald-200/80 shadow-sm p-6 sm:p-10 md:p-12">
        {/* Subtle decorative background shapes */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-300/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text Content */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-700/10 border border-emerald-600/20 text-emerald-800 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>{t.hero_tag}</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                <span className="block text-emerald-800">{t.hero_title_1}</span>
                <span className="block text-slate-900">{t.hero_title_2}</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed pt-2">
                {t.hero_description}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onBrowseClick}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-700/25 transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <span>{t.browse_products}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onSellClick}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-800 border-2 border-emerald-600/30 font-bold text-sm shadow-xs transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <Store className="w-4 h-4 text-emerald-600" />
                <span>{t.start_selling_now}</span>
              </button>
            </div>

            {/* Micro assurances */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                {language === 'am' ? 'አንድ ጊዜ ብቻ መመዝገብ' : 'Single Unified Registration'}
              </span>
              <span className="flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                {language === 'am' ? 'አዲስ እና ያገለገሉ እቃዎች' : 'Brand New & Verified Used Goods'}
              </span>
            </div>
          </div>

          {/* Right Hero Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white aspect-4/3 sm:aspect-16/10 lg:aspect-4/3 group">
                <img
                  src="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=1000&q=80"
                  alt="Ethiopian Coffee and Specialty Marketplace"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                
                {/* Floating highlight tag on image */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-emerald-100 shadow-lg flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                      {language === 'am' ? 'ቀጥታ ከኢትዮጵያ' : 'Direct From Ethiopia'}
                    </span>
                    <span className="text-xs font-extrabold text-slate-900 block truncate">
                      {language === 'am' ? 'የይርጋጨፌ ስፔሻሊቲ ቡና እና የሀበሻ ጥበብ' : 'Specialty Coffee & Handcrafted Goods'}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    100% {language === 'am' ? 'ኦሪጅናል' : 'Authentic'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Four Service Assurance Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4 mt-6">
        <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-emerald-100 shadow-2xs hover:border-emerald-300 transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">{t.fast_delivery_title}</h4>
            <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{t.fast_delivery_desc}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-emerald-100 shadow-2xs hover:border-emerald-300 transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">{t.verified_quality_title}</h4>
            <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{t.verified_quality_desc}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-emerald-100 shadow-2xs hover:border-emerald-300 transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">{t.secure_payments_title}</h4>
            <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{t.secure_payments_desc}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-emerald-100 shadow-2xs hover:border-emerald-300 transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">{t.ethiopian_support_title}</h4>
            <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{t.ethiopian_support_desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

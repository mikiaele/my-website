import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Leaf,
  Globe2,
  Users,
} from 'lucide-react';
import { PageView } from '../types/index.ts';
import { useLanguage } from '../context/LanguageContext.tsx';

interface AboutPageProps {
  setCurrentPage: (page: PageView) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ setCurrentPage }) => {
  const { t, language } = useLanguage();

  return (
    <div className="space-y-16 py-10 pb-20">
      
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>{language === 'am' ? 'የሜላ ገበያ አመሰራረት ታሪክ' : 'Our Origin Story'}</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {language === 'am' ? 'ለዘመናዊ ኑሮ የሚሆኑ ጥራት ያላቸው እቃዎች።' : 'Curating Quality Goods for Mindful Living.'}
        </h1>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
          {language === 'am'
            ? 'ሜላ ገበያ የተመሰረተው በአንድ ጠንካራ እምነት ነው፡ ደንበኞች እውነተኛ መገኛቸው የተረጋገጠ፣ ጥራታቸው የላቀ እና በእደ-ጥበብ የተሰሩ እቃዎችን በቀጥታ ከአምራቾች ማግኘት ይገባቸዋል።'
            : 'MELA MARKET was founded with a singular conviction: discerning customers deserve transparency, authentic origin, and heirloom craftsmanship in everyday essentials.'}
        </p>
      </section>

      {/* Visual Showcase Banner */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="relative aspect-21/9 rounded-3xl overflow-hidden bg-slate-900 shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80"
            alt="Mela Market curated origin goods"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-8 sm:p-12">
            <div className="text-white space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                {language === 'am' ? 'ቀጥተኛ የንግድ ግንኙነት' : 'Ethical Sourcing & True Direct-Trade'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold">
                {language === 'am' ? 'ከተራራማው የይርጋጨፌ እርሻዎች እስከ ዘመናዊ ቴክኖሎጂ ላቦራቶሪዎች' : 'From High-Altitude African Farms to Modern Precision Labs'}
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {language === 'am' ? 'አራቱ ዋና ዋና መርሆዎቻችን' : 'Our Four Foundational Pillars'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            {language === 'am' ? 'እያንዳንዱን ምርት በምንመርጥበት ጊዜ የምንመራባቸው መርሆዎች' : 'Guiding every product selection, supplier partnership, and customer experience.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Leaf className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">
              {language === 'am' ? 'እውነተኛ ጥራት' : 'Uncompromising Integrity'}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {language === 'am' ? 'እያንዳንዱ የቡና ፍሬ፣ የተፈጥሮ ማር እና የእደ-ጥበብ እቃ ትክክለኛነቱ ተረጋግጦ ይቀርባል።' : 'Every organic bean, botanical formula, and ceramic piece passes rigorous origin verification before listing.'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">
              {language === 'am' ? 'ዘላቂ አገልግሎት' : 'Longevity by Design'}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {language === 'am' ? 'የቆዳ ውጤቶቻችንና አልባሳቶቻችን ለረጅም አመታት እንዲያገለግሉ በጥንቃቄ የተሰሩ ናቸው።' : 'We reject disposable consumerism. Our apparel, leather goods, and audio gear are crafted to endure for decades.'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Globe2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">
              {language === 'am' ? 'ቀጥተኛ የንግድ ስርዓት' : 'Equitable Direct-Trade'}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {language === 'am' ? 'ያለ አላስፈላጊ ደላሎች ገዢና ሻጭን በቀጥታ እናገናኛለን።' : 'We eliminate unnecessary middlemen, ensuring our partner growers and artisan workshops receive above-market compensation.'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">
              {language === 'am' ? 'የተሟላ የደንበኞች ድጋፍ' : 'Customer Concierge'}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {language === 'am' ? 'የ24/7 ፈጣን ምላሽ እና የ30-ቀን የዕቃ መመለሻ ዋስትና።' : 'Real humans, instantaneous dispute resolution, and a seamless 30-day return policy backed by 24/7 support.'}
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="p-8 sm:p-12 bg-slate-900 rounded-3xl text-white space-y-6">
          <h3 className="text-2xl sm:text-3xl font-extrabold">
            {language === 'am' ? 'ሜላ ገበያን ለመሸመት ዝግጁ ነዎት?' : 'Ready to Discover MELA MARKET?'}
          </h3>
          <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto">
            {language === 'am' ? 'ሙሉውን የምርት ካታሎግ ይመልከቱ ወይም ጥያቄ ካለዎት ያግኙን።' : 'Browse our full catalog or contact our concierge team with bespoke sourcing inquiries.'}
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setCurrentPage('shop')}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              {t('shop')}
            </button>
            <button
              onClick={() => setCurrentPage('contact')}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              {t('contact')}
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

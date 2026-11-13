import React from 'react';
import { PlusCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';

export const HeroSection: React.FC = () => {
  const { t } = useLanguage();
  const { user, openAuthModal } = useAuth();
  const { setIsSellModalOpen } = useMarketplace();

  const handlePostAd = () => {
    if (!user) {
      openAuthModal('login', 'postAd');
    } else {
      setIsSellModalOpen(true);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-900 text-white py-5 sm:py-6 border-b border-emerald-950/40">
      {/* Background Decorative Patterns */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-emerald-700/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Retained CTA Button Row */}
        <div className="flex justify-center">
          <button
            onClick={handlePostAd}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-sm sm:text-base shadow-lg shadow-amber-400/25 active:scale-98 transition-all cursor-pointer"
          >
            <PlusCircle className="w-5 h-5 text-emerald-900" />
            <span>{t('nav.postAd')}</span>
          </button>
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useMarketplace } from '../context/MarketplaceContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();
  const { setIsAboutModalOpen, setIsHelpModalOpen } = useMarketplace();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-10 pb-6 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">

          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-amber-400 flex items-center justify-center font-black text-xl shadow-md">
                መ
              </div>
              <div>
                <span className="font-black text-lg text-white tracking-tight">
                  {t('brand.name')}
                </span>
                <p className="text-[11px] text-emerald-400 uppercase font-semibold">
                  MELA MARKET ETHIOPIA
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setIsAboutModalOpen(true)}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  {t('nav.about')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsHelpModalOpen(true)}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  {t('nav.help')}
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} {t('footer.rights')}</p>
          <div className="flex items-center gap-1">
            <span>Built with care for Ethiopia</span>
            <span className="text-amber-400">🇪🇹</span>
          </div>
        </div>

        {/* Phone & WhatsApp Contact Links at Very Bottom of Footer */}
        <div className="mt-5 pt-4 border-t border-slate-800/60 flex flex-wrap items-center justify-center gap-4 text-xs">
          <a
            href="tel:+251904503245"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-emerald-800 text-slate-200 hover:text-white border border-slate-700 transition-colors font-semibold"
          >
            <Phone className="w-4 h-4 text-amber-400 shrink-0" />
            <span>0904503245 (+251 904 503 245)</span>
          </a>

          <a
            href="https://wa.me/251904503245"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-600 transition-colors font-semibold"
          >
            <MessageCircle className="w-4 h-4 text-amber-300 shrink-0" />
            <span>WhatsApp (@brmiki21)</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

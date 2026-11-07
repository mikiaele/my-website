import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MessageCircle, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <footer className="bg-white border-t border-slate-200 mt-20 text-xs text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold">
                M
              </div>
              <span className="text-base font-bold text-slate-900 tracking-tight">
                {t('siteName')}
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              {t('footerAbout')}
            </p>

            {/* Official Owner / Admin WhatsApp Contact (Strictly @brmiki21) */}
            <div className="pt-2">
              <a
                href="https://wa.me/?text=Hello%20Mela%20Market%20Support"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 font-medium transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>{t('officialWhatsApp')}:</span>
                <span className="font-bold">{t('whatsappContact')}</span>
              </a>
            </div>
          </div>

          {/* Languages Supported */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">
              ቋንቋዎች / Languages
            </h4>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setLanguage('am')}
                className={`text-left transition-colors ${
                  language === 'am' ? 'text-emerald-700 font-bold' : 'hover:text-slate-900'
                }`}
              >
                አማርኛ (Amharic)
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`text-left transition-colors ${
                  language === 'en' ? 'text-emerald-700 font-bold' : 'hover:text-slate-900'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('ti')}
                className={`text-left transition-colors ${
                  language === 'ti' ? 'text-emerald-700 font-bold' : 'hover:text-slate-900'
                }`}
              >
                ትግርኛ (Tigrinya)
              </button>
            </div>
          </div>

          {/* Trust & Guarantee */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">
              Mela Market Ethiopia
            </h4>
            <div className="space-y-2 text-slate-500 text-[11px] leading-relaxed">
              <p className="flex items-center gap-1.5 text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Live Camera Verification</span>
              </p>
              <p>Addis Ababa, Ethiopia</p>
              <p>Certified Local Marketplace</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} Mela Market. {t('allRightsReserved')}</p>
          <div className="flex items-center gap-1">
            <span>Built with care for Ethiopia</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

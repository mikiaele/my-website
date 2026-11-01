import React, { useState } from 'react';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  CheckCircle2,
  Mail,
  ArrowRight,
  Smartphone,
  Database,
  Lock,
} from 'lucide-react';
import { PageView } from '../../types/index.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface FooterProps {
  setCurrentPage: (page: PageView) => void;
  onSelectCategory: (slug: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentPage, onSelectCategory }) => {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setIsSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Value Proposition Highlights Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-950/80 border border-emerald-800/60 rounded-xl text-emerald-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">{t('freeShippingTitle')}</h4>
              <p className="text-xs text-slate-400 mt-1">{t('freeShippingDesc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-950/80 border border-emerald-800/60 rounded-xl text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">{t('authenticGuaranteeTitle')}</h4>
              <p className="text-xs text-slate-400 mt-1">{t('authenticGuaranteeDesc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-950/80 border border-emerald-800/60 rounded-xl text-emerald-400">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">{t('easyReturnsTitle')}</h4>
              <p className="text-xs text-slate-400 mt-1">{t('easyReturnsDesc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-950/80 border border-emerald-800/60 rounded-xl text-emerald-400">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">{t('support247Title')}</h4>
              <p className="text-xs text-slate-400 mt-1">{t('support247Desc')}</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links & Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12 border-b border-slate-800 text-sm">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-bold font-serif text-lg">
                M
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                {t('brandName')}
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              {language === 'am'
                ? 'ሜላ ገበያ ጥራት ያላቸው እቃዎችን፣ የኢትዮጵያ ምርጥ ቡናን፣ እውነተኛ የቆዳ ውጤቶችን፣ አልባሳትን እና ዘመናዊ ቴክኖሎጂዎችን በቀጥታ ከታመኑ ነጋዴዎች ጋር የሚያገናኝ የገበያ መድረክ ነው።'
                : 'MELA MARKET is a full-stack commercial marketplace connecting discerning buyers with premium goods, specialty coffee, certified organics, minimalist apparel, and precision electronics.'}
            </p>

            {/* Customer Trust Badge */}
            <div className="inline-flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-800/90 border border-slate-700 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-white font-medium block">
                  {language === 'am' ? 'የታመነ የገበያ መድረክ' : 'Verified Marketplace'}
                </span>
                <span className="text-slate-400 text-[11px]">
                  {language === 'am' ? 'የተረጋገጡ ሻጮችና ጥራት ያላቸው ምርቶች' : 'Verified sellers and quality guaranteed'}
                </span>
              </div>
            </div>
          </div>

          {/* Shop Categories */}
          <div>
            <h5 className="text-white font-semibold mb-4 text-xs tracking-wider uppercase">
              {language === 'am' ? 'የምርት ክፍሎች' : 'Departments'}
            </h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onSelectCategory('electronics')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {language === 'am' ? 'ኤሌክትሮኒክስ እና ኦዲዮ' : 'Electronics & Audio'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('organic-gourmet')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {language === 'am' ? 'ይርጋጨፌ ቡና እና ኦርጋኒክ' : 'Organic Gourmet Coffee'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('apparel')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {language === 'am' ? 'የቆዳ ውጤቶች እና አልባሳት' : 'Leather & Apparel'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('home-living')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {language === 'am' ? 'የቤት እቃዎች እና ሴራሚክስ' : 'Home & Living'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('beauty-wellness')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {language === 'am' ? 'ውበት እና ጤና' : 'Beauty & Skincare'}
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-white font-semibold mb-4 text-xs tracking-wider uppercase">
              {language === 'am' ? 'የደንበኞች አገልግሎት' : 'Customer Care'}
            </h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => setCurrentPage('orders')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  {t('trackOrder')}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage('contact')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  {t('contact')}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage('about')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  {t('about')}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage('seller-register')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  {t('becomeSeller')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('admin-login')}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{language === 'am' ? 'የአስተዳዳሪ መግቢያ (Admin Portal)' : 'Admin Portal Login'}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h5 className="text-white font-semibold mb-2 text-xs tracking-wider uppercase">
              {t('stayUpdated')}
            </h5>
            <p className="text-xs text-slate-400 mb-3">
              {t('newsletterDesc')}
            </p>
            {isSubscribed ? (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t('subscribedSuccess')}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder={language === 'am' ? 'ኢሜይልዎን ያስገቡ...' : 'Enter your email...'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-8 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-2.5 top-3" />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 block">
                  {language === 'am' ? 'ምንም አይነት አላስፈላጊ መልእክት አንልክም' : 'No spam, unsubscribe anytime.'}
                </span>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Bar: Copyright & Security */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} {t('allRightsReserved')}</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-xs">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              <span>{language === 'am' ? 'በ256-ቢት SSL የተጠበቀ ክፍያ' : '256-Bit SSL Encrypted Checkout'}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>{language === 'am' ? 'የተረጋገጠ የግብይት ደህንነት' : 'Verified Buyer & Seller Protection'}</span>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};

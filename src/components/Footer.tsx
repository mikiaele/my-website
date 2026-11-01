import React from 'react';
import { useApp } from '../../src/context/AppContext';
import { ShieldCheck, Sparkles, Heart, Globe, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const { language, setLanguage, setActiveTab, setIsAdminAuthModalOpen, isAdmin } = useApp();

  return (
    <footer className="bg-emerald-950 text-white border-t border-emerald-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center text-emerald-950 font-black text-xl">
                M
              </div>
              <span className="text-xl font-black text-white">Mela Market</span>
            </div>
            <p className="text-xs text-emerald-200 leading-relaxed">
              {language === 'am'
                ? 'መላ ገበያ — ትክክለኛ የኢትዮጵያ ምርቶች መሸጫ እና መግዣ የዲጂታል ገበያ መድረክ።'
                : 'Ethiopia’s verified digital marketplace connecting local roasters, weavers, and merchants with buyers nationwide.'}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#009A44]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#FED100]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF3340]"></span>
              <span className="text-[11px] text-emerald-300 font-bold uppercase tracking-wider">
                Made in Ethiopia
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Marketplace
            </h4>
            <ul className="space-y-2 text-xs text-emerald-200">
              <li>
                <button onClick={() => setActiveTab('marketplace')} className="hover:text-white cursor-pointer">
                  Browse All Products
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('categories')} className="hover:text-white cursor-pointer">
                  Featured Categories
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('seller')} className="hover:text-white cursor-pointer">
                  Seller Dashboard & Listing
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    if (isAdmin) setActiveTab('admin');
                    else setIsAdminAuthModalOpen(true);
                  }} 
                  className="hover:text-white cursor-pointer flex items-center gap-1 text-amber-300"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Administrator Portal</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Payments & Security
            </h4>
            <div className="space-y-2 text-xs text-emerald-200">
              <div className="p-2.5 bg-emerald-900/60 rounded-xl border border-emerald-800">
                <div className="font-bold text-white">Telebirr (ቴሌብር)</div>
                <div className="text-[11px] text-emerald-300">Fast & zero-fee mobile payment</div>
              </div>
              <div className="p-2.5 bg-emerald-900/60 rounded-xl border border-emerald-800">
                <div className="font-bold text-white">CBE Birr (የኢትዮጵያ ንግድ ባንክ)</div>
                <div className="text-[11px] text-emerald-300">Secure bank transfer integration</div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Addis Ababa Operations
            </h4>
            <ul className="space-y-2 text-xs text-emerald-200">
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Bole Medhanialem, Addis Ababa</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>+251 911 002233</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>mikiaelebrhane@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="pt-8 border-t border-emerald-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-300">
          <div>
            © {new Date().getFullYear()} Mela Market (መላ ገበያ). All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
              className="flex items-center gap-1 hover:text-white cursor-pointer font-bold"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'አማርኛ' : 'English'}</span>
            </button>
            <span>•</span>
            <span className="text-amber-300 font-semibold">Supabase Auth & Storage Powered</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

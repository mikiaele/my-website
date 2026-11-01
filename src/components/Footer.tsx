import React from 'react';
import { ShoppingBag, ShieldCheck, Heart, Phone, Mail, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <footer className="mt-16 bg-slate-900 text-slate-300 border-t border-slate-800 text-left">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white flex items-center justify-center shadow-md">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                {language === 'am' ? 'ሜላ ገበያ' : 'MELA MARKET'}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'am'
                ? 'በኢትዮጵያ ውስጥ ጥራት ያላቸውን አዳዲስና ያገለገሉ እቃዎች በቀጥታ ከሻጮች የሚገዙበትና የሚሸጡበት ዘመናዊ የኢኮሜርስ የገበያ አውታር።'
                : "Ethiopia's premier multi-vendor e-commerce platform connecting buyers with authentic sellers for brand new and pre-owned goods."}
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>{language === 'am' ? '100% ደህንነቱ የተጠበቀ ክፍያ' : '100% Secure Payments'}</span>
            </div>
          </div>

          {/* Col 2: Customer Assistance */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {language === 'am' ? 'የደንበኞች አገልግሎት' : 'Customer Care'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="hover:text-emerald-400 cursor-pointer">
                {language === 'am' ? 'የትዕዛዝ ክትትል' : 'Order Tracking'}
              </li>
              <li className="hover:text-emerald-400 cursor-pointer">
                {language === 'am' ? 'የማድረሻ ሁኔታ እና ከተሞች' : 'Delivery Zones & Rates'}
              </li>
              <li className="hover:text-emerald-400 cursor-pointer">
                {language === 'am' ? 'የእቃዎች ሁኔታ (አዲስ እና ያገለገለ)' : 'Condition Policy (New & Used)'}
              </li>
              <li className="hover:text-emerald-400 cursor-pointer">
                {language === 'am' ? 'የገንዘብ ተመላሽ ዋስትና' : 'Buyer Protection'}
              </li>
            </ul>
          </div>

          {/* Col 3: Selling on Mela */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {language === 'am' ? 'በሜላ ገበያ ይሽጡ' : 'Sell on Mela Market'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="hover:text-emerald-400 cursor-pointer">
                {language === 'am' ? 'ቀጥታ መመዝገብና መሸጥ (አንድ ምዝገባ)' : 'Register & Sell Instantly'}
              </li>
              <li className="hover:text-emerald-400 cursor-pointer">
                {language === 'am' ? 'የሻጭ ዳሽቦርድ' : 'Seller Dashboard'}
              </li>
              <li className="hover:text-emerald-400 cursor-pointer">
                {language === 'am' ? 'የክፍያ አሰባሰብ (ቴሌብር እና ሲቢኢ)' : 'Payouts (Telebirr & CBE)'}
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Ethiopian Payments */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {language === 'am' ? 'አድራሻ እና ክፍያዎች' : 'Contact & Payments'}
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>+251 91 100 2233 / +251 92 200 4455</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>support@melamarket.et</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Bole Sub-city, Addis Ababa, Ethiopia</span>
              </div>
            </div>

            <div className="pt-3">
              <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
                {language === 'am' ? 'ተቀባይነት ያላቸው ክፍያዎች:' : 'Supported Payment Methods:'}
              </span>
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-emerald-300">
                <span className="px-2 py-1 bg-slate-800 rounded-md border border-slate-700">ቴሌብር Telebirr</span>
                <span className="px-2 py-1 bg-slate-800 rounded-md border border-slate-700">CBE Birr</span>
                <span className="px-2 py-1 bg-slate-800 rounded-md border border-slate-700">Cash on Delivery</span>
                <span className="px-2 py-1 bg-slate-800 rounded-md border border-slate-700">Card / Visa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} ሜላ ገበያ — MELA MARKET. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for Ethiopian Commerce with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};

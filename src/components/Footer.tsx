import React, { useEffect, useState } from 'react';
import { ShoppingBag, ShieldCheck, MapPin, Camera, MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { buildAdminWhatsAppLink, DEFAULT_ADMIN_WHATSAPP } from '../lib/whatsapp.ts';

interface FooterProps {
  onNavigate: (page: string, params?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [adminWhatsApp, setAdminWhatsApp] = useState<string>(DEFAULT_ADMIN_WHATSAPP);

  useEffect(() => {
    fetch('/api/settings/public')
      .then((res) => res.json())
      .then((data) => {
        if (data.admin_whatsapp_number) {
          setAdminWhatsApp(data.admin_whatsapp_number);
        }
      })
      .catch((err) => console.error('Failed to load WhatsApp in footer:', err));
  }, []);

  return (
    <footer className="bg-stone-100 text-stone-700 border-t border-stone-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-500 flex items-center justify-center text-white shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-stone-900 text-lg tracking-tight">{t.appName}</span>
              <p className="text-[11px] text-stone-500 font-medium">Mela Market Ethiopia</p>
            </div>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            {t.tagline}. አዲስ እና ያገለገሉ እቃዎችን በቀጥታ በካሜራ ፎቶ በማንሳት፣ በአካባቢና ክልል በመለየት የሚገበያዩበት ታማኝ የኢትዮጵያ ገበያ።
          </p>
        </div>

        {/* Feature Guarantees */}
        <div className="space-y-3">
          <h5 className="font-bold text-stone-900 text-xs tracking-wider uppercase">
            የገበያው ዋስትናዎች
          </h5>
          <ul className="text-xs space-y-2.5 text-stone-600">
            <li className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>እውነተኛ የካሜራ ፎቶ ብቻ (Camera Only)</span>
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>አዲስ እና ያገለገሉ እቃዎች ግልጽ ምደባ</span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>ትክክለኛ ክልል፣ ወረዳ እና ከተማ አድራሻ</span>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h5 className="font-bold text-stone-900 text-xs tracking-wider uppercase">
            ፈጣን ማሰሻ
          </h5>
          <ul className="text-xs space-y-2 text-stone-600 font-medium">
            <li>
              <button
                onClick={() => onNavigate('browse')}
                className="hover:text-emerald-700 transition"
              >
                {t.browse}
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('browse', { condition: 'new' })}
                className="hover:text-emerald-700 transition"
              >
                {t.newProducts}
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('browse', { condition: 'used' })}
                className="hover:text-amber-700 transition"
              >
                {t.usedProducts}
              </button>
            </li>
          </ul>
        </div>

        {/* Official Administrator Contact */}
        <div className="space-y-3">
          <h5 className="font-bold text-stone-900 text-xs tracking-wider uppercase">
            ይፋዊ የአስተዳዳሪ ግንኙነት
          </h5>
          <p className="text-xs text-stone-600">
            {t.whatsappNotice}
          </p>
          <a
            href={buildAdminWhatsAppLink(adminWhatsApp || DEFAULT_ADMIN_WHATSAPP, 'ሰላም መላ ገበያ አስተዳዳሪ')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-sm"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{t.contactAdminWhatsApp} (@brmiki21)</span>
          </a>
        </div>
      </div>

      <div className="border-t border-stone-200 py-4 px-4 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} Mela Market (መላ ገበያ). All rights reserved. Ethiopian Online Marketplace.
      </div>
    </footer>
  );
};

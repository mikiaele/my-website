import React from 'react';
import { Store, ShieldCheck, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Footer: React.FC = () => {
  const { t, language } = useAuth();

  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800 pt-12 pb-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-800">
          {/* Brand Col */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                <Store className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">
                MELA <span className="text-emerald-400">MARKET</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mb-4">
              {language === 'am'
                ? 'መላ ማርኬት - በኢትዮጵያ ውስጥ አዳዲስ እና ያገለገሉ እቃዎችን በጥራት እና በታማኝነት የሚገበያዩበት ዘመናዊ የዲጂታል ገበያ።'
                : language === 'ti'
                ? 'መላ ማርኬት - ኣብ ኢትዮጵያ ሓደሽትን ዝተጠቐምኩምሎም ኣቑሑትን ብጽሬትን ብተኣማንነትን ዝሽየጥሉን ዝዕደግሉን ዘመናዊ መድረኽ።'
                : 'Mela Market - Buy and sell authenticated new and used merchandise across Ethiopia with verified photos and direct seller inquiry channels.'}
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Listings · Authentic Camera Uploads</span>
            </div>
          </div>

          {/* Official WhatsApp Support - Clearly Separated in Dedicated Card */}
          <div className="md:col-span-4">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                Official Marketplace Contact
              </span>
              <h4 className="text-sm font-bold text-white mb-2">
                Mela Market Support & Admin
              </h4>
              <p className="text-xs text-slate-300 mb-3">
                {t.officialSupportDesc}
              </p>
              <a
                href="https://wa.me/251911000000?text=Hello%20Mela%20Market%20Support%20@brmiki21"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                <span>WhatsApp: @brmiki21</span>
              </a>
            </div>
          </div>

          {/* Languages & Coverage */}
          <div className="md:col-span-3 text-xs text-slate-400 space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
              Supported Languages
            </h4>
            <p>1. አማርኛ (Amharic - Default)</p>
            <p>2. English</p>
            <p>3. ትግርኛ (Tigrinya)</p>
            <div className="pt-2">
              <span className="text-slate-500">Addis Ababa · Mekelle · Hawassa · Bahir Dar · Dire Dawa</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Mela Market. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Built with care for Ethiopian commerce</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

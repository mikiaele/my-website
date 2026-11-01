import React, { useState } from 'react';
import {
  Store,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  ArrowRight,
  Globe2,
  Package,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { PageView } from '../../types/index.ts';
import { sellerRegisterSchema } from '../../lib/validations.ts';

interface SellerRegisterPageProps {
  setCurrentPage: (page: PageView) => void;
}

export const SellerRegisterPage: React.FC<SellerRegisterPageProps> = ({ setCurrentPage }) => {
  const { registerSeller } = useAuth();
  const { t, language } = useLanguage();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopDescription, setShopDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState(language === 'am' ? 'አዲስ አበባ' : 'Addis Ababa');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitError(null);
    setSuccessMsg(null);

    const formData = {
      fullName,
      email,
      password,
      shopName,
      shopDescription,
      phone,
      city,
    };

    const validation = sellerRegisterSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) fieldErrors[issue.path[0].toString()] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    const result = await registerSeller(formData);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMsg(
        language === 'am'
          ? 'እንኳን ደስ አለዎት! የሻጭ መለያዎ እና ሱቅዎ በተሳካ ሁኔታ ተፈጥሯል። ወደ ሻጭ ማዕከል በመዘዋወር ላይ...'
          : 'Success! Your seller merchant account and storefront have been created. Redirecting to your dashboard...'
      );
      setTimeout(() => {
        setCurrentPage('seller-dashboard');
      }, 700);
    } else {
      setSubmitError(result.error || 'Failed to create seller shop account.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Hero Intro */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider">
          <Store className="w-3.5 h-3.5 text-emerald-700" />
          <span>{language === 'am' ? 'የሻጮች ማዕከል' : 'Vendor Onboarding'}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {language === 'am' ? 'ሜላ ገበያ ላይ ሱቅዎን ይክፈቱ፣ በቀጥታ ይሽጡ!' : 'Open Your Digital Storefront on MELA MARKET'}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
          {language === 'am'
            ? 'በኢትዮጵያና በመላው ዓለም ላሉ ደንበኞች ጥራት ያላቸው ምርቶችዎን ይሽጡ። የራስዎን ምርቶች ያስተዳድሩ፣ ትዕዛዞችን ይከታተሉ፣ ገቢዎን ያሳድጉ።'
            : 'Join verified independent artisans, specialty coffee growers, and electronics merchants reaching thousands of customers worldwide.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left: Value Props */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-8 space-y-6 border border-slate-800 shadow-xl">
            <h3 className="text-xl font-bold">
              {language === 'am' ? 'ለምን ሜላ ገበያ ላይ ሻጭ ይሆናሉ?' : 'Why Sell on MELA MARKET?'}
            </h3>

            <div className="space-y-4 text-xs sm:text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-950 text-emerald-400 rounded-lg shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-white block font-semibold">
                    {language === 'am' ? 'ሰፊ የገበያ ተደራሽነት' : 'Broad Multi-Vendor Reach'}
                  </strong>
                  <span>{language === 'am' ? 'በአገር ውስጥና በውጭ አገር ለሚገኙ ፈላጊ ደንበኞች መሸጥ ይችላሉ።' : 'Instantly list your items alongside curated artisan brands.'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-950 text-emerald-400 rounded-lg shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-white block font-semibold">
                    {language === 'am' ? 'ገለልተኛ የሻጭ ቁጥጥር' : 'Autonomous Shop Management'}
                  </strong>
                  <span>{language === 'am' ? 'እያንዳንዱ ሻጭ የራሱን ምርቶችና ትዕዛዞች በብቸኝነት ያቀናብራል።' : 'Manage your own stock, photos, prices, and shipment dispatch.'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-950 text-emerald-400 rounded-lg shrink-0">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-white block font-semibold">
                    {language === 'am' ? 'ቀጥተኛና ፈጣን ክፍያ' : 'Direct & Transparent Payouts'}
                  </strong>
                  <span>{language === 'am' ? 'ምንም ድብቅ ክፍያ የለም፤ በቴሌብር፣ በሲቢኢ እና በካርድ ክፍያዎች የተደገፈ።' : 'Secure payments directly cleared to your merchant wallet.'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-950 text-emerald-400 rounded-lg shrink-0">
                  <Globe2 className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-white block font-semibold">
                    {language === 'am' ? 'የአማርኛና የእንግሊዝኛ ድጋፍ' : 'Bilingual Platform'}
                  </strong>
                  <span>{language === 'am' ? 'በአማርኛና በእንግሊዝኛ በቀላሉ ሱቅዎን ማስተዳደር ይችላሉ።' : 'Full native Ethiopic Amharic and English translation support.'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Registration Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {language === 'am' ? 'የሻጭ መለያ እና የሱቅ መረጃ' : 'Seller Account & Shop Details'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {language === 'am'
                  ? 'መረጃዎን በትክክል ሞልተው የንግድ ሱቅዎን በደቂቃዎች ውስጥ ይክፈቱ።'
                  : 'Complete your merchant registration to launch your shop.'}
              </p>
            </div>

            {submitError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold animate-in fade-in">
                {submitError}
              </div>
            )}

            {successMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'am' ? 'ሙሉ ስም (የነጋዴው ስም)' : 'Merchant Full Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Abebe Kebede"
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm ${
                      errors.fullName ? 'border-rose-400' : 'border-slate-200'
                    }`}
                  />
                  {errors.fullName && <p className="text-[11px] text-rose-600 mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'am' ? 'የንግድ ኢሜይል' : 'Business Email'}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seller@addisleather.com"
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm ${
                      errors.email ? 'border-rose-400' : 'border-slate-200'
                    }`}
                  />
                  {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'am' ? 'የይለፍ ቃል (ቢያንስ 6 ፊደላት)' : 'Password (min 6 chars)'}
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm ${
                      errors.password ? 'border-rose-400' : 'border-slate-200'
                    }`}
                  />
                  {errors.password && <p className="text-[11px] text-rose-600 mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'am' ? 'የስልክ ቁጥር' : 'Contact Phone'}
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+251 91 123 4567"
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm ${
                      errors.phone ? 'border-rose-400' : 'border-slate-200'
                    }`}
                  />
                  {errors.phone && <p className="text-[11px] text-rose-600 mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {language === 'am' ? 'የሱቅ ስም (የንግድ ምልክት)' : 'Storefront Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="e.g. Addis Artisan Leather"
                      className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm ${
                        errors.shopName ? 'border-rose-400' : 'border-slate-200'
                      }`}
                    />
                    {errors.shopName && <p className="text-[11px] text-rose-600 mt-1">{errors.shopName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {language === 'am' ? 'ከተማ / መገኛ' : 'City / Region'}
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Addis Ababa / አዲስ አበባ"
                      className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm ${
                        errors.city ? 'border-rose-400' : 'border-slate-200'
                      }`}
                    />
                    {errors.city && <p className="text-[11px] text-rose-600 mt-1">{errors.city}</p>}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'am' ? 'ስለ ሱቅዎ እና ስለሚሸጧቸው እቃዎች አጭር መግለጫ' : 'Store Bio & Product Specialty'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={shopDescription}
                  onChange={(e) => setShopDescription(e.target.value)}
                  placeholder={
                    language === 'am'
                      ? 'እውነተኛ የኢትዮጵያ የቆዳ ውጤቶች፣ ቦርሳዎች እና መለዋወጫዎችን እንሰራለን...'
                      : 'We craft authentic full-grain Ethiopian leather goods and travel gear...'
                  }
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm ${
                    errors.shopDescription ? 'border-rose-400' : 'border-slate-200'
                  }`}
                />
                {errors.shopDescription && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.shopDescription}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Store className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? language === 'am'
                        ? 'ሱቅ በመክፈት ላይ...'
                        : 'Registering Storefront...'
                      : language === 'am'
                      ? 'ሱቁን ክፈትና መሸጥ ጀምር'
                      : 'Register Shop & Launch'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5 pt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {language === 'am'
                    ? 'በሜላ ገበያ ባለብዙ ነጋዴ ሥርዓት የተጠበቀ'
                    : 'Protected by Mela Market multi-vendor security rules'}
                </span>
              </div>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  onRegisteredSuccess?: () => void;
}

const ETHIOPIAN_CITIES = [
  'Addis Ababa',
  'Hawassa',
  'Bahir Dar',
  'Dire Dawa',
  'Adama (Nazret)',
  'Mekelle',
  'Gondar',
  'Jimma',
  'Bishoftu (Debre Zeyit)',
  'Dessie',
  'Arba Minch',
  'Jijiga',
];

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin,
  onRegisteredSuccess,
}) => {
  const { signUp } = useAuth();
  const { t, language } = useLanguage();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Addis Ababa');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError(t('valNameRequired'));
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError(t('valEmailRequired'));
      return;
    }
    if (password.length < 6) {
      setError(t('valPasswordLength'));
      return;
    }
    if (!phone.trim()) {
      setError(t('valPhoneRequired'));
      return;
    }

    setLoading(true);
    try {
      await signUp({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        city,
      });

      if (onRegisteredSuccess) {
        onRegisteredSuccess();
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-emerald-200 hover:text-white rounded-full hover:bg-emerald-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-700/60 text-emerald-100 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {language === 'am' ? 'አንድ ጊዜ ብቻ ይመዝገቡ' : 'One Single Registration'}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white">
            {t('registerTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1">
            {t('registerSubtitle')}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Value callout notice: NO separate shop registration required */}
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              {language === 'am'
                ? 'ምዝገባውን እንደጨረሱ ወዲያውኑ ወደ ሻጭ ዳሽቦርድ በመሄድ ምርቶችዎን ያለተጨማሪ የሱቅ ቅጽ መሸጥ ይችላሉ!'
                : 'Your account is automatically enabled with seller access! You can start uploading products immediately without filling out a separate shop form.'}
            </span>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {t('fullName')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t('fullNamePlaceholder')}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {t('emailLabel')} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('emailPlaceholder')}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {t('passwordLabel')} <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('passwordPlaceholder')}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {t('phoneLabel')} <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('phonePlaceholder')}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* City in Ethiopia */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {t('cityLabel')}
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {ETHIOPIAN_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-700/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>{t('registerBtn')}</span>
              </>
            )}
          </button>

          {/* Switch to Login */}
          <div className="text-center pt-2">
            <p className="text-xs text-gray-500">
              {t('alreadyHaveAccount')}{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-emerald-700 font-bold hover:underline cursor-pointer"
              >
                {t('signInLink')}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

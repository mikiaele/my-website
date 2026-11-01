import React, { useState } from 'react';
import { X, User, Mail, Lock, Phone, MapPin, CheckCircle2, ShieldCheck, Sparkles, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ETHIOPIAN_CITIES } from '../lib/constants';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccessNavigateToSeller?: boolean;
  onOpenSellerDashboard?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'register',
  onSuccessNavigateToSeller = false,
  onOpenSellerDashboard,
}) => {
  const { login, register, loginDemo } = useAuth();
  const { t, language } = useLanguage();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('Addis Ababa');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    if (mode === 'register') {
      if (!fullName.trim() || !email.trim() || !password.trim()) {
        setErrorMessage(t.fill_all_fields);
        setIsSubmitting(false);
        return;
      }

      const res = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password: password.trim(),
        phoneNumber: phoneNumber.trim(),
        city: city.trim(),
      });

      setIsSubmitting(false);
      if (res.success) {
        onClose();
        if (onOpenSellerDashboard) {
          onOpenSellerDashboard();
        }
      } else {
        setErrorMessage(res.error || 'Registration failed');
      }
    } else {
      if (!email.trim() || !password.trim()) {
        setErrorMessage(t.fill_all_fields);
        setIsSubmitting(false);
        return;
      }

      const res = await login(email.trim(), password.trim());
      setIsSubmitting(false);
      if (res.success) {
        onClose();
        if (onOpenSellerDashboard && onSuccessNavigateToSeller) {
          onOpenSellerDashboard();
        }
      } else {
        setErrorMessage(res.error || 'Login failed');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-left">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-emerald-900/50 hover:bg-emerald-900 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-[11px] font-bold tracking-wider text-emerald-200 uppercase">
              {language === 'am' ? 'ሜላ ገበያ መለያ' : 'Mela Market Account'}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {mode === 'register' ? t.auth_register_title : t.auth_login_title}
          </h3>
          <p className="text-xs text-emerald-100/90 mt-1">
            {mode === 'register' ? t.auth_register_subtitle : t.auth_login_subtitle}
          </p>

          {/* Key requirement reassurance pill */}
          {mode === 'register' && (
            <div className="mt-3 bg-emerald-900/70 border border-emerald-500/30 rounded-xl p-2.5 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
              <p className="text-[11px] text-emerald-100 leading-tight">
                {t.register_once_note}
              </p>
            </div>
          )}
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.full_name} *
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={language === 'am' ? 'ምሳሌ፡ አበበ ቢቂላ' : 'e.g. Abebe Bikila'}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.email} *
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.password} *
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.phone_number}
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="0911234567"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.city}
                  </label>
                  <div className="relative flex items-center">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3" />
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    >
                      {ETHIOPIAN_CITIES.map((c) => (
                        <option key={c.id} value={c.name_en}>
                          {language === 'am' ? c.name_am : c.name_en}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl font-extrabold text-sm text-white bg-emerald-700 hover:bg-emerald-800 shadow-md shadow-emerald-700/25 transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              {isSubmitting
                ? '...'
                : mode === 'register'
                ? t.register_button
                : t.login_button}
            </button>
          </form>

          {/* Toggle Login / Register */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setErrorMessage('');
                setMode(mode === 'register' ? 'login' : 'register');
              }}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer"
            >
              {mode === 'register' ? t.already_have_account : t.need_an_account}
            </button>
          </div>

          {/* Demo Persona Quick Logins for Rapid Verification */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 text-center">
              {t.demo_login}
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  loginDemo('seller');
                  onClose();
                  if (onOpenSellerDashboard) onOpenSellerDashboard();
                }}
                className="p-2 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-[11px] font-bold transition-all text-center cursor-pointer"
              >
                Abebe (Seller)
              </button>
              <button
                type="button"
                onClick={() => {
                  loginDemo('buyer');
                  onClose();
                }}
                className="p-2 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-[11px] font-bold transition-all text-center cursor-pointer"
              >
                Sara (Customer)
              </button>
              <button
                type="button"
                onClick={() => {
                  loginDemo('admin');
                  onClose();
                }}
                className="p-2 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-[11px] font-bold transition-all text-center cursor-pointer"
              >
                Marcus (Admin)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

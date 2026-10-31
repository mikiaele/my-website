import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { loginSchema, registerSchema } from '../../lib/validations.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
  
  // Register Form State
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErrors({});
    setGeneralError(null);

    const validation = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) fieldErrors[issue.path[0].toString()] = issue.message;
      });
      setLoginErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    const result = await login(loginEmail, loginPassword);
    setIsSubmitting(false);

    if (result.success) {
      onClose();
    } else {
      setGeneralError(
        result.error || (language === 'am' ? 'መግባት አልተሳካም። እባክዎ ኢሜይል እና የይለፍ ቃልዎን ያረጋግጡ።' : 'Failed to authenticate. Please check your credentials.')
      );
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegErrors({});
    setGeneralError(null);

    const validation = registerSchema.safeParse({
      fullName: regFullName,
      email: regEmail,
      password: regPassword,
      confirmPassword: regConfirmPassword,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) fieldErrors[issue.path[0].toString()] = issue.message;
      });
      setRegErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    const result = await register(regFullName, regEmail, regPassword);
    setIsSubmitting(false);

    if (result.success) {
      onClose();
    } else {
      setGeneralError(
        result.error || (language === 'am' ? 'መመዝገብ አልተሳካም። እባክዎ እንደገና ይሞክሩ።' : 'Failed to register account.')
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-serif font-bold text-base">
              M
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{t('accountModalTitle')}</h3>
              <p className="text-xs text-slate-500">{t('accountModalSubtitle')}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => {
              setActiveTab('login');
              setGeneralError(null);
            }}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center transition-colors cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white text-emerald-800 border-b-2 border-emerald-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t('loginTab')}
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setGeneralError(null);
            }}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center transition-colors cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white text-emerald-800 border-b-2 border-emerald-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t('registerTab')}
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {generalError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
              {generalError}
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t('emailAddress')}</label>
                <div className="relative">
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                      loginErrors.email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                    }`}
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                {loginErrors.email && (
                  <p className="text-[11px] text-rose-600 mt-1">{loginErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t('password')}</label>
                <div className="relative">
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                      loginErrors.password ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                    }`}
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                {loginErrors.password && (
                  <p className="text-[11px] text-rose-600 mt-1">{loginErrors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold transition-colors shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                <span>{isSubmitting ? (language === 'am' ? 'በመግባት ላይ...' : 'Signing In...') : t('signInAction')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t('fullName')}</label>
                <div className="relative">
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder={language === 'am' ? 'አበበ ከበደ' : 'John Doe'}
                    className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                      regErrors.fullName ? 'border-rose-400' : 'border-slate-200'
                    }`}
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
                {regErrors.fullName && (
                  <p className="text-[11px] text-rose-600 mt-1">{regErrors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t('emailAddress')}</label>
                <div className="relative">
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                      regErrors.email ? 'border-rose-400' : 'border-slate-200'
                    }`}
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
                {regErrors.email && (
                  <p className="text-[11px] text-rose-600 mt-1">{regErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t('password')}</label>
                <div className="relative">
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder={language === 'am' ? 'ቢያንስ 6 ፊደላት' : 'At least 6 characters'}
                    className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                      regErrors.password ? 'border-rose-400' : 'border-slate-200'
                    }`}
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
                {regErrors.password && (
                  <p className="text-[11px] text-rose-600 mt-1">{regErrors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t('confirmPassword')}</label>
                <div className="relative">
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder={language === 'am' ? 'የይለፍ ቃሉን ደግመው ያስገቡ' : 'Re-enter password'}
                    className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                      regErrors.confirmPassword ? 'border-rose-400' : 'border-slate-200'
                    }`}
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
                {regErrors.confirmPassword && (
                  <p className="text-[11px] text-rose-600 mt-1">{regErrors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold transition-colors shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
              >
                <span>{isSubmitting ? (language === 'am' ? 'በመመዝገብ ላይ...' : 'Creating Account...') : t('registerAction')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'am' ? 'በሱፓቤዝ (Supabase) እና ፖስትግሬስ የተጠበቀ ደህንነት' : 'Secured with Supabase Auth & PostgreSQL RLS'}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

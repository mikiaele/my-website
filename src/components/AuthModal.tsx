import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { X, Lock, Mail, Phone, User as UserIcon, Key, AlertCircle, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'admin';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}) => {
  const { login, register, adminLogin } = useAuth();
  const { t } = useLanguage();

  const [mode, setMode] = useState<'login' | 'register' | 'admin'>(initialMode);
  const [adminMode, setAdminMode] = useState<'password' | 'masterKey'>('password');

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [masterKey, setMasterKey] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'register') {
        if (!fullName || !email || !phone || !password) {
          setErrorMessage('Please fill in all registration fields.');
          setIsLoading(false);
          return;
        }

        if (password.length < 6) {
          setErrorMessage('Password must be at least 6 characters long.');
          setIsLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setErrorMessage('Passwords do not match.');
          setIsLoading(false);
          return;
        }

        const res = await register({
          full_name: fullName,
          email,
          phone,
          password,
        });

        if (!res.success) {
          setErrorMessage(res.error || 'Registration failed');
          setIsLoading(false);
          return;
        }
      } else if (mode === 'login') {
        const res = await login(email, password);
        if (!res.success) {
          setErrorMessage(res.error || 'Login failed');
          setIsLoading(false);
          return;
        }
      } else if (mode === 'admin') {
        let res;
        if (adminMode === 'masterKey') {
          res = await adminLogin({ masterKey });
        } else {
          res = await adminLogin({ email, password });
        }

        if (!res.success) {
          setErrorMessage(res.error || 'Administrator login failed');
          setIsLoading(false);
          return;
        }
      }

      // Success
      setIsLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      setIsLoading(false);
      setErrorMessage(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm">
              {mode === 'login'
                ? t('loginTitle')
                : mode === 'register'
                ? t('registerTitle')
                : t('adminLogin')}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 p-1 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-xl font-bold transition-all ${
              mode === 'login'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {t('login')}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-xl font-bold transition-all ${
              mode === 'register'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {t('register')}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('admin');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-xl font-bold transition-all ${
              mode === 'admin'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {t('adminDashboard')}
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Mode: REGISTER (strictly 4 fields only: full name, email, phone, password. NO profile photo!) */}
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    1. {t('fullName')} *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={t('fullNamePlaceholder')}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-emerald-600 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    2. {t('email')} *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('emailPlaceholder')}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-emerald-600 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    3. {t('phone')} *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t('phonePlaceholder')}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-emerald-600 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    4. {t('password')} *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('passwordPlaceholder')}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-emerald-600 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {t('confirmPassword')} *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t('confirmPassword')}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-emerald-600 bg-slate-50/50"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Mode: LOGIN */}
            {mode === 'login' && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {t('email')} *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('emailPlaceholder')}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-emerald-600 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {t('password')} *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-emerald-600 bg-slate-50/50"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Mode: ADMIN LOGIN */}
            {mode === 'admin' && (
              <>
                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/60 mb-2">
                  <p className="text-[11px] text-emerald-900 font-medium">
                    {t('adminLoginSubtitle')}
                  </p>
                </div>

                <div className="flex gap-2 text-xs mb-2">
                  <button
                    type="button"
                    onClick={() => setAdminMode('password')}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold ${
                      adminMode === 'password'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Email & Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminMode('masterKey')}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold ${
                      adminMode === 'masterKey'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Master Key
                  </button>
                </div>

                {adminMode === 'masterKey' ? (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {t('adminMasterKey')} *
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        value={masterKey}
                        onChange={(e) => setMasterKey(e.target.value)}
                        placeholder="ADMIN_SETUP_MASTER_KEY"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-emerald-600 bg-slate-50/50 font-mono"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Admin {t('email')} *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="admin@melamarket.com"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-emerald-600 bg-slate-50/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Admin {t('password')} *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-emerald-600 bg-slate-50/50"
                        />
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>
                {mode === 'login'
                  ? t('login')
                  : mode === 'register'
                  ? t('register')
                  : t('adminLogin')}
              </span>
            </button>
          </form>

          {/* Toggle between register and login */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            {mode === 'login' ? (
              <p className="text-xs text-slate-500">
                {t('dontHaveAccount')}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                  }}
                  className="font-bold text-emerald-700 hover:underline"
                >
                  {t('register')}
                </button>
              </p>
            ) : mode === 'register' ? (
              <p className="text-xs text-slate-500">
                {t('alreadyHaveAccount')}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="font-bold text-emerald-700 hover:underline"
                >
                  {t('login')}
                </button>
              </p>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                }}
                className="text-xs font-semibold text-slate-600 hover:text-emerald-700"
              >
                ← Back to standard user login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

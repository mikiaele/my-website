import React, { useState } from 'react';
import { X, LogIn, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  onSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSwitchToRegister,
  onSuccess,
}) => {
  const { signIn } = useAuth();
  const { t, language } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError(t('valEmailRequired'));
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim(), password);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('DemoPass123!');
    setLoading(true);
    try {
      await signIn(demoEmail, 'DemoPass123!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed demo login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95">
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-emerald-200 hover:text-white rounded-full hover:bg-emerald-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl sm:text-2xl font-black text-white">{t('signInTitle')}</h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1">{t('signInSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">{t('emailLabel')}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. abebe@melamarket.et"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">{t('passwordLabel')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-700/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>{t('signInBtn')}</span>
              </>
            )}
          </button>

          {/* Quick Demo Test Buttons */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-[11px] text-gray-700 font-semibold mb-2">
              {language === 'am' ? 'ፈጣን የሙከራ መግቢያ:' : 'Quick Test Accounts:'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('abebe@melamarket.et')}
                className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Abebe (Seller)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin@melamarket.et')}
                className="py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          <div className="text-center pt-1">
            <p className="text-xs text-gray-500">
              {t('noAccountYet')}{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-emerald-700 font-bold hover:underline cursor-pointer"
              >
                {t('registerLink')}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

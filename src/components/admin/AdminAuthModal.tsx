import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DESIGNATED_ADMIN_EMAIL, isSupabaseConfigured } from '../../lib/supabase';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Database, 
  HelpCircle,
  KeyRound,
  X,
  Loader2
} from 'lucide-react';

export const AdminAuthModal: React.FC = () => {
  const { 
    isAdminAuthModalOpen, 
    setIsAdminAuthModalOpen, 
    loginAsAdmin, 
    language, 
    t, 
    setActiveTab 
  } = useApp();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  if (!isAdminAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!password) {
      setErrorMsg(language === 'am' ? 'እባክዎ የይለፍ ቃል ያስገቡ።' : 'Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginAsAdmin(password);
      if (result.success) {
        setIsAdminAuthModalOpen(false);
        setActiveTab('admin');
        setPassword('');
      } else {
        setErrorMsg(result.error || 'Authentication failed.');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header with Dark Green Shield theme */}
        <div className="bg-gradient-to-br from-emerald-900 to-gray-950 p-6 text-white text-center relative">
          <button
            onClick={() => setIsAdminAuthModalOpen(false)}
            className="absolute top-4 right-4 text-emerald-300 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-400/20">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-bold tracking-tight">{t.admin_login_title}</h3>
          <p className="text-xs text-emerald-200 mt-1 max-w-xs mx-auto">
            {t.admin_login_sub}
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-800/80 border border-emerald-700 rounded-full text-[11px] text-amber-300 font-medium">
            <Lock className="w-3 h-3 text-amber-300" />
            <span>Supabase Auth & RLS Protected</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Dedicated Admin Email (Locked to designated admin email) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                {t.admin_email_label}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={DESIGNATED_ADMIN_EMAIL}
                  disabled
                  className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-xl text-sm font-semibold text-gray-800 cursor-not-allowed select-all"
                />
                <span className="absolute right-3.5 top-2.5 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                  Designated
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                {language === 'am' 
                  ? 'የተፈቀደው ዋና አስተዳዳሪ ኢሜይል ብቻ ነው።' 
                  : 'Designated primary administrator account.'}
              </p>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  {t.admin_password_label}
                </label>
                <button
                  type="button"
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>{language === 'am' ? 'የይለፍ ቃል እንዴት ማዘጋጀት ይቻላል?' : 'Password Setup Guide'}</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-4 pr-11 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Instructions Drawer */}
            {showInstructions && (
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl text-xs text-gray-700 space-y-2 animate-in fade-in">
                <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-emerald-700" />
                  <span>{language === 'am' ? 'የሱፓቤዝ አስተዳዳሪ የይለፍ ቃል ቅንብር' : 'Setting Admin Password in Supabase'}</span>
                </div>
                <ol className="list-decimal pl-4 space-y-1 text-gray-600 text-[11px]">
                  <li>
                    {language === 'am' 
                      ? 'ወደ Supabase Dashboard > Authentication > Users ይሂዱ።' 
                      : 'Go to your Supabase Dashboard > Authentication > Users.'}
                  </li>
                  <li>
                    {language === 'am'
                      ? 'Add User > Create User ን ተጭነው mikiaelebrhane@gmail.com እና የሚስጥር ይለፍ ቃል ያስገቡ።'
                      : 'Click "Add user" > "Create user" for mikiaelebrhane@gmail.com with your private password.'}
                  </li>
                  <li>
                    {language === 'am'
                      ? 'ወይም በአስተዳዳሪ ገጹ ላይ የቀረበውን የ SQL script በ SQL Editor ውስጥ ያስፈጽሙ።'
                      : 'Or execute the provided SQL script to assign the admin role and RLS policies.'}
                  </li>
                </ol>
              </div>
            )}

            {/* Supabase Connection Status Badge */}
            <div className="flex items-center justify-between px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs">
              <span className="text-gray-500 font-medium">Supabase Auth:</span>
              <span className={`font-bold flex items-center gap-1 ${
                isSupabaseConfigured ? 'text-emerald-700' : 'text-amber-700'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  isSupabaseConfigured ? 'bg-emerald-600' : 'bg-amber-500'
                }`} />
                {isSupabaseConfigured ? 'Connected' : 'Local Verification Active'}
              </span>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t.admin_login_btn}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

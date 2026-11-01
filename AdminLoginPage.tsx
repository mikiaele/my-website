import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { PageView } from '../../types/index.ts';

interface AdminLoginPageProps {
  setCurrentPage: (page: PageView) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ setCurrentPage }) => {
  const { login, logout, user, isAdmin } = useAuth();
  const { t, language } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If already signed in as admin, provide quick entry
  if (user && isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              {language === 'am' ? 'የተረጋገጠ የአስተዳዳሪ ክፍለ-ጊዜ' : 'Verified Admin Session'}
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-3">
              {language === 'am' ? 'እንኳን ደህና መጡ' : 'Welcome, Administrator'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'am'
                ? `በ ${user.full_name} (${user.email}) መለያ ገብተዋል።`
                : `Signed in as ${user.full_name} (${user.email})`}
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <button
              onClick={() => setCurrentPage('admin')}
              className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{language === 'am' ? 'ወደ አስተዳዳሪ ሰሌዳ ይግቡ' : 'Open Admin Console'}</span>
            </button>
            <button
              onClick={() => setCurrentPage('home')}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              {language === 'am' ? 'ወደ መነሻ ገጽ ተመለስ' : 'Return to Public Store'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMsg(
        language === 'am'
          ? 'እባክዎ ኢሜይል እና የይለፍ ቃል ያስገቡ።'
          : 'Please enter both your administrator email and password.'
      );
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(cleanEmail, password);
      if (!res.success) {
        setErrorMsg(res.error || (language === 'am' ? 'የተሳሳተ ኢሜይል ወይም የይለፍ ቃል።' : 'Invalid admin credentials.'));
        setIsLoading(false);
        return;
      }

      // Check current user role after login
      const rawUser = localStorage.getItem('mela_current_user');
      const currentUser = rawUser ? JSON.parse(rawUser) : null;

      if (!currentUser || currentUser.role !== 'admin') {
        // Log out immediately if not authorized as admin
        await logout();
        setErrorMsg(
          language === 'am'
            ? 'ይህ መለያ የአስተዳዳሪ ፈቃድ የለውም። እባክዎ በተፈቀደ የአስተዳዳሪ መለያ ይግቡ።'
            : 'Access Denied: This account does not have administrator privileges. Please sign in with an authorized admin account.'
        );
        setIsLoading(false);
        return;
      }

      // Successful verified admin login
      setCurrentPage('admin');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-slate-100 via-slate-50 to-white">
      <div className="w-full max-w-md">
        
        {/* Back Link */}
        <button
          onClick={() => setCurrentPage('home')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'am' ? 'ወደ ሜላ ገበያ ተመለስ' : 'Return to Mela Market'}</span>
        </button>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xl space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center mx-auto shadow-md">
              <KeyRound className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {language === 'am' ? 'የአስተዳዳሪ መግቢያ' : 'Admin Portal'}
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              {language === 'am'
                ? 'የሜላ ገበያ ሻጮችን፣ እቃዎችን፣ ትዕዛዞችንና ተጠቃሚዎችን ለማስተዳደር የፈቃድ መለያዎን ያስገቡ።'
                : 'Sign in to access the system administration suite, moderate sellers, manage catalog, and oversee platform orders.'}
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {language === 'am' ? 'የአስተዳዳሪ ኢሜይል' : 'Admin Email'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@melamarket.et"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {language === 'am' ? 'የይለፍ ቃል' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <span>{language === 'am' ? 'በማረጋገጥ ላይ...' : 'Authenticating...'}</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'am' ? 'ወደ መቆጣጠሪያ ሰሌዳ ግባ' : 'Sign In as Administrator'}</span>
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {language === 'am'
                ? 'ይህ ገጽ ለስርዓቱ የተረጋገጡ አስተዳዳሪዎች ብቻ የተዘጋጀ ነው። ያልተፈቀደ መግቢያ በስርዓቱ ክትትል ይደረግበታል።'
                : 'Restricted administrative access. Public registration cannot create administrator accounts. All unauthorized access attempts are blocked.'}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

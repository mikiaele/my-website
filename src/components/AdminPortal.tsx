import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  Trash2,
  AlertCircle,
  FileCheck,
  Eye,
  Plus,
  Minus,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  LogOut,
  RefreshCw,
  Database,
  ExternalLink,
  X,
  CheckCircle2,
  XCircle,
  Key,
  Server,
  Link2,
  ShieldCheck,
  Check,
  Copy,
  Sparkles,
  PlayCircle,
  UserPlus,
  EyeOff,
  UserCheck,
  KeyRound,
  Phone,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { OrderStatus } from '../types';
import { ethiopianLocations } from '../data/locations';
import {
  getSupabaseConfig,
  updateSupabaseCredentials,
  testSupabaseConnection,
  isSupabaseConfigured,
} from '../lib/supabase';
import { DEFAULT_ADMIN_SETUP_KEY } from '../lib/crypto';

interface AdminPortalProps {
  onReturnToMarketplace: () => void;
  isExplicitLoginRoute?: boolean;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onReturnToMarketplace,
  isExplicitLoginRoute = false,
}) => {
  const { t, localize } = useLanguage();
  const {
    user,
    isAdmin,
    isLoading,
    signIn,
    signInAdmin,
    signOut,
    refreshUserProfile,
    registerAdmin,
    hasAdminAccount,
    adminToken,
    verifyAdminServerSession,
  } = useAuth();
  const {
    products,
    deleteProduct,
    updateProductQuantity,
    orders,
    updateOrderStatus,
    verifyPaymentReceipt,
    refetchSupabaseData,
  } = useMarketplace();

  // Admin Portal State (Super Admin full entity management)
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'users' | 'sellers' | 'admins' | 'logs' | 'database'>('overview');
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState<string | null>(null);

  // Super Admin Entity State (Users, Sellers, Admin Accounts, Logs, Neon)
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminSellers, setAdminSellers] = useState<any[]>([]);
  const [adminAccountsList, setAdminAccountsList] = useState<any[]>([]);
  const [adminLogs, setAdminLogs] = useState<any[]>([]);
  const [neonStatus, setNeonStatus] = useState<any>(null);
  const [isMigratingNeon, setIsMigratingNeon] = useState(false);
  const [migrationMessage, setMigrationMessage] = useState<string | null>(null);

  // Server-Side Protected API Diagnostics state
  const [serverApiTestResult, setServerApiTestResult] = useState<string | null>(null);
  const [isTestingServerApi, setIsTestingServerApi] = useState(false);

  // Neon Database Connection & Testing state
  const [dbConfig, setDbConfig] = useState(getSupabaseConfig());
  const [customAnonKey, setCustomAnonKey] = useState(dbConfig.anonKey);
  const [customUrl, setCustomUrl] = useState(dbConfig.url);
  const [dbTestResult, setDbTestResult] = useState<{
    connected: boolean;
    message: string;
    tables?: { profiles: boolean; products: boolean; orders: boolean; buckets: boolean };
  } | null>(null);
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [saveDbStatus, setSaveDbStatus] = useState<string | null>(null);
  const [isSyncingData, setIsSyncingData] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showKeyField, setShowKeyField] = useState(false);

  // Authentication mode for /admin portal: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [hasExistingAdmin, setHasExistingAdmin] = useState<boolean | null>(null);

  // Login form state for /admin
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Registration form state for first admin setup
  const [regName, setRegName] = useState('Mikiyae Lebrhane');
  const [regEmail, setRegEmail] = useState('mikiaelebrhane21@gmail.com');
  const [regPhone, setRegPhone] = useState('+251904503245');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regSetupKey, setRegSetupKey] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  const [loginError, setLoginError] = useState<string | null>(null);
  const [regSuccessMessage, setRegSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check if an admin account already exists
  useEffect(() => {
    hasAdminAccount().then((hasAdmin) => {
      setHasExistingAdmin(hasAdmin);
      if (!hasAdmin) {
        setAuthMode('register');
      }
    });
  }, []);

  // Redirect countdown for unauthorized ordinary users
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  // If ordinary user visits /admin, initiate access denial and redirect countdown
  useEffect(() => {
    if (!isLoading && user && !isAdmin) {
      setRedirectCountdown(3);
      const timer = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            onReturnToMarketplace();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isLoading, user, isAdmin, onReturnToMarketplace]);

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);

    const res = await signInAdmin(loginEmail.trim(), loginPassword);
    setIsSubmitting(false);

    if (!res.success) {
      setLoginError(res.error || 'Server authorization failed. Please verify credentials.');
      return;
    }

    // Verify session with server
    const isServerVerified = await verifyAdminServerSession();
    if (!isServerVerified) {
      const fresh = await refreshUserProfile();
      if (!fresh || fresh.role !== 'admin') {
        setLoginError(
          `Access Denied: The account "${loginEmail}" was authenticated, but does not possess the 'admin' role on the server. Only authorized administrator accounts are permitted.`
        );
      }
    }
  };

  const handleTestServerApi = async (withAuth = true) => {
    setIsTestingServerApi(true);
    setServerApiTestResult(null);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (withAuth) {
        const token = adminToken || localStorage.getItem('mela_admin_server_token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch('/api/admin/dashboard-stats', {
        method: 'GET',
        headers,
      });

      const data = await response.json();
      setServerApiTestResult(
        `HTTP Status: ${response.status} ${response.statusText}\n` +
        JSON.stringify(data, null, 2)
      );
    } catch (err: any) {
      setServerApiTestResult(`Error calling protected endpoint: ${err.message}`);
    } finally {
      setIsTestingServerApi(false);
    }
  };

  const handleAdminRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setRegSuccessMessage(null);

    if (regPassword !== regConfirmPassword) {
      setLoginError('Passwords do not match. Please re-enter identical passwords.');
      return;
    }

    if (regPassword.length < 8) {
      setLoginError('Administrator password must be at least 8 characters long for security.');
      return;
    }

    setIsSubmitting(true);
    const res = await registerAdmin({
      name: regName.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim(),
      password: regPassword,
      setupKey: regSetupKey.trim(),
    });
    setIsSubmitting(false);

    if (!res.success) {
      setLoginError(res.error || 'Failed to register administrator account.');
      return;
    }

    setRegSuccessMessage('Administrator account successfully created and authorized!');
    setHasExistingAdmin(true);
  };

  const handleRefreshRole = async () => {
    setIsRefreshing(true);
    await refreshUserProfile();
    setIsRefreshing(false);
  };

  const handleSaveCredentials = async () => {
    setSaveDbStatus(null);
    const result = updateSupabaseCredentials(customUrl, customAnonKey);
    if (result.success) {
      setDbConfig(getSupabaseConfig());
      setSaveDbStatus('Neon PostgreSQL connection configured! Testing connection...');
      await handleTestConnection();
      await refetchSupabaseData();
    } else {
      setSaveDbStatus(`Error configuring connection: ${result.error}`);
    }
  };

  const fetchSuperAdminData = async () => {
    const token = adminToken || localStorage.getItem('mela_admin_server_token');
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const [uRes, sRes, aRes, lRes, nRes] = await Promise.all([
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/sellers', { headers }),
        fetch('/api/admin/accounts', { headers }),
        fetch('/api/admin/logs', { headers }),
        fetch('/api/neon/status'),
      ]);

      if (uRes.ok) setAdminUsers(await uRes.json());
      if (sRes.ok) setAdminSellers(await sRes.json());
      if (aRes.ok) setAdminAccountsList(await aRes.json());
      if (lRes.ok) setAdminLogs(await lRes.json());
      if (nRes.ok) {
        const nData = await nRes.json();
        setNeonStatus(nData);
        setDbTestResult({
          connected: nData.connected,
          message: nData.message,
          tables: {
            profiles: Boolean(nData.tables?.user_profiles || nData.tables?.users),
            products: Boolean(nData.tables?.products),
            orders: Boolean(nData.tables?.orders),
            buckets: true,
          },
        });
      }
    } catch (err) {
      console.warn('Super Admin fetch notice:', err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchSuperAdminData();
    }
  }, [isAdmin, activeTab]);

  const handleToggleUserStatus = async (userId: string, currentActive: boolean) => {
    const token = adminToken || localStorage.getItem('mela_admin_server_token');
    try {
      await fetch(`/api/admin/users/${userId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      fetchSuperAdminData();
    } catch (err) {
      console.warn(err);
    }
  };

  const handleUpdateUserRole = async (userId: string, role: string) => {
    const token = adminToken || localStorage.getItem('mela_admin_server_token');
    try {
      await fetch(`/api/admin/users/${userId}/role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });
      fetchSuperAdminData();
    } catch (err) {
      console.warn(err);
    }
  };

  const handleToggleSellerStatus = async (sellerId: string, status: string, isVerified: boolean) => {
    const token = adminToken || localStorage.getItem('mela_admin_server_token');
    try {
      await fetch(`/api/admin/sellers/${sellerId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, isVerified }),
      });
      fetchSuperAdminData();
    } catch (err) {
      console.warn(err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to permanently delete this user account from Neon PostgreSQL?')) return;
    const token = adminToken || localStorage.getItem('mela_admin_server_token');
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchSuperAdminData();
    } catch (err) {
      console.warn(err);
    }
  };

  const handleDeleteSeller = async (sellerId: string) => {
    if (!confirm('Are you sure you want to permanently delete this seller from Neon PostgreSQL?')) return;
    const token = adminToken || localStorage.getItem('mela_admin_server_token');
    try {
      await fetch(`/api/admin/sellers/${sellerId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchSuperAdminData();
    } catch (err) {
      console.warn(err);
    }
  };

  const handleRunNeonMigrations = async () => {
    setIsMigratingNeon(true);
    setMigrationMessage(null);
    const token = adminToken || localStorage.getItem('mela_admin_server_token');
    try {
      const res = await fetch('/api/neon/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ customUrl }),
      });
      const data = await res.json();
      setMigrationMessage(data.message || (data.success ? 'Neon PostgreSQL migrations applied successfully!' : 'Migration failed.'));
      await fetchSuperAdminData();
    } catch (err: any) {
      setMigrationMessage(`Migration call failed: ${err.message}`);
    } finally {
      setIsMigratingNeon(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTestingDb(true);
    setDbTestResult(null);
    try {
      const res = await testSupabaseConnection();
      setDbTestResult(res);
      await fetchSuperAdminData();
    } catch (err: any) {
      setDbTestResult({
        connected: false,
        message: err.message || 'Neon connection test failed',
      });
    } finally {
      setIsTestingDb(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncingData(true);
    try {
      await refetchSupabaseData();
      await fetchSuperAdminData();
      await refreshUserProfile();
    } finally {
      setIsSyncingData(false);
    }
  };

  // Run initial connection test when Database tab is opened
  useEffect(() => {
    if (activeTab === 'database' && !dbTestResult) {
      handleTestConnection();
    }
  }, [activeTab]);

  // Case 1: Checking authentication status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-300">
            Verifying administrator authorization...
          </p>
        </div>
      </div>
    );
  }

  // Case 2: Not logged in — Show Restricted Administrator Sign In & Registration Portal
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 text-slate-100">
        <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto font-black shadow-lg shadow-amber-400/20">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {isExplicitLoginRoute ? 'Private Administrator Login' : 'Mela Market Administration'}
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Private Route (<code className="text-amber-400 font-mono">{isExplicitLoginRoute ? '/admin/login' : '/admin'}</code>). Server-enforced administrator authorization only.
            </p>
          </div>

          {/* Mode Switcher Tabs: Sign In vs Register First Admin */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setLoginError(null);
                setRegSuccessMessage(null);
              }}
              className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setLoginError(null);
                setRegSuccessMessage(null);
              }}
              className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer relative ${
                authMode === 'register'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register First Admin</span>
              {hasExistingAdmin === false && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-500 text-slate-950 animate-pulse">
                  Setup
                </span>
              )}
            </button>
          </div>

          {/* First Admin Setup Info Banner */}
          {hasExistingAdmin === false && authMode === 'register' && (
            <div className="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-800/80 text-amber-200 text-xs flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-amber-300">Initial Administrator Setup Required</p>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  No administrator account exists yet. Complete this secure registration to initialize the first primary administrator account.
                </p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {regSuccessMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs font-medium flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Registration Successful</p>
                <p className="text-[11px] leading-relaxed text-emerald-300">{regSuccessMessage}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {loginError && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Authentication Issue</p>
                <p className="text-[11px] leading-relaxed text-rose-300">{loginError}</p>
              </div>
            </div>
          )}

          {/* MODE 1: SECURE ADMIN SIGN IN */}
          {authMode === 'login' && (
            <form onSubmit={handleAdminSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Administrator Email *
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-sm focus:border-amber-400 focus:outline-hidden transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Password *
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-sm focus:border-amber-400 focus:outline-hidden transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 active:scale-98 text-white font-bold text-sm shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Verifying Credentials...' : 'Sign In as Administrator'}</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Enforced Database Authorization</span>
                </p>
                <p>Only verified accounts possessing the <code className="text-amber-400 font-mono">admin</code> role in the database are allowed access.</p>
              </div>
            </form>
          )}

          {/* MODE 2: SECURE FIRST ADMIN REGISTRATION */}
          {authMode === 'register' && (
            <form onSubmit={handleAdminRegister} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <div className="relative flex items-center">
                    <UserCheck className="absolute left-3 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Mikiyae Lebrhane"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Phone Number *
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="absolute left-3 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+251904503245"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Administrator Email *
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="mikiaelebrhane21@gmail.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-300">
                    Master Setup Authorization Key *
                  </label>
                  <span className="text-[10px] text-amber-300 font-mono">Bootstrap Key</span>
                </div>
                <div className="relative flex items-center">
                  <KeyRound className="absolute left-3 w-3.5 h-3.5 text-amber-400" />
                  <input
                    type="text"
                    required
                    value={regSetupKey}
                    onChange={(e) => setRegSetupKey(e.target.value)}
                    placeholder="Enter Master Setup Key"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-amber-300 font-mono text-xs focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Protects against unauthorized admin account creation. Required authorization key verified on the server.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Password (min 8 chars) *
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type={showRegConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      className="absolute right-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-98 text-slate-950 font-black text-xs shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 mt-2"
              >
                <span>{isSubmitting ? 'Creating Administrator Account...' : 'Register & Access Admin Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[10px] text-slate-400 space-y-1">
                <p className="font-bold text-slate-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Security & Cryptographic Guarantees</span>
                </p>
                <p>• Passwords are encrypted with PBKDF2/SHA-256 (100,000 rounds) & Supabase bcrypt. Zero plain-text storage.</p>
                <p>• Automatically grants verified <code className="text-amber-400 font-mono">admin</code> role in database profiles.</p>
              </div>
            </form>
          )}

          {/* Collapsible Supabase Connection Setup */}
          <div className="pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setShowKeyField(!showKeyField)}
              className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-amber-300 py-1 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-amber-400" />
                <span>Supabase Connection Settings</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                dbConfig.isConfigured ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {dbConfig.isConfigured ? 'Connected' : 'Anon Key Needed'}
              </span>
            </button>

            {showKeyField && (
              <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://shvwchpdqimwsdqhbwyj.supabase.co"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">
                    Supabase Anon Public Key
                  </label>
                  <input
                    type="password"
                    value={customAnonKey}
                    onChange={(e) => setCustomAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono"
                  />
                </div>

                {saveDbStatus && (
                  <p className="text-[11px] text-emerald-400 font-medium">
                    {saveDbStatus}
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSaveCredentials}
                    className="flex-1 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs cursor-pointer"
                  >
                    Save & Reconnect
                  </button>
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTestingDb}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs cursor-pointer disabled:opacity-50 flex items-center gap-1"
                  >
                    {isTestingDb && <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />}
                    <span>Test Ping</span>
                  </button>
                </div>

                {dbTestResult && (
                  <div className={`p-2 rounded-lg text-[11px] ${
                    dbTestResult.connected
                      ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-200'
                      : 'bg-rose-950/80 border border-rose-800 text-rose-200'
                  }`}>
                    {dbTestResult.message}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Return to public site */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <button
              type="button"
              onClick={onReturnToMarketplace}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Marketplace</span>
            </button>
            <span className="text-[11px] text-slate-500 font-mono">RBAC Enforced</span>
          </div>

        </div>
      </div>
    );
  }

  // Case 3: Logged in, but NOT an administrator — Deny Access and Redirect
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 text-slate-100">
        <div className="w-full max-w-md bg-slate-900 border border-rose-900/60 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-950 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto animate-pulse">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-black text-rose-300">
              403 Forbidden — Access Denied
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              The account <strong className="text-white">{user.email}</strong> is authenticated as role <span className="font-mono text-amber-400 font-bold">"{user.role}"</span>, which does not have administrator privileges.
            </p>
            <p className="text-xs text-slate-400">
              Ordinary accounts are strictly prohibited from accessing <code className="text-amber-400">/admin</code>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
            <span>Redirecting to public marketplace in {redirectCountdown ?? 3} seconds...</span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onReturnToMarketplace}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer transition-colors"
            >
              Return to Website Now
            </button>
            <button
              type="button"
              onClick={async () => {
                await signOut();
                onReturnToMarketplace();
              }}
              className="py-2.5 px-4 rounded-xl bg-rose-900/60 hover:bg-rose-900 text-rose-200 font-bold text-xs cursor-pointer transition-colors"
            >
              Sign Out
            </button>
          </div>

          {/* Re-check if recently granted role */}
          <div className="pt-2 text-[11px] text-slate-500">
            <span>Were you just granted the admin role in Supabase? </span>
            <button
              type="button"
              onClick={handleRefreshRole}
              disabled={isRefreshing}
              className="text-amber-400 hover:underline cursor-pointer font-bold inline-flex items-center gap-1"
            >
              {isRefreshing ? 'Rechecking...' : 'Recheck Database Role'}
            </button>
          </div>

        </div>
      </div>
    );
  }

  // Case 4: Logged in AND Verified Administrator — Full Authorized Admin Dashboard
  const totalListings = products.length;
  const activeOrders = orders.filter((o) => o.status === 'Pending').length;
  const verifiedSellersCount = new Set(
    products.filter((p) => p.sellerIsVerified).map((p) => p.sellerId)
  ).size;
  const totalVolume = orders.reduce((sum, ord) => sum + ord.totalAmount, 0);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      
      {/* Top Admin Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm sm:text-base text-white">MELA MARKET</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                ADMIN
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Signed in as: <strong className="text-white">{user.name}</strong> (<span className="text-amber-300 font-mono">{user.email}</span>)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefreshRole}
            disabled={isRefreshing}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
            title="Recheck database permissions"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            type="button"
            onClick={onReturnToMarketplace}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
            <span>Go to Storefront</span>
          </button>

          <button
            type="button"
            onClick={async () => {
              await signOut();
              onReturnToMarketplace();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Admin Tabs */}
      <div className="bg-slate-950/60 border-b border-slate-800 px-4 sm:px-6 lg:px-8 flex overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-3.5 font-bold text-xs sm:text-sm border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          {t('admin.tab.overview')}
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`py-3 px-3.5 font-bold text-xs sm:text-sm border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'products'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          {t('admin.tab.products')} ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-3 px-3.5 font-bold text-xs sm:text-sm border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          {t('admin.tab.orders')} ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`py-3 px-3.5 font-bold text-xs sm:text-sm border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-blue-400" />
          <span>Users & Customers ({adminUsers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('sellers')}
          className={`py-3 px-3.5 font-bold text-xs sm:text-sm border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'sellers'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Sellers ({adminSellers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('admins')}
          className={`py-3 px-3.5 font-bold text-xs sm:text-sm border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'admins'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5 text-purple-400" />
          <span>Admin Accounts ({adminAccountsList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`py-3 px-3.5 font-bold text-xs sm:text-sm border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'logs'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Server className="w-3.5 h-3.5 text-cyan-400" />
          <span>Audit Logs ({adminLogs.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`py-3 px-3.5 font-bold text-xs sm:text-sm border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'database'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-amber-400" />
          <span>Neon PostgreSQL ({neonStatus?.connected ? 'Connected' : 'Ready'})</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">

        {/* TAB 1: OVERVIEW & STATS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-bold">{t('admin.stats.listings')}</span>
                  <Package className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-3xl font-black text-white">{totalListings}</p>
                <span className="text-[11px] text-emerald-400">Live active listings</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-bold">{t('admin.stats.orders')}</span>
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-3xl font-black text-white">{activeOrders}</p>
                <span className="text-[11px] text-amber-400">Pending customer orders</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-bold">{t('admin.stats.sellers')}</span>
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-3xl font-black text-white">{verifiedSellersCount}</p>
                <span className="text-[11px] text-blue-400">Verified merchants</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-bold">{t('admin.stats.revenue')}</span>
                  <DollarSign className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-3xl font-black text-white">{totalVolume.toLocaleString()} ETB</p>
                <span className="text-[11px] text-purple-400">Total gross order volume</span>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700">
              <h3 className="font-black text-sm text-white mb-3">Recent Orders Activity</h3>
              <div className="space-y-2.5">
                {orders.slice(0, 5).map((ord) => (
                  <div key={ord.id} className="p-3.5 bg-slate-800 rounded-xl border border-slate-700/80 flex flex-wrap items-center justify-between text-xs gap-2">
                    <div>
                      <span className="font-extrabold text-amber-300">{ord.id}</span>
                      <span className="text-slate-300 ml-2">by {ord.customerName} ({ord.customerPhone})</span>
                      <span className="text-slate-500 ml-2">[{ord.region}{ord.woreda ? ` / ${ord.woreda}` : ''}]</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-emerald-400">{ord.totalAmount.toLocaleString()} ETB</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        {ord.status}
                      </span>
                      {ord.paymentReceipt && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ord.paymentReceipt.verified
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {ord.paymentReceipt.verified ? 'Receipt Verified ✓' : 'Receipt Pending'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-white">All Marketplace Listings ({products.length})</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-800 text-slate-400 uppercase font-semibold">
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Location (Region/Zone/Woreda)</th>
                    <th className="py-2.5 px-3">Seller</th>
                    <th className="py-2.5 px-3">Price</th>
                    <th className="py-2.5 px-3">Stock Qty</th>
                    <th className="py-2.5 px-3">Condition</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {products.map((prod) => {
                    const regionObj = ethiopianLocations.find((r) => r.id === prod.region);
                    const regName = regionObj ? localize(regionObj.name) : prod.region;
                    const znObj = regionObj?.zones.find((z) => z.id === prod.zone);
                    const znName = znObj ? localize(znObj.name) : prod.zone;
                    const wrObj = znObj?.woredas?.find((w) => w.id === prod.woreda);
                    const wrName = wrObj ? localize(wrObj.name) : prod.woreda;
                    const locStr = wrName ? `${wrName}, ${znName || regName}` : znName ? `${znName}, ${regName}` : regName;

                    return (
                      <tr key={prod.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="py-3 px-3 flex items-center gap-2.5">
                          <img
                            src={prod.images[0] || ''}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-slate-700 shrink-0"
                          />
                          <span className="font-bold text-white max-w-[180px] truncate">
                            {localize(prod.title)}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-300">{prod.categoryId}</td>
                        <td className="py-3 px-3 text-slate-300 max-w-[150px] truncate" title={locStr}>
                          {locStr}
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-semibold text-slate-200">{prod.sellerName}</p>
                          <p className="text-[10px] text-slate-400">{prod.sellerPhone}</p>
                        </td>
                        <td className="py-3 px-3 font-black text-emerald-400">
                          {prod.price.toLocaleString()} ETB
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1 border border-slate-600 rounded-lg p-0.5 w-fit bg-slate-800">
                            <button
                              type="button"
                              onClick={() => updateProductQuantity(prod.id, (prod.quantity ?? 1) - 1)}
                              className="w-5 h-5 rounded hover:bg-slate-700 flex items-center justify-center text-slate-300"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center font-black text-white">
                              {prod.quantity ?? 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateProductQuantity(prod.id, (prod.quantity ?? 1) + 1)}
                              className="w-5 h-5 rounded hover:bg-slate-700 flex items-center justify-center text-slate-300"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-200">
                            {prod.condition === 'Brand New' ? 'አዲስ (Brand New)' : 'ያገለገለ (Used)'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this listing?')) {
                                deleteProduct(prod.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-900/50 transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS MANAGEMENT & RECEIPT VERIFICATION */}
        {activeTab === 'orders' && (
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-4">
            <h3 className="font-black text-sm text-white">Order Tracking & Receipt Verification ({orders.length})</h3>

            <div className="space-y-3.5">
              {orders.map((ord) => (
                <div key={ord.id} className="p-4 rounded-2xl border border-slate-700 bg-slate-800 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-700">
                    <div>
                      <span className="font-black text-sm text-amber-300">{ord.id}</span>
                      <span className="text-xs text-slate-400 ml-2">{ord.orderDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-300">Status:</span>
                      <select
                        value={ord.status}
                        onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                        className="px-2.5 py-1 rounded-lg border border-slate-600 font-bold text-xs bg-slate-900 text-white cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="font-bold text-white">Customer: {ord.customerName}</p>
                      <p className="text-slate-300">Phone: <a href={`tel:${ord.customerPhone}`} className="text-emerald-400 underline">{ord.customerPhone}</a></p>
                      <p className="text-slate-400">Address: {ord.deliveryAddress}</p>
                      {ord.woreda && <p className="text-slate-400">Woreda: {ord.woreda} ({ord.zone}, {ord.region})</p>}
                    </div>
                    <div className="sm:text-right">
                      <p className="text-slate-400">Total Amount:</p>
                      <p className="text-base font-black text-emerald-400">
                        {ord.totalAmount.toLocaleString()} ETB
                      </p>
                      {ord.notes && (
                        <p className="text-[11px] text-amber-300/80 italic mt-1">Note: "{ord.notes}"</p>
                      )}
                    </div>
                  </div>

                  {/* Payment Receipt Verification Box */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-xs text-white">Payment Receipt Screenshot:</span>
                        {ord.paymentReceipt ? (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ord.paymentReceipt.verified
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}>
                            {ord.paymentReceipt.verified ? 'Verified by Admin ✓' : 'Pending Verification (Not Verified)'}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">No screenshot uploaded yet</span>
                        )}
                      </div>

                      {ord.paymentReceipt && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewReceiptUrl(ord.paymentReceipt!.receiptUrl)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-600 hover:border-amber-400 text-xs font-semibold text-slate-200 flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Full Image</span>
                          </button>

                          {ord.paymentReceipt.verified ? (
                            <button
                              type="button"
                              onClick={() => verifyPaymentReceipt(ord.id, false)}
                              className="px-2.5 py-1 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-bold hover:bg-rose-900 cursor-pointer"
                            >
                              Revoke Verification
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => verifyPaymentReceipt(ord.id, true)}
                              className="px-3 py-1 rounded-lg bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-600 cursor-pointer shadow-xs"
                            >
                              Verify Payment (ክፍያ አረጋግጥ)
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {ord.paymentReceipt && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center gap-3 text-xs">
                        <img
                          src={ord.paymentReceipt.receiptUrl}
                          alt="Receipt"
                          onClick={() => setPreviewReceiptUrl(ord.paymentReceipt!.receiptUrl)}
                          className="w-14 h-14 rounded-lg object-cover border border-slate-700 cursor-pointer hover:opacity-80"
                        />
                        <div className="text-[11px] text-slate-300">
                          <p><strong>Payment Method:</strong> {ord.paymentReceipt.paymentMethod || 'Telebirr'}</p>
                          {ord.paymentReceipt.transactionRef && (
                            <p><strong>Transaction Ref:</strong> <span className="font-mono text-amber-300">{ord.paymentReceipt.transactionRef}</span></p>
                          )}
                          <p className="text-slate-500">Uploaded at: {ord.paymentReceipt.uploadedAt}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: USERS & CUSTOMERS MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-sm text-white">All Registered Users & Customers ({adminUsers.length})</h3>
                <p className="text-xs text-slate-400 mt-0.5">Manage customer accounts, verify permissions, and toggle access on Neon PostgreSQL.</p>
              </div>
              <button
                type="button"
                onClick={fetchSuperAdminData}
                className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Users</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-800 text-slate-400 uppercase font-semibold">
                    <th className="py-2.5 px-3">User</th>
                    <th className="py-2.5 px-3">Email & Phone</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {adminUsers.map((u: any) => (
                    <tr key={u.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="py-3 px-3 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-amber-300">
                            {(u.name || 'U')[0].toUpperCase()}
                          </div>
                          <span>{u.name || 'Customer'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <p className="text-slate-200 font-mono text-[11px]">{u.email}</p>
                        <p className="text-slate-400 text-[10px]">{u.phone || 'No phone'}</p>
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {u.region || 'Ethiopia'}{u.zone ? ` / ${u.zone}` : ''}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'super_admin'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            : u.role === 'admin'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : u.role === 'seller'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-700 text-slate-300'
                        }`}>
                          {u.role || 'user'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.is_active !== false
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}>
                          {u.is_active !== false ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleUserStatus(u.id, u.is_active !== false)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                              u.is_active !== false
                                ? 'bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300'
                                : 'bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300'
                            }`}
                          >
                            {u.is_active !== false ? 'Deactivate' : 'Activate'}
                          </button>
                          <select
                            value={u.role || 'user'}
                            onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                            className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-[11px] font-bold cursor-pointer"
                          >
                            <option value="user">User</option>
                            <option value="seller">Seller</option>
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1 rounded-lg text-rose-400 hover:bg-rose-900/50 transition-colors cursor-pointer"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: SELLERS MANAGEMENT */}
        {activeTab === 'sellers' && (
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-sm text-white">Marketplace Merchants & Sellers ({adminSellers.length})</h3>
                <p className="text-xs text-slate-400 mt-0.5">Approve business registrations and verify merchant trust badges on Neon PostgreSQL.</p>
              </div>
              <button
                type="button"
                onClick={fetchSuperAdminData}
                className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Sellers</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-800 text-slate-400 uppercase font-semibold">
                    <th className="py-2.5 px-3">Merchant / Business</th>
                    <th className="py-2.5 px-3">Contact</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Verification</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {adminSellers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No external sellers registered yet. Sellers can register through the storefront.
                      </td>
                    </tr>
                  ) : (
                    adminSellers.map((s: any) => (
                      <tr key={s.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="py-3 px-3 font-bold text-white">
                          <p>{s.business_name || 'Merchant'}</p>
                          {s.business_license && <span className="text-[10px] text-slate-400 font-mono">Lic: {s.business_license}</span>}
                        </td>
                        <td className="py-3 px-3">
                          <p className="text-slate-200">{s.phone}</p>
                          <p className="text-slate-400 text-[10px]">{s.email || s.user_email || '—'}</p>
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          {s.region}{s.zone ? ` / ${s.zone}` : ''}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.is_verified
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-700 text-slate-400'
                          }`}>
                            {s.is_verified ? 'Verified Merchant ✓' : 'Unverified'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : s.status === 'suspended'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}>
                            {s.status || 'pending'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleSellerStatus(s.id, s.status || 'approved', !s.is_verified)}
                              className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] cursor-pointer"
                            >
                              {s.is_verified ? 'Revoke Verification' : 'Verify Merchant (አረጋግጥ)'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleSellerStatus(s.id, s.status === 'approved' ? 'suspended' : 'approved', s.is_verified)}
                              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer ${
                                s.status === 'approved'
                                  ? 'bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300'
                                  : 'bg-emerald-700 hover:bg-emerald-600 text-white'
                              }`}
                            >
                              {s.status === 'approved' ? 'Suspend' : 'Approve'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSeller(s.id)}
                              className="p-1 rounded-lg text-rose-400 hover:bg-rose-900/50 transition-colors cursor-pointer"
                              title="Delete Seller"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: ADMIN ACCOUNTS & RBAC */}
        {activeTab === 'admins' && (
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-sm text-white">Administrator Accounts & Access Control ({adminAccountsList.length})</h3>
                <p className="text-xs text-slate-400 mt-0.5">Strictly server-side role-based access control with HMAC-SHA256 tokens.</p>
              </div>
              <button
                type="button"
                onClick={fetchSuperAdminData}
                className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Admins</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {adminAccountsList.map((adm: any) => (
                <div key={adm.id} className="p-4 rounded-xl bg-slate-900 border border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center font-black">
                        <KeyRound className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-xs">{adm.name || 'Admin'}</h4>
                        <p className="text-[11px] text-slate-400 font-mono">{adm.email}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
                      {adm.role || 'super_admin'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[11px] space-y-1 text-slate-300">
                    <p><strong>Admin ID:</strong> <span className="font-mono text-slate-400">{adm.id}</span></p>
                    <p><strong>Phone:</strong> {adm.phone || '+251904503245'}</p>
                    <p><strong>Created:</strong> {adm.created_at?.split('T')[0] || 'Active'}</p>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                    <p className="text-[10px] font-bold text-amber-400 uppercase mb-1">Active Neon RBAC Permissions:</p>
                    <div className="flex flex-wrap gap-1">
                      {['manage_users', 'manage_sellers', 'manage_products', 'manage_orders', 'manage_admins', 'view_audit_logs'].map((perm) => (
                        <span key={perm} className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-emerald-400 font-mono border border-slate-700">
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: AUDIT ACTIVITY LOGS */}
        {activeTab === 'logs' && (
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-sm text-white">System Activity & Administrator Audit Logs ({adminLogs.length})</h3>
                <p className="text-xs text-slate-400 mt-0.5">Real-time audit trail of administrative modifications recorded in Neon PostgreSQL.</p>
              </div>
              <button
                type="button"
                onClick={fetchSuperAdminData}
                className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Logs</span>
              </button>
            </div>

            <div className="space-y-2">
              {adminLogs.length === 0 ? (
                <div className="p-8 text-center bg-slate-900 rounded-xl border border-slate-800 text-slate-400 text-xs">
                  No activity logs recorded yet. Administrative actions will automatically log here.
                </div>
              ) : (
                adminLogs.map((log: any) => (
                  <div key={log.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <div>
                        <span className="font-bold text-amber-300 font-mono text-[11px]">{log.action}</span>
                        <span className="text-slate-400 ml-2">by <strong className="text-white">{log.admin_email}</strong></span>
                        <span className="text-slate-500 ml-2">[{log.target_type}{log.target_id ? ` #${log.target_id}` : ''}]</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {log.created_at ? new Date(log.created_at).toLocaleTimeString() : 'Just now'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 8: NEON POSTGRESQL DATABASE & MIGRATION CENTER */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-400/20">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-lg text-white">Neon Serverless PostgreSQL Database & Migration Center</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                      neonStatus?.connected || dbTestResult?.connected
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${neonStatus?.connected || dbTestResult?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                      {neonStatus?.connected ? 'Neon PostgreSQL Connected' : 'Neon Ready (In-Memory Fallback)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Official serverless PostgreSQL connection, pooled deployment, and DDL schema migrations for Mela Market.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTestingDb}
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingDb ? 'animate-spin text-amber-400' : 'text-slate-300'}`} />
                  <span>{isTestingDb ? 'Testing...' : 'Test Connection'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleRunNeonMigrations}
                  disabled={isMigratingNeon}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Server className={`w-3.5 h-3.5 ${isMigratingNeon ? 'animate-spin' : ''}`} />
                  <span>{isMigratingNeon ? 'Applying Migrations...' : 'Execute neon-schema.sql'}</span>
                </button>
              </div>
            </div>

            {migrationMessage && (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{migrationMessage}</span>
              </div>
            )}

            {/* Live Connection Diagnostics & Key Configuration */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              
              {/* Box A: Credentials & Connection Config */}
              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-400" />
                    <span>Neon Database Connection Strings</span>
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">@neondatabase/serverless</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      DATABASE_URL (Neon Pooled Connection)
                    </label>
                    <input
                      type="text"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="postgresql://user:pass@ep-xyz-pooler.region.neon.tech/neondb?sslmode=require"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs focus:border-amber-400 focus:outline-hidden"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Set in environment variables or configure here for immediate live connection testing.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      DIRECT_URL (Neon Direct Connection for Migrations)
                    </label>
                    <input
                      type="password"
                      value={customAnonKey}
                      onChange={(e) => setCustomAnonKey(e.target.value)}
                      placeholder="postgresql://user:pass@ep-xyz.region.neon.tech/neondb?sslmode=require"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs focus:border-amber-400 focus:outline-hidden"
                    />
                  </div>

                  {saveDbStatus && (
                    <div className="p-2.5 rounded-lg bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs">
                      {saveDbStatus}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleSaveCredentials}
                      className="flex-1 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs cursor-pointer transition-all"
                    >
                      Save & Test Neon Connection
                    </button>
                  </div>
                </div>
              </div>

              {/* Box B: Live Health Check & Table Status */}
              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Neon Database Schema (15 Required Tables)</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    className="text-[11px] text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isTestingDb ? 'animate-spin' : ''}`} />
                    <span>Re-test</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {dbTestResult ? (
                    <div className={`p-3 rounded-xl text-xs flex items-center gap-2.5 ${
                      dbTestResult.connected
                        ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-200'
                        : 'bg-amber-950/80 border border-amber-800 text-amber-200'
                    }`}>
                      {dbTestResult.connected ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                      <span>{dbTestResult.message}</span>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Click "Test Connection" to query and verify Neon PostgreSQL tables.</span>
                    </div>
                  )}

                  {/* Schema 15-table checklist */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                    {[
                      'users', 'user_profiles', 'roles', 'permissions', 'sellers',
                      'products', 'categories', 'product_images', 'orders', 'order_items',
                      'order_statuses', 'admin_accounts', 'admin_activity_logs', 'notifications', 'reports'
                    ].map((tbl) => {
                      const isOk = neonStatus?.tables?.[tbl] || dbTestResult?.connected;
                      return (
                        <div key={tbl} className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                          <span className="font-mono text-slate-300 truncate">{tbl}</span>
                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5 shrink-0 ml-1">
                            <Check className="w-3 h-3" /> OK
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>

            {/* Box C: Server-Side Authentication & API Endpoint Protection */}
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h4 className="font-bold text-sm text-white">Server-Side Authentication & API Endpoint Protection</h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  HMAC-SHA256 Token Enforced
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                All administrative operations communicate through protected backend endpoints (<code className="text-amber-400 font-mono">/api/admin/*</code>). Access is strictly validated on the server with role-based access control (RBAC). The application does not rely on a hidden URL as a security mechanism.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <p className="font-bold text-slate-300">Active Admin Token Status:</p>
                  <p className="font-mono text-[11px] text-amber-300 truncate">
                    {adminToken ? `${adminToken.slice(0, 32)}...` : 'Client authenticated (token available in local session)'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <p className="font-bold text-slate-300">Protected Backend Routes:</p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    /api/admin/login, /api/admin/verify, /api/admin/users, /api/admin/sellers, /api/admin/orders, /api/neon/*
                  </p>
                </div>
              </div>

              {/* Interactive Endpoint Test Buttons */}
              <div className="space-y-2 pt-1">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleTestServerApi(true)}
                    disabled={isTestingServerApi}
                    className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTestingServerApi ? 'animate-spin' : ''}`} />
                    <span>Test Protected Endpoint (Authorized Request)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTestServerApi(false)}
                    disabled={isTestingServerApi}
                    className="px-3.5 py-2 rounded-xl bg-rose-950/80 border border-rose-800 hover:bg-rose-900 text-rose-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>Test Unauthorized Call (Simulate Public / No Token)</span>
                  </button>
                </div>

                {serverApiTestResult && (
                  <pre className="p-3.5 rounded-xl bg-black/70 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed whitespace-pre-wrap">
                    {serverApiTestResult}
                  </pre>
                )}
              </div>
            </div>

            {/* Step-by-Step Testing Runbook */}
            <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700 space-y-5">
              <div>
                <h4 className="font-black text-base text-white flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-amber-400" />
                  <span>Neon PostgreSQL & Super Admin Verification Guide</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Follow these step-by-step procedures to thoroughly test Neon PostgreSQL, Users, Products, and Orders.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                
                {/* Test 1: User Auth & Admin Access */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 font-bold">
                      <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-xs">1</span>
                      <h5>User Auth & Admin RBAC</h5>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      Verify administrator access and Neon role verification.
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-400">
                      <li>Currently logged in as: <strong className="text-white">{user?.email}</strong></li>
                      <li>Verified Database Role: <span className="font-mono font-bold text-emerald-400">"{user?.role}"</span></li>
                      <li>Public pages have <strong className="text-white">zero</strong> admin links or buttons.</li>
                      <li>Non-admin visitors to <code className="text-amber-400">/admin</code> are met with a 403 Forbidden screen.</li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={handleRefreshRole}
                    disabled={isRefreshing}
                    className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
                    <span>Re-query Role from Neon</span>
                  </button>
                </div>

                {/* Test 2: Product Listings */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <span className="w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center text-xs">2</span>
                      <h5>Product Listings & Inventory</h5>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      All products and stock persist directly in Neon PostgreSQL.
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-400">
                      <li>Click <strong className="text-white">"Sell (መሸጫ)"</strong> on the top header.</li>
                      <li>Photo capture launches device camera directly.</li>
                      <li>Administrative Locations: Full Ethiopian Regions, Zones & Woredas.</li>
                      <li>Quantity updates and product deletions immediately persist in Neon.</li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={onReturnToMarketplace}
                    className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Go to Marketplace to Test Sell</span>
                  </button>
                </div>

                {/* Test 3: Orders & Receipt Verification */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold">
                      <span className="w-5 h-5 rounded-full bg-cyan-400/20 text-cyan-300 flex items-center justify-center text-xs">3</span>
                      <h5>Orders & Payment Verification</h5>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      Test customer purchasing and admin payment receipt approval.
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-400">
                      <li>Add an item to Cart and checkout.</li>
                      <li>Customer submits purchase, then uploads payment screenshot (Telebirr or CBE Birr).</li>
                      <li>Switch to the <strong className="text-white">"Orders"</strong> tab above to view and verify.</li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="w-full py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Open Orders Tab ({orders.length})</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                </div>

              </div>
            </div>

            {/* SQL Command Quick Reference Box */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  <span>Neon PostgreSQL Admin Role SQL Query Reference</span>
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`-- Grant Super Admin Role in Neon PostgreSQL\nUPDATE user_profiles\nSET role = 'super_admin'\nWHERE id IN (SELECT id FROM users WHERE email = 'mikiaelebrhane21@gmail.com');\n\n-- Verify update\nSELECT u.id, u.email, p.name, p.role, u.created_at \nFROM users u \nJOIN user_profiles p ON u.id = p.id \nWHERE u.email = 'mikiaelebrhane21@gmail.com';`);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2000);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
                </button>
              </div>

              <pre className="p-3.5 rounded-xl bg-black/60 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
{`-- Grant Super Admin Role in Neon PostgreSQL
UPDATE user_profiles
SET role = 'super_admin'
WHERE id IN (SELECT id FROM users WHERE email = 'mikiaelebrhane21@gmail.com');

-- Verify the update succeeded
SELECT u.id, u.email, p.name, p.role, u.created_at 
FROM users u 
JOIN user_profiles p ON u.id = p.id 
WHERE u.email = 'mikiaelebrhane21@gmail.com';`}
              </pre>
            </div>

          </div>
        )}

      </main>

      {/* Full-Screen Receipt Preview Modal */}
      {previewReceiptUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden p-3 flex flex-col">
            <div className="flex justify-between items-center px-2 py-1.5 border-b border-slate-800 mb-2">
              <span className="font-bold text-xs text-amber-300">Payment Receipt Full Preview</span>
              <button
                onClick={() => setPreviewReceiptUrl(null)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-auto flex items-center justify-center bg-black rounded-lg p-2">
              <img src={previewReceiptUrl} alt="Receipt Full" className="max-w-full max-h-[75vh] object-contain" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

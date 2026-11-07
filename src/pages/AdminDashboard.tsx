import React, { useState, useEffect } from 'react';
import {
  Shield,
  BarChart3,
  Package,
  Users,
  MapPin,
  Settings,
  MessageCircle,
  Clock,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle2,
  PhoneCall,
  Save,
  Eye,
  X,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { buildAdminWhatsAppLink, DEFAULT_ADMIN_WHATSAPP } from '../lib/whatsapp.ts';

export const AdminDashboard: React.FC = () => {
  const { t, getLocalized } = useLanguage();
  const { token, user } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'secrets' | 'users' | 'locations' | 'products' | 'inquiries' | 'orders' | 'logs'>('overview');
  const [adminProdFilter, setAdminProdFilter] = useState<'all' | 'new' | 'used'>('all');
  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null);

  const [stats, setStats] = useState<any>(null);
  const [adminWhatsApp, setAdminWhatsApp] = useState<string>(DEFAULT_ADMIN_WHATSAPP);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [locationsHierarchy, setLocationsHierarchy] = useState<any[]>([]);
  const [allInquiries, setAllInquiries] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [dbHealth, setDbHealth] = useState<any>(null);

  // Bootstrap with Master Key state
  const [masterKeyInput, setMasterKeyInput] = useState('');
  const [bootstrapEmail, setBootstrapEmail] = useState('');
  const [bootstrapPassword, setBootstrapPassword] = useState('');
  const [bootstrapName, setBootstrapName] = useState('');
  const [bootstrapFeedback, setBootstrapFeedback] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(false);

  const [isSavingSetting, setIsSavingSetting] = useState(false);
  const [settingFeedback, setSettingFeedback] = useState<string | null>(null);

  // New location state
  const [newRegAm, setNewRegAm] = useState('');
  const [newRegEn, setNewRegEn] = useState('');
  const [newRegCode, setNewRegCode] = useState('');

  const [targetRegionId, setTargetRegionId] = useState('');
  const [newWoredaAm, setNewWoredaAm] = useState('');
  const [newWoredaEn, setNewWoredaEn] = useState('');

  const [targetWoredaId, setTargetWoredaId] = useState('');
  const [newCityAm, setNewCityAm] = useState('');
  const [newCityEn, setNewCityEn] = useState('');

  const loadAdminData = async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, settingsRes, usersRes, locsRes, prodsRes, inqRes, ordRes, logsRes, healthRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/settings/public'),
        fetch('/api/admin/users', { headers }),
        fetch('/api/locations/hierarchy'),
        fetch('/api/products?limit=100'),
        fetch('/api/inquiries/admin', { headers }),
        fetch('/api/orders/admin', { headers }),
        fetch('/api/admin/audit-logs', { headers }),
        fetch('/api/admin/db-health'),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (settingsRes.ok) {
        const s = await settingsRes.json();
        setAdminWhatsApp(s.admin_whatsapp_number || '');
      }
      if (usersRes.ok) setUsersList(await usersRes.json());
      if (locsRes.ok) setLocationsHierarchy(await locsRes.json());
      if (prodsRes.ok) setProductsList(await prodsRes.json());
      if (inqRes.ok) setAllInquiries(await inqRes.json());
      if (ordRes.ok) setAllOrders(await ordRes.json());
      if (logsRes.ok) setAuditLogs(await logsRes.json());
      if (healthRes.ok) setDbHealth(await healthRes.json());
    } catch (err) {
      console.error('Error loading admin data:', err);
    }
  };

  const handleBootstrapWithMasterKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBootstrapping(true);
    setBootstrapFeedback(null);
    try {
      const res = await fetch('/api/admin/bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          masterKey: masterKeyInput,
          email: bootstrapEmail,
          password: bootstrapPassword,
          name: bootstrapName,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setBootstrapFeedback('Administrator account successfully initialized via Master Key!');
        setMasterKeyInput('');
        setBootstrapPassword('');
        await loadAdminData();
      } else {
        setBootstrapFeedback(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setBootstrapFeedback(err.message || 'Bootstrap failed');
    } finally {
      setIsBootstrapping(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [token]);

  // Save official WhatsApp configuration
  const handleSaveWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSetting(true);
    setSettingFeedback(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          key: 'admin_whatsapp_number',
          value: adminWhatsApp,
        }),
      });

      if (res.ok) {
        setSettingFeedback('Official Administrator WhatsApp number successfully updated!');
        setTimeout(() => setSettingFeedback(null), 3000);
        await loadAdminData();
      } else {
        const d = await res.json();
        setSettingFeedback(`Error: ${d.error}`);
      }
    } catch (err: any) {
      setSettingFeedback(err.message || 'Failed to save');
    } finally {
      setIsSavingSetting(false);
    }
  };

  // Change user role
  const handleChangeUserRole = async (userId: number, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsersList(
          usersList.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      console.error('Role update error:', err);
    }
  };

  // Add Region
  const handleAddRegion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/locations/regions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nameAm: newRegAm,
          nameEn: newRegEn,
          code: newRegCode,
        }),
      });
      if (res.ok) {
        setNewRegAm('');
        setNewRegEn('');
        setNewRegCode('');
        await loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Woreda
  const handleAddWoreda = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/locations/woredas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          regionId: targetRegionId,
          nameAm: newWoredaAm,
          nameEn: newWoredaEn,
        }),
      });
      if (res.ok) {
        setNewWoredaAm('');
        setNewWoredaEn('');
        await loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add City
  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/locations/cities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          woredaId: targetWoredaId,
          nameAm: newCityAm,
          nameEn: newCityEn,
        }),
      });
      if (res.ok) {
        setNewCityAm('');
        setNewCityEn('');
        await loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete product by admin
  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setProductsList(productsList.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Title Banner */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-md">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900">
              {t.adminDashboard}
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              ዋና አስተዳዳሪ፡ <span className="font-semibold text-stone-800">{user?.name}</span> ({user?.email})
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
          Super Admin Privileges
        </span>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-stone-200 gap-2 sm:gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'overview'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>{t.statistics}</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'settings'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>ይፋዊ WhatsApp ቁጥር</span>
        </button>

        <button
          onClick={() => setActiveTab('secrets')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'secrets'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>ዳታቤዝ እና ምስጢራት (Neon & Secrets)</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'products'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>እቃዎች ({productsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'users'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t.manageUsers} ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('locations')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'locations'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>{t.manageLocations}</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'logs'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>ቁጥጥር መዝገብ (Logs)</span>
        </button>
      </div>

      {/* Overview Statistics Tab (Section 14 Requirement) */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm">
              <span className="text-[11px] font-medium text-stone-500 block">{t.totalProductsStat}</span>
              <span className="text-2xl font-black text-stone-900 mt-1 block">{stats.totalProducts}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm">
              <span className="text-[11px] font-medium text-emerald-700 block">{t.newProductsStat} (አዲስ)</span>
              <span className="text-2xl font-black text-emerald-800 mt-1 block">{stats.newProducts}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm">
              <span className="text-[11px] font-medium text-amber-700 block">{t.usedProductsStat} (ያገለገለ)</span>
              <span className="text-2xl font-black text-amber-800 mt-1 block">{stats.usedProducts}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm">
              <span className="text-[11px] font-medium text-stone-500 block">{t.customersStat}</span>
              <span className="text-2xl font-black text-stone-900 mt-1 block">{stats.totalCustomers}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm">
              <span className="text-[11px] font-medium text-stone-500 block">{t.sellersStat}</span>
              <span className="text-2xl font-black text-stone-900 mt-1 block">{stats.totalSellers}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm">
              <span className="text-[11px] font-medium text-stone-500 block">ንቁ እቃዎች (Active)</span>
              <span className="text-2xl font-black text-stone-900 mt-1 block">{stats.activeProducts}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm">
              <span className="text-[11px] font-medium text-stone-500 block">በመጠባበቅ ላይ (Pending)</span>
              <span className="text-2xl font-black text-stone-900 mt-1 block">{stats.pendingProducts}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm">
              <span className="text-[11px] font-medium text-stone-500 block">{t.inquiriesStat}</span>
              <span className="text-2xl font-black text-stone-900 mt-1 block">{stats.totalInquiries}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm">
              <span className="text-[11px] font-medium text-stone-500 block">{t.ordersStat}</span>
              <span className="text-2xl font-black text-stone-900 mt-1 block">{stats.totalOrders}</span>
            </div>
          </div>
        </div>
      )}

      {/* Official WhatsApp Configuration Tab (Section 12 & 14 Requirement) */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm max-w-xl space-y-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-stone-900 text-base">
              ይፋዊ የአስተዳዳሪ WhatsApp ቁጥር ማስተካከያ
            </h3>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            በመመሪያው መሰረት በመላ ገበያ ድረ-ገጽ ላይ የሚፈቀደው <strong>አንድ ይፋዊ የአስተዳዳሪ WhatsApp ብቻ</strong> (@brmiki21) ነው። በግል ሻጮች ገጽ ላይ ምንም አይነት WhatsApp አይቀመጥም። ቁጥር ወይም ዩዘርኔም ካልተመዘገበ በድረ-ገጹ ላይ አይታይም።
          </p>

          {settingFeedback && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{settingFeedback}</span>
            </div>
          )}

          <form onSubmit={handleSaveWhatsApp} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                ይፋዊ የአስተዳዳሪ WhatsApp (Username ወይም ስልክ ቁጥር)
              </label>
              <div className="relative">
                <PhoneCall className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={adminWhatsApp}
                  onChange={(e) => setAdminWhatsApp(e.target.value)}
                  placeholder="@brmiki21 ወይም +251 911 223 344"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>
              <span className="text-[11px] text-stone-400 mt-1 block">
                ምሳሌ፡ <code>@brmiki21</code> (ወደ <code>https://wa.me/brmiki21</code> ይወስዳል) ወይም <code>+251911223344</code> (ወደ <code>https://wa.me/251XXXXXXXXX</code>)
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isSavingSetting}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition active:scale-95 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingSetting ? t.loading : 'አድራሻውን መዝግብ (Save WhatsApp)'}</span>
              </button>

              {adminWhatsApp && (
                <a
                  href={buildAdminWhatsAppLink(adminWhatsApp, 'ሰላም መላ ገበያ አስተዳዳሪ')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ሊንኩን ፈትሽ (Test Link)</span>
                </a>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Neon PostgreSQL & Secrets Management Tab */}
      {activeTab === 'secrets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Diagnostics Card */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              <h3 className="font-extrabold text-stone-900 text-base">
                የዳታቤዝ እና ምስጢራት ሁኔታ (Secrets Status)
              </h3>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Mela Market የተሰራው በ <strong>Neon PostgreSQL</strong> ብቻ እንዲሰራ ነው። የሚከተሉት 3 ምስጢራት በ <strong>Google AI Studio Secrets</strong> ውስጥ መዘጋጀት አለባቸው።
            </p>

            <div className="space-y-3 pt-2">
              {/* DATABASE_URL */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-stone-900 font-mono">DATABASE_URL</div>
                  <div className="text-[11px] text-stone-500">Neon PostgreSQL Connection String</div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    dbHealth?.secrets?.DATABASE_URL
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}
                >
                  {dbHealth?.secrets?.DATABASE_URL ? 'CONFIGURED ✓' : 'MISSING ✗'}
                </span>
              </div>

              {/* ADMIN_SERVER_SECRET */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-stone-900 font-mono">ADMIN_SERVER_SECRET</div>
                  <div className="text-[11px] text-stone-500">Cryptographic Session Signing Key</div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    dbHealth?.secrets?.ADMIN_SERVER_SECRET
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {dbHealth?.secrets?.ADMIN_SERVER_SECRET ? 'CONFIGURED ✓' : 'DEFAULT FALLBACK'}
                </span>
              </div>

              {/* ADMIN_SETUP_MASTER_KEY */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-stone-900 font-mono">ADMIN_SETUP_MASTER_KEY</div>
                  <div className="text-[11px] text-stone-500">Initial Master Administrator Setup Key</div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    dbHealth?.secrets?.ADMIN_SETUP_MASTER_KEY
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}
                >
                  {dbHealth?.secrets?.ADMIN_SETUP_MASTER_KEY ? 'CONFIGURED ✓' : 'NOT SET ✗'}
                </span>
              </div>
            </div>

            {/* Live Connection Result */}
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 ${
                dbHealth?.connected
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border border-amber-200 text-amber-900'
              }`}
            >
              <CheckCircle2
                className={`w-4 h-4 shrink-0 mt-0.5 ${
                  dbHealth?.connected ? 'text-emerald-600' : 'text-amber-600'
                }`}
              />
              <div>
                <div className="font-bold">
                  {dbHealth?.connected
                    ? 'የዳታቤዝ ግንኙነት ተሳክቷል (Connected)'
                    : 'የዳታቤዝ ግንኙነት በመጠባበቅ ላይ (Waiting for DATABASE_URL)'}
                </div>
                <div className="text-[11px] mt-0.5">{dbHealth?.message}</div>
                {dbHealth?.database && (
                  <div className="text-[10px] text-stone-500 mt-1">Database: {dbHealth.database}</div>
                )}
              </div>
            </div>
          </div>

          {/* Master Key Bootstrap Form */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-600" />
              <h3 className="font-extrabold text-stone-900 text-base">
                በ Master Key አስተዳዳሪን መመዝገቢያ / ማደሻ
              </h3>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              የ <code>ADMIN_SETUP_MASTER_KEY</code> ምስጢርን በመጠቀም አዲስ ዋና አስተዳዳሪ መመዝገብ ወይም የነበረውን መለያ ደህንነቱ በተጠበቀ ሁኔታ ማደስ ይችላሉ።
            </p>

            {bootstrapFeedback && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{bootstrapFeedback}</span>
              </div>
            )}

            <form onSubmit={handleBootstrapWithMasterKey} className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  ADMIN_SETUP_MASTER_KEY *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Paste your ADMIN_SETUP_MASTER_KEY"
                  value={masterKeyInput}
                  onChange={(e) => setMasterKeyInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  አስተዳዳሪ ስም (Admin Full Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Mela Market Super Admin"
                  value={bootstrapName}
                  onChange={(e) => setBootstrapName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  አስተዳዳሪ ኢሜይል (Admin Email) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@melamarket.et"
                  value={bootstrapEmail}
                  onChange={(e) => setBootstrapEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  አዲስ የይለፍ ቃል (New Admin Password) *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  value={bootstrapPassword}
                  onChange={(e) => setBootstrapPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
                />
              </div>

              <button
                type="submit"
                disabled={isBootstrapping}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95 disabled:opacity-50"
              >
                {isBootstrapping ? t.loading : 'አስተዳዳሪን መዝግብ / አድስ (Bootstrap Admin)'}
              </button>
            </form>
          </div>
        </div>
      )}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-stone-100 font-bold text-sm text-stone-900">
            የተጠቃሚዎች ዝርዝር ({usersList.length})
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-semibold">
                <tr>
                  <th className="p-3">ስም (Name)</th>
                  <th className="p-3">ኢሜይል</th>
                  <th className="p-3">ስልክ</th>
                  <th className="p-3">ሚና (Role)</th>
                  <th className="p-3">ተግባር (Action)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50/50">
                    <td className="p-3 font-semibold text-stone-900">{u.name}</td>
                    <td className="p-3 text-stone-600">{u.email}</td>
                    <td className="p-3 text-stone-600">{u.phone || '—'}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'admin'
                            ? 'bg-amber-100 text-amber-800'
                            : u.role === 'seller'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeUserRole(u.id, e.target.value)}
                        className="px-2 py-1 rounded-lg border border-stone-200 text-xs bg-white"
                      >
                        <option value="customer">customer</option>
                        <option value="seller">seller</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Locations Management Tab */}
      {activeTab === 'locations' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Add Region */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-sm space-y-3">
            <h4 className="font-bold text-xs uppercase text-stone-900 tracking-wider">
              1. አዲስ ክልል ጨምር
            </h4>
            <form onSubmit={handleAddRegion} className="space-y-2.5">
              <input
                type="text"
                placeholder="የክልል ስም (አማርኛ) ለምሳሌ፡ አፋር"
                required
                value={newRegAm}
                onChange={(e) => setNewRegAm(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-300"
              />
              <input
                type="text"
                placeholder="English Name (e.g. Afar)"
                required
                value={newRegEn}
                onChange={(e) => setNewRegEn(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-300"
              />
              <input
                type="text"
                placeholder="Code (e.g. AF)"
                required
                value={newRegCode}
                onChange={(e) => setNewRegCode(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-300"
              />
              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
              >
                ክልል መዝግብ
              </button>
            </form>
          </div>

          {/* Add Woreda */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-sm space-y-3">
            <h4 className="font-bold text-xs uppercase text-stone-900 tracking-wider">
              2. አዲስ ወረዳ ጨምር
            </h4>
            <form onSubmit={handleAddWoreda} className="space-y-2.5">
              <select
                required
                value={targetRegionId}
                onChange={(e) => setTargetRegionId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-300 bg-stone-50"
              >
                <option value="">ክልል ምረጥ</option>
                {locationsHierarchy.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nameAm} ({r.nameEn})
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="የወረዳ ስም (አማርኛ) ለምሳሌ፡ ቂርቆስ"
                required
                value={newWoredaAm}
                onChange={(e) => setNewWoredaAm(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-300"
              />
              <input
                type="text"
                placeholder="Woreda Name in English"
                required
                value={newWoredaEn}
                onChange={(e) => setNewWoredaEn(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-300"
              />
              <button
                type="submit"
                disabled={!targetRegionId}
                className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
              >
                ወረዳ መዝግብ
              </button>
            </form>
          </div>

          {/* Add City */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-sm space-y-3">
            <h4 className="font-bold text-xs uppercase text-stone-900 tracking-wider">
              3. አዲስ ከተማ/መንደር ጨምር
            </h4>
            <form onSubmit={handleAddCity} className="space-y-2.5">
              <select
                required
                value={targetWoredaId}
                onChange={(e) => setTargetWoredaId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-300 bg-stone-50"
              >
                <option value="">ወረዳ ምረጥ</option>
                {locationsHierarchy.flatMap((r) => r.woredas).map((w: any) => (
                  <option key={w.id} value={w.id}>
                    {w.nameAm} ({w.nameEn})
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="የከተማ ስም (አማርኛ) ለምሳሌ፡ መገናኛ"
                required
                value={newCityAm}
                onChange={(e) => setNewCityAm(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-300"
              />
              <input
                type="text"
                placeholder="City Name in English"
                required
                value={newCityEn}
                onChange={(e) => setNewCityEn(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-300"
              />
              <button
                type="submit"
                disabled={!targetWoredaId}
                className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
              >
                ከተማ መዝግብ
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Products list for admin deletion/moderation with New vs Used separation and photo preview */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {/* Sub-filters for Admin */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAdminProdFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  adminProdFilter === 'all'
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {t.all} ({productsList.length})
              </button>
              <button
                onClick={() => setAdminProdFilter('new')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  adminProdFilter === 'new'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{t.newProducts} ({productsList.filter((p) => p.condition === 'new').length})</span>
              </button>
              <button
                onClick={() => setAdminProdFilter('used')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  adminProdFilter === 'used'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>{t.usedProducts} ({productsList.filter((p) => p.condition === 'used').length})</span>
              </button>
            </div>

            <div className="text-xs text-stone-500">
              ፎቶውን በመጫን በትልቅ ማየት ይችላሉ
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-semibold">
                  <tr>
                    <th className="p-3">ምስል</th>
                    <th className="p-3">የእቃ ስም</th>
                    <th className="p-3">ይዞታ</th>
                    <th className="p-3">ዋጋ (ETB)</th>
                    <th className="p-3">ቦታ</th>
                    <th className="p-3">ሻጭ</th>
                    <th className="p-3 text-right">ተግባር</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {productsList
                    .filter((p) => adminProdFilter === 'all' || p.condition === adminProdFilter)
                    .map((p) => (
                      <tr key={p.id} className="hover:bg-stone-50/50">
                        <td className="p-3">
                          <button
                            onClick={() => setEnlargedPhoto(p.primaryImage)}
                            className="relative group w-12 h-12 rounded-xl overflow-hidden border border-stone-200 block shadow-2xs"
                            title="በትልቅ እይ"
                          >
                            <img
                              src={p.primaryImage}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-110 transition"
                            />
                            <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition">
                              <Eye className="w-3.5 h-3.5" />
                            </div>
                          </button>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-stone-900 max-w-xs truncate" title={p.title}>
                            {p.title}
                          </div>
                          <div className="text-[10px] text-stone-400">ID: #{p.id}</div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              p.condition === 'new'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {p.condition === 'new' ? 'አዲስ (New)' : 'ያገለገለ (Used)'}
                          </span>
                        </td>
                        <td className="p-3 font-extrabold text-stone-900 whitespace-nowrap">
                          {p.price.toLocaleString()}{' '}
                          <span className="text-emerald-700 text-[11px] font-bold">{t.currency}</span>
                        </td>
                        <td className="p-3 text-stone-600">
                          {[p.cityNameAm, p.regionNameAm].filter(Boolean).join(', ') || 'አዲስ አበባ'}
                        </td>
                        <td className="p-3 text-stone-600">
                          {p.sellerName || 'ሻጭ'}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Photo Lightbox Modal for Admin */}
          {enlargedPhoto && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm"
              onClick={() => setEnlargedPhoto(null)}
            >
              <div
                className="relative bg-white rounded-3xl max-w-3xl w-full p-4 space-y-3 shadow-2xl border border-stone-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800">
                    ትልቅ የምርት ፎቶ እይታ (Camera Photo)
                  </span>
                  <button
                    onClick={() => setEnlargedPhoto(null)}
                    className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="aspect-16/10 rounded-2xl overflow-hidden bg-stone-950 flex items-center justify-center">
                  <img src={enlargedPhoto} alt="" className="max-h-full max-w-full object-contain" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-stone-100 font-bold text-sm text-stone-900">
            {t.auditLogs}
          </div>
          <div className="divide-y divide-stone-100">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3.5 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-stone-900">{log.action}</span>
                  <p className="text-stone-500 mt-0.5">{log.details}</p>
                </div>
                <div className="text-right text-[11px] text-stone-400">
                  <span>{new Date(log.createdAt).toLocaleString()}</span>
                  <div className="text-stone-600 font-medium">{log.adminEmail || 'admin'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  ShieldCheck,
  Package,
  Users,
  MessageSquare,
  AlertTriangle,
  RefreshCw,
  Trash2,
  CheckCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DatabaseStatus } from '../types';

interface AdminData {
  dbStatus: DatabaseStatus;
  users: Array<{
    id: string;
    email: string;
    full_name: string;
    phone: string;
    role: string;
    created_at: string;
  }>;
  products: Array<{
    id: string;
    userId: string;
    title: string;
    category: string;
    condition: string;
    price: number;
    currency: string;
    city: string;
    region: string;
    photoUrl: string;
    createdAt: string;
  }>;
  inquiries: Array<{
    id: string;
    product_id: string;
    buyer_name: string;
    buyer_email: string;
    buyer_phone: string;
    message: string;
    status: string;
    created_at: string;
  }>;
  reports: Array<{
    id: string;
    product_id: string;
    reporter_email: string;
    reason: string;
    status: string;
    created_at: string;
  }>;
}

export const AdminDashboard: React.FC = () => {
  const { user, token, isAdminModalOpen, closeAdminModal, t } = useAuth();

  const [activeTab, setActiveTab] = useState<'db' | 'products' | 'users' | 'inquiries' | 'reports'>('db');
  const [data, setData] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPingingDb, setIsPingingDb] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [neonInput, setNeonInput] = useState('');
  const [isConnectingNeon, setIsConnectingNeon] = useState(false);
  const [neonConnectResult, setNeonConnectResult] = useState<{ success: boolean; message: string; latencyMs?: number; version?: string } | null>(null);

  // Strictly protect: Never render if not admin
  if (!isAdminModalOpen || user?.role !== 'admin') {
    return null;
  }

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/overview', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleTestDbPing = async () => {
    setIsPingingDb(true);
    setPingResult(null);
    try {
      const res = await fetch('/api/admin/db-test', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const resJson = await res.json();
      setPingResult(resJson.message);
      if (resJson.status) {
        setData(prev => (prev ? { ...prev, dbStatus: resJson.status } : null));
      }
    } catch (err: any) {
      setPingResult('DB Ping Failed: ' + err.message);
    } finally {
      setIsPingingDb(false);
    }
  };

  const handleConnectNeon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!neonInput.trim()) return;

    setIsConnectingNeon(true);
    setNeonConnectResult(null);

    try {
      const res = await fetch('/api/admin/neon-connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ connectionString: neonInput.trim() }),
      });

      const resJson = await res.json();
      setNeonConnectResult(resJson);

      if (resJson.success) {
        // Refresh admin data
        fetchAdminData();
        setNeonInput('');
      }
    } catch (err: any) {
      setNeonConnectResult({
        success: false,
        message: 'Neon connection request failed: ' + err.message,
      });
    } finally {
      setIsConnectingNeon(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setData(prev => prev ? { ...prev, products: prev.products.filter(p => p.id !== id) } : null);
      }
    } catch (err) {
      console.error('Delete product error:', err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user and their listings?')) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setData(prev => prev ? { ...prev, users: prev.users.filter(u => u.id !== id) } : null);
      }
    } catch (err) {
      console.error('Delete user error:', err);
    }
  };

  const dbStatus = data?.dbStatus;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-6 flex flex-col max-h-[90vh]">
        {/* Admin Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600/30 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <span>{t.adminTitle}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Authorized Admin
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Logged in as {user.fullName || (user as any).full_name || user.email} ({user.email}) · Owner WhatsApp: @brmiki21
              </p>
            </div>
          </div>

          <button
            onClick={closeAdminModal}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 bg-slate-50 border-b border-slate-200 overflow-x-auto text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab('db')}
            className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'db'
                ? 'border-emerald-600 text-emerald-700 bg-white font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>{t.dbStatus}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'products'
                ? 'border-emerald-600 text-emerald-700 bg-white font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{t.manageProducts} ({data?.products?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-emerald-600 text-emerald-700 bg-white font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t.manageUsers} ({data?.users?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inquiries')}
            className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'inquiries'
                ? 'border-emerald-600 text-emerald-700 bg-white font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t.inquiriesTab} ({data?.inquiries?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'reports'
                ? 'border-emerald-600 text-emerald-700 bg-white font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{t.reportsTab} ({data?.reports?.length || 0})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 flex-1 overflow-y-auto bg-slate-50/50">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 mb-2" />
              <p className="text-sm">Loading admin console...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: Real Database Connection & Health Verification */}
              {activeTab === 'db' && (
                <div className="space-y-6">
                  {/* Database Status Card */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                            dbStatus?.connected ? 'bg-emerald-600' : 'bg-amber-600'
                          }`}
                        >
                          <Database className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-base">
                              {dbStatus?.engine || 'PostgreSQL Engine'}
                            </h3>
                            <span
                              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                                dbStatus?.connected
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {dbStatus?.connected ? t.dbConnected : 'Standby / Local Fallback'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {dbStatus?.message}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleTestDbPing}
                        disabled={isPingingDb}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isPingingDb ? 'animate-spin' : ''}`} />
                        <span>{t.verifyDb}</span>
                      </button>
                    </div>

                    {pingResult && (
                      <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{pingResult}</span>
                      </div>
                    )}

                    {/* Database Health Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[11px] font-semibold text-slate-400 block">{t.totalUsers}</span>
                        <span className="text-xl font-bold text-slate-900 tabular-nums">
                          {dbStatus?.tableCounts?.users ?? data?.users.length ?? 0}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[11px] font-semibold text-slate-400 block">{t.totalProducts}</span>
                        <span className="text-xl font-bold text-slate-900 tabular-nums">
                          {dbStatus?.tableCounts?.products ?? data?.products.length ?? 0}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[11px] font-semibold text-slate-400 block">{t.totalInquiries}</span>
                        <span className="text-xl font-bold text-slate-900 tabular-nums">
                          {dbStatus?.tableCounts?.inquiries ?? data?.inquiries.length ?? 0}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[11px] font-semibold text-slate-400 block">{t.totalReports}</span>
                        <span className="text-xl font-bold text-slate-900 tabular-nums">
                          {dbStatus?.tableCounts?.reports ?? data?.reports.length ?? 0}
                        </span>
                      </div>
                    </div>

                    {/* Neon PostgreSQL Live Connection & Verification Form */}
                    <div className="mt-6 p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-sm font-bold text-white">
                            Neon PostgreSQL Connection & Verification
                          </h4>
                        </div>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          dbStatus?.connected
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {dbStatus?.connected ? '✓ Neon Connected' : 'Awaiting Connection String'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                        Mela Market is configured to use Neon PostgreSQL as its production database provider. Paste your real Neon connection string below to run an instant connection test, create/verify all database schemas, and establish active persistence.
                      </p>

                      <form onSubmit={handleConnectNeon} className="space-y-3">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="password"
                            value={neonInput}
                            onChange={(e) => setNeonInput(e.target.value)}
                            placeholder="postgresql://user:password@ep-xyz.aws.neon.tech/neondb?sslmode=require"
                            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs font-mono focus:outline-emerald-500"
                          />
                          <button
                            type="submit"
                            disabled={isConnectingNeon || !neonInput.trim()}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isConnectingNeon ? 'animate-spin' : ''}`} />
                            <span>{isConnectingNeon ? 'Testing Neon...' : 'Verify & Connect Neon'}</span>
                          </button>
                        </div>
                      </form>

                      {neonConnectResult && (
                        <div className={`mt-3 p-3 rounded-xl text-xs flex items-center gap-2 border ${
                          neonConnectResult.success
                            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                            : 'bg-red-950/60 border-red-500/40 text-red-300'
                        }`}>
                          {neonConnectResult.success ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                          )}
                          <div>
                            <p className="font-semibold">{neonConnectResult.message}</p>
                            {neonConnectResult.version && (
                              <p className="text-[11px] opacity-80 mt-0.5 font-mono">
                                Server: {neonConnectResult.version} · Latency: {neonConnectResult.latencyMs}ms
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Manage Products */}
              {activeTab === 'products' && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Product</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Condition</th>
                          <th className="p-3">Price</th>
                          <th className="p-3">Location</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {data?.products?.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 font-semibold text-slate-900 flex items-center gap-2">
                              <img
                                src={p.photoUrl}
                                alt={p.title}
                                className="w-8 h-8 rounded-lg object-cover"
                              />
                              <span className="max-w-xs truncate">{p.title}</span>
                            </td>
                            <td className="p-3 text-slate-600">{p.category}</td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  p.condition === 'new'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-100 text-slate-800'
                                }`}
                              >
                                {p.condition.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-3 font-bold text-slate-900 tabular-nums">
                              {p.price.toLocaleString()} {p.currency}
                            </td>
                            <td className="p-3 text-slate-600">{p.city}</td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title={t.deleteBtn}
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
              )}

              {/* TAB 3: Manage Users */}
              {activeTab === 'users' && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3">User</th>
                          <th className="p-3">Email</th>
                          <th className="p-3">Phone</th>
                          <th className="p-3">Role</th>
                          <th className="p-3">Registered</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {data?.users?.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 font-semibold text-slate-900">
                              {u.full_name}
                            </td>
                            <td className="p-3 text-slate-600">{u.email}</td>
                            <td className="p-3 text-slate-600">{u.phone}</td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  u.role === 'admin'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {u.role.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-3 text-slate-400 text-[11px]">
                              {new Date(u.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-3 text-right">
                              {u.role !== 'admin' && (
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title={t.deleteBtn}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: Customer Inquiries */}
              {activeTab === 'inquiries' && (
                <div className="space-y-3">
                  {data?.inquiries?.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                      No customer inquiries submitted yet.
                    </div>
                  ) : (
                    data?.inquiries?.map((inq) => (
                      <div key={inq.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{inq.buyer_name} ({inq.buyer_phone})</span>
                          <span className="text-slate-400">{new Date(inq.created_at).toLocaleString()}</span>
                        </div>
                        {inq.buyer_email && (
                          <div className="text-slate-500">Email: {inq.buyer_email}</div>
                        )}
                        <p className="p-2.5 bg-slate-50 rounded-xl text-slate-700">
                          {inq.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 5: Reported Content */}
              {activeTab === 'reports' && (
                <div className="space-y-3">
                  {data?.reports?.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                      No reported content. The marketplace is clean.
                    </div>
                  ) : (
                    data?.reports?.map((rep) => (
                      <div key={rep.id} className="p-4 bg-white rounded-2xl border border-red-200 shadow-xs text-xs space-y-2">
                        <div className="flex items-center justify-between text-red-700 font-bold">
                          <span>Reported Product ID: {rep.product_id}</span>
                          <span className="text-slate-400 font-normal">{new Date(rep.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-700">Reason: {rep.reason}</p>
                        <div className="text-[11px] text-slate-400">Reporter: {rep.reporter_email}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

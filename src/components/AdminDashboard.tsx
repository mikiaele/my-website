import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Category, Product, Inquiry, User, AdminStats } from '../types';
import {
  Shield,
  Package,
  Layers,
  MessageSquare,
  Users,
  BarChart3,
  Trash2,
  CheckCircle,
  Plus,
  RefreshCw,
  Database,
  Search,
  ExternalLink,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

interface AdminDashboardProps {
  onBackToStore: () => void;
  categories: Category[];
  onRefreshCategories: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToStore,
  categories,
  onRefreshCategories,
}) => {
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'inquiries' | 'users'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; isNeon: boolean; tablesReady: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Category Form State
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatNameAm, setNewCatNameAm] = useState('');
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [newCatNameTi, setNewCatNameTi] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  // Search filter
  const [searchFilter, setSearchFilter] = useState('');

  const fetchAdminData = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch stats
      const [statsRes, prodsRes, inqsRes, usersRes, dbRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/products'),
        fetch('/api/inquiries', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/db-status'),
      ]);

      if (!statsRes.ok || !inqsRes.ok || !usersRes.ok) {
        throw new Error('Access denied. Administrator privileges required.');
      }

      const statsData = await statsRes.json();
      const prodsData = await prodsRes.json();
      const inqsData = await inqsRes.json();
      const usersData = await usersRes.json();
      const dbData = await dbRes.json();

      setStats(statsData);
      setProducts(prodsData);
      setInquiries(inqsData);
      setUsersList(usersData);
      setDbStatus(dbData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error fetching admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  // Handle Delete Product
  const handleDeleteProduct = async (id: number) => {
    if (!confirm(t('confirmDeleteProduct'))) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id));
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Update Inquiry Status
  const handleResolveInquiry = async (id: number) => {
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'resolved' }),
      });
      if (res.ok) {
        setInquiries(
          inquiries.map((inq) => (inq.id === id ? { ...inq, status: 'resolved' } : inq))
        );
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Add Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatSlug || !newCatNameAm || !newCatNameEn || !newCatNameTi) return;
    setIsSavingCategory(true);

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          slug: newCatSlug,
          name_am: newCatNameAm,
          name_en: newCatNameEn,
          name_ti: newCatNameTi,
        }),
      });

      if (res.ok) {
        setShowAddCategory(false);
        setNewCatSlug('');
        setNewCatNameAm('');
        setNewCatNameEn('');
        setNewCatNameTi('');
        onRefreshCategories();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingCategory(false);
    }
  };

  // Handle Delete Category
  const handleDeleteCategory = async (slug: string) => {
    if (!confirm(`Delete category "${slug}"?`)) return;
    try {
      const res = await fetch(`/api/categories/${slug}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        onRefreshCategories();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // If user is not authorized admin
  if (user?.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl border border-rose-200 text-center shadow-lg">
        <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
          <Shield className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
        <p className="text-xs text-slate-500 mb-6">
          The Admin Dashboard is strictly restricted to authorized system administrators.
        </p>
        <button
          onClick={onBackToStore}
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Marketplace</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner & Return */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToStore}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
            title="Return to Marketplace"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {t('adminTitle')}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                Verified Admin
              </span>
            </div>
            <p className="text-xs text-slate-500">Logged in as {user.email}</p>
          </div>
        </div>

        {/* Database Status Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            <Database className="w-3.5 h-3.5 text-emerald-700" />
            <span className="text-slate-600">Neon PostgreSQL:</span>
            <span
              className={`font-semibold ${
                dbStatus?.connected ? 'text-emerald-700' : 'text-amber-600'
              }`}
            >
              {dbStatus?.connected ? t('dbConnected') : t('dbPending')}
            </span>
          </div>

          <button
            onClick={fetchAdminData}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar border-b border-slate-200 pb-3 mb-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>{t('adminOverview')}</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'products'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>{t('adminProducts')} ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'inquiries'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{t('adminInquiries')} ({inquiries.length})</span>
          {stats && stats.pendingInquiries > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px]">
              {stats.pendingInquiries}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'categories'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{t('adminCategories')} ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t('adminUsers')} ({usersList.length})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-slate-400 text-xs block mb-1">{t('totalProducts')}</span>
              <span className="text-2xl font-bold text-slate-900 tabular-nums">
                {stats.totalProducts}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-slate-400 text-xs block mb-1">{t('newProducts')}</span>
              <span className="text-2xl font-bold text-emerald-700 tabular-nums">
                {stats.newProductsCount}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-slate-400 text-xs block mb-1">{t('usedProducts')}</span>
              <span className="text-2xl font-bold text-amber-700 tabular-nums">
                {stats.usedProductsCount}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-slate-400 text-xs block mb-1">{t('totalInquiries')}</span>
              <span className="text-2xl font-bold text-slate-900 tabular-nums">
                {stats.totalInquiries}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-slate-400 text-xs block mb-1">{t('pendingInquiries')}</span>
              <span className="text-2xl font-bold text-amber-600 tabular-nums">
                {stats.pendingInquiries}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-slate-400 text-xs block mb-1">{t('totalUsers')}</span>
              <span className="text-2xl font-bold text-slate-900 tabular-nums">
                {stats.totalUsers}
              </span>
            </div>
          </div>

          {/* Recent Inquiries summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm">{t('adminInquiries')}</h3>
              <button
                onClick={() => setActiveTab('inquiries')}
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                View all →
              </button>
            </div>

            {inquiries.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No customer inquiries yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {inquiries.slice(0, 4).map((inq, idx) => (
                  <div key={inq.id || `inq-card-${idx}`} className="py-3 flex items-start justify-between gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900">{inq.customer_name}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-600">{inq.customer_contact}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                            inq.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {inq.status}
                        </span>
                      </div>
                      <p className="text-slate-600 line-clamp-1 italic">"{inq.message}"</p>
                    </div>

                    {inq.status === 'pending' && (
                      <button
                        onClick={() => handleResolveInquiry(inq.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-[11px] whitespace-nowrap"
                      >
                        {t('resolve')}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter products..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Total: {products.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Photo</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Condition</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Seller</th>
                  <th className="py-3 px-4 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products
                  .filter((p) =>
                    searchFilter
                      ? p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                        p.city.toLowerCase().includes(searchFilter.toLowerCase())
                      : true
                  )
                  .map((p, idx) => (
                    <tr key={p.id || `prod-row-${idx}`} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4">
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded-lg bg-slate-100"
                        />
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs truncate">
                        {p.name}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            p.condition === 'new'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.condition}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-700 tabular-nums">
                        {p.price} ETB
                      </td>
                      <td className="py-3 px-4 text-slate-600">{p.city}</td>
                      <td className="py-3 px-4 text-slate-600">
                        <div>{p.seller_name}</div>
                        <div className="text-[10px] text-slate-400">{p.seller_phone}</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title={t('delete')}
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

      {/* TAB 3: CUSTOMER INQUIRIES */}
      {activeTab === 'inquiries' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">{t('adminInquiries')}</h3>
            <span className="text-xs text-slate-500 font-medium">
              Total Inquiries: {inquiries.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Product ID / Name</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Message</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inquiries.map((inq, idx) => (
                  <tr key={inq.id || `inq-row-${idx}`} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {inq.product_name || `#${inq.product_id}`}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{inq.customer_name}</td>
                    <td className="py-3 px-4 text-emerald-800 font-medium">
                      {inq.customer_contact}
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-sm">{inq.message}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(inq.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          inq.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {inq.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {inq.status !== 'resolved' && (
                        <button
                          onClick={() => handleResolveInquiry(inq.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition-colors"
                        >
                          {t('resolve')}
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

      {/* TAB 4: CATEGORIES MANAGEMENT */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">{t('adminCategories')}</h3>
            <button
              onClick={() => setShowAddCategory(!showAddCategory)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('addCategory')}</span>
            </button>
          </div>

          {showAddCategory && (
            <form
              onSubmit={handleAddCategory}
              className="p-5 bg-white rounded-2xl border border-emerald-200 shadow-sm space-y-3"
            >
              <h4 className="font-bold text-xs text-slate-900">{t('addCategory')}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <input
                  type="text"
                  required
                  value={newCatSlug}
                  onChange={(e) => setNewCatSlug(e.target.value)}
                  placeholder={t('categorySlug')}
                  className="px-3 py-2 border border-slate-200 rounded-xl"
                />
                <input
                  type="text"
                  required
                  value={newCatNameAm}
                  onChange={(e) => setNewCatNameAm(e.target.value)}
                  placeholder={t('categoryNameAm')}
                  className="px-3 py-2 border border-slate-200 rounded-xl"
                />
                <input
                  type="text"
                  required
                  value={newCatNameEn}
                  onChange={(e) => setNewCatNameEn(e.target.value)}
                  placeholder={t('categoryNameEn')}
                  className="px-3 py-2 border border-slate-200 rounded-xl"
                />
                <input
                  type="text"
                  required
                  value={newCatNameTi}
                  onChange={(e) => setNewCatNameTi(e.target.value)}
                  placeholder={t('categoryNameTi')}
                  className="px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCategory(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSavingCategory}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Amharic (አማርኛ)</th>
                  <th className="py-3 px-4">English</th>
                  <th className="py-3 px-4">Tigrinya (ትግርኛ)</th>
                  <th className="py-3 px-4 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((c, idx) => (
                  <tr key={c.slug || String(c.id || `cat-row-${idx}`)} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono text-slate-600">{c.slug}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{c.name_am}</td>
                    <td className="py-3 px-4 text-slate-700">{c.name_en}</td>
                    <td className="py-3 px-4 text-slate-700">{c.name_ti}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteCategory(c.slug)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title={t('delete')}
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

      {/* TAB 5: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">{t('adminUsers')}</h3>
            <span className="text-xs text-slate-500 font-medium">
              Registered Users: {usersList.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">{t('fullName')}</th>
                  <th className="py-3 px-4">{t('email')}</th>
                  <th className="py-3 px-4">{t('phone')}</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u, idx) => (
                  <tr key={u.id || `user-row-${idx}`} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-slate-400">#{u.id}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{u.full_name}</td>
                    <td className="py-3 px-4 text-slate-600">{u.email}</td>
                    <td className="py-3 px-4 text-slate-600">{u.phone}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

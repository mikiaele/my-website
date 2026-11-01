import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ProductStatus, OrderStatus, Category, UserRole } from '../../types';
import { DESIGNATED_ADMIN_EMAIL, isSupabaseConfigured } from '../../lib/supabase';
import { 
  ShieldCheck, 
  BarChart3, 
  Package, 
  ShoppingBag, 
  Users, 
  Layers, 
  Database, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Edit3, 
  Eye, 
  Search, 
  Filter, 
  DollarSign, 
  ArrowUpRight, 
  AlertTriangle,
  Copy,
  ExternalLink,
  Plus,
  Save,
  X
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    isAdmin, 
    currentUser, 
    setIsAdminAuthModalOpen, 
    stats, 
    products, 
    updateProductStatus, 
    updateProduct, 
    deleteProduct,
    orders, 
    updateOrderStatus, 
    users, 
    toggleUserVerification,
    categories, 
    addCategory, 
    deleteCategory,
    language, 
    t 
  } = useApp();

  // Admin Sub-tabs
  const [activeTab, setActiveTab] = useState<'stats' | 'products' | 'orders' | 'users' | 'categories' | 'supabase'>('stats');

  // Product Filter & Search
  const [productStatusFilter, setProductStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [productSearch, setProductSearch] = useState('');

  // Editing Product Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New Category State
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [newCatNameAm, setNewCatNameAm] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Tag');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Copy SQL script feedback
  const [copiedSql, setCopiedSql] = useState(false);

  // Security Guard: If not admin, do not render admin views
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-300">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.admin_unauthorized_msg}</h2>
        <p className="text-sm text-gray-600 max-w-md mx-auto mb-6">
          {t.admin_auth_hint}
        </p>
        <button
          onClick={() => setIsAdminAuthModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{t.admin_login_btn}</span>
        </button>
      </div>
    );
  }

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesStatus = productStatusFilter === 'all' || p.status === productStatusFilter;
    const matchesSearch = 
      p.title_en.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.title_am.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.seller_name.toLowerCase().includes(productSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const sqlSetupScript = `-- ========================================================
-- MELA MARKET SUPABASE SETUP & SECURE ADMIN CONFIGURATION
-- Run this in your Supabase SQL Editor:
-- ========================================================

-- 1. Create product-images Storage Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Allow public read
CREATE POLICY "Public Read Product Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Storage Policy: Allow authenticated users to upload product images
CREATE POLICY "Auth Users Upload Product Images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- 2. Create Users Profile Table with Role
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('admin', 'seller', 'customer')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies: Users can view profiles, only admins can modify roles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile except role" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- 3. Automatic Admin Assignment for mikiaelebrhane@gmail.com
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Mela User'),
    CASE 
      WHEN lower(new.email) = 'mikiaelebrhane@gmail.com' THEN 'admin'
      ELSE 'customer'
    END
  )
  ON CONFLICT (id) DO UPDATE
  SET role = CASE 
    WHEN lower(new.email) = 'mikiaelebrhane@gmail.com' THEN 'admin'
    ELSE profiles.role
  END;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_am TEXT NOT NULL,
  title_en TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price > 0),
  stock INTEGER NOT NULL CHECK (stock >= 0),
  category_id TEXT NOT NULL,
  condition TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  seller_id TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  seller_phone TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products Policies: Public can read approved products
CREATE POLICY "Public read approved products"
ON public.products FOR SELECT
USING (status = 'approved' OR auth.jwt()->>'email' = 'mikiaelebrhane@gmail.com');

-- Sellers can insert their listings as pending
CREATE POLICY "Sellers create products"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (true);

-- Admins can update any product (status, price, details)
CREATE POLICY "Admins full manage products"
ON public.products FOR ALL
USING (auth.jwt()->>'email' = 'mikiaelebrhane@gmail.com');
`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSetupScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Admin Header */}
      <div className="bg-gradient-to-r from-gray-900 via-emerald-950 to-gray-900 text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-gray-950 text-xs font-black">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t.admin_badge}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t.admin_title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-300">
              {t.admin_sub}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10 self-start md:self-auto">
            <div className="text-xs text-amber-300 font-bold uppercase tracking-wider mb-0.5">
              Admin Account
            </div>
            <div className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <span>{currentUser?.email || DESIGNATED_ADMIN_EMAIL}</span>
            </div>
            <div className="text-[11px] text-emerald-300 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Full Authorization & RLS Enforcement</span>
            </div>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-white/10 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-amber-400 text-gray-950 shadow-md'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{t.admin_tab_stats}</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'bg-amber-400 text-gray-950 shadow-md'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{t.admin_tab_products}</span>
            {stats.pending_products > 0 && (
              <span className="px-1.5 py-0.5 bg-red-600 text-white rounded-full text-[10px] font-bold">
                {stats.pending_products}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-amber-400 text-gray-950 shadow-md'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t.admin_tab_orders}</span>
            <span className="px-1.5 py-0.5 bg-emerald-600 text-white rounded-full text-[10px] font-bold">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-amber-400 text-gray-950 shadow-md'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t.admin_tab_users}</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-amber-400 text-gray-950 shadow-md'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{t.admin_tab_categories}</span>
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'supabase'
                ? 'bg-amber-400 text-gray-950 shadow-md'
                : 'bg-emerald-900/60 text-emerald-300 hover:bg-emerald-800/60'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>{t.admin_tab_supabase}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & STATS */}
      {activeTab === 'stats' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Revenue */}
            <div className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.stat_revenue}</p>
                <h3 className="text-2xl font-black text-emerald-900 mt-1">
                  {stats.total_revenue.toLocaleString()} <span className="text-sm font-bold text-emerald-600">{t.currency}</span>
                </h3>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  +18.4% from last month
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            {/* Total Orders */}
            <div className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.stat_orders}</p>
                <h3 className="text-2xl font-black text-gray-900 mt-1">
                  {stats.total_orders}
                </h3>
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Telebirr & CBE Birr integrated
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-xs flex items-center justify-between bg-amber-50/20">
              <div>
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">{t.stat_pending}</p>
                <h3 className="text-2xl font-black text-amber-900 mt-1">
                  {stats.pending_products}
                </h3>
                <button
                  onClick={() => {
                    setActiveTab('products');
                    setProductStatusFilter('pending');
                  }}
                  className="text-[11px] text-amber-700 font-bold underline mt-1 cursor-pointer"
                >
                  Review Listings Now →
                </button>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>

            {/* Active Products */}
            <div className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.stat_active}</p>
                <h3 className="text-2xl font-black text-gray-900 mt-1">
                  {stats.active_products}
                </h3>
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Published in public marketplace
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
            </div>

            {/* Total Users */}
            <div className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.stat_users}</p>
                <h3 className="text-2xl font-black text-gray-900 mt-1">
                  {stats.total_users}
                </h3>
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Customers & active accounts
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>

            {/* Verified Sellers */}
            <div className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.stat_sellers}</p>
                <h3 className="text-2xl font-black text-gray-900 mt-1">
                  {stats.total_sellers}
                </h3>
                <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                  Ethiopian artisan merchants
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Recent Orders Overview */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">Recent Customer Orders</h3>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
              >
                View All Orders ({orders.length}) →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 uppercase font-bold">
                    <th className="pb-3">{t.th_order_id}</th>
                    <th className="pb-3">{t.th_customer}</th>
                    <th className="pb-3">{t.th_total}</th>
                    <th className="pb-3">{t.th_payment}</th>
                    <th className="pb-3">{t.th_order_status}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {orders.slice(0, 4).map(o => (
                    <tr key={o.id} className="hover:bg-gray-50/50">
                      <td className="py-3 font-mono font-bold text-emerald-800">{o.id}</td>
                      <td className="py-3">
                        <div className="font-bold text-gray-900">{o.customer_name}</div>
                        <div className="text-[10px] text-gray-500">{o.delivery_city}</div>
                      </td>
                      <td className="py-3 font-bold text-gray-900">
                        {o.total_etb.toLocaleString()} {t.currency}
                      </td>
                      <td className="py-3 capitalize">
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-semibold">
                          {o.payment_method.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          o.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                          o.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          o.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {o.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS MANAGEMENT (Approve, Edit, Delete) */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
          {/* Controls: Filter & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setProductStatusFilter(status)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                    productStatusFilter === status
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? t.admin_filter_all : 
                   status === 'pending' ? `${t.admin_filter_pending} (${stats.pending_products})` :
                   status === 'approved' ? t.admin_filter_approved : t.admin_filter_rejected}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products or sellers..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Products Table */}
          <div className="overflow-x-auto border border-gray-100 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-bold">
                <tr>
                  <th className="py-3 px-4">{t.th_product}</th>
                  <th className="py-3 px-3">{t.th_category}</th>
                  <th className="py-3 px-3">{t.th_price}</th>
                  <th className="py-3 px-3">{t.th_stock}</th>
                  <th className="py-3 px-3">{t.th_seller}</th>
                  <th className="py-3 px-3">{t.th_status}</th>
                  <th className="py-3 px-4 text-right">{t.th_actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      No products found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(product => {
                    const category = categories.find(c => c.id === product.category_id);
                    return (
                      <tr key={product.id} className="hover:bg-gray-50/60 transition-colors">
                        {/* Product Info with Real Uploaded Photo */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image_url}
                              alt={product.title_en}
                              className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800';
                              }}
                            />
                            <div className="max-w-[200px]">
                              <div className="font-bold text-gray-900 truncate" title={product.title_en}>
                                {product.title_en}
                              </div>
                              <div className="text-[11px] text-gray-500 truncate" title={product.title_am}>
                                {product.title_am}
                              </div>
                              <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-gray-100 text-gray-600 rounded text-[9px] font-bold">
                                {product.condition}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3 font-medium text-gray-700">
                          {language === 'am' ? category?.name_am : category?.name_en}
                        </td>

                        {/* Price */}
                        <td className="py-3 px-3 font-extrabold text-emerald-800">
                          {product.price.toLocaleString()} {t.currency}
                        </td>

                        {/* Stock */}
                        <td className="py-3 px-3 font-medium text-gray-700">
                          <span className={`font-bold ${product.stock <= 5 ? 'text-amber-600' : 'text-gray-900'}`}>
                            {product.stock}
                          </span>
                        </td>

                        {/* Seller */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-gray-800">{product.seller_name}</div>
                          <div className="text-[10px] text-gray-400">{product.seller_phone || 'N/A'}</div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            product.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                            product.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {product.status === 'approved' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            {product.status === 'pending' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                            {product.status === 'rejected' && <XCircle className="w-3 h-3 text-red-600" />}
                            {product.status.toUpperCase()}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Approve Button */}
                            {product.status !== 'approved' && (
                              <button
                                onClick={() => updateProductStatus(product.id, 'approved')}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                                title="Approve for public marketplace"
                              >
                                {t.btn_approve}
                              </button>
                            )}

                            {/* Reject Button */}
                            {product.status === 'pending' && (
                              <button
                                onClick={() => updateProductStatus(product.id, 'rejected')}
                                className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                                title="Reject listing"
                              >
                                {t.btn_reject}
                              </button>
                            )}

                            {/* Edit Button */}
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit product details"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => {
                                if (window.confirm(t.confirm_delete_product)) {
                                  deleteProduct(product.id);
                                }
                              }}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOMER ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{t.admin_tab_orders}</h2>
              <p className="text-xs text-gray-500">Track shipments and update customer order fulfillment statuses</p>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
              {orders.length} Total Orders
            </span>
          </div>

          <div className="overflow-x-auto border border-gray-100 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-bold">
                <tr>
                  <th className="py-3 px-4">{t.th_order_id}</th>
                  <th className="py-3 px-3">{t.th_customer}</th>
                  <th className="py-3 px-3">Delivery Address</th>
                  <th className="py-3 px-3">Items Purchased</th>
                  <th className="py-3 px-3">{t.th_total}</th>
                  <th className="py-3 px-3">{t.th_payment}</th>
                  <th className="py-3 px-4">{t.th_order_status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/60">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                      {order.id}
                      <div className="text-[10px] text-gray-400 font-normal">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-gray-900">{order.customer_name}</div>
                      <div className="text-[10px] text-gray-500">{order.customer_email}</div>
                      <div className="text-[10px] font-semibold text-emerald-700">{order.customer_phone}</div>
                    </td>

                    <td className="py-3 px-3 max-w-[160px]">
                      <div className="font-semibold text-gray-800">{order.delivery_city}</div>
                      <div className="text-[10px] text-gray-500 truncate" title={order.delivery_address}>
                        {order.delivery_address}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px] text-gray-700">
                            <span className="font-bold text-emerald-800">{item.quantity}x</span>
                            <span className="truncate max-w-[140px]">{item.title_en}</span>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-extrabold text-emerald-900">
                      {order.total_etb.toLocaleString()} {t.currency}
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 font-bold uppercase text-[10px]">
                        {order.payment_method.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className={`text-xs font-bold rounded-lg px-2.5 py-1 border transition-colors cursor-pointer ${
                          order.status === 'delivered' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                          order.status === 'processing' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                          order.status === 'shipped' ? 'bg-purple-50 text-purple-800 border-purple-300' :
                          'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: USERS & SELLERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{t.admin_tab_users}</h2>
              <p className="text-xs text-gray-500">Manage buyer accounts, verified merchant status, and administrator privileges</p>
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-100 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-bold">
                <tr>
                  <th className="py-3 px-4">{t.th_user_name}</th>
                  <th className="py-3 px-3">{t.th_user_email}</th>
                  <th className="py-3 px-3">{t.th_user_role}</th>
                  <th className="py-3 px-3">Location / City</th>
                  <th className="py-3 px-3">{t.th_user_verified}</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/60">
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{u.full_name}</div>
                      <div className="text-[10px] text-gray-400">{u.phone || 'No phone'}</div>
                    </td>

                    <td className="py-3 px-3 font-mono text-gray-700">
                      {u.email}
                      {u.email === DESIGNATED_ADMIN_EMAIL && (
                        <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-bold text-[10px]">
                          Primary Admin
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'seller' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-gray-600">
                      {u.city || 'Addis Ababa'}
                    </td>

                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.is_verified ? 'text-emerald-700 bg-emerald-50' : 'text-gray-500 bg-gray-100'
                      }`}>
                        <CheckCircle2 className="w-3 h-3" />
                        {u.is_verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {u.email !== DESIGNATED_ADMIN_EMAIL && (
                        <button
                          onClick={() => toggleUserVerification(u.id)}
                          className="px-2.5 py-1 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
                        >
                          Toggle Verified
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

      {/* TAB 5: CATEGORIES MANAGEMENT */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{t.admin_tab_categories}</h2>
              <p className="text-xs text-gray-500">Configure marketplace taxonomy in Amharic & English</p>
            </div>

            <button
              onClick={() => setIsAddingCategory(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Category</span>
            </button>
          </div>

          {/* Add Category Form */}
          {isAddingCategory && (
            <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-4 animate-in fade-in">
              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">New Marketplace Category</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">English Name *</label>
                  <input
                    type="text"
                    value={newCatNameEn}
                    onChange={(e) => setNewCatNameEn(e.target.value)}
                    placeholder="e.g. Leather & Accessories"
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Amharic Name *</label>
                  <input
                    type="text"
                    value={newCatNameAm}
                    onChange={(e) => setNewCatNameAm(e.target.value)}
                    placeholder="ለምሳሌ፡ የቆዳ ውጤቶች"
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (newCatNameEn && newCatNameAm) {
                      addCategory({
                        name_en: newCatNameEn,
                        name_am: newCatNameAm,
                        slug: newCatNameEn.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                        icon: newCatIcon,
                      });
                      setNewCatNameEn('');
                      setNewCatNameAm('');
                      setIsAddingCategory(false);
                    }
                  }}
                  className="px-4 py-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </div>
          )}

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => {
              const productCount = products.filter(p => p.category_id === cat.id).length;
              return (
                <div key={cat.id} className="p-4 border border-gray-200 rounded-xl flex items-center justify-between bg-white hover:border-emerald-300 transition-colors">
                  <div>
                    <div className="font-bold text-sm text-gray-900">{cat.name_en}</div>
                    <div className="text-xs text-gray-500">{cat.name_am}</div>
                    <span className="text-[10px] font-semibold text-emerald-700 mt-1 inline-block">
                      {productCount} items listed
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm(`Delete category "${cat.name_en}"?`)) {
                        deleteCategory(cat.id);
                      }
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 6: SUPABASE & RLS SETUP */}
      {activeTab === 'supabase' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-700" />
                <span>Supabase Storage & Security RLS Migration</span>
              </h2>
              <p className="text-xs text-gray-500">
                Automatic authorization for administrator {DESIGNATED_ADMIN_EMAIL} and product-images bucket setup
              </p>
            </div>

            <button
              onClick={copySql}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              {copiedSql ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>SQL Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy SQL Migration</span>
                </>
              )}
            </button>
          </div>

          {/* Quick instructions card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="font-bold text-xs text-emerald-950 mb-1">1. Supabase Storage Bucket</div>
              <p className="text-[11px] text-emerald-800">
                Creates the public bucket <code className="bg-white px-1 py-0.5 rounded font-mono font-bold">product-images</code> so photos uploaded from the Seller Dashboard are securely stored and publicly served.
              </p>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <div className="font-bold text-xs text-amber-950 mb-1">2. Admin Protection for {DESIGNATED_ADMIN_EMAIL}</div>
              <p className="text-[11px] text-amber-800">
                PostgreSQL trigger checks whenever a user signs up or signs in. If the email matches <span className="font-bold">{DESIGNATED_ADMIN_EMAIL}</span>, it automatically grants the <code className="bg-white px-1 py-0.5 rounded font-mono font-bold">admin</code> role.
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="font-bold text-xs text-blue-950 mb-1">3. Row Level Security (RLS)</div>
              <p className="text-[11px] text-blue-800">
                Sellers and regular users cannot edit or delete other products or elevate their own roles to admin. Only verified admins can approve listings.
              </p>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="relative">
            <pre className="p-4 bg-gray-900 text-emerald-300 font-mono text-xs rounded-2xl overflow-x-auto max-h-[420px] leading-relaxed border border-gray-800">
              {sqlSetupScript}
            </pre>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-700" />
                <span>Edit Product Details</span>
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">English Title</label>
                <input
                  type="text"
                  value={editingProduct.title_en}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title_en: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Amharic Title</label>
                <input
                  type="text"
                  value={editingProduct.title_am}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title_am: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Price (ETB)</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Approval Status</label>
                  <select
                    value={editingProduct.status}
                    onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value as ProductStatus })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Condition</label>
                  <select
                    value={editingProduct.condition}
                    onChange={(e) => setEditingProduct({ ...editingProduct, condition: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="Brand New">Brand New</option>
                    <option value="Used">Used</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  updateProduct(editingProduct);
                  setEditingProduct(null);
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Database,
  Copy,
  Check,
  RefreshCw,
  Package,
  ShoppingBag,
  Trash2,
  DollarSign,
  Tag,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Product, Order } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { getSupabaseConfig, saveSupabaseConfig, testSupabaseConnection } from '../lib/supabase';
import { api } from '../lib/api';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onRefreshData: () => void;
}

const SUPABASE_MIGRATION_SQL = `-- MELA MARKET — SUPABASE POSTGRESQL SCHEMA & CONDITION MIGRATION
-- Paste and execute this directly in your Supabase SQL Editor:

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  city TEXT DEFAULT 'Addis Ababa',
  role TEXT NOT NULL DEFAULT 'seller' CHECK (role IN ('buyer', 'seller', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can manage their own profile" ON public.profiles FOR ALL USING (auth.uid() = id);

-- 2. Shops Table (Automatic background record)
CREATE TABLE IF NOT EXISTS public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  shop_name TEXT NOT NULL,
  shop_slug TEXT NOT NULL UNIQUE,
  city TEXT DEFAULT 'Addis Ababa',
  phone_number TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Shops are viewable by everyone" ON public.shops FOR SELECT USING (true);
CREATE POLICY "Sellers manage own shop" ON public.shops FOR ALL USING (auth.uid() = user_id);

-- 3. Products Table with 'condition' ('new' | 'used')
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY DEFAULT ('prod-' || substr(md5(random()::text), 1, 8)),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_name TEXT,
  category_id TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_am TEXT NOT NULL,
  description_en TEXT,
  description_am TEXT,
  price NUMERIC NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 1 CHECK (stock >= 0),
  condition TEXT NOT NULL DEFAULT 'new' CHECK (condition IN ('new', 'used')),
  images TEXT[] NOT NULL DEFAULT '{}',
  rating NUMERIC DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- SAFE MIGRATION: Ensure 'condition' column exists
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'condition'
  ) THEN 
    ALTER TABLE public.products ADD COLUMN condition TEXT NOT NULL DEFAULT 'new' CHECK (condition IN ('new', 'used'));
  END IF;
END $$;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Sellers create own products" ON public.products FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers update own products" ON public.products FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Sellers delete own products" ON public.products FOR DELETE USING (auth.uid() = seller_id);

-- 4. Automated User Trigger (Provisions seller role and shop with safe defaults)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  clean_name TEXT;
  clean_slug TEXT;
BEGIN
  clean_name := COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  clean_slug := lower(regexp_replace(clean_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(md5(new.id::text), 1, 4);

  INSERT INTO public.profiles (id, email, full_name, phone_number, city, role)
  VALUES (new.id, new.email, clean_name, COALESCE(new.raw_user_meta_data->>'phone_number', ''), COALESCE(new.raw_user_meta_data->>'city', 'Addis Ababa'), 'seller')
  ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

  INSERT INTO public.shops (user_id, shop_name, shop_slug, city, phone_number, status)
  VALUES (new.id, clean_name || '''s Store', clean_slug, COALESCE(new.raw_user_meta_data->>'city', 'Addis Ababa'), COALESCE(new.raw_user_meta_data->>'phone_number', ''), 'active')
  ON CONFLICT (shop_slug) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
`;

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  products,
  onRefreshData,
}) => {
  const { t, language, formatPrice } = useLanguage();
  const { isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'sql' | 'products'>('sql');
  const [copied, setCopied] = useState(false);

  // Supabase connection state
  const config = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(config.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(config.anonKey);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen || !isAdmin) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_MIGRATION_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveCredentials = () => {
    saveSupabaseConfig(supabaseUrl, supabaseAnonKey);
    setTestResult({
      success: true,
      message: 'Supabase credentials saved in browser storage. You can now test the connection.',
    });
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection();
    setIsTesting(false);
    setTestResult(res);
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Delete this product permanently as Administrator?')) {
      await api.deleteProduct(id, 'admin');
      onRefreshData();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden text-left">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-950 text-emerald-300 flex items-center justify-center border border-emerald-700/50">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-extrabold tracking-tight">{t.admin_title}</h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-700/60 text-emerald-200">
                  Root Admin
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5">{t.admin_desc}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-emerald-950/60 hover:bg-emerald-950 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'sql'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>{t.supabase_migration_tab}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>All Catalog Items ({products.length})</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {/* TAB 1: SUPABASE & SQL CENTER */}
          {activeTab === 'sql' && (
            <div className="space-y-5">
              {/* Credentials Configuration Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-700" />
                    <h4 className="text-sm font-extrabold text-slate-900">
                      Supabase PostgreSQL Connection
                    </h4>
                  </div>
                  <span
                    className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      config.isConfigured
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {config.isConfigured ? 'Credentials Provided' : 'Local Persistence Mode'}
                  </span>
                </div>

                <p className="text-xs text-slate-500">
                  Connect your live Supabase project to persist products, seller accounts, and condition states directly in PostgreSQL with RLS.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Project URL (VITE_SUPABASE_URL)
                    </label>
                    <input
                      type="url"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      placeholder="https://xyzcompany.supabase.co"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Anon Public Key (VITE_SUPABASE_ANON_KEY)
                    </label>
                    <input
                      type="password"
                      value={supabaseAnonKey}
                      onChange={(e) => setSupabaseAnonKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleSaveCredentials}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    Save Credentials
                  </button>
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>Test Connection</span>
                  </button>
                </div>

                {testResult && (
                  <div
                    className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                      testResult.success
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {testResult.success ? (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : null}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>

              {/* SQL Migration Script Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                      PostgreSQL SQL Migration Code
                    </h4>
                    <p className="text-[11px] text-slate-500">{t.apply_migration_note}</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{t.sql_copied}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{t.copy_sql}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative rounded-2xl bg-slate-900 text-emerald-300 font-mono text-xs p-4 overflow-x-auto max-h-72 border border-slate-800">
                  <pre className="whitespace-pre">{SUPABASE_MIGRATION_SQL}</pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ALL PRODUCTS LIST */}
          {activeTab === 'products' && (
            <div className="divide-y divide-slate-100">
              {products.map((p) => {
                const isNew = p.condition === 'new';
                return (
                  <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images[0] || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e'}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                              isNew ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isNew ? 'አዲስ / Brand New' : 'ያገለገለ / Used'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Seller: {p.seller_name || p.seller_id}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 truncate max-w-sm">
                          {p.title_en}
                        </h4>
                        <span className="text-xs font-bold text-emerald-800">
                          {formatPrice(p.price)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(p.id)}
                      className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

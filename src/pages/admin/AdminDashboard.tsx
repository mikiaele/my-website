import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Database,
  Smartphone,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  Search,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  X,
  Upload,
  DollarSign,
  TrendingUp,
  Store,
  ShieldAlert,
} from 'lucide-react';
import { Product, Category, Order, Profile, OrderStatus, Shop, ShopStatus } from '../../types/database.types.ts';
import { PageView } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  getProducts,
  getCategories,
  getOrders,
  getProfiles,
  getShops,
  updateShopStatus,
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  updateCategory,
  deleteCategory,
  updateOrderStatus,
  resetDatabaseToDefaults,
} from '../../lib/api.ts';
import {
  getSavedSupabaseConfig,
  saveSupabaseConfig,
  testConnection,
  getSupabaseClient,
} from '../../lib/supabase.ts';
import { SUPABASE_SQL_SCHEMA } from '../../lib/sql-schema.ts';
import { productSchema, categorySchema } from '../../lib/validations.ts';

interface AdminDashboardProps {
  setCurrentPage: (page: PageView) => void;
  onRefreshData: () => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  setCurrentPage,
  onRefreshData,
}) => {
  const { user, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'categories' | 'orders' | 'customers' | 'shops' | 'supabase' | 'android'
  >('overview');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [selectedOrderForView, setSelectedOrderForView] = useState<Order | null>(null);

  // Product Form State
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodPrice, setProdPrice] = useState<number>(0);
  const [prodDiscountPrice, setProdDiscountPrice] = useState<number | ''>('');
  const [prodStock, setProdStock] = useState<number>(10);
  const [prodStatus, setProdStatus] = useState<'in_stock' | 'low_stock' | 'out_of_stock'>('in_stock');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodBrand, setProdBrand] = useState('');
  const [prodIsFeatured, setProdIsFeatured] = useState(false);
  const [prodErrors, setProdErrors] = useState<Record<string, string>>({});

  // Category Form State
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState('');

  // Supabase Settings State
  const savedCfg = getSavedSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(savedCfg.url);
  const [supabaseKey, setSupabaseKey] = useState(savedCfg.anonKey);
  const [supabaseStatusMsg, setSupabaseStatusMsg] = useState<{ ok: boolean; msg: string } | null>(null);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);

  // Filters
  const [productSearch, setProductSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  const loadData = async () => {
    setIsLoading(true);
    const [p, c, o, u, s] = await Promise.all([
      getProducts(),
      getCategories(),
      getOrders(),
      getProfiles(),
      getShops(),
    ]);
    setProducts(p);
    setCategories(c);
    setOrders(o);
    setCustomers(u);
    setShops(s);
    setIsLoading(false);
  };

  const handleUpdateShopStatus = async (shopId: string, status: ShopStatus) => {
    await updateShopStatus(shopId, status);
    await loadData();
    await onRefreshData();
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute Metrics
  const totalRevenue = orders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + o.total_amount : sum), 0);
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const lowStockCount = products.filter((p) => p.stock_quantity <= 5).length;

  // PRODUCT CRUD
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdName('');
    setProdCategory(categories[0]?.id || '');
    setProdPrice(99.0);
    setProdDiscountPrice('');
    setProdStock(20);
    setProdStatus('in_stock');
    setProdDesc('');
    setProdImage('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80');
    setProdBrand('Mela Artisan');
    setProdIsFeatured(false);
    setProdErrors({});
    setIsAddProductOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdCategory(prod.category_id);
    setProdPrice(prod.price);
    setProdDiscountPrice(prod.discount_price ?? '');
    setProdStock(prod.stock_quantity);
    setProdStatus(prod.availability_status);
    setProdDesc(prod.description);
    setProdImage(prod.image_url);
    setProdBrand(prod.brand || '');
    setProdIsFeatured(!!prod.is_featured);
    setProdErrors({});
    setIsAddProductOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProdErrors({});

    const formData = {
      name: prodName,
      categoryId: prodCategory || categories[0]?.id || 'cat-1',
      price: Number(prodPrice),
      discountPrice: prodDiscountPrice ? Number(prodDiscountPrice) : null,
      stockQuantity: Number(prodStock),
      availabilityStatus: prodStatus,
      description: prodDesc,
      imageUrl: prodImage,
      brand: prodBrand,
      isFeatured: prodIsFeatured,
      isOnSale: !!prodDiscountPrice && Number(prodDiscountPrice) < Number(prodPrice),
    };

    const validation = productSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) fieldErrors[issue.path[0].toString()] = issue.message;
      });
      setProdErrors(fieldErrors);
      return;
    }

    if (editingProduct) {
      await updateProduct(
        editingProduct.id,
        {
          name: prodName,
          category_id: prodCategory,
          price: Number(prodPrice),
          discount_price: prodDiscountPrice ? Number(prodDiscountPrice) : null,
          stock_quantity: Number(prodStock),
          availability_status: prodStatus,
          description: prodDesc,
          image_url: prodImage,
          brand: prodBrand,
          is_featured: prodIsFeatured,
          is_on_sale: !!prodDiscountPrice,
        },
        user ? { userId: user.id, role: user.role } : undefined
      );
    } else {
      await createProduct(
        {
          name: prodName,
          category_id: prodCategory,
          slug: prodName.toLowerCase().replace(/\s+/g, '-'),
          price: Number(prodPrice),
          discount_price: prodDiscountPrice ? Number(prodDiscountPrice) : null,
          stock_quantity: Number(prodStock),
          availability_status: prodStatus,
          description: prodDesc,
          image_url: prodImage,
          images: [prodImage],
          rating: 5.0,
          review_count: 0,
          brand: prodBrand,
          is_featured: prodIsFeatured,
          is_on_sale: !!prodDiscountPrice,
        },
        user ? { userId: user.id, role: user.role } : undefined
      );
    }

    setIsAddProductOpen(false);
    await loadData();
    await onRefreshData();
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to permanently delete this product?')) {
      await deleteProduct(id, user ? { userId: user.id, role: user.role } : undefined);
      await loadData();
      await onRefreshData();
    }
  };

  // CATEGORY CRUD
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName || !catSlug || !catImage) {
      alert('Please fill out all category fields.');
      return;
    }

    await createCategory({
      name: catName,
      slug: catSlug.toLowerCase().replace(/\s+/g, '-'),
      description: catDesc,
      image_url: catImage,
      icon: 'Layers',
    });

    setIsAddCategoryOpen(false);
    setCatName('');
    setCatSlug('');
    setCatDesc('');
    setCatImage('');
    await loadData();
    await onRefreshData();
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Delete this category? Products associated with it may be impacted.')) {
      await deleteCategory(id);
      await loadData();
      await onRefreshData();
    }
  };

  // ORDER STATUS UPDATE
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus);
    await loadData();
  };

  // SUPABASE CONFIG & TEST
  const handleSaveSupabase = async () => {
    setIsTestingSupabase(true);
    const res = await saveSupabaseConfig(supabaseUrl, supabaseKey);
    setIsTestingSupabase(false);
    setSupabaseStatusMsg({ ok: res.success, msg: res.message });
    await loadData();
    await onRefreshData();
  };

  const handleTestSupabase = async () => {
    setIsTestingSupabase(true);
    const res = await testConnection();
    setIsTestingSupabase(false);
    setSupabaseStatusMsg({ ok: res.ok, msg: res.message });
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2500);
  };

  const handleResetData = async () => {
    if (confirm('Reset catalog products, categories, and sample orders to factory defaults?')) {
      resetDatabaseToDefaults();
      await loadData();
      await onRefreshData();
      alert('Data reset to default seed records.');
    }
  };

  // Security check: if not admin, show barrier
  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Administrator Access Required</h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          ይህ የመቆጣጠሪያ ገጽ ለዋና አስተዳዳሪዎች ብቻ የተፈቀደ ነው። Only authorized system administrators with valid credentials can access this console.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={() => setCurrentPage('home')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Return to Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 uppercase tracking-wide">
              Mela Admin Suite
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-mono">
              Signed in as {user?.full_name || 'Administrator'}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Store Operations & Database Management
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            <span className="hidden sm:inline">Sync Data</span>
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              getSupabaseClient()
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-slate-800 text-slate-100 hover:bg-slate-900'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>{getSupabaseClient() ? 'Supabase Live' : 'Connect Supabase'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-3 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-3 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'products'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Products ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-3 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Categories ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-3 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Customer Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-3 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'customers'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Customers ({customers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('shops')}
          className={`px-4 py-3 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'shops'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Vendors & Shops ({shops.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('supabase')}
          className={`px-4 py-3 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'supabase'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Supabase & SQL</span>
        </button>

        <button
          onClick={() => setActiveTab('android')}
          className={`px-4 py-3 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'android'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Android Ready</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 1. OVERVIEW TAB */}
      {/* ============================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in">
          {/* KPI Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 font-mono">
                ${totalRevenue.toFixed(2)}
              </p>
              <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +18.4% from last month
              </span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
                <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 font-mono">
                {orders.length}
              </p>
              <span className="text-[11px] text-slate-500 font-medium">
                {orders.filter((o) => o.status === 'processing').length} orders awaiting shipment
              </span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Catalog Products</span>
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
                  <Package className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 font-mono">
                {products.length}
              </p>
              <span className="text-[11px] text-amber-600 font-medium">
                {lowStockCount} items low in stock
              </span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Avg Order Value</span>
                <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 font-mono">
                ${averageOrderValue.toFixed(2)}
              </p>
              <span className="text-[11px] text-slate-500 font-medium">
                Calculated across {orders.length} orders
              </span>
            </div>

          </div>

          {/* Recent Orders Overview */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Recent Customer Orders</h3>
                <p className="text-xs text-slate-500">Live order activity across the marketplace</p>
              </div>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
              >
                View All Orders &rarr;
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.slice(0, 5).map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{o.order_number}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">{o.shipping_address.full_name}</td>
                      <td className="py-3 px-4 text-slate-500">{o.items?.length || 1} items</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">${o.total_amount.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          o.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.status === 'shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : o.status === 'processing'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(o.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. PRODUCTS MANAGEMENT TAB */}
      {/* ============================================================== */}
      {activeTab === 'products' && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Search products by title, SKU, brand..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <button
              onClick={handleOpenAddProduct}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Availability</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products
                    .filter(
                      (p) =>
                        !productSearch ||
                        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                        p.brand?.toLowerCase().includes(productSearch.toLowerCase())
                    )
                    .map((prod) => (
                      <tr key={prod.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.image_url}
                              alt=""
                              className="w-12 h-12 object-cover rounded-lg bg-slate-100 border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0 max-w-xs">
                              <p className="font-bold text-slate-900 truncate">{prod.name}</p>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {prod.brand || 'Mela'} • {prod.slug}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-medium text-slate-600">
                          {prod.category?.name || 'General'}
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          ${prod.price.toFixed(2)}
                          {prod.discount_price && (
                            <span className="block text-[10px] text-rose-600 font-semibold">
                              Sale: ${prod.discount_price.toFixed(2)}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-800">
                          {prod.stock_quantity} units
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              prod.availability_status === 'in_stock'
                                ? 'bg-emerald-100 text-emerald-800'
                                : prod.availability_status === 'low_stock'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {prod.availability_status.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEditProduct(prod)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. CATEGORIES MANAGEMENT TAB */}
      {/* ============================================================== */}
      {activeTab === 'categories' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Product Categories ({categories.length})</h3>
            <button
              onClick={() => setIsAddCategoryOpen(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Department</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs p-5 space-y-4">
                <div className="aspect-16/9 rounded-xl overflow-hidden bg-slate-100">
                  <img src={cat.image_url} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{cat.name}</h4>
                  <span className="text-[11px] text-slate-400 font-mono">Slug: {cat.slug}</span>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{cat.description}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    {products.filter((p) => p.category_id === cat.id).length} products
                  </span>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="text-rose-600 hover:text-rose-800 font-bold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. ORDERS MANAGEMENT TAB */}
      {/* ============================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                    orderStatusFilter === st
                      ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                      : 'text-slate-600'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Recipient</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Status & Update</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders
                    .filter((o) => orderStatusFilter === 'all' || o.status === orderStatusFilter)
                    .map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{order.order_number}</td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-800">{order.shipping_address.full_name}</p>
                          <span className="text-[11px] text-slate-400">{order.shipping_address.city}, {order.shipping_address.country}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          ${order.total_amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-slate-600 block">{order.payment_method}</span>
                          <span className="text-emerald-700 uppercase font-bold text-[10px]">{order.payment_status}</span>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedOrderForView(order)}
                            className="text-emerald-700 hover:text-emerald-900 font-bold"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. CUSTOMERS MANAGEMENT TAB */}
      {/* ============================================================== */}
      {activeTab === 'customers' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Registered Customer Accounts ({customers.length})</h3>
              <p className="text-xs text-slate-500">PostgreSQL profiles table records synchronized with Supabase Auth</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Member Since</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center">
                            {c.avatar_url ? (
                              <img src={c.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              c.full_name.charAt(0)
                            )}
                          </div>
                          <span className="font-bold text-slate-900">{c.full_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono">{c.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          c.role === 'admin' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {c.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {c.city ? `${c.city}, ${c.state || ''} ${c.country || ''}` : 'Not specified'}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5.5 VENDORS & SHOPS MANAGEMENT TAB */}
      {/* ============================================================== */}
      {activeTab === 'shops' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Total Vendors</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{shops.length}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
              <span className="text-xs text-emerald-700 font-medium">Active & Approved</span>
              <p className="text-2xl font-black text-emerald-800 mt-1">
                {shops.filter((s) => s.status === 'active').length}
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-2xs">
              <span className="text-xs text-amber-700 font-medium">Pending Review</span>
              <p className="text-2xl font-black text-amber-800 mt-1">
                {shops.filter((s) => s.status === 'pending_approval').length}
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-red-200 bg-red-50/20 shadow-2xs">
              <span className="text-xs text-red-700 font-medium">Suspended</span>
              <p className="text-2xl font-black text-red-800 mt-1">
                {shops.filter((s) => s.status === 'suspended').length}
              </p>
            </div>
          </div>

          {/* Vendors Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Independent Vendor Storefronts ({shops.length})</h3>
                <p className="text-xs text-slate-500">
                  Control vendor storefront onboarding, approve merchant accounts, and enforce marketplace quality standards.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Storefront</th>
                    <th className="py-3 px-4">Location & Contact</th>
                    <th className="py-3 px-4">Catalog Size</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4">Approval Status</th>
                    <th className="py-3 px-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shops.map((shop) => {
                    const shopProdCount = products.filter((p) => p.seller_id === shop.id).length;
                    return (
                      <tr key={shop.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={shop.logo_url}
                              alt={shop.name}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs"
                            />
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{shop.name}</p>
                              <span className="text-[11px] font-mono text-slate-400">/shop/{shop.slug}</span>
                              <p className="text-[11px] text-slate-500 line-clamp-1 max-w-xs">{shop.description}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            <p className="font-medium text-slate-800">{shop.city || 'Addis Ababa'}</p>
                            <p className="text-slate-500 text-[11px]">{shop.phone || '—'}</p>
                            <p className="text-slate-400 font-mono text-[10px]">{shop.email || '—'}</p>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                            <Package className="w-3.5 h-3.5 text-slate-500" />
                            {shopProdCount} products
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-bold text-amber-600 font-mono">
                            ★ {shop.rating?.toFixed(1) || '5.0'}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                              shop.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : shop.status === 'pending_approval'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-red-100 text-red-800 border border-red-300'
                            }`}
                          >
                            {shop.status === 'active' && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                            {shop.status === 'pending_approval' && <Clock className="w-3 h-3 text-amber-700" />}
                            {shop.status === 'suspended' && <AlertCircle className="w-3 h-3 text-red-700" />}
                            {shop.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {shop.status !== 'active' && (
                              <button
                                onClick={() => handleUpdateShopStatus(shop.id, 'active')}
                                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
                                title="Approve and activate this vendor storefront"
                              >
                                Approve
                              </button>
                            )}

                            {shop.status === 'active' && (
                              <button
                                onClick={() => handleUpdateShopStatus(shop.id, 'suspended')}
                                className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                                title="Temporarily suspend vendor privileges"
                              >
                                Suspend
                              </button>
                            )}

                            {shop.status !== 'pending_approval' && (
                              <button
                                onClick={() => handleUpdateShopStatus(shop.id, 'pending_approval')}
                                className="px-2 py-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs cursor-pointer transition-colors"
                                title="Set back to pending review"
                              >
                                Review
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. SUPABASE & SQL CENTER TAB */}
      {/* ============================================================== */}
      {activeTab === 'supabase' && (
        <div className="space-y-8 animate-in fade-in">
          
          {/* Status banner */}
          <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-600/30 rounded-2xl border border-emerald-500/40 text-emerald-400">
                  <Database className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Supabase PostgreSQL Architecture</h3>
                  <p className="text-xs text-slate-400">
                    Engineered for high performance with RLS policies, indexing, and direct mobile readiness.
                  </p>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                getSupabaseClient()
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {getSupabaseClient() ? 'Live Supabase Connected' : 'Running in Local Engine'}
              </span>
            </div>
          </div>

          {/* Configuration Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Connect to Your Custom Supabase Project</h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your Supabase Project URL and Anon Public Key below. Once connected, all products, orders, cart items, and profiles will synchronize with your live cloud PostgreSQL instance.
              </p>
            </div>

            {supabaseStatusMsg && (
              <div className={`p-4 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                supabaseStatusMsg.ok
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                {supabaseStatusMsg.ok ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                <span>{supabaseStatusMsg.msg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  VITE_SUPABASE_URL
                </label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  VITE_SUPABASE_ANON_KEY
                </label>
                <input
                  type="password"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleSaveSupabase}
                disabled={isTestingSupabase}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md disabled:opacity-50"
              >
                {isTestingSupabase ? 'Connecting...' : 'Save & Connect Credentials'}
              </button>

              <button
                onClick={handleTestSupabase}
                disabled={isTestingSupabase || !supabaseUrl}
                className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                Test Connection
              </button>

              <button
                onClick={handleResetData}
                className="ml-auto text-xs font-semibold text-rose-600 hover:text-rose-800 cursor-pointer"
              >
                Reset Catalog to Factory Seed
              </button>
            </div>
          </div>

          {/* SQL Migration Script Box */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">PostgreSQL Schema & RLS Script (schema.sql)</h3>
                <p className="text-xs text-slate-500">
                  Run this inside your Supabase project's SQL Editor to bootstrap all tables, policies, and triggers.
                </p>
              </div>

              <button
                onClick={handleCopySchema}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedSchema ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSchema ? 'Copied to Clipboard!' : 'Copy SQL Schema'}</span>
              </button>
            </div>

            <div className="bg-slate-950 text-slate-200 p-4 rounded-2xl font-mono text-xs max-h-80 overflow-y-auto leading-relaxed border border-slate-800">
              <pre>{SUPABASE_SQL_SCHEMA}</pre>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* 7. ANDROID ARCHITECTURE READINESS TAB */}
      {/* ============================================================== */}
      {activeTab === 'android' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-2xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
                <Smartphone className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Android Application Architecture Specification</h3>
                <p className="text-xs text-slate-500">React Native + Expo SDK 52 integration guide</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              MELA MARKET is architected with complete cross-platform parity. Because this web app uses a clean Supabase client layer and modular TypeScript DTOs, a future Android application can directly reuse:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <h5 className="font-bold text-slate-900">1. Shared TypeScript Types</h5>
                <p className="text-slate-500 font-mono text-[11px]">src/types/database.types.ts</p>
                <p className="text-slate-600">Profiles, Categories, Products, Orders, OrderItems, CartItems, Reviews.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <h5 className="font-bold text-slate-900">2. Shared Zod Schemas</h5>
                <p className="text-slate-500 font-mono text-[11px]">src/lib/validations.ts</p>
                <p className="text-slate-600">Checkout address validation, login, registration, and product creation.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <h5 className="font-bold text-slate-900">3. Supabase REST & Auth API</h5>
                <p className="text-slate-500 font-mono text-[11px]">src/lib/api.ts</p>
                <p className="text-slate-600">Zero backend modifications needed when porting to mobile.</p>
              </div>
            </div>

            <div className="p-5 bg-slate-950 text-slate-300 rounded-2xl font-mono text-xs space-y-2 border border-slate-800">
              <p className="text-emerald-400 font-bold">// Quickstart for Android Expo App:</p>
              <p>npx create-expo-app@latest mela-market-mobile --template blank-typescript</p>
              <p>cd mela-market-mobile</p>
              <p>npx expo install @supabase/supabase-js @react-native-async-storage/async-storage zod</p>
              <p>// Copy src/types and src/lib into your Expo app and plug in VITE_SUPABASE_URL!</p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ADD / EDIT PRODUCT MODAL */}
      {/* ============================================================== */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setIsAddProductOpen(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" />
          
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 overflow-y-auto max-h-[90vh] space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingProduct ? 'Edit Marketplace Product' : 'Add New Marketplace Product'}
              </h3>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. Aether Pro Wireless Headphones"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
                {prodErrors.name && <p className="text-rose-600 mt-1">{prodErrors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department / Category</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={prodBrand}
                    onChange={(e) => setProdBrand(e.target.value)}
                    placeholder="e.g. Atelier Mela"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Base Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Discount Price (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodDiscountPrice}
                    onChange={(e) => setProdDiscountPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Leave blank if no sale"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Availability Status</label>
                  <select
                    value={prodStatus}
                    onChange={(e) => setProdStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodIsFeatured}
                      onChange={(e) => setProdIsFeatured(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span className="font-semibold text-slate-800">Featured in Homepage Showcase</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Primary Image URL</label>
                <input
                  type="url"
                  required
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
                {prodErrors.imageUrl && <p className="text-rose-600 mt-1">{prodErrors.imageUrl}</p>}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  rows={4}
                  required
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Comprehensive description of material, origin, and characteristics..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
                {prodErrors.description && <p className="text-rose-600 mt-1">{prodErrors.description}</p>}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-md"
                >
                  {editingProduct ? 'Save Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ADD CATEGORY MODAL */}
      {/* ============================================================== */}
      {isAddCategoryOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setIsAddCategoryOpen(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" />
          
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Add New Department</h3>
              <button onClick={() => setIsAddCategoryOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => {
                    setCatName(e.target.value);
                    setCatSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                  }}
                  placeholder="e.g. Watches & Timepieces"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Slug</label>
                <input
                  type="text"
                  required
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  placeholder="watches-timepieces"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={catImage}
                  onChange={(e) => setCatImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Brief description of items..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCategoryOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ORDER DETAILS MODAL (ADMIN) */}
      {/* ============================================================== */}
      {selectedOrderForView && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setSelectedOrderForView(null)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" />
          
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Order #{selectedOrderForView.order_number}</h3>
                <span className="text-xs text-slate-400">Placed on {new Date(selectedOrderForView.created_at).toLocaleString()}</span>
              </div>
              <button onClick={() => setSelectedOrderForView(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block">Customer & Address</span>
                <p className="font-bold text-slate-900 text-sm">{selectedOrderForView.shipping_address.full_name}</p>
                <p className="text-slate-600">{selectedOrderForView.shipping_address.email} • {selectedOrderForView.shipping_address.phone}</p>
                <p className="text-slate-600">
                  {selectedOrderForView.shipping_address.address_line1}, {selectedOrderForView.shipping_address.city}, {selectedOrderForView.shipping_address.state} {selectedOrderForView.shipping_address.postal_code}
                </p>
              </div>

              <div>
                <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block mb-2">Order Items</span>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {selectedOrderForView.items?.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img src={item.product_image} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                        <div>
                          <p className="font-semibold text-slate-800">{item.product_name}</p>
                          <span className="text-[10px] text-slate-400">Qty: {item.quantity} × ${item.unit_price.toFixed(2)}</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-slate-900">${item.total_price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 text-sm font-bold text-slate-900">
                <span>Total Amount:</span>
                <span className="font-mono text-emerald-800 text-base">${selectedOrderForView.total_amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedOrderForView(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

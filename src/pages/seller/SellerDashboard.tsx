import React, { useState, useEffect } from 'react';
import {
  Store,
  Package,
  ShoppingBag,
  DollarSign,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  ExternalLink,
  Search,
  Upload,
  AlertCircle,
  X,
  Star,
  Settings,
  TrendingUp,
  Image as ImageIcon,
} from 'lucide-react';
import { Product, Order, Shop, Category, FulfillmentStatus } from '../../types/database.types.ts';
import { PageView } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import {
  getProducts,
  getCategories,
  getSellerOrders,
  createProduct,
  updateProduct,
  deleteProduct,
  updateShop,
  updateOrderItemFulfillment,
} from '../../lib/api.ts';
import { uploadImageToSupabaseStorage } from '../../lib/supabase.ts';
import { productSchema, shopProfileSchema } from '../../lib/validations.ts';

interface SellerDashboardProps {
  setCurrentPage: (page: PageView) => void;
  onSelectShopPreview?: (shop: Shop) => void;
  onRefreshData?: () => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  setCurrentPage,
  onSelectShopPreview,
  onRefreshData,
}) => {
  const { user, isSeller, sellerShop, refreshSellerShop } = useAuth();
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'settings'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sellerOrders, setSellerOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Image Uploading State
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState('');

  // Add / Edit Product Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [discountPrice, setDiscountPrice] = useState<number | ''>('');
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [availabilityStatus, setAvailabilityStatus] = useState<'in_stock' | 'low_stock' | 'out_of_stock'>('in_stock');
  const [description, setDescription] = useState('');
  const [primaryImage, setPrimaryImage] = useState('');
  const [extraImages, setExtraImages] = useState<string[]>([]);
  const [newExtraImageInput, setNewExtraImageInput] = useState('');
  const [brand, setBrand] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Shop Settings Form
  const [shopName, setShopName] = useState(sellerShop?.name || '');
  const [shopDesc, setShopDesc] = useState(sellerShop?.description || '');
  const [shopPhone, setShopPhone] = useState(sellerShop?.phone || '');
  const [shopEmail, setShopEmail] = useState(sellerShop?.email || '');
  const [shopCity, setShopCity] = useState(sellerShop?.city || '');
  const [shopLogo, setShopLogo] = useState(sellerShop?.logo_url || '');
  const [shopBanner, setShopBanner] = useState(sellerShop?.banner_url || '');
  const [settingsSaved, setSettingsSaved] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'primary' | 'extra' | 'logo' | 'banner'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadProgressMsg(language === 'am' ? 'ምስል ወደ Supabase Storage በመጫን ላይ...' : 'Uploading image to Supabase Storage...');
    try {
      const bucket = target === 'logo' || target === 'banner' ? 'shops' : 'products';
      const res = await uploadImageToSupabaseStorage(file, bucket);
      if (res.url) {
        if (target === 'primary') setPrimaryImage(res.url);
        else if (target === 'extra') setExtraImages((prev) => [...prev, res.url!]);
        else if (target === 'logo') setShopLogo(res.url);
        else if (target === 'banner') setShopBanner(res.url);
      }
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setIsUploadingImage(false);
      setUploadProgressMsg('');
      e.target.value = '';
    }
  };

  const loadSellerData = async () => {
    if (!sellerShop) return;
    setIsLoading(true);
    const [allProds, allCats, orders] = await Promise.all([
      getProducts({ sellerId: sellerShop.id }),
      getCategories(),
      getSellerOrders(sellerShop.id),
    ]);
    setProducts(allProds);
    setCategories(allCats);
    setSellerOrders(orders);
    setIsLoading(false);
  };

  useEffect(() => {
    if (sellerShop) {
      loadSellerData();
      setShopName(sellerShop.name);
      setShopDesc(sellerShop.description);
      setShopPhone(sellerShop.phone);
      setShopEmail(sellerShop.email);
      setShopCity(sellerShop.city);
      setShopLogo(sellerShop.logo_url);
      setShopBanner(sellerShop.banner_url);
    }
  }, [sellerShop?.id]);

  if (!isSeller || !sellerShop) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          {language === 'am' ? 'የሻጭ መለያ ያስፈልጋል' : 'Seller Storefront Required'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          {language === 'am'
            ? 'ይህንን ገጽ ለመጠቀም እንደ ሻጭ መመዝገብ ወይም የተዘጋጀውን የሙከራ ሻጭ መለያ መጠቀም ይችላሉ።'
            : 'You are currently not signed in with a registered seller shop. Register your storefront to begin selling.'}
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => setCurrentPage('seller-register')}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            {language === 'am' ? 'ሻጭ ይሁኑ / ሱቅ ይክፈቱ' : 'Open a Shop'}
          </button>
        </div>
      </div>
    );
  }

  // Calculate seller revenue from their items
  const sellerTotalRevenue = sellerOrders.reduce((sum, order) => {
    const items = order.items?.filter((it) => it.seller_id === sellerShop.id) || [];
    const itemTotal = items.reduce((s, it) => s + it.total_price, 0);
    return sum + itemTotal;
  }, 0);

  // PRODUCT MODAL HANDLERS
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setName('');
    setCategoryId(categories[0]?.id || 'cat-1');
    setPrice(45.0);
    setDiscountPrice('');
    setStockQuantity(15);
    setAvailabilityStatus('in_stock');
    setDescription('');
    setPrimaryImage('https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80');
    setExtraImages([
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
    ]);
    setBrand(sellerShop.name.split('(')[0].trim());
    setErrors({});
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setCategoryId(prod.category_id);
    setPrice(prod.price);
    setDiscountPrice(prod.discount_price ?? '');
    setStockQuantity(prod.stock_quantity);
    setAvailabilityStatus(prod.availability_status);
    setDescription(prod.description);
    setPrimaryImage(prod.image_url);
    setExtraImages(prod.images || [prod.image_url]);
    setBrand(prod.brand || sellerShop.name);
    setErrors({});
    setIsProductModalOpen(true);
  };

  const handleAddExtraImage = () => {
    if (newExtraImageInput.trim()) {
      setExtraImages((prev) => [...prev, newExtraImageInput.trim()]);
      setNewExtraImageInput('');
    }
  };

  const handleRemoveExtraImage = (index: number) => {
    setExtraImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData = {
      name,
      categoryId: categoryId || categories[0]?.id || 'cat-1',
      sellerId: sellerShop.id,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      stockQuantity: Number(stockQuantity),
      availabilityStatus,
      description,
      imageUrl: primaryImage,
      images: extraImages.length > 0 ? extraImages : [primaryImage],
      brand: brand || sellerShop.name,
      isFeatured: true,
      isOnSale: !!discountPrice && Number(discountPrice) < Number(price),
    };

    const validation = productSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) fieldErrors[issue.path[0].toString()] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (editingProduct) {
      await updateProduct(editingProduct.id, {
        name,
        category_id: categoryId,
        price: Number(price),
        discount_price: discountPrice ? Number(discountPrice) : null,
        stock_quantity: Number(stockQuantity),
        availability_status: availabilityStatus,
        description,
        image_url: primaryImage,
        images: extraImages,
        brand: brand || sellerShop.name,
        is_featured: true,
        is_trending: true,
      });
    } else {
      await createProduct({
        seller_id: sellerShop.id,
        category_id: categoryId,
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        price: Number(price),
        discount_price: discountPrice ? Number(discountPrice) : null,
        stock_quantity: Number(stockQuantity),
        availability_status: availabilityStatus,
        approval_status: 'approved',
        description,
        image_url: primaryImage,
        images: extraImages,
        rating: 5.0,
        review_count: 0,
        brand: brand || sellerShop.name,
        is_featured: true,
        is_trending: true,
      });
    }

    setIsProductModalOpen(false);
    await loadSellerData();
    onRefreshData?.();
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm(language === 'am' ? 'እርግጠኛ ነዎት ይህን ምርት ማጥፋት ይፈልጋሉ?' : 'Delete this product permanently?')) {
      await deleteProduct(id);
      await loadSellerData();
      onRefreshData?.();
    }
  };

  const handleUpdateItemStatus = async (orderId: string, itemId: string, status: FulfillmentStatus) => {
    await updateOrderItemFulfillment(orderId, itemId, status);
    await loadSellerData();
  };

  const handleSaveShopSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateShop(sellerShop.id, {
      name: shopName,
      description: shopDesc,
      phone: shopPhone,
      email: shopEmail,
      city: shopCity,
      logo_url: shopLogo,
      banner_url: shopBanner,
    });
    await refreshSellerShop();
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner: Storefront Identity */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-xl">
        <div className="h-44 sm:h-52 w-full relative">
          <img
            src={sellerShop.banner_url}
            alt=""
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>

        <div className="px-6 sm:px-8 pb-6 -mt-16 relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white border-4 border-slate-900 shadow-xl shrink-0">
              <img src={sellerShop.logo_url} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-md border border-emerald-800">
                  {language === 'am' ? 'የተረጋገጠ ሻጭ' : 'Verified Vendor'}
                </span>
                <span className="text-xs text-slate-300">
                  {sellerShop.city}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {sellerShop.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {onSelectShopPreview && (
              <button
                onClick={() => onSelectShopPreview(sellerShop)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{language === 'am' ? 'የህዝብ ሱቅ ገጽን እይ' : 'View Public Storefront'}</span>
              </button>
            )}

            <button
              onClick={handleOpenAddProduct}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'am' ? 'አዲስ ምርት መዝግብ' : 'Add New Product'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-3 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>{language === 'am' ? 'አጠቃላይ እይታ' : 'Overview & Analytics'}</span>
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
          <span>{language === 'am' ? `የእኔ ምርቶች (${products.length})` : `My Products (${products.length})`}</span>
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
          <span>{language === 'am' ? `የሱቁ ትዕዛዞች (${sellerOrders.length})` : `Store Orders (${sellerOrders.length})`}</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-3 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>{language === 'am' ? 'የሱቅ ቅንብሮች' : 'Store Settings'}</span>
        </button>
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          {/* KPI Stat Cards (5 metrics: Sales, Total, Active, Pending, Orders) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {language === 'am' ? 'የሱቅ ጠቅላላ ገቢ' : 'Sales Overview'}
              </span>
              <p className="text-xl sm:text-2xl font-extrabold text-emerald-800 font-mono">
                ${sellerTotalRevenue.toFixed(2)}
              </p>
              <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {language === 'am' ? 'የተረጋገጠ ሽያጭ' : 'Dispatched balance'}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {language === 'am' ? 'ጠቅላላ ምርቶች' : 'Total Products'}
              </span>
              <p className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono">
                {products.length}
              </p>
              <span className="text-[10px] text-slate-500 font-medium">
                {language === 'am' ? 'በሱቁ ውስጥ ያሉ' : 'Catalog products'}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {language === 'am' ? 'ንቁ ምርቶች' : 'Active Products'}
              </span>
              <p className="text-xl sm:text-2xl font-extrabold text-emerald-700 font-mono">
                {products.filter((p) => p.availability_status === 'in_stock' && p.approval_status !== 'rejected').length}
              </p>
              <span className="text-[10px] text-emerald-700 font-medium">
                {language === 'am' ? 'ለሽያጭ ዝግጁ' : 'Live & In stock'}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {language === 'am' ? 'በግምገማ ላይ ያሉ' : 'Pending Products'}
              </span>
              <p className="text-xl sm:text-2xl font-extrabold text-amber-600 font-mono">
                {products.filter((p) => p.approval_status === 'pending').length}
              </p>
              <span className="text-[10px] text-amber-600 font-medium">
                {language === 'am' ? 'ማረጋገጫ በመጠባበቅ' : 'Awaiting review'}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {language === 'am' ? 'ጠቅላላ ትዕዛዞች' : 'Total Orders'}
              </span>
              <p className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono">
                {sellerOrders.length}
              </p>
              <span className="text-[10px] text-blue-700 font-medium">
                {sellerOrders.filter((o) => o.status === 'processing').length} {language === 'am' ? 'በዝግጅት ላይ' : 'to fulfill'}
              </span>
            </div>
          </div>

          {/* Seller Profile & Storefront Information Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <img
                src={sellerShop.logo_url}
                alt={sellerShop.name}
                className="w-16 h-16 rounded-2xl object-cover bg-slate-100 border border-slate-200 shrink-0"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-extrabold text-slate-900">{sellerShop.name}</h3>
                  {sellerShop.verified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Verified Merchant
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-mono">
                    ID: {sellerShop.id}
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-1">{sellerShop.description}</p>
                <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-0.5 flex-wrap">
                  <span>Merchant: <strong className="text-slate-700">{user?.full_name}</strong></span>
                  <span>Email: <strong className="text-slate-700">{sellerShop.email}</strong></span>
                  <span>Phone: <strong className="text-slate-700">{sellerShop.phone}</strong></span>
                  <span>City: <strong className="text-slate-700">{sellerShop.city}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
              <button
                onClick={() => onSelectShopPreview && onSelectShopPreview(sellerShop)}
                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-emerald-200"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{language === 'am' ? 'የህዝብ ሱቅ ገጽ እይ' : 'View Public Storefront'}</span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{language === 'am' ? 'መረጃ አሻሽል' : 'Edit Store'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder={language === 'am' ? 'ምርቶችን ይፈልጉ...' : 'Search my products...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <button
              onClick={handleOpenAddProduct}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'am' ? 'አዲስ ምርት መዝግብ' : 'Add Product'}</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">{language === 'am' ? 'ምርት' : 'Product'}</th>
                    <th className="py-3 px-4">{language === 'am' ? 'ምድብ' : 'Category'}</th>
                    <th className="py-3 px-4">{language === 'am' ? 'ዋጋ' : 'Price'}</th>
                    <th className="py-3 px-4">{language === 'am' ? 'ክምችት' : 'Stock'}</th>
                    <th className="py-3 px-4">{language === 'am' ? 'ሁኔታ' : 'Status'}</th>
                    <th className="py-3 px-4 text-right">{language === 'am' ? 'እርምጃዎች' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products
                    .filter(
                      (p) =>
                        !searchQuery ||
                        p.name.toLowerCase().includes(searchQuery.toLowerCase())
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
                              <span className="text-[10px] text-slate-400 font-mono">
                                {prod.images?.length || 1} images uploaded
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
                            <span className="block text-[10px] text-rose-600">
                              Sale: ${prod.discount_price.toFixed(2)}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-800">
                          {prod.stock_quantity} units
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1 items-start">
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
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider ${
                                prod.approval_status === 'approved'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : prod.approval_status === 'rejected'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {prod.approval_status === 'approved'
                                ? 'Active'
                                : prod.approval_status === 'rejected'
                                ? 'Rejected'
                                : 'Pending Approval'}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEditProduct(prod)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Delete"
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

      {/* 3. ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {language === 'am' ? 'የሱቅዎ ትዕዛዞች እና መላኪያ' : 'Customer Orders for Your Shop'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'am'
                  ? 'የደንበኞችን ትዕዛዞች ያዘጋጁ እና የመላኪያ ሁኔታቸውን ያዘምኑ።'
                  : 'Fulfill order items and update dispatch progress for your buyers.'}
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {sellerOrders.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  {language === 'am' ? 'እስካሁን ምንም ትዕዛዝ አልደረሰዎትም።' : 'No customer orders received yet.'}
                </div>
              ) : (
                sellerOrders.map((order) => {
                  const myItems = order.items?.filter((it) => it.seller_id === sellerShop.id) || [];
                  const orderTotalForSeller = myItems.reduce((s, it) => s + it.total_price, 0);

                  return (
                    <div key={order.id} className="p-6 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-4 text-xs pb-3 border-b border-slate-100">
                        <div>
                          <span className="text-slate-400 block font-mono text-[10px]">ORDER ID</span>
                          <strong className="text-slate-900 font-mono text-sm">{order.order_number}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">RECIPIENT</span>
                          <strong className="text-slate-800">{order.shipping_address.full_name}</strong>
                          <span className="text-slate-500 block">{order.shipping_address.city}, {order.shipping_address.country}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">DATE</span>
                          <span className="text-slate-600">{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">MY SHOP SHARE</span>
                          <span className="font-mono font-bold text-emerald-800 text-sm">
                            ${orderTotalForSeller.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Items from this seller */}
                      <div className="space-y-2">
                        {myItems.map((item) => (
                          <div
                            key={item.id}
                            className="p-3 bg-slate-50 rounded-xl flex items-center justify-between gap-4 text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={item.product_image}
                                alt=""
                                className="w-12 h-12 object-cover rounded-lg bg-white border border-slate-200"
                              />
                              <div>
                                <p className="font-bold text-slate-900">{item.product_name}</p>
                                <span className="text-slate-500 font-mono">
                                  Qty: {item.quantity} × ${item.unit_price.toFixed(2)}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-slate-900">${item.total_price.toFixed(2)}</span>
                              <select
                                value={item.fulfillment_status || 'pending'}
                                onChange={(e) =>
                                  handleUpdateItemStatus(order.id, item.id, e.target.value as FulfillmentStatus)
                                }
                                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700"
                              >
                                <option value="pending">{language === 'am' ? 'በመጠባበቅ ላይ' : 'Pending'}</option>
                                <option value="processing">{language === 'am' ? 'በዝግጅት ላይ' : 'Processing'}</option>
                                <option value="shipped">{language === 'am' ? 'ተልኳል / በመንገድ ላይ' : 'Dispatched / Shipped'}</option>
                                <option value="delivered">{language === 'am' ? 'ደርሷል' : 'Delivered'}</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {language === 'am' ? 'የሱቅ መገለጫ እና አርማ' : 'Storefront Profile & Branding'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'am' ? 'የሱቅዎን ስም፣ ምስል እና አድራሻ ያዘምኑ።' : 'Update your shop info, banner, and customer contact.'}
                </p>
              </div>

              {settingsSaved && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4" /> {language === 'am' ? 'የሱቅ መረጃ ተሻሽሏል!' : 'Settings Saved!'}
                </div>
              )}
            </div>

            <form onSubmit={handleSaveShopSettings} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'am' ? 'የሱቅ ስም' : 'Shop Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'am' ? 'የንግድ ስልክ' : 'Business Phone'}
                  </label>
                  <input
                    type="text"
                    required
                    value={shopPhone}
                    onChange={(e) => setShopPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'am' ? 'የንግድ ኢሜይል' : 'Contact Email'}
                  </label>
                  <input
                    type="email"
                    required
                    value={shopEmail}
                    onChange={(e) => setShopEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'am' ? 'ከተማ / መገኛ' : 'City / Region'}
                  </label>
                  <input
                    type="text"
                    required
                    value={shopCity}
                    onChange={(e) => setShopCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">
                    {language === 'am' ? 'የሱቅ አርማ ምስል' : 'Store Logo'}
                  </label>
                  <label className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer">
                    <Upload className="w-3 h-3" />
                    <span>{language === 'am' ? 'ፋይል ጫን (Storage)' : 'Upload File (Storage)'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'logo')}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="url"
                    required
                    value={shopLogo}
                    onChange={(e) => setShopLogo(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                  {shopLogo && (
                    <img src={shopLogo} alt="Logo" className="w-9 h-9 rounded-lg object-cover border border-slate-200 bg-slate-100 shrink-0" />
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">
                    {language === 'am' ? 'የሱቅ ባነር ምስል' : 'Storefront Banner'}
                  </label>
                  <label className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer">
                    <Upload className="w-3 h-3" />
                    <span>{language === 'am' ? 'ፋይል ጫን (Storage)' : 'Upload File (Storage)'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'banner')}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="url"
                    required
                    value={shopBanner}
                    onChange={(e) => setShopBanner(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                  {shopBanner && (
                    <img src={shopBanner} alt="Banner" className="w-16 h-9 rounded-lg object-cover border border-slate-200 bg-slate-100 shrink-0" />
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'am' ? 'የሱቅ አጭር መግለጫ' : 'Storefront Description'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={shopDesc}
                  onChange={(e) => setShopDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  {language === 'am' ? 'ቅንብሮችን አድን' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL (WITH MULTI-IMAGE SUPPORT) */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setIsProductModalOpen(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" />
          
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 overflow-y-auto max-h-[90vh] space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingProduct
                  ? language === 'am'
                    ? 'ምርት አሻሽል'
                    : 'Edit Store Product'
                  : language === 'am'
                  ? 'አዲስ ምርት መዝግብ'
                  : 'Add New Product to Store'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'am' ? 'የምርት ስም' : 'Product Title'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Handmade Ethiopian Leather Messenger Bag"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
                {errors.name && <p className="text-rose-600 mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'am' ? 'የምርት ምድብ' : 'Category'}
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
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
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'am' ? 'የምርት ምልክት (Brand)' : 'Brand / Label'}
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder={sellerShop.name}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'am' ? 'ዋጋ ($)' : 'Price ($)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'am' ? 'የቅናሽ ዋጋ (አማራጭ)' : 'Discount Price ($)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Optional"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'am' ? 'የክምችት ብዛት' : 'Stock Units'}
                  </label>
                  <input
                    type="number"
                    required
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              {/* Upload Progress Indicator */}
              {isUploadingImage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-pulse">
                  <Upload className="w-4 h-4 animate-bounce text-emerald-700" />
                  <span className="font-semibold">{uploadProgressMsg}</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    {language === 'am' ? 'ዋና የምርት ምስል' : 'Primary Product Image'}
                  </label>
                  <label className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer">
                    <Upload className="w-3 h-3" />
                    <span>{language === 'am' ? 'ፋይል ጫን (Storage)' : 'Upload File (Storage)'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'primary')}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="url"
                    required
                    value={primaryImage}
                    onChange={(e) => setPrimaryImage(e.target.value)}
                    placeholder="https://images.unsplash.com/... or upload file"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                  {primaryImage && (
                    <img
                      src={primaryImage}
                      alt="Primary"
                      className="w-10 h-10 rounded-lg object-cover border border-slate-200 bg-slate-100 shrink-0"
                    />
                  )}
                </div>
                {errors.imageUrl && <p className="text-rose-600 mt-1">{errors.imageUrl}</p>}
              </div>

              {/* Multi-image gallery upload section */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">
                    {language === 'am' ? 'ተጨማሪ የምስል ጋለሪ (Multiple Images)' : 'Product Image Gallery'}
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer">
                      <Upload className="w-3 h-3" />
                      <span>{language === 'am' ? 'ፋይል ስቀል' : 'Upload File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'extra')}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[10px] text-slate-400">
                      ({extraImages.length} images)
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={newExtraImageInput}
                    onChange={(e) => setNewExtraImageInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddExtraImage}
                    className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    + Add Image
                  </button>
                </div>

                {extraImages.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pt-1">
                    {extraImages.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveExtraImage(idx)}
                          className="absolute top-0.5 right-0.5 bg-rose-600 text-white p-0.5 rounded-full cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'am' ? 'ዝርዝር የምርት መግለጫ' : 'Detailed Description'}
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Material, origin, sizing, and details..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
                {errors.description && <p className="text-rose-600 mt-1">{errors.description}</p>}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  {language === 'am' ? 'ሰርዝ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  {editingProduct
                    ? language === 'am'
                      ? 'ምርቱን አሻሽል'
                      : 'Save Product'
                    : language === 'am'
                    ? 'ምርቱን መዝግብ'
                    : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

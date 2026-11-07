import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Package,
  MessageSquare,
  ShoppingCart,
  Trash2,
  Edit,
  Eye,
  AlertCircle,
  CheckCircle2,
  X,
  MapPin,
  Tag,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { CameraCapture } from '../components/CameraCapture.tsx';
import { ProductItem } from '../components/ProductCard.tsx';

interface SellerDashboardProps {
  onOpenProduct: (id: number) => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({ onOpenProduct }) => {
  const { t, getLocalized } = useLanguage();
  const { user, token } = useAuth();

  const [activeTab, setActiveTab] = useState<'products' | 'inquiries' | 'orders'>('products');
  const [conditionFilter, setConditionFilter] = useState<'all' | 'new' | 'used'>('all');
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [locationsHierarchy, setLocationsHierarchy] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add/Edit Product Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<'new' | 'used'>('new');
  const [categoryId, setCategoryId] = useState('');
  const [regionId, setRegionId] = useState('');
  const [woredaId, setWoredaId] = useState('');
  const [cityId, setCityId] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load seller data
  const loadSellerData = async () => {
    if (!token || !user) return;
    setIsLoading(true);
    try {
      const [prodsRes, inqRes, ordRes, catsRes, locsRes] = await Promise.all([
        fetch(`/api/products?sellerId=${user.id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/inquiries/seller', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/orders/my', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/categories'),
        fetch('/api/locations/hierarchy'),
      ]);

      if (prodsRes.ok) setProducts(await prodsRes.json());
      if (inqRes.ok) setInquiries(await inqRes.json());
      if (ordRes.ok) setOrders(await ordRes.json());
      if (catsRes.ok) setCategories(await catsRes.json());
      if (locsRes.ok) setLocationsHierarchy(await locsRes.json());
    } catch (err) {
      console.error('Failed to load seller dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSellerData();
  }, [token, user]);

  const openAddModal = () => {
    setEditingProduct(null);
    setTitle('');
    setPrice('');
    setCondition('new');
    setCategoryId(categories[0]?.id ? String(categories[0].id) : '');
    setRegionId(locationsHierarchy[0]?.id ? String(locationsHierarchy[0].id) : '');
    setWoredaId('');
    setCityId('');
    setDescription('');
    setImages([]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: ProductItem) => {
    setEditingProduct(p);
    setTitle(p.title);
    setPrice(String(p.price));
    setCondition(p.condition);
    setCategoryId(p.categoryId ? String(p.categoryId) : '');
    setRegionId(p.regionId ? String(p.regionId) : '');
    setWoredaId(p.woredaId ? String(p.woredaId) : '');
    setCityId(p.cityId ? String(p.cityId) : '');
    setDescription(p.description);
    setImages(p.images || [p.primaryImage]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm(t.confirmDelete)) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id));
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to delete');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (images.length === 0) {
      setFormError(t.cameraRequiredNotice);
      return;
    }

    if (!regionId || !woredaId || !cityId) {
      setFormError('እባክዎ የሽያጭ ቦታውን (ክልል፣ ወረዳና ከተማ) ይምረጡ።');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title,
        price: Number(price),
        condition,
        categoryId: Number(categoryId),
        regionId: Number(regionId),
        woredaId: Number(woredaId),
        cityId: Number(cityId),
        description,
        images,
      };

      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save product');
      }

      setIsModalOpen(false);
      await loadSellerData();
    } catch (err: any) {
      setFormError(err.message || 'Error saving product');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cascading location options
  const selectedRegion = locationsHierarchy.find((r) => String(r.id) === String(regionId));
  const availableWoredas = selectedRegion?.woredas || [];
  const selectedWoreda = availableWoredas.find((w: any) => String(w.id) === String(woredaId));
  const availableCities = selectedWoreda?.cities || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900">
              {t.sellerDashboard}
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            የተመዘገበ ሻጭ፡ <span className="font-semibold text-stone-800">{user?.name}</span> ({user?.email})
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.addProduct}</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-stone-200 gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'products'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>የእኔ እቃዎች ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'inquiries'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>የደንበኞች ጥያቄዎች ({inquiries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'orders'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>የትዕዛዝ ጥያቄዎች ({orders.length})</span>
        </button>
      </div>

      {/* Tab Content: Products */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Sub-navigation Condition Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConditionFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  conditionFilter === 'all'
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {t.all} ({products.length})
              </button>
              <button
                onClick={() => setConditionFilter('new')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  conditionFilter === 'new'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{t.newProducts} ({products.filter((p) => p.condition === 'new').length})</span>
              </button>
              <button
                onClick={() => setConditionFilter('used')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  conditionFilter === 'used'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>{t.usedProducts} ({products.filter((p) => p.condition === 'used').length})</span>
              </button>
            </div>

            <button
              onClick={openAddModal}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t.addProduct}</span>
            </button>
          </div>

          {products.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200/80 p-12 text-center space-y-4">
              <Package className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="font-bold text-stone-800 text-sm">እስካሁን ምንም እቃ አልለጠፉም</h3>
              <p className="text-xs text-stone-500">
                የካሜራ ፎቶዎችን በማንሳት የመጀመሪያውን እቃዎን አሁኑኑ ይሽጡ።
              </p>
              <button
                onClick={openAddModal}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs"
              >
                {t.addProduct}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* SECTION: አዲስ እቃዎች (New Products) */}
              {(conditionFilter === 'all' || conditionFilter === 'new') && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <h3 className="font-extrabold text-stone-900 text-sm sm:text-base">
                      አዲስ እቃዎች (New Products)
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      {products.filter((p) => p.condition === 'new').length}
                    </span>
                  </div>

                  {products.filter((p) => p.condition === 'new').length === 0 ? (
                    <div className="p-6 bg-white rounded-2xl border border-stone-200 text-center text-xs text-stone-500">
                      ምንም አዲስ እቃ አልተመዘገበም።
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {products
                        .filter((p) => p.condition === 'new')
                        .map((p) => (
                          <div
                            key={p.id}
                            className="bg-white rounded-2xl border border-emerald-200/80 p-4 shadow-sm space-y-3 flex flex-col justify-between hover:shadow-md transition"
                          >
                            <div className="space-y-3">
                              {/* Product Photo from Database */}
                              <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                                <img
                                  src={p.primaryImage}
                                  alt={p.title}
                                  className="w-full h-full object-cover"
                                />
                                <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white bg-emerald-600 shadow-sm">
                                  {t.newBadge}
                                </span>
                                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-stone-900/75 text-emerald-300 text-[10px] font-semibold">
                                  ካሜራ
                                </span>
                              </div>

                              <div>
                                <h4 className="font-bold text-stone-900 text-sm line-clamp-1" title={p.title}>
                                  {p.title}
                                </h4>
                                <div className="mt-1 flex items-baseline gap-1">
                                  <span className="text-lg font-black text-stone-900">
                                    {p.price.toLocaleString()}
                                  </span>
                                  <span className="text-xs font-bold text-emerald-700">
                                    {t.currency}
                                  </span>
                                </div>
                              </div>

                              <div className="text-[11px] text-stone-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-stone-400" />
                                <span className="truncate">
                                  {[p.cityNameAm, p.woredaNameAm, p.regionNameAm].filter(Boolean).join(', ') || 'አዲስ አበባ'}
                                </span>
                              </div>
                            </div>

                            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                              <button
                                onClick={() => onOpenProduct(p.id)}
                                className="text-xs text-stone-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>እይ (View)</span>
                              </button>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => openEditModal(p)}
                                  className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700"
                                  title={t.editProduct}
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600"
                                  title={t.deleteProduct}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION: ያገለገሉ እቃዎች (Used Products) */}
              {(conditionFilter === 'all' || conditionFilter === 'used') && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 px-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                    <h3 className="font-extrabold text-stone-900 text-sm sm:text-base">
                      ያገለገሉ እቃዎች (Used Products)
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                      {products.filter((p) => p.condition === 'used').length}
                    </span>
                  </div>

                  {products.filter((p) => p.condition === 'used').length === 0 ? (
                    <div className="p-6 bg-white rounded-2xl border border-stone-200 text-center text-xs text-stone-500">
                      ምንም ያገለገለ እቃ አልተመዘገበም።
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {products
                        .filter((p) => p.condition === 'used')
                        .map((p) => (
                          <div
                            key={p.id}
                            className="bg-white rounded-2xl border border-amber-200/80 p-4 shadow-sm space-y-3 flex flex-col justify-between hover:shadow-md transition"
                          >
                            <div className="space-y-3">
                              {/* Product Photo from Database */}
                              <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                                <img
                                  src={p.primaryImage}
                                  alt={p.title}
                                  className="w-full h-full object-cover"
                                />
                                <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white bg-amber-600 shadow-sm">
                                  {t.usedBadge}
                                </span>
                                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-stone-900/75 text-amber-300 text-[10px] font-semibold">
                                  ካሜራ
                                </span>
                              </div>

                              <div>
                                <h4 className="font-bold text-stone-900 text-sm line-clamp-1" title={p.title}>
                                  {p.title}
                                </h4>
                                <div className="mt-1 flex items-baseline gap-1">
                                  <span className="text-lg font-black text-stone-900">
                                    {p.price.toLocaleString()}
                                  </span>
                                  <span className="text-xs font-bold text-amber-700">
                                    {t.currency}
                                  </span>
                                </div>
                              </div>

                              <div className="text-[11px] text-stone-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-stone-400" />
                                <span className="truncate">
                                  {[p.cityNameAm, p.woredaNameAm, p.regionNameAm].filter(Boolean).join(', ') || 'አዲስ አበባ'}
                                </span>
                              </div>
                            </div>

                            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                              <button
                                onClick={() => onOpenProduct(p.id)}
                                className="text-xs text-stone-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>እይ (View)</span>
                              </button>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => openEditModal(p)}
                                  className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700"
                                  title={t.editProduct}
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600"
                                  title={t.deleteProduct}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Inquiries */}
      {activeTab === 'inquiries' && (
        <div className="bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-sm">
          {inquiries.length === 0 ? (
            <div className="p-12 text-center text-xs text-stone-500">
              ምንም የተቀበሉት የደንበኛ ጥያቄ የለም።
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {inquiries.map((inq) => (
                <div key={inq.id} className="p-4 sm:p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 text-sm">
                      {inq.customerName} ({inq.customerPhone})
                    </span>
                    <span className="text-[11px] text-stone-400">
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-xs text-emerald-800 font-semibold">
                    ስለ እቃው፡ {inq.productTitle}
                  </div>
                  <p className="text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-200">
                    "{inq.message}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Orders */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-sm">
          {orders.length === 0 ? (
            <div className="p-12 text-center text-xs text-stone-500">
              ምንም የተቀበሉት የትዕዛዝ ጥያቄ የለም።
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {orders.map((ord) => (
                <div key={ord.id} className="p-4 sm:p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 text-sm">
                      {ord.customerName} ({ord.customerPhone})
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {ord.status}
                    </span>
                  </div>
                  <div className="text-xs text-stone-700">
                    እቃ፡ <span className="font-bold">{ord.productTitle}</span> | ብዛት፡ {ord.quantity} | ጠቅላላ ዋጋ፡{' '}
                    <span className="font-bold text-emerald-700">{ord.totalPrice.toLocaleString()} {t.currency}</span>
                  </div>
                  <p className="text-xs text-stone-500">
                    የመላኪያ አድራሻ፡ {ord.deliveryAddress || 'በግል የሚረከብ'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Product Modal with CAMERA-ONLY Photography */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleSubmitProduct} className="p-6 space-y-5">
              <div>
                <h3 className="text-lg font-bold text-stone-900">
                  {editingProduct ? t.editProduct : t.addProduct}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  የእቃውን ትክክለኛ መረጃ እና የካሜራ ፎቶዎችን ያስገቡ።
                </p>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* CAMERA CAPTURE (Strict Section 9 Compliance - No File Selection) */}
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                  የእቃ ፎቶ (በካሜራ ብቻ የተነሳ) *
                </label>
                <CameraCapture
                  initialImages={images}
                  onImagesChange={(newUrls) => setImages(newUrls)}
                  maxPhotos={5}
                />
              </div>

              {/* Title & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t.productName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="ለምሳሌ፡ iPhone 15 Pro Max 256GB"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t.priceETB} *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="12000"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>
              </div>

              {/* Category & Condition (Condition must be strictly 'new' or 'used') */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t.categories} *
                  </label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50 font-medium"
                  >
                    <option value="">ምድብ ይምረጡ</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {getLocalized(c.nameAm, c.nameEn, c.nameTi)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t.condition} (ይዞታ) *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCondition('new')}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition ${
                        condition === 'new'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'border-stone-200 text-stone-700 bg-stone-50'
                      }`}
                    >
                      {t.newProducts} (አዲስ)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCondition('used')}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition ${
                        condition === 'used'
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'border-stone-200 text-stone-700 bg-stone-50'
                      }`}
                    >
                      {t.usedProducts} (ያገለገለ)
                    </button>
                  </div>
                </div>
              </div>

              {/* Location Cascade (Region, Woreda, City) */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5 uppercase">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>የሽያጭ ቦታ መረጃ (Sale Location) *</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      {t.region} (ክልል) *
                    </label>
                    <select
                      required
                      value={regionId}
                      onChange={(e) => {
                        setRegionId(e.target.value);
                        setWoredaId('');
                        setCityId('');
                      }}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-300 bg-white"
                    >
                      <option value="">ክልል ምረጥ</option>
                      {locationsHierarchy.map((r) => (
                        <option key={r.id} value={r.id}>
                          {getLocalized(r.nameAm, r.nameEn, r.nameTi)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      {t.woreda} (ወረዳ) *
                    </label>
                    <select
                      required
                      value={woredaId}
                      disabled={!regionId}
                      onChange={(e) => {
                        setWoredaId(e.target.value);
                        setCityId('');
                      }}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-300 bg-white disabled:opacity-50"
                    >
                      <option value="">ወረዳ ምረጥ</option>
                      {availableWoredas.map((w: any) => (
                        <option key={w.id} value={w.id}>
                          {getLocalized(w.nameAm, w.nameEn, w.nameTi)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      {t.city} (ከተማ) *
                    </label>
                    <select
                      required
                      value={cityId}
                      disabled={!woredaId}
                      onChange={(e) => setCityId(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-300 bg-white disabled:opacity-50"
                    >
                      <option value="">ከተማ ምረጥ</option>
                      {availableCities.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {getLocalized(c.nameAm, c.nameEn, c.nameTi)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.description} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="የእቃውን ሁኔታ፣ ዝርዝር መረጃ፣ አጠቃቀም እና ዋስትና..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? t.loading : t.saveChanges}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Package,
  TrendingUp,
  Boxes,
  Trash2,
  Edit3,
  X,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  ArrowLeft,
  Store,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  addProductToDb,
  deleteProductFromDb,
  fetchSellerProducts,
  updateProductInDb,
} from '../lib/supabase';
import { Category, Product, ProductCondition } from '../types';

interface SellerDashboardProps {
  categories: Category[];
  onBackToShopping: () => void;
  onRefreshCatalog: () => void;
}

// Preset photo options representing authentic Ethiopian products for instant selection
const PHOTO_PRESETS = [
  {
    name: 'Coffee Beans / የቡና ፍሬ',
    url: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Traditional Kemis / የሀበሻ ቀሚስ',
    url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Smartphone / ስልክ',
    url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Clay Jebena / ጀበና',
    url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Leather Goods / የቆዳ ቦርሳ',
    url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Laptop / ላፕቶፕ',
    url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Mesob / መሶብ',
    url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Habesha Gabi / ጋቢ',
    url: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=800&q=80',
  },
];

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  categories,
  onBackToShopping,
  onRefreshCatalog,
}) => {
  const { user, shop, isAdmin } = useAuth();
  const { t, language } = useLanguage();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [titleAm, setTitleAm] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'coffee-spices');
  const [stock, setStock] = useState<number | ''>(1);
  // CRITICAL: Exactly two choices 'new' (አዲስ / Brand New) or 'used' (ያገለገለ / Used)
  const [condition, setCondition] = useState<ProductCondition>('new');
  const [imageUrl, setImageUrl] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const loadSellerProducts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await fetchSellerProducts(user.id);
      setProducts(data);
    } catch (err) {
      console.error('Failed to load seller products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellerProducts();
  }, [user]);

  const openAddForm = () => {
    setEditingProduct(null);
    setTitle('');
    setTitleAm('');
    setDescription('');
    setPrice('');
    setCategoryId(categories[0]?.id || 'coffee-spices');
    setStock(1);
    setCondition('new'); // Default to new
    setImageUrl(PHOTO_PRESETS[0].url);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (p: Product) => {
    // Security check: cannot edit other's product unless admin
    if (!isAdmin && p.seller_id !== user?.id) {
      alert('Security violation: You can only edit your own products.');
      return;
    }
    setEditingProduct(p);
    setTitle(p.title);
    setTitleAm(p.title_am || '');
    setDescription(p.description);
    setPrice(p.price);
    setCategoryId(p.category_id);
    setStock(p.stock);
    setCondition(p.condition === 'used' ? 'used' : 'new');
    setImageUrl(p.images[0] || '');
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleDelete = async (productId: string, productSellerId: string) => {
    if (!user) return;
    if (!isAdmin && productSellerId !== user.id) {
      alert('Security violation: You cannot delete another seller’s product.');
      return;
    }

    if (!window.confirm(t('confirmDelete'))) return;

    try {
      await deleteProductFromDb(productId, user.id, isAdmin);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      onRefreshCatalog();
      showToast(t('successDeleted'));
    } catch (err: any) {
      alert(err?.message || 'Delete failed');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setFormError(null);

    if (!title.trim()) {
      setFormError(t('valProductTitle'));
      return;
    }
    if (price === '' || Number(price) <= 0) {
      setFormError(t('valProductPrice'));
      return;
    }
    if (stock === '' || Number(stock) < 0) {
      setFormError(t('valProductStock'));
      return;
    }

    // Verify condition is strictly 'new' or 'used'
    if (condition !== 'new' && condition !== 'used') {
      setFormError(t('valProductCondition'));
      return;
    }

    setSubmitting(true);
    try {
      const selectedCategory = categories.find((c) => c.id === categoryId);
      const imagesArray = imageUrl.trim() ? [imageUrl.trim()] : [PHOTO_PRESETS[0].url];

      if (editingProduct) {
        const updated = await updateProductInDb(
          editingProduct.id,
          {
            title: title.trim(),
            title_am: titleAm.trim() || undefined,
            description: description.trim(),
            price: Number(price),
            category_id: categoryId,
            category_name: language === 'am' ? selectedCategory?.name_am : selectedCategory?.name_en,
            stock: Number(stock),
            condition: condition, // Saved directly to database
            images: imagesArray,
          },
          user.id,
          isAdmin
        );

        setProducts((prev) =>
          prev.map((item) => (item.id === editingProduct.id ? updated : item))
        );
        showToast(t('successSaved'));
      } else {
        const created = await addProductToDb(
          {
            title: title.trim(),
            title_am: titleAm.trim() || undefined,
            description: description.trim(),
            price: Number(price),
            category_id: categoryId,
            category_name: language === 'am' ? selectedCategory?.name_am : selectedCategory?.name_en,
            stock: Number(stock),
            condition: condition, // Saved directly to database
            images: imagesArray,
            is_featured: false,
          },
          user
        );

        setProducts((prev) => [created, ...prev]);
        showToast(t('successSaved'));
      }

      onRefreshCatalog();
      setIsFormOpen(false);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Metrics
  const totalValue = products.reduce((acc, p) => acc + p.price * p.stock, 0);
  const totalStockUnits = products.reduce((acc, p) => acc + p.stock, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-emerald-600 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold">{notification}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-gray-200 gap-4">
        <div>
          <button
            onClick={onBackToShopping}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900 mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('backToMarketplace')}</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {t('dashboardTitle')}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('activeSellerBadge')}</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {user?.full_name} · {shop?.name || `${user?.full_name}'s Store`} · {user?.city || 'Addis Ababa'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openAddForm}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-700/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addProductBtn')}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">{t('statsTotalProducts')}</p>
            <p className="text-2xl font-black text-gray-900">{products.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">{t('statsTotalValue')}</p>
            <p className="text-2xl font-black text-gray-900">
              ETB {totalValue.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">{t('statsTotalStock')}</p>
            <p className="text-2xl font-black text-gray-900">{totalStockUnits}</p>
          </div>
        </div>
      </div>

      {/* Products Table / Grid */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">{t('myProductsTab')}</h2>
          <span className="text-xs text-gray-500">
            {products.length} {products.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400">
            <span className="inline-block w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-2 text-xs">{t('loadingListings')}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <Store className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm mb-1">
              {language === 'am' ? 'እስካሁን ምንም ምርት አልተዘረዘረም' : 'No products listed yet'}
            </h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              {t('noProductsYet')}
            </p>
            <button
              onClick={openAddForm}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addProductBtn')}</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">{t('thProduct')}</th>
                  <th className="py-3 px-4">{t('thCategory')}</th>
                  <th className="py-3 px-4">{t('thCondition')}</th>
                  <th className="py-3 px-4">{t('thPrice')}</th>
                  <th className="py-3 px-4">{t('thStock')}</th>
                  <th className="py-3 px-4 text-right">{t('thActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((item) => {
                  const isNew = item.condition === 'new';
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.images[0] || PHOTO_PRESETS[0].url}
                            alt={item.title}
                            className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0"
                          />
                          <div className="max-w-xs sm:max-w-md">
                            <p className="font-semibold text-gray-900 text-xs sm:text-sm line-clamp-1">
                              {language === 'am' && item.title_am ? item.title_am : item.title}
                            </p>
                            <p className="text-[11px] text-gray-400 line-clamp-1">{item.description}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-gray-600">
                        {item.category_name || item.category_id}
                      </td>

                      {/* Condition Column (CRITICAL REQUIREMENT) */}
                      <td className="py-3.5 px-4">
                        {isNew ? (
                          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                            {t('conditionNew')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                            {t('conditionUsed')}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-gray-900 text-xs sm:text-sm">
                        ETB {item.price.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-xs">
                        <span
                          className={`font-semibold ${
                            item.stock > 0 ? 'text-gray-900' : 'text-red-600'
                          }`}
                        >
                          {item.stock} {language === 'am' ? 'እቃዎች' : 'units'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditForm(item)}
                            className="p-1.5 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title={t('editBtn')}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.seller_id)}
                            className="p-1.5 text-gray-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title={t('deleteBtn')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* ADD / EDIT PRODUCT MODAL (CRITICAL REQUIREMENTS)                     */}
      {/* ===================================================================== */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full my-8 overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 p-6 text-white relative">
              <button
                onClick={() => setIsFormOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-emerald-200 hover:text-white rounded-full hover:bg-emerald-700/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-black text-white">
                {editingProduct ? t('formEditHeading') : t('formAddHeading')}
              </h2>
              <p className="text-xs text-emerald-100/90 mt-1">
                {language === 'am'
                  ? 'ምርትዎ በቀጥታ ከሻጭ መለያዎ ጋር ተያይዞ በገበያው ላይ ይታያል።'
                  : 'Your product will be published immediately under your seller account.'}
              </p>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Product Name (English) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t('formProductName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('formProductNamePlaceholder')}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Optional Amharic Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {language === 'am' ? 'የምርት ስም በአማርኛ (አማራጭ)' : 'Amharic Title (Optional)'}
                </label>
                <input
                  type="text"
                  value={titleAm}
                  onChange={(e) => setTitleAm(e.target.value)}
                  placeholder="ለምሳሌ፡ የይርጋጨፌ አንደኛ ደረጃ የቆላ ቡና"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t('formDescription')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('formDescriptionPlaceholder')}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Price & Category in two columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t('formPrice')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                      ETB
                    </span>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 1200"
                      className="w-full pl-12 pr-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t('formCategory')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {language === 'am' ? c.name_am : c.name_en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Available Stock */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t('formStock')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 15"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* ============================================================= */}
              {/* PRODUCT CONDITION: EXACTLY TWO CHOICES (CRITICAL REQUIREMENT) */}
              {/* 1. አዲስ / Brand New                                           */}
              {/* 2. ያገለገለ / Used                                             */}
              {/* ============================================================= */}
              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl">
                <label className="block text-xs font-bold text-emerald-950 mb-1.5">
                  {t('conditionLabel')} <span className="text-red-500">*</span>
                </label>
                <p className="text-[11px] text-emerald-800 mb-3">
                  {t('formConditionRequiredNotice')}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {/* Choice 1: አዲስ / Brand New */}
                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      condition === 'new'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-700/20'
                        : 'bg-white text-gray-800 border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="productCondition"
                      value="new"
                      checked={condition === 'new'}
                      onChange={() => setCondition('new')}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        condition === 'new' ? 'border-white' : 'border-gray-400'
                      }`}
                    >
                      {condition === 'new' && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold block">
                        አዲስ / Brand New
                      </span>
                      <span
                        className={`text-[10px] block ${
                          condition === 'new' ? 'text-emerald-100' : 'text-gray-500'
                        }`}
                      >
                        {language === 'am' ? 'ሙሉ በሙሉ አዲስ ፋብሪካ እቃ' : 'Brand new condition'}
                      </span>
                    </div>
                  </label>

                  {/* Choice 2: ያገለገለ / Used */}
                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      condition === 'used'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-700/20'
                        : 'bg-white text-gray-800 border-gray-200 hover:border-amber-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="productCondition"
                      value="used"
                      checked={condition === 'used'}
                      onChange={() => setCondition('used')}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        condition === 'used' ? 'border-white' : 'border-gray-400'
                      }`}
                    >
                      {condition === 'used' && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold block">
                        ያገለገለ / Used
                      </span>
                      <span
                        className={`text-[10px] block ${
                          condition === 'used' ? 'text-amber-100' : 'text-gray-500'
                        }`}
                      >
                        {language === 'am' ? 'ጥሩ ሁኔታ ላይ ያለ ያገለገለ' : 'Previously used item'}
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Product Image URL & Quick Presets */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t('formImageUrl')}
                </label>
                <div className="flex gap-2 mb-2">
                  <div className="relative flex-1">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder={t('formImageUrlPlaceholder')}
                      className="w-full pl-9 pr-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                    />
                  )}
                </div>

                {/* Quick Photo Presets */}
                <div>
                  <p className="text-[11px] text-gray-500 font-medium mb-1.5">
                    {t('formQuickPhotos')}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {PHOTO_PRESETS.map((preset) => (
                      <button
                        type="button"
                        key={preset.name}
                        onClick={() => setImageUrl(preset.url)}
                        className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          imageUrl === preset.url
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {t('formCancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-700/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {submitting ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{editingProduct ? t('formSubmitUpdate') : t('formSubmitAdd')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

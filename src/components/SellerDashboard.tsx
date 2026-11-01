import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  Package,
  Layers,
  Sparkles,
  Tag,
  DollarSign,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Edit3,
  Store,
  TrendingUp,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Product, ProductCondition, Category } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../lib/api';

interface SellerDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  allProducts: Product[];
  onProductCreatedOrUpdated: () => void;
}

const SAMPLE_PRESET_IMAGES = [
  { label: 'Coffee & Jebena', url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80' },
  { label: 'Smartphones & Tech', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80' },
  { label: 'Traditional Fashion', url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80' },
  { label: 'Audio & Gadgets', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' },
  { label: 'Leather Goods', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80' },
];

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  isOpen,
  onClose,
  categories,
  allProducts,
  onProductCreatedOrUpdated,
}) => {
  const { user, sellerProfile } = useAuth();
  const { t, language, formatPrice } = useLanguage();

  const [activeTab, setActiveTab] = useState<'add' | 'inventory'>('add');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Editing state
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form Fields
  const [titleEn, setTitleEn] = useState('');
  const [titleAm, setTitleAm] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionAm, setDescriptionAm] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id || 'cat-coffee');
  const [stock, setStock] = useState<number | ''>(5);
  // Condition: Exactly two choices ('new' | 'used')
  const [condition, setCondition] = useState<ProductCondition>('new');
  const [imageUrl, setImageUrl] = useState('');

  if (!isOpen || !user) return null;

  // Filter products belonging to this seller
  const sellerProducts = allProducts.filter(
    (p) => p.seller_id === user.id || (user.role === 'admin' && p.seller_id === user.id)
  );

  const resetForm = () => {
    setTitleEn('');
    setTitleAm('');
    setDescriptionEn('');
    setDescriptionAm('');
    setPrice('');
    setStock(5);
    setCondition('new');
    setImageUrl('');
    setEditingProductId(null);
  };

  const handleEditClick = (product: Product) => {
    setEditingProductId(product.id);
    setTitleEn(product.title_en);
    setTitleAm(product.title_am);
    setDescriptionEn(product.description_en);
    setDescriptionAm(product.description_am);
    setPrice(product.price);
    setStock(product.stock);
    setCondition(product.condition);
    setCategoryId(product.category_id);
    setImageUrl(product.images[0] || '');
    setActiveTab('add');
  };

  const handleDeleteClick = async (productId: string) => {
    if (!window.confirm(t.confirm_delete)) return;
    try {
      await api.deleteProduct(productId, user.id);
      onProductCreatedOrUpdated();
      setSuccessMsg(t.product_deleted_success);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setErrorMsg('Failed to delete product');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!titleEn.trim() && !titleAm.trim()) {
      setErrorMsg('Please enter a product title');
      return;
    }
    if (!price || Number(price) <= 0) {
      setErrorMsg('Please enter a valid price in ETB');
      return;
    }

    setIsSubmitting(true);

    const primaryTitle = titleEn.trim() || titleAm.trim();
    const primaryTitleAm = titleAm.trim() || titleEn.trim();
    const primaryDescEn = descriptionEn.trim() || descriptionAm.trim() || primaryTitle;
    const primaryDescAm = descriptionAm.trim() || descriptionEn.trim() || primaryTitleAm;
    const finalImage = imageUrl.trim() || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80';

    try {
      if (editingProductId) {
        await api.updateProduct(
          editingProductId,
          {
            title_en: primaryTitle,
            title_am: primaryTitleAm,
            description_en: primaryDescEn,
            description_am: primaryDescAm,
            price: Number(price),
            stock: Number(stock) || 1,
            condition, // 'new' | 'used'
            category_id: categoryId,
            images: [finalImage],
          },
          user.id
        );
        setSuccessMsg(t.product_saved_success);
      } else {
        await api.createProduct(
          {
            seller_id: user.id, // Authenticated seller account ID
            seller_name: user.full_name,
            category_id: categoryId,
            title_en: primaryTitle,
            title_am: primaryTitleAm,
            description_en: primaryDescEn,
            description_am: primaryDescAm,
            price: Number(price),
            stock: Number(stock) || 1,
            condition, // 'new' | 'used'
            images: [finalImage],
          },
          user.id,
          user.full_name
        );
        setSuccessMsg(t.product_saved_success);
      }

      onProductCreatedOrUpdated();
      resetForm();
      setTimeout(() => setSuccessMsg(''), 4000);
      setActiveTab('inventory');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save product';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden text-left">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 flex items-center justify-center">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                  {t.seller_hub}
                </h2>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">
                  {sellerProfile?.shop_name || `${user.full_name}'s Store`}
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5">{t.seller_hub_desc}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-emerald-900/50 hover:bg-emerald-900 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setActiveTab('add');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'add'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>{editingProductId ? t.edit_product : t.add_product}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>{t.my_products} ({sellerProducts.length})</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>ID: <strong className="text-slate-700">{user.id.slice(0, 10)}...</strong></span>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {successMsg && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: ADD / EDIT PRODUCT FORM */}
          {activeTab === 'add' && (
            <div>
              {/* Frictionless Selling Notice */}
              <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-900 text-xs flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-extrabold">{language === 'am' ? 'ቀጥታ መሸጥ' : 'Instant Listing'}</strong>:
                  <span className="ml-1">{t.instant_selling_notice}</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Product Title in Amharic & English */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t.product_name} ({language === 'am' ? 'በአማርኛ' : 'Amharic'}) *
                    </label>
                    <input
                      type="text"
                      required
                      value={titleAm}
                      onChange={(e) => setTitleAm(e.target.value)}
                      placeholder={language === 'am' ? 'የምርት ስም...' : 'e.g. የይርጋጨፌ ቡና / ሳምሰንግ ስልክ'}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t.product_name} (English)
                    </label>
                    <input
                      type="text"
                      value={titleEn}
                      onChange={(e) => setTitleEn(e.target.value)}
                      placeholder="e.g. Premium Yirgacheffe Coffee / Samsung Galaxy"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                {/* Price, Stock, Category */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t.price_etb} *
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        required
                        min="1"
                        step="any"
                        value={price}
                        onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                        placeholder="1500"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-bold"
                      />
                      <span className="absolute right-3 text-xs font-bold text-slate-400">ETB</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t.available_stock} *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={stock}
                      onChange={(e) => setStock(e.target.value ? Number(e.target.value) : '')}
                      placeholder="10"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t.category_select} *
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {language === 'am' ? cat.name_am : cat.name_en}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* CRITICAL REQUIREMENT 3: PRODUCT CONDITION (EXACTLY TWO CHOICES) */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <label className="block text-xs font-extrabold text-slate-800 mb-2">
                    {t.product_condition} (Product Condition) *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Option 1: አዲስ / Brand New */}
                    <label
                      onClick={() => setCondition('new')}
                      className={`relative flex items-center justify-between p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                        condition === 'new'
                          ? 'border-emerald-600 bg-emerald-50/80 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="product_condition"
                          checked={condition === 'new'}
                          onChange={() => setCondition('new')}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 font-extrabold text-sm text-emerald-950">
                            <Sparkles className="w-4 h-4 text-emerald-600" />
                            <span>{t.condition_new_full}</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {language === 'am' ? 'በካርቶን የታሸገ፣ ሙሉ በሙሉ አዲስ' : 'Unopened, brand new sealed in box'}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/70 text-emerald-800">
                        {language === 'am' ? 'አዲስ' : 'New'}
                      </span>
                    </label>

                    {/* Option 2: ያገለገለ / Used */}
                    <label
                      onClick={() => setCondition('used')}
                      className={`relative flex items-center justify-between p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                        condition === 'used'
                          ? 'border-amber-500 bg-amber-50/80 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="product_condition"
                          checked={condition === 'used'}
                          onChange={() => setCondition('used')}
                          className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 font-extrabold text-sm text-amber-950">
                            <Tag className="w-4 h-4 text-amber-600" />
                            <span>{t.condition_used_full}</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {language === 'am' ? 'በጥንቃቄ የተያዘ፣ የተፈተሸ ያገለገለ' : 'Pre-owned, tested, good condition'}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-800">
                        {language === 'am' ? 'ያገለገለ' : 'Used'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Product Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.product_description}
                  </label>
                  <textarea
                    rows={3}
                    value={descriptionAm}
                    onChange={(e) => setDescriptionAm(e.target.value)}
                    placeholder={language === 'am' ? 'ስለ እቃው ጥራት፣ ዋስትና እና ሁኔታ ዝርዝር መረጃ...' : 'Product details, warranty, condition notes...'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                {/* Product Images & Presets */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.product_images}
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder={t.image_url_placeholder}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">{t.product_images_help}</p>

                  {/* Preset quick image choices */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-[11px] font-bold text-slate-500">
                      {language === 'am' ? 'ናሙና ምስል ምረጥ:' : 'Sample photo:'}
                    </span>
                    {SAMPLE_PRESET_IMAGES.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setImageUrl(preset.url)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {imageUrl && (
                    <div className="mt-3 w-28 h-28 rounded-xl overflow-hidden border border-slate-200 shadow-xs">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                  {editingProductId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-md shadow-emerald-700/25 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : editingProductId ? 'Update Product' : t.save_product}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: MY PRODUCTS LISTINGS */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              {sellerProducts.length === 0 ? (
                <div className="text-center p-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-700">{t.no_seller_products}</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('add')}
                    className="mt-4 px-5 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow-xs hover:bg-emerald-800 transition-colors cursor-pointer"
                  >
                    {t.start_adding_products}
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {sellerProducts.map((p) => {
                    const isNew = p.condition === 'new';
                    return (
                      <div
                        key={p.id}
                        className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 p-2 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images[0] || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e'}
                            alt={p.title_en}
                            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                  isNew
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {isNew ? t.condition_new_full : t.condition_used_full}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                Stock: <strong>{p.stock}</strong>
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">
                              {language === 'am' ? p.title_am || p.title_en : p.title_en}
                            </h4>
                            <p className="text-xs font-extrabold text-emerald-700 mt-0.5">
                              {formatPrice(p.price)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleEditClick(p)}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            title={t.edit_product}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{t.edit_product}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(p.id)}
                            className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            title={t.delete_product}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{t.delete_product}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

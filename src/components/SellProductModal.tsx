import React, { useState } from 'react';
import { Category, ProductCondition } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { CameraCapture } from './CameraCapture';
import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface SellProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onProductCreated: () => void;
  onRequireAuth: () => void;
}

export const SellProductModal: React.FC<SellProductModalProps> = ({
  isOpen,
  onClose,
  categories,
  onProductCreated,
  onRequireAuth,
}) => {
  const { language, t } = useLanguage();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<ProductCondition>('new');
  const [imageUrl, setImageUrl] = useState('');
  const [region, setRegion] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [sellerPhone, setSellerPhone] = useState(user?.phone || '');
  const [sellerName, setSellerName] = useState(user?.full_name || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // If user is not logged in, redirect them to login/register immediately
  if (!user) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">{t('mustLoginToSell')}</h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Please log in to your account or register a new account to publish and sell products on Mela Market.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              onClick={() => {
                onClose();
                onRequireAuth();
              }}
              className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors shadow-sm"
            >
              {t('login')} / {t('register')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate photo
    if (!imageUrl) {
      setErrorMessage(t('photoRequired'));
      return;
    }

    if (!categorySlug) {
      setErrorMessage('Please select a category.');
      return;
    }

    setIsSubmitting(true);

    try {
      const authToken = localStorage.getItem('mela_session_token');
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken || ''}`,
        },
        body: JSON.stringify({
          name,
          category_slug: categorySlug,
          description,
          price: parseFloat(price),
          condition,
          image_url: imageUrl,
          region,
          district,
          city,
          seller_name: sellerName || user.full_name,
          seller_phone: sellerPhone || user.phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to publish product');
      }

      setSuccessMessage(t('productPublishedSuccess'));
      setTimeout(() => {
        onProductCreated();
        onClose();
      }, 1200);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error publishing product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryLabel = (cat: Category) => {
    if (language === 'ti') return cat.name_ti;
    if (language === 'en') return cat.name_en;
    return cat.name_am;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-6 border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {t('registerProductTitle')}
            </h2>
            <p className="text-xs text-slate-500">Mela Market Ethiopia</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto p-6">
          {successMessage ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{successMessage}</h3>
              <p className="text-xs text-slate-500">Refreshing listings...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 1. Camera Photo ONLY: Live capture with camera */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  1. {t('takePhoto')} *
                </label>
                <CameraCapture
                  existingPhotoUrl={imageUrl}
                  onPhotoConfirmed={(url) => setImageUrl(url)}
                  onClearPhoto={() => setImageUrl('')}
                />
              </div>

              {/* 2. Product Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    2. {t('productName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('productNamePlaceholder')}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-emerald-600 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    3. {t('categorySelect')} *
                  </label>
                  <select
                    required
                    value={categorySlug}
                    onChange={(e) => setCategorySlug(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-emerald-600 bg-slate-50/50"
                  >
                    <option value="">-- {t('categorySelect')} --</option>
                    {categories.map((c, idx) => (
                      <option key={c.slug || String(c.id || `cat-opt-${idx}`)} value={c.slug || String(c.id)}>
                        {getCategoryLabel(c)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. Price & Condition (New or Used) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    4. {t('price')} *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder={t('pricePlaceholder')}
                      className="w-full pl-3 pr-12 py-2 text-xs border border-slate-200 rounded-xl focus:outline-emerald-600 bg-slate-50/50 tabular-nums"
                    />
                    <span className="absolute right-3 top-2 text-xs font-semibold text-slate-400">
                      {t('priceCurrency')}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    5. {t('condition')} *
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCondition('new')}
                      className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all ${
                        condition === 'new'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {t('conditionNew')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCondition('used')}
                      className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all ${
                        condition === 'used'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {t('conditionUsed')}
                    </button>
                  </div>
                </div>
              </div>

              {/* 4. Description */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  6. {t('description')} *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('descriptionPlaceholder')}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-emerald-600 bg-slate-50/50 resize-none"
                />
              </div>

              {/* 5. Location: Region, District, City */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  7. {t('location')} (Region, District, City) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    required
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder={t('regionPlaceholder')}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-emerald-600 bg-slate-50/50"
                  />
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder={t('districtPlaceholder')}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-emerald-600 bg-slate-50/50"
                  />
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={t('cityPlaceholder')}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-emerald-600 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* 6. Seller Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    8. {t('sellerName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    placeholder="Full name"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-emerald-600 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    9. {t('contactPhone')} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={sellerPhone}
                    onChange={(e) => setSellerPhone(e.target.value)}
                    placeholder="0911..."
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-emerald-600 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmitting ? t('publishing') : t('publishProduct')}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

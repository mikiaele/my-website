import React, { useState } from 'react';
import { X, Camera, DollarSign, MapPin, Tag, Phone, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { categoriesList, regionsList } from '../translations';
import { CameraCapture } from './CameraCapture';
import { Product } from '../types';

interface SellProductModalProps {
  onProductCreated: (product: Product) => void;
}

export const SellProductModal: React.FC<SellProductModalProps> = ({ onProductCreated }) => {
  const {
    user,
    token,
    isSellModalOpen,
    closeSellModal,
    t,
    language,
    openAuthModal,
  } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categoriesList[0].id);
  const [condition, setCondition] = useState<'new' | 'used'>('new');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [region, setRegion] = useState(regionsList[0].split(' / ')[0]);
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [sellerContact, setSellerContact] = useState(user?.phone || '');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isSellModalOpen) return null;

  // Strict Protection: If not logged in, show auth requirement notice & redirect
  if (!user || !token) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 text-center border border-slate-200">
          <button
            onClick={closeSellModal}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-2">
            {t.sellAuthRequired}
          </h3>
          <p className="text-xs text-slate-600 mb-5 leading-relaxed">
            {t.sellAuthDesc}
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => {
                closeSellModal();
                openAuthModal('login');
              }}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              {t.login}
            </button>
            <button
              onClick={() => {
                closeSellModal();
                openAuthModal('register');
              }}
              className="flex-1 py-2.5 border border-emerald-600 text-emerald-700 hover:bg-emerald-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              {t.register}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl) {
      setError('Please take or upload a product photo with your camera.');
      return;
    }
    if (!title || !price || !city) {
      setError('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          category,
          condition,
          price: parseFloat(price),
          currency: 'ETB',
          description,
          photoUrl,
          region,
          district,
          city,
          sellerContact: sellerContact || user.phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to publish listing');
      }

      onProductCreated(data.product);
      closeSellModal();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
              {t.sellTitle}
            </h3>
            <p className="text-xs text-slate-500">{t.sellSubtitle}</p>
          </div>
          <button
            onClick={closeSellModal}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Product Photo: Camera Capture First */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.productPhoto} <span className="text-red-500">*</span>
            </label>
            {photoUrl ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 aspect-16/9 bg-slate-100 max-h-56">
                <img
                  src={photoUrl}
                  alt="Product preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="absolute bottom-3 right-3 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-md cursor-pointer backdrop-blur-sm"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{t.retake}</span>
                </button>
              </div>
            ) : (
              <div
                onClick={() => setIsCameraOpen(true)}
                className="w-full aspect-16/9 max-h-48 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-2 shadow-md">
                  <Camera className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-emerald-900">
                  {t.takePhotoWithCamera}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                  Capture clear photo of your product using your mobile, laptop, or USB camera
                </p>
              </div>
            )}
          </div>

          {/* Title & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.productName} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., iPhone 15 Pro Max 256GB"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-emerald-600"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.condition} <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setCondition('new')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    condition === 'new'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.conditionNew}
                </button>
                <button
                  type="button"
                  onClick={() => setCondition('used')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    condition === 'used'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.conditionUsed}
                </button>
              </div>
            </div>
          </div>

          {/* Category & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.category} <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-emerald-600 cursor-pointer"
              >
                {categoriesList.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {language === 'am' ? cat.am : language === 'ti' ? cat.ti : cat.en}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.price} ({t.etb}) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-emerald-600">
                <span className="text-xs font-bold text-emerald-700">{t.etb}</span>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="2500"
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-800 focus:outline-hidden tabular-nums font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.description}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="State key features, included accessories, or reasons for selling..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-emerald-600 resize-none"
            />
          </div>

          {/* Location Fields: Region, District, City */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.region} <span className="text-red-500">*</span>
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-emerald-600 cursor-pointer"
              >
                {regionsList.map((reg, idx) => (
                  <option key={idx} value={reg.split(' / ')[0]}>
                    {language === 'am' ? reg.split(' / ')[1] || reg : language === 'ti' ? reg.split(' / ')[2] || reg : reg.split(' / ')[0]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.district}
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g., Bole / Kirkos"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.city} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., Addis Ababa"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-emerald-600"
              />
            </div>
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.contactPhone} <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-emerald-600">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="tel"
                required
                value={sellerContact}
                onChange={(e) => setSellerContact(e.target.value)}
                placeholder="+251 91 100 0000"
                className="w-full bg-transparent text-xs text-slate-800 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t.publishing}</span>
              </>
            ) : (
              <span>{t.publishProduct}</span>
            )}
          </button>
        </form>
      </div>

      {/* Live Camera Modal for Product */}
      {isCameraOpen && (
        <CameraCapture
          title={t.takePhotoWithCamera}
          idealFacingMode="environment"
          onCapture={(img) => {
            setPhotoUrl(img);
            setIsCameraOpen(false);
          }}
          onClose={() => setIsCameraOpen(false)}
        />
      )}
    </div>
  );
};

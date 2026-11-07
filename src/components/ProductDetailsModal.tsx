import React, { useState } from 'react';
import { Product, Category } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  X,
  MapPin,
  Tag,
  Phone,
  User as UserIcon,
  Send,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from 'lucide-react';

interface ProductDetailsModalProps {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  categories,
  onClose,
}) => {
  const { language, t } = useLanguage();
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!product) return null;

  const categoryObj = categories.find((c) => c.slug === product.category_slug);
  const categoryName = categoryObj
    ? language === 'ti'
      ? categoryObj.name_ti
      : language === 'en'
      ? categoryObj.name_en
      : categoryObj.name_am
    : product.category_slug;

  const formattedPrice = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(Number(product.price));

  const conditionLabel = product.condition === 'new' ? t('conditionNew') : t('conditionUsed');

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerContact || !message) {
      setSubmitError('Please fill in all inquiry fields.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          customer_name: customerName,
          customer_contact: customerContact,
          message: message,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit inquiry');
      }

      setSubmitSuccess(true);
      setCustomerName('');
      setCustomerContact('');
      setMessage('');
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : t('inquiryError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-6 border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                product.condition === 'new'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {conditionLabel}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {categoryName}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column: Image & Specifications */}
          <div className="md:col-span-7 flex flex-col gap-4">
            <div className="aspect-[4/3] rounded-2xl bg-slate-100 overflow-hidden border border-slate-200/80">
              <img
                src={product.image_url}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';
                }}
              />
            </div>

            {/* Product Meta Grid */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">{t('categorySelect')}</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  {categoryName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">{t('condition')}</span>
                <span className="font-semibold text-slate-800">{conditionLabel}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">{t('location')}</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {product.city}, {product.district || product.region}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">{t('postedOn')}</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  {new Date(product.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">{t('description')}</h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-white p-4 rounded-xl border border-slate-100">
                {product.description}
              </p>
            </div>
          </div>

          {/* Right Column: Pricing, Seller Contact & Customer Inquiry */}
          <div className="md:col-span-5 flex flex-col justify-between gap-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                {product.name}
              </h2>

              {/* Price Banner */}
              <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-semibold text-emerald-800 block">
                    {t('price')}
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-emerald-800 tabular-nums">
                    {formattedPrice}
                  </span>{' '}
                  <span className="text-sm font-bold text-emerald-700">{t('priceCurrency')}</span>
                </div>
              </div>

              {/* Seller Information */}
              <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
                  {t('sellerInformation')}
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{t('sellerName')}:</span>
                    <span className="font-semibold text-slate-800">{product.seller_name}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{t('sellerPhone')}:</span>
                    <a
                      href={`tel:${product.seller_phone}`}
                      className="font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      {product.seller_phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Customer Inquiry Form */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 mb-1">{t('inquiryTitle')}</h4>
                <p className="text-xs text-slate-500 mb-3">{t('inquirySubtitle')}</p>

                {submitSuccess ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-2.5 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">{t('inquirySuccess')}</p>
                      <button
                        onClick={() => setSubmitSuccess(false)}
                        className="mt-2 text-emerald-700 font-medium underline"
                      >
                        Ask another question
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSendInquiry} className="space-y-3">
                    {submitError && (
                      <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {t('customerName')} *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Abebe Bikila"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-emerald-600 focus:bg-white bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {t('customerContact')} *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerContact}
                        onChange={(e) => setCustomerContact(e.target.value)}
                        placeholder="0911... or email@..."
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-emerald-600 focus:bg-white bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {t('inquiryMessage')} *
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={t('inquiryPlaceholder')}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-emerald-600 focus:bg-white bg-slate-50/50 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>{t('sendingInquiry')}</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>{t('sendInquiry')}</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

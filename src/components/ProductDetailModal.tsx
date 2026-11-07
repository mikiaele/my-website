import React, { useState } from 'react';
import { X, MapPin, Tag, User, Phone, Send, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
}) => {
  const { t, language } = useAuth();

  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const isNew = product.condition.toLowerCase() === 'new';

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !buyerPhone || !message) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          buyerName,
          buyerEmail,
          buyerPhone,
          message,
        }),
      });

      if (res.ok) {
        setInquirySuccess(true);
        setMessage('');
      }
    } catch (err) {
      console.error('Inquiry submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason) return;

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          reporterEmail: buyerEmail || 'anonymous',
          reason: reportReason,
        }),
      });

      if (res.ok) {
        setReportSuccess(true);
        setIsReporting(false);
      }
    } catch (err) {
      console.error('Report error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 shadow-md transition-colors cursor-pointer"
          title={t.close}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[85vh] overflow-y-auto">
          {/* Left: Product Image */}
          <div className="md:col-span-6 bg-slate-100 flex flex-col justify-center relative min-h-[300px]">
            <img
              src={product.photoUrl}
              alt={product.title}
              className="w-full h-full object-cover max-h-[460px]"
            />
            <div className="absolute top-4 left-4">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-lg shadow-sm ${
                  isNew
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 text-amber-200'
                }`}
              >
                {isNew ? t.conditionNew : t.conditionUsed}
              </span>
            </div>
          </div>

          {/* Right: Product Details & Direct Inquiry Form */}
          <div className="md:col-span-6 p-6 sm:p-7 flex flex-col justify-between">
            <div>
              {/* Category & Location */}
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-semibold text-emerald-700 uppercase tracking-wide">
                  {product.category}
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {product.city}, {product.region.split(' / ')[0]}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug mb-3">
                {product.title}
              </h2>

              {/* Price */}
              <div className="mb-4 pb-4 border-b border-slate-100">
                <span className="text-xs text-slate-400 block mb-0.5">{t.price}</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-emerald-800 tabular-nums">
                    {product.price.toLocaleString()}
                  </span>
                  <span className="text-sm font-semibold text-emerald-700">{t.etb}</span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.description}
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {product.description || 'No description provided by seller.'}
                </p>
              </div>

              {/* Location Details */}
              <div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
                <div>
                  <span className="font-semibold text-slate-700">{t.region}:</span> {product.region}
                </div>
                {product.district && (
                  <div>
                    <span className="font-semibold text-slate-700">{t.district}:</span> {product.district}
                  </div>
                )}
                <div>
                  <span className="font-semibold text-slate-700">{t.city}:</span> {product.city}
                </div>
              </div>

              {/* Seller Information */}
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={product.sellerPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                    alt={product.sellerName || 'Seller'}
                    className="w-10 h-10 rounded-full object-cover border border-emerald-300"
                  />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{product.sellerName || 'Verified Seller'}</h5>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>{product.sellerContact}</span>
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-800 px-2 py-0.5 rounded bg-emerald-100">
                  {t.seller}
                </span>
              </div>
            </div>

            {/* Direct Inquiry Form to Seller */}
            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.contactSeller}</span>
              </h4>

              {inquirySuccess ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.inquirySuccess}</span>
                </div>
              ) : (
                <form onSubmit={handleSendInquiry} className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder={t.buyerName}
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-emerald-600"
                    />
                    <input
                      type="tel"
                      placeholder={t.buyerPhone}
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-emerald-600"
                    />
                  </div>

                  <input
                    type="email"
                    placeholder={t.buyerEmail + ' (optional)'}
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-emerald-600"
                  />

                  <textarea
                    rows={2}
                    placeholder={t.message + '...'}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-emerald-600 resize-none"
                  />

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Sending...' : t.sendInquiry}</span>
                  </button>
                </form>
              )}

              {/* Report Listing Trigger */}
              <div className="mt-3 pt-2 text-right">
                {reportSuccess ? (
                  <span className="text-[11px] text-emerald-700">{t.reportSuccess}</span>
                ) : isReporting ? (
                  <form onSubmit={handleReportListing} className="text-left mt-2 space-y-2">
                    <input
                      type="text"
                      placeholder="Reason for report (e.g. misleading info, spam)"
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      required
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-3 py-1 bg-red-600 text-white rounded-lg text-[11px] font-medium"
                      >
                        Submit Report
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsReporting(false)}
                        className="px-2 py-1 text-slate-500 text-[11px]"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsReporting(true)}
                    className="text-[11px] text-slate-400 hover:text-red-500 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <ShieldAlert className="w-3 h-3" />
                    <span>{t.reportListing}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

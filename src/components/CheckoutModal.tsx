import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, MapPin, Phone, CreditCard, Banknote } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export const CheckoutModal: React.FC = () => {
  const { user } = useAuth();
  const { items, subtotal, clearCart, isCheckoutOpen, setIsCheckoutOpen } = useCart();
  const { t, language } = useLanguage();

  const [customerName, setCustomerName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || 'Addis Ababa');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'telebirr' | 'cbe_birr' | 'cash_on_delivery'>('telebirr');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isCheckoutOpen) return null;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      setError(language === 'am' ? 'እባክዎ ሁሉንም አስፈላጊ መረጃዎች ያስገቡ።' : 'Please fill in all delivery details.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setOrderComplete(true);
      clearCart();
    }, 1200);
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setOrderComplete(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full my-6 overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 p-6 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 text-emerald-200 hover:text-white rounded-full hover:bg-emerald-700/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-black text-white">{t('checkoutTitle')}</h2>
          <p className="text-xs text-emerald-100/90 mt-1">
            {language === 'am'
              ? 'ትዕዛዝዎን ለማጠናቀቅ አድራሻዎን እና የመክፈያ መንገድዎን ይምረጡ'
              : 'Fast local delivery across Addis Ababa and major Ethiopian cities.'}
          </p>
        </div>

        {orderComplete ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-gray-900">{t('orderSuccessTitle')}</h3>
            <p className="text-xs sm:text-sm text-gray-600 max-w-sm mx-auto leading-relaxed">
              {t('orderSuccessMsg')}
            </p>
            <div className="p-4 bg-emerald-50 rounded-2xl text-xs text-emerald-900 font-semibold">
              <p>Delivery to: {customerName} ({phone})</p>
              <p className="mt-1">{address}, {city}</p>
              <p className="mt-1 font-black">Total Paid/Due: ETB {subtotal.toLocaleString()}</p>
            </div>
            <button
              onClick={handleClose}
              className="mt-4 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
            >
              {language === 'am' ? 'ወደ መነሻ ገጽ ተመለስ' : 'Continue Shopping'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitOrder} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {error}
              </div>
            )}

            {/* Recipient Details */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('fullName')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Almaz Bekele"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t('phoneLabel')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0911 234 567"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t('cityLabel')}
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('deliveryAddress')} <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t('deliveryAddressPlaceholder')}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Payment Method Selector */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-gray-700 mb-2">
                {t('paymentMethod')}
              </label>
              <div className="space-y-2">
                <label
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'telebirr'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-xs">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'telebirr'}
                      onChange={() => setPaymentMethod('telebirr')}
                    />
                    <span>{t('telebirr')}</span>
                  </div>
                  <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded font-semibold">
                    Instant
                  </span>
                </label>

                <label
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'cbe_birr'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-xs">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cbe_birr'}
                      onChange={() => setPaymentMethod('cbe_birr')}
                    />
                    <span>{t('cbeBirr')}</span>
                  </div>
                  <span className="text-[10px] bg-purple-100 text-purple-900 px-2 py-0.5 rounded font-semibold">
                    CBE Bank
                  </span>
                </label>

                <label
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'cash_on_delivery'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-xs">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cash_on_delivery'}
                      onChange={() => setPaymentMethod('cash_on_delivery')}
                    />
                    <span>{t('cashOnDelivery')}</span>
                  </div>
                  <Banknote className="w-4 h-4 text-gray-400" />
                </label>
              </div>
            </div>

            {/* Total summary */}
            <div className="p-3 bg-gray-50 rounded-xl flex items-baseline justify-between text-xs">
              <span className="text-gray-500 font-semibold">
                {language === 'am' ? 'አጠቃላይ ክፍያ' : 'Total Amount'}
              </span>
              <span className="text-base font-black text-gray-900">
                ETB {subtotal.toLocaleString()}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-700/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>{t('placeOrderBtn')}</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, MapPin, Phone, User, CreditCard } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { ETHIOPIAN_CITIES } from '../lib/constants';
import { PaymentMethod } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCompleted: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onOrderCompleted }) => {
  const { t, language, formatPrice } = useLanguage();
  const { items, subtotal, discount, shippingFee, total, clearCart } = useCart();
  const { user } = useAuth();

  const [customerName, setCustomerName] = useState(user?.full_name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone_number || '');
  const [customerCity, setCustomerCity] = useState(user?.city || 'Addis Ababa');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('telebirr');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      setErrorMsg(t.fill_all_fields);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const orderItems = items.map((item) => ({
        product_id: item.product.id,
        title: language === 'am' ? item.product.title_am || item.product.title_en : item.product.title_en,
        price: item.product.price,
        quantity: item.quantity,
        image_url: item.product.images[0] || '',
        condition: item.product.condition,
      }));

      const newOrder = await api.createOrder({
        user_id: user?.id || 'guest',
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_city: customerCity,
        customer_address: customerAddress.trim(),
        items: orderItems,
        subtotal,
        shipping_fee: shippingFee,
        discount,
        total,
        payment_method: paymentMethod,
        status: 'pending',
      });

      // Fire celebratory confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      setCreatedOrderId(newOrder.id);
      setIsSuccess(true);
      clearCart();
      onOrderCompleted();
    } catch {
      setErrorMsg('Failed to process order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-left flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold tracking-tight">
              {isSuccess ? t.order_success : t.checkout}
            </h3>
            <p className="text-xs text-emerald-100/90 mt-0.5">
              {isSuccess ? t.order_success_desc : `${items.length} items • Total: ${formatPrice(total)}`}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-emerald-900/50 hover:bg-emerald-900 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto">
          {isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-extrabold text-slate-900">{t.order_success}</h4>
                <p className="text-xs text-slate-500">{t.order_success_desc}</p>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mt-3 inline-block">
                  <span className="text-xs text-slate-500 block">Order Tracking Number:</span>
                  <strong className="text-sm text-emerald-800 font-mono tracking-wider">{createdOrderId}</strong>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  {t.continue_shopping}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePlaceOrder} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  {t.delivery_address}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t.full_name} *</label>
                    <div className="relative flex items-center">
                      <User className="w-4 h-4 text-slate-400 absolute left-3" />
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Abebe Kebede"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t.phone_number} *</label>
                    <div className="relative flex items-center">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3" />
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="0911234567"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t.city} *</label>
                    <select
                      value={customerCity}
                      onChange={(e) => setCustomerCity(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:border-emerald-500"
                    >
                      {ETHIOPIAN_CITIES.map((c) => (
                        <option key={c.id} value={c.name_en}>
                          {language === 'am' ? c.name_am : c.name_en}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'am' ? 'የሰፈር / የቤት አድራሻ' : 'Sub-city / Street / House No.'} *
                    </label>
                    <div className="relative flex items-center">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3" />
                      <input
                        type="text"
                        required
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder={language === 'am' ? 'ቦሌ፣ መድሃኒአለም አደባባይ ፊትለፊት' : 'Bole Medhanialem, House 452'}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods (Telebirr, CBE Birr, Cash on Delivery) */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  {t.payment_method}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <label
                    onClick={() => setPaymentMethod('telebirr')}
                    className={`p-3 rounded-xl border-2 flex flex-col justify-between cursor-pointer transition-all ${
                      paymentMethod === 'telebirr'
                        ? 'border-emerald-600 bg-emerald-50/80 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-emerald-900">ቴሌብር Telebirr</span>
                      <input
                        type="radio"
                        name="payment_choice"
                        checked={paymentMethod === 'telebirr'}
                        onChange={() => setPaymentMethod('telebirr')}
                        className="text-emerald-600"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">Instant via Ethio Telecom</span>
                  </label>

                  <label
                    onClick={() => setPaymentMethod('cbe_birr')}
                    className={`p-3 rounded-xl border-2 flex flex-col justify-between cursor-pointer transition-all ${
                      paymentMethod === 'cbe_birr'
                        ? 'border-emerald-600 bg-emerald-50/80 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-emerald-900">CBE Birr</span>
                      <input
                        type="radio"
                        name="payment_choice"
                        checked={paymentMethod === 'cbe_birr'}
                        onChange={() => setPaymentMethod('cbe_birr')}
                        className="text-emerald-600"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">Commercial Bank of Ethiopia</span>
                  </label>

                  <label
                    onClick={() => setPaymentMethod('cash_on_delivery')}
                    className={`p-3 rounded-xl border-2 flex flex-col justify-between cursor-pointer transition-all ${
                      paymentMethod === 'cash_on_delivery'
                        ? 'border-emerald-600 bg-emerald-50/80 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-emerald-900">Cash on Delivery</span>
                      <input
                        type="radio"
                        name="payment_choice"
                        checked={paymentMethod === 'cash_on_delivery'}
                        onChange={() => setPaymentMethod('cash_on_delivery')}
                        className="text-emerald-600"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">Pay when item arrives</span>
                  </label>
                </div>
              </div>

              {/* Order Summary breakdown */}
              <div className="bg-slate-50 rounded-2xl p-3.5 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>{t.subtotal}</span>
                  <span className="font-semibold text-slate-800">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{t.shipping}</span>
                  <span className="font-semibold text-slate-800">
                    {shippingFee === 0 ? t.free_shipping : formatPrice(shippingFee)}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-900">
                  <span>{t.total}</span>
                  <span className="text-emerald-800 text-base">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl font-extrabold text-sm text-white bg-emerald-700 hover:bg-emerald-800 shadow-md shadow-emerald-700/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Processing Order...' : `${t.place_order} • ${formatPrice(total)}`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

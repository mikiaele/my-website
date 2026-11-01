import React, { useState } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  PackageCheck,
  Wallet,
  Smartphone,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { PageView } from '../types/index.ts';
import { createOrder } from '../lib/api.ts';
import { checkoutSchema } from '../lib/validations.ts';
import { Order } from '../types/database.types.ts';

interface CheckoutPageProps {
  setCurrentPage: (page: PageView) => void;
  onOrderCompleted: (order: Order) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  setCurrentPage,
  onOrderCompleted,
}) => {
  const { cart, subtotal, discountAmount, taxAmount, grandTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { t, language } = useLanguage();

  // Form states
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addressLine1, setAddressLine1] = useState(user?.address_line1 || '');
  const [addressLine2, setAddressLine2] = useState(user?.address_line2 || '');
  const [city, setCity] = useState(user?.city || (language === 'am' ? 'አዲስ አበባ' : 'Addis Ababa'));
  const [state, setState] = useState(user?.state || '');
  const [postalCode, setPostalCode] = useState(user?.postal_code || '1000');
  const [country, setCountry] = useState(user?.country || (language === 'am' ? 'ኢትዮጵያ' : 'Ethiopia'));
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Shipping & Payment
  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'express' | 'priority'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod' | 'mobile_money'>('mobile_money');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const deliveryCost = deliveryMethod === 'priority' ? 14.99 : deliveryMethod === 'express' ? 5.99 : 0;
  const finalTotal = grandTotal + deliveryCost;

  const handleAutofillAddis = () => {
    setFullName(language === 'am' ? 'ዮናስ ታደሰ' : 'Yonas Tadesse');
    setEmail('yonas.tadesse@example.com');
    setPhone('+251 91 123 4567');
    setAddressLine1(language === 'am' ? 'ቦሌ መድኃኔዓለም፣ ህንፃ 4' : 'Bole Medhanealem, Suite 4');
    setCity(language === 'am' ? 'አዲስ አበባ' : 'Addis Ababa');
    setState(language === 'am' ? 'ቦሌ' : 'Bole');
    setPostalCode('1000');
    setCountry(language === 'am' ? 'ኢትዮጵያ' : 'Ethiopia');
  };

  const handleAutofillSeattle = () => {
    setFullName('Alex Morgan');
    setEmail('alex.morgan@example.com');
    setPhone('+1 (555) 234-5678');
    setAddressLine1('742 Evergreen Terrace');
    setCity('Seattle');
    setState('WA');
    setPostalCode('98101');
    setCountry('United States');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData = {
      fullName,
      email,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      deliveryMethod,
      paymentMethod,
      cardNumber,
      cardExp,
      cardCvc,
    };

    const validation = checkoutSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) fieldErrors[issue.path[0].toString()] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (cart.length === 0) {
      alert(language === 'am' ? 'የግዢ ቅርጫትዎ ባዶ ነው። እባክዎ ምርት ይምረጡ።' : 'Your cart is empty. Please add items before checkout.');
      setCurrentPage('shop');
      return;
    }

    setIsSubmitting(true);

    try {
      // Map cart items into OrderItem database schema with vendor attribution
      const orderItems = cart.map((item) => {
        const itemUnitPrice = item.product.discount_price ?? item.product.price;
        return {
          product_id: item.product_id,
          product_name: item.product.name,
          product_image: item.product.image_url,
          unit_price: itemUnitPrice,
          quantity: item.quantity,
          total_price: itemUnitPrice * item.quantity,
          seller_id: item.product.seller_id,
          shop_name: item.product.shop?.name,
          fulfillment_status: 'pending' as const,
        };
      });

      const newOrder = await createOrder(
        {
          user_id: user?.id || 'guest-user',
          total_amount: finalTotal,
          subtotal,
          discount_amount: discountAmount,
          shipping_fee: deliveryCost,
          tax_amount: taxAmount,
          status: 'pending',
          shipping_method:
            deliveryMethod === 'priority'
              ? 'Priority Overnight Air'
              : deliveryMethod === 'express'
              ? 'Express Courier'
              : 'Standard Delivery',
          payment_method:
            paymentMethod === 'card'
              ? 'Credit Card'
              : paymentMethod === 'mobile_money'
              ? 'telebirr / CBE Birr (Mobile Money)'
              : 'Cash on Delivery',
          payment_status: paymentMethod === 'cod' ? 'pending' : 'paid',
          shipping_address: {
            full_name: fullName,
            email,
            phone,
            address_line1: addressLine1,
            address_line2: addressLine2 || undefined,
            city,
            state,
            postal_code: postalCode,
            country,
          },
        },
        orderItems
      );

      // Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#059669', '#10b981', '#34d399', '#f59e0b'],
        });
      } catch {
        // Confetti safeguard
      }

      clearCart();
      setConfirmedOrder(newOrder);
      onOrderCompleted(newOrder);
    } catch (err: any) {
      console.error('Order creation error:', err);
      alert(language === 'am' ? 'ትዕዛዝ በማጠናቀቅ ላይ ችግር አጋጥሟል። እባክዎ እንደገና ይሞክሩ።' : 'Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-lg animate-in zoom-in">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
            {language === 'am' ? 'ትዕዛዝዎ ተረጋግጧል' : 'Order Confirmed & Payment Verified'}
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('orderSuccessTitle')}
          </h1>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">
            {t('orderSuccessMsg')}
          </p>
        </div>

        {/* Order Details Card */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 text-left shadow-xs space-y-4 max-w-xl mx-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs text-slate-400">{t('orderNumber')}</span>
              <p className="font-extrabold text-slate-900 font-mono text-base">{confirmedOrder.order_number}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">{t('trackingCode')}</span>
              <p className="font-mono text-emerald-800 font-semibold text-xs">{confirmedOrder.tracking_number}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">{t('deliveryAddressSummary')}</span>
              <p className="font-semibold text-slate-800">{confirmedOrder.shipping_address.full_name}</p>
              <p className="text-slate-500">{confirmedOrder.shipping_address.address_line1}</p>
              <p className="text-slate-500">
                {confirmedOrder.shipping_address.city}, {confirmedOrder.shipping_address.state} {confirmedOrder.shipping_address.postal_code}
              </p>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">{t('paymentMethod')}</span>
              <p className="font-semibold text-slate-800">{confirmedOrder.payment_method}</p>
              <p className="text-emerald-700 font-semibold uppercase">{confirmedOrder.payment_status}</p>
              <p className="text-slate-500 mt-1">{t('totalDue')}: <strong className="text-slate-900 font-mono">${confirmedOrder.total_amount.toFixed(2)}</strong></p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <button
            onClick={() => setCurrentPage('orders')}
            className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold transition-colors cursor-pointer"
          >
            {t('trackOrderStatus')}
          </button>

          <button
            onClick={() => setCurrentPage('shop')}
            className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
          >
            {t('continueShopping')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Title */}
      <div className="pb-6 border-b border-slate-200 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t('checkoutTitle')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t('checkoutSubtitle')}
          </p>
        </div>

        {/* Quick autofill buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden md:inline">
            {language === 'am' ? 'አድራሻ በ1-ክሊክ ሙሉ፡' : 'Quick demo address:'}
          </span>
          <button
            type="button"
            onClick={handleAutofillAddis}
            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-medium transition-colors cursor-pointer border border-emerald-200"
          >
            {language === 'am' ? 'አዲስ አበባ (ቦሌ)' : 'Addis Ababa, Bole'}
          </button>
          <button
            type="button"
            onClick={handleAutofillSeattle}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            Seattle, WA
          </button>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Form: Steps 1, 2, 3 */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Step 1: Shipping Address */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                    1
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{t('shippingDetails')}</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t('fullName')}</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm ${
                      errors.fullName ? 'border-rose-400' : 'border-slate-200'
                    }`}
                  />
                  {errors.fullName && <p className="text-[11px] text-rose-600 mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t('emailAddress')}</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm ${
                      errors.email ? 'border-rose-400' : 'border-slate-200'
                    }`}
                  />
                  {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t('phoneNumber')}</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm ${
                      errors.phone ? 'border-rose-400' : 'border-slate-200'
                    }`}
                  />
                  {errors.phone && <p className="text-[11px] text-rose-600 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t('country')}</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t('streetAddress')}</label>
                  <input
                    type="text"
                    required
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm ${
                      errors.addressLine1 ? 'border-rose-400' : 'border-slate-200'
                    }`}
                  />
                  {errors.addressLine1 && <p className="text-[11px] text-rose-600 mt-1">{errors.addressLine1}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t('apartmentSuite')}</label>
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="Apt 4B"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t('city')}</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">{t('stateRegion')}</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">{t('postalCode')}</label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t('deliveryNotes')}</label>
                  <input
                    type="text"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder={language === 'am' ? 'ለአድራሹ የተለየ ጥቆማ ወይም መለያ ምልክት...' : 'Gate code or leave at front porch...'}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Method */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                  2
                </div>
                <h3 className="font-bold text-slate-900 text-base">{t('deliveryMethod')}</h3>
              </div>

              <div className="space-y-3">
                <label className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  deliveryMethod === 'standard' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200 bg-white'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="delivery"
                      value="standard"
                      checked={deliveryMethod === 'standard'}
                      onChange={() => setDeliveryMethod('standard')}
                      className="text-emerald-600 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">
                        {language === 'am' ? 'መደበኛ ማድረሻ' : 'Standard Delivery'}
                      </span>
                      <span className="text-xs text-slate-500">
                        {language === 'am' ? 'ከ 3-5 የስራ ቀናት ውስጥ የሚደርስ' : 'Delivered within 3-5 business days'}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-800 text-sm">{t('freeShipping')}</span>
                </label>

                <label className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  deliveryMethod === 'express' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200 bg-white'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="delivery"
                      value="express"
                      checked={deliveryMethod === 'express'}
                      onChange={() => setDeliveryMethod('express')}
                      className="text-emerald-600 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">
                        {language === 'am' ? 'ፈጣን መልእክተኛ (ኤክስፕረስ)' : 'Express Courier'}
                      </span>
                      <span className="text-xs text-slate-500">
                        {language === 'am' ? 'በ2 የስራ ቀናት ውስጥ የሚደርስ' : 'Delivered within 2 business days'}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 font-mono text-sm">$5.99</span>
                </label>

                <label className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  deliveryMethod === 'priority' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200 bg-white'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="delivery"
                      value="priority"
                      checked={deliveryMethod === 'priority'}
                      onChange={() => setDeliveryMethod('priority')}
                      className="text-emerald-600 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">
                        {language === 'am' ? 'አፋጣኝ የነጋ ማለዳ ማድረሻ' : 'Priority Overnight Air'}
                      </span>
                      <span className="text-xs text-slate-500">
                        {language === 'am' ? 'በሚቀጥለው ቀን ጠዋት የሚደርስ' : 'Guaranteed next morning delivery'}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 font-mono text-sm">$14.99</span>
                </label>
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                  3
                </div>
                <h3 className="font-bold text-slate-900 text-base">{t('paymentMethod')}</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mobile_money')}
                  className={`p-3.5 rounded-xl border-2 text-left flex flex-col justify-between h-24 transition-all cursor-pointer ${
                    paymentMethod === 'mobile_money' ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900' : 'border-slate-200 text-slate-700'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-emerald-700" />
                  <div>
                    <span className="font-bold text-xs block">telebirr / CBE Birr</span>
                    <span className="text-[10px] text-slate-500">{language === 'am' ? 'ቴሌብር / ሲቢኢ ብር' : 'Instant Mobile Money'}</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3.5 rounded-xl border-2 text-left flex flex-col justify-between h-24 transition-all cursor-pointer ${
                    paymentMethod === 'card' ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900' : 'border-slate-200 text-slate-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-emerald-700" />
                  <div>
                    <span className="font-bold text-xs block">{language === 'am' ? 'ክሬዲት / ዴቢት ካርድ' : 'Credit / Debit Card'}</span>
                    <span className="text-[10px] text-slate-500">Visa, Mastercard</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3.5 rounded-xl border-2 text-left flex flex-col justify-between h-24 transition-all cursor-pointer ${
                    paymentMethod === 'cod' ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900' : 'border-slate-200 text-slate-700'
                  }`}
                >
                  <Wallet className="w-5 h-5 text-emerald-700" />
                  <div>
                    <span className="font-bold text-xs block">{language === 'am' ? 'በጥሬ ገንዘብ (እቃ ሲደርስ)' : 'Cash on Delivery'}</span>
                    <span className="text-[10px] text-slate-500">{language === 'am' ? 'እጅ በእጅ ክፍያ' : 'Pay at Door'}</span>
                  </div>
                </button>
              </div>

              {/* Card Inputs Simulation */}
              {paymentMethod === 'card' && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">{t('cardNumber')}</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">{t('expires')}</label>
                      <input
                        type="text"
                        value={cardExp}
                        onChange={(e) => setCardExp(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">{t('cvc')}</label>
                      <input
                        type="password"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'mobile_money' && (
                <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                  {language === 'am'
                    ? <>"ትዕዛዝ አጠናቅቅ" የሚለውን ሲጫኑ ወደ ተመዘገበው ስልክ ቁጥር (<strong>{phone}</strong>) የቴሌብር / ሲቢኢ ብር ክፍያ ጥያቄ ይላካል።</>
                    : <>A push prompt will be dispatched to your registered phone number (<strong>{phone}</strong>) upon tapping "Place Order".</>}
                </div>
              )}
            </div>

          </div>

          {/* Right Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6 sticky top-24">
              <h3 className="font-bold text-slate-900 text-base pb-3 border-b border-slate-100">
                {t('orderSummary')} ({cart.length} {t('itemsCount')})
              </h3>

              {/* Items Mini List */}
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 pr-1">
                {cart.map((item) => (
                  <div key={item.product_id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={item.product.image_url}
                        alt=""
                        className="w-10 h-10 object-cover rounded-lg bg-slate-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{item.product.name}</p>
                        <p className="text-slate-400 font-mono">{t('quantity')}: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-slate-800 shrink-0">
                      ${((item.product.discount_price ?? item.product.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Calculation Totals */}
              <div className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <div className="flex justify-between">
                  <span>{t('subtotal')}</span>
                  <span className="font-mono text-slate-900 font-semibold">${subtotal.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>{t('discount')}</span>
                    <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>{t('shipping')}</span>
                  <span className="font-mono text-slate-900">
                    {deliveryCost === 0 ? <span className="text-emerald-700 font-bold">{t('freeShipping')}</span> : `$${deliveryCost.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>{t('tax')}</span>
                  <span className="font-mono text-slate-900">${taxAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-3 border-t border-slate-200">
                  <span>{t('totalDue')}</span>
                  <span className="font-mono text-xl text-emerald-800">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-extrabold transition-all shadow-lg shadow-emerald-900/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>{t('processingOrder')}</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>{t('placeOrder')} (${finalTotal.toFixed(2)})</span>
                  </>
                )}
              </button>

              <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'am' ? 'የተረጋገጠ ደህንነቱ የተጠበቀ ትዕዛዝ' : '256-bit encrypted secure order placement'}</span>
              </div>
            </div>
          </div>

        </div>
      </form>

    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod, Order } from '../../types';
import { 
  X, 
  CheckCircle2, 
  Phone, 
  MapPin, 
  User, 
  CreditCard, 
  ShieldCheck, 
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';

export const CheckoutModal: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({
  onClose,
  onSuccess,
}) => {
  const { cart, createOrder, language, t } = useApp();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Addis Ababa');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('telebirr');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = 150; // ETB
  const total = subtotal + deliveryFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      setErrorMsg(
        language === 'am' 
          ? 'እባክዎ ሙሉ ስም፣ ስልክ ቁጥር እና አድራሻዎን ያስገቡ።' 
          : 'Please enter your full name, phone number, and delivery address.'
      );
      return;
    }

    // Phone format check (must be at least 9 digits)
    if (phone.replace(/[^0-9]/g, '').length < 9) {
      setErrorMsg(
        language === 'am'
          ? 'እባክዎ ትክክለኛ የኢትዮጵያ ስልክ ቁጥር ያስገቡ (ለምሳሌ፡ 0912345678)'
          : 'Please enter a valid phone number (e.g. 0912345678 or +251 9...)'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems = cart.map(item => ({
        product_id: item.product.id,
        title_en: item.product.title_en,
        title_am: item.product.title_am,
        price: item.product.price,
        quantity: item.quantity,
        image_url: item.product.image_url,
      }));

      const newOrder = createOrder({
        customer_name: fullName.trim(),
        customer_email: email.trim() || 'customer@mela.et',
        customer_phone: phone.trim(),
        delivery_city: city,
        delivery_address: address.trim(),
        payment_method: paymentMethod,
        items: orderItems,
        total_etb: total,
        status: 'pending',
        notes: notes.trim() || undefined,
      });

      setCreatedOrder(newOrder);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to place order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-emerald-900 text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">{t.checkout_title}</h3>
            <p className="text-xs text-emerald-200">
              {language === 'am' ? 'የክፍያ እና ማድረሻ መረጃዎችን ይሙሉ' : 'Fill delivery coordinates and payment provider'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-300 hover:text-white rounded-full hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {createdOrder ? (
            /* Order Placed Success View */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-gray-950">{t.order_success_title}</h3>
              <p className="text-xs text-gray-600 max-w-sm mx-auto">
                {t.order_success_msg}
              </p>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-left space-y-2 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="text-gray-500">{t.th_order_id}:</span>
                  <span className="font-bold text-emerald-800">{createdOrder.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t.th_customer}:</span>
                  <span className="font-bold text-gray-900">{createdOrder.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t.th_payment}:</span>
                  <span className="font-bold uppercase text-emerald-700">{createdOrder.payment_method.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 text-sm">
                  <span className="font-bold text-gray-900">{t.cart_total}:</span>
                  <span className="font-black text-emerald-900">{createdOrder.total_etb.toLocaleString()} {t.currency}</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={onSuccess}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    {t.full_name} *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Almaz Kebede"
                      className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs bg-white"
                    />
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    {t.phone_number} *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0911223344"
                      className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs bg-white font-mono"
                    />
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>

              {/* Email & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="almaz@gmail.com"
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    {t.delivery_city} *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white cursor-pointer"
                  >
                    <option value="Addis Ababa (Bole)">Addis Ababa (Bole)</option>
                    <option value="Addis Ababa (Kazanchis)">Addis Ababa (Kazanchis)</option>
                    <option value="Addis Ababa (CMC/Summit)">Addis Ababa (CMC / Summit)</option>
                    <option value="Addis Ababa (Sarbet)">Addis Ababa (Sarbet)</option>
                    <option value="Addis Ababa (Piazza)">Addis Ababa (Piazza)</option>
                    <option value="Hawassa">Hawassa</option>
                    <option value="Adama (Nazret)">Adama (Nazret)</option>
                    <option value="Bahir Dar">Bahir Dar</option>
                  </select>
                </div>
              </div>

              {/* Delivery Address / Landmarks */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  {t.delivery_address} *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Near Edna Mall, House #204, 2nd Floor"
                    className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs bg-white"
                  />
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  {t.payment_method} *
                </label>
                <div className="space-y-2">
                  <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                    paymentMethod === 'telebirr' ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500' : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value="telebirr"
                        checked={paymentMethod === 'telebirr'}
                        onChange={() => setPaymentMethod('telebirr')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <div className="font-bold text-gray-900">{t.pay_telebirr}</div>
                        <div className="text-[10px] text-gray-500">Pay directly with Ethio Telecom Telebirr wallet</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-700 text-white font-bold rounded text-[10px]">Instant</span>
                  </label>

                  <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                    paymentMethod === 'cbe_birr' ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500' : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value="cbe_birr"
                        checked={paymentMethod === 'cbe_birr'}
                        onChange={() => setPaymentMethod('cbe_birr')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <div className="font-bold text-gray-900">{t.pay_cbe}</div>
                        <div className="text-[10px] text-gray-500">Commercial Bank of Ethiopia mobile banking</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-purple-700 text-white font-bold rounded text-[10px]">CBE</span>
                  </label>

                  <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                    paymentMethod === 'cash_on_delivery' ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500' : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value="cash_on_delivery"
                        checked={paymentMethod === 'cash_on_delivery'}
                        onChange={() => setPaymentMethod('cash_on_delivery')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <div className="font-bold text-gray-900">{t.pay_cod}</div>
                        <div className="text-[10px] text-gray-500">Pay when your order reaches your door</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Order Breakdown */}
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Items Subtotal:</span>
                  <span className="font-bold">{subtotal.toLocaleString()} {t.currency}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery to {city}:</span>
                  <span className="font-bold">{deliveryFee} {t.currency}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-emerald-950 pt-1.5 border-t border-gray-200">
                  <span>Grand Total:</span>
                  <span>{total.toLocaleString()} {t.currency}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-800/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{t.btn_place_order} • {total.toLocaleString()} {t.currency}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

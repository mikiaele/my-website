import React, { useState } from 'react';
import { X, ShoppingBag, Trash2, ArrowRight, Tag, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface CartDrawerProps {
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenCheckout }) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    discount,
    shippingFee,
    total,
    couponCode,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const { t, language, formatPrice } = useLanguage();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    const res = applyCoupon(inputCoupon);
    setCouponFeedback({ success: res.success, msg: res.message });
    if (res.success) setInputCoupon('');
    setTimeout(() => setCouponFeedback(null), 3000);
  };

  const freeShippingThreshold = 3000;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden text-left">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-emerald-100 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-emerald-800 to-emerald-700 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-900/60 text-emerald-300 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-base sm:text-lg">{t.shopping_cart}</h3>
              <span className="text-xs bg-emerald-500/30 text-emerald-100 font-bold px-2 py-0.5 rounded-full">
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-full bg-emerald-900/50 hover:bg-emerald-900 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Free Shipping Tracker */}
          <div className="bg-emerald-50/70 border-b border-emerald-100 px-5 py-3">
            <div className="flex justify-between text-xs font-bold text-emerald-900 mb-1">
              <span>
                {subtotal >= freeShippingThreshold
                  ? (language === 'am' ? 'ነፃ የማድረስ ዕድል አግኝተዋል!' : 'You have earned FREE delivery!')
                  : (language === 'am'
                      ? `ለነፃ ማድረስ ${formatPrice(freeShippingThreshold - subtotal)} ይቀራል`
                      : `Add ${formatPrice(freeShippingThreshold - subtotal)} more for free shipping`)}
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-emerald-200/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-extrabold text-slate-800 text-sm">{t.cart_empty}</h4>
                <p className="text-xs text-slate-500 max-w-xs">{t.cart_empty_desc}</p>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs shadow-xs hover:bg-emerald-800 transition-colors cursor-pointer"
                >
                  {t.continue_shopping}
                </button>
              </div>
            ) : (
              items.map(({ product, quantity }) => {
                const title = language === 'am' ? product.title_am || product.title_en : product.title_en;
                const isUsed = product.condition === 'used';

                return (
                  <div key={product.id} className="pt-3 flex gap-3 items-center">
                    <img
                      src={product.images[0] || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e'}
                      alt={title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                            isUsed ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isUsed ? (language === 'am' ? 'ያገለገለ' : 'Used') : (language === 'am' ? 'አዲስ' : 'New')}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 truncate">{title}</h4>
                      </div>
                      <p className="text-xs font-extrabold text-emerald-800 mt-1">
                        {formatPrice(product.price)}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="px-2 py-0.5 text-slate-600 hover:text-emerald-700 font-bold text-xs cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-2 font-bold text-xs text-slate-800">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="px-2 py-0.5 text-slate-600 hover:text-emerald-700 font-bold text-xs cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(product.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Area */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-3 shrink-0">
              {/* Voucher Input */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={inputCoupon}
                  onChange={(e) => setInputCoupon(e.target.value)}
                  placeholder={t.coupon_placeholder}
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-emerald-500 uppercase tracking-wider font-bold"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Apply
                </button>
              </form>

              {couponFeedback && (
                <p className={`text-[11px] font-bold ${couponFeedback.success ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {couponFeedback.msg}
                </p>
              )}

              {couponCode && (
                <div className="flex items-center justify-between text-xs bg-emerald-100/70 border border-emerald-300/60 px-2.5 py-1.5 rounded-lg text-emerald-900 font-bold">
                  <span>Coupon: <strong>{couponCode}</strong> applied</span>
                  <button type="button" onClick={removeCoupon} className="text-emerald-900 hover:text-rose-700 ml-2">✕</button>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>{t.subtotal}</span>
                  <span className="font-semibold text-slate-800">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
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
                  <span className="text-base text-emerald-800">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  onOpenCheckout();
                }}
                className="w-full py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-md shadow-emerald-700/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>{t.checkout}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

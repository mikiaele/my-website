import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  Check,
} from 'lucide-react';
import { useCart } from '../../context/CartContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { PageView } from '../../types/index.ts';

interface CartDrawerProps {
  setCurrentPage: (page: PageView) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ setCurrentPage }) => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    totalItems,
    couponCode,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    discountAmount,
    grandTotal,
  } = useCart();
  const { t, language } = useLanguage();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isCartOpen) return null;

  const freeShippingThreshold = 50;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const amountNeeded = Math.max(0, freeShippingThreshold - subtotal);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCoupon.trim()) {
      const res = applyCoupon(inputCoupon.trim());
      setCouponFeedback(res);
      if (res.success) {
        setInputCoupon('');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-800">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">{t('yourCart')}</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {totalItems} {language === 'am' ? 'ምርቶች' : totalItems === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-emerald-50/80 px-6 py-3 border-b border-emerald-100/70">
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              {amountNeeded > 0 ? (
                <span className="text-emerald-900">
                  {language === 'am' ? (
                    <>ለነፃ ፈጣን ማድረሻ ተጨማሪ <strong className="text-emerald-700 font-mono">${amountNeeded.toFixed(2)}</strong> ይጨምሩ</>
                  ) : (
                    <>Add <strong className="text-emerald-700 font-mono">${amountNeeded.toFixed(2)}</strong> more for <strong>Free Express Shipping</strong></>
                  )}
                </span>
              ) : (
                <span className="text-emerald-800 font-bold flex items-center gap-1">
                  <Check className="w-4 h-4 text-emerald-600" /> {t('freeShippingUnlocked')}
                </span>
              )}
              <span className="text-emerald-700 font-mono text-[11px] font-semibold">
                {progressToFreeShipping.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-emerald-200/80 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-slate-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-800 text-base">{t('cartEmpty')}</h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1 mb-6">
                  {t('cartEmptyDesc')}
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setCurrentPage('shop');
                  }}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                >
                  {t('continueShopping')}
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const price = item.product.discount_price ?? item.product.price;
                const lineTotal = price * item.quantity;

                return (
                  <div key={item.product_id} className="py-4 flex gap-4">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg bg-slate-100 border border-slate-200 shrink-0"
                    />

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="font-semibold text-slate-900 text-sm truncate">
                            {item.product.name}
                          </h5>
                          <button
                            onClick={() => removeFromCart(item.product_id)}
                            className="text-slate-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                            title={language === 'am' ? 'አስወግድ' : 'Remove'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {item.product.brand && (
                          <span className="text-[11px] text-slate-400 font-medium block">
                            {item.product.brand}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Stepper */}
                        <div className="flex items-center border border-slate-200 rounded-md bg-slate-50">
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            className="p-1 hover:bg-white text-slate-600 rounded-l transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-semibold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            className="p-1 hover:bg-white text-slate-600 rounded-r transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <span className="font-bold text-slate-900 text-sm font-mono">
                            ${lineTotal.toFixed(2)}
                          </span>
                          {item.quantity > 1 && (
                            <span className="block text-[10px] text-slate-400 font-mono">
                              (${price.toFixed(2)} {language === 'am' ? 'በአንዱ' : 'each'})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Totals */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-slate-200 bg-slate-50/80 space-y-4">
              
              {/* Promo Code Input */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-100/70 border border-emerald-300 rounded-lg text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                    <Tag className="w-3.5 h-3.5" />
                    <span>{language === 'am' ? 'የቅናሽ ቫውቸር' : 'Coupon'} <strong>{appliedCoupon.code}</strong> ({appliedCoupon.percent}% {language === 'am' ? 'ቅናሽ' : 'off'})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-emerald-700 hover:text-emerald-900 font-bold text-xs cursor-pointer"
                  >
                    {language === 'am' ? 'ሰርዝ' : 'Remove'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t('promoCode')}
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs uppercase placeholder:normal-case focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {t('apply')}
                  </button>
                </form>
              )}

              {couponFeedback && !appliedCoupon && (
                <p className={`text-xs ${couponFeedback.success ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {couponFeedback.message}
                </p>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600">
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
                    {subtotal > 50 || (appliedCoupon && appliedCoupon.freeShipping) ? (
                      <span className="text-emerald-700 font-semibold">{t('freeShipping')}</span>
                    ) : (
                      '$9.99'
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>{t('totalDue')}</span>
                  <span className="font-mono text-base text-emerald-800">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setCurrentPage('checkout');
                  }}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>{t('proceedToCheckout')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setCurrentPage('cart');
                  }}
                  className="w-full py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  {language === 'am' ? 'ሙሉ የቅርጫት ዝርዝር ይመልከቱ' : 'View Full Cart Details'}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'am' ? 'በ256-ቢት የተጠበቀ ደህንነቱ የተረጋገጠ ክፍያ' : 'Encrypted 256-bit secure checkout'}</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

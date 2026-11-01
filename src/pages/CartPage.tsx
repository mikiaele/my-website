import React, { useState } from 'react';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  ArrowLeft,
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { PageView } from '../types/index.ts';

interface CartPageProps {
  setCurrentPage: (page: PageView) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ setCurrentPage }) => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    discountAmount,
    shippingFee,
    taxAmount,
    grandTotal,
    totalItems,
    couponCode,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const { t, language } = useLanguage();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCoupon.trim()) {
      const res = applyCoupon(inputCoupon.trim());
      setCouponFeedback(res);
      if (res.success) setInputCoupon('');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{t('cartEmpty')}</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            {t('cartEmptyDesc')}
          </p>
          <div className="pt-4">
            <button
              onClick={() => setCurrentPage('shop')}
              className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm transition-colors inline-flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('continueShopping')}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t('yourCart')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {language === 'am' ? `የተመረጡ እቃዎች ዝርዝር (${totalItems} እቃዎች በቅርጫትዎ ውስጥ)` : `Review your selected items (${totalItems} items in cart)`}
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
        >
          {t('clearCart')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs divide-y divide-slate-100">
            {cart.map((item) => {
              const price = item.product.discount_price ?? item.product.price;
              const lineTotal = price * item.quantity;

              return (
                <div key={item.product_id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  
                  {/* Product info */}
                  <div className="flex items-center gap-4">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-xl bg-slate-100 border border-slate-200 shrink-0"
                    />
                    <div>
                      <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                        {item.product.brand || item.product.category?.name}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                        {item.product.name}
                      </h4>
                      <span className="text-xs text-slate-500 font-mono">
                        ${price.toFixed(2)} {language === 'am' ? 'በአንዱ' : 'each'}
                      </span>
                    </div>
                  </div>

                  {/* Stepper & Total */}
                  <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                    {/* Stepper */}
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="p-2 text-slate-600 hover:text-slate-900 rounded-l-xl transition-colors cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-slate-800 font-mono">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock_quantity}
                        className="p-2 text-slate-600 hover:text-slate-900 rounded-r-xl transition-colors disabled:opacity-40 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Line total */}
                    <div className="text-right min-w-[80px]">
                      <span className="text-base font-extrabold text-slate-900 font-mono">
                        ${lineTotal.toFixed(2)}
                      </span>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      className="text-slate-400 hover:text-rose-600 p-2 transition-colors cursor-pointer"
                      title={language === 'am' ? 'እቃውን አስወግድ' : 'Remove Item'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentPage('shop')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('continueShopping')}</span>
            </button>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              {t('orderSummary')}
            </h3>

            {/* Promo Code Input */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                {language === 'am' ? 'የቅናሽ ቫውቸር / ኩፖን ኮድ' : 'Discount Code / Gift Voucher'}
              </label>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-semibold">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'am' ? 'ቫውቸር' : 'Coupon'} "{appliedCoupon.code}" ({appliedCoupon.percent}% {language === 'am' ? 'ቅናሽ' : 'off'})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-rose-600 hover:text-rose-800 font-bold text-xs cursor-pointer"
                  >
                    {language === 'am' ? 'ሰርዝ' : 'Remove'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder={language === 'am' ? 'የቅናሽ ኮድ ያስገቡ' : 'Enter promo code'}
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    {t('apply')}
                  </button>
                </form>
              )}

              {couponFeedback && !appliedCoupon && (
                <p className={`text-xs mt-1.5 ${couponFeedback.success ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {couponFeedback.message}
                </p>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-3 text-xs sm:text-sm text-slate-600 border-t border-slate-100 pt-4">
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
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-bold">{t('freeShipping')}</span>
                  ) : (
                    `$${shippingFee.toFixed(2)}`
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span>{t('tax')}</span>
                <span className="font-mono text-slate-900 font-semibold">${taxAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-3 border-t border-slate-200">
                <span>{t('totalDue')}</span>
                <span className="font-mono text-xl text-emerald-800">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <button
              onClick={() => setCurrentPage('checkout')}
              className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>{t('proceedToCheckout')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'am' ? 'ነፃ ፈጣን ማድረሻ እና የ30-ቀን የተረጋገጠ ተመላሽ' : 'Free shipping & 30-day money-back guarantee'}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

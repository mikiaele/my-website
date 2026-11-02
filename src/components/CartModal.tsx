import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Phone,
  CheckCircle,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import { CartItem, Language } from '../types';
import { SUPPORT_PHONE } from '../data/mockData';
import { TRANSLATIONS } from '../data/translations';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  language: Language;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'telebirr' | 'cbe' | 'cod'>('telebirr');

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = items.length > 0 ? 150 : 0;
  const total = subtotal + deliveryFee;

  const formatPrice = (val: number) => new Intl.NumberFormat('en-US').format(val);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderSubmitted(true);
    setTimeout(() => {
      onClearCart();
    }, 2500);
  };

  const getProductTitle = (item: CartItem) => {
    return language === 'ti'
      ? item.product.titleTi
      : language === 'am'
      ? item.product.titleAm
      : item.product.titleEn;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900">{t.shoppingCart}</h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              {items.reduce((acc, it) => acc + it.quantity, 0)} {t.items}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 flex-1 space-y-4">
          {orderSubmitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{t.orderReceived}</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">{t.orderReceivedDesc}</p>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm font-semibold text-emerald-900 flex items-center justify-center gap-2">
                <Phone className="w-4 h-4 text-emerald-700" />
                <span>
                  {t.orderCallNotice}{' '}
                  <a href={`tel:${SUPPORT_PHONE}`} className="underline font-bold">
                    {SUPPORT_PHONE}
                  </a>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOrderSubmitted(false);
                  setIsCheckingOut(false);
                  onClose();
                }}
                className="bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm cursor-pointer"
              >
                {t.continueShopping}
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="text-slate-700 font-bold text-base">{t.cartEmpty}</p>
              <p className="text-slate-500 text-xs">{t.cartEmptyDesc}</p>
              <button
                type="button"
                onClick={onClose}
                className="text-emerald-700 font-bold hover:underline text-sm pt-2 cursor-pointer"
              >
                {t.exploreMarketplace}
              </button>
            </div>
          ) : !isCheckingOut ? (
            <>
              {/* Items List */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200">
                      <img
                        src={item.product.imageUrl}
                        alt={getProductTitle(item)}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 truncate">
                        {getProductTitle(item)}
                      </h4>
                      <div className="text-xs text-slate-500 font-medium mt-0.5">
                        {formatPrice(item.product.price)} ETB × {item.quantity}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id, -1)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-slate-800">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id, 1)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.product.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price summary */}
              <div className="pt-4 border-t border-slate-200 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>{t.subtotal}</span>
                  <span className="font-semibold text-slate-900">
                    {formatPrice(subtotal)} {t.etbCurrency}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{t.deliveryFee}</span>
                  <span className="font-semibold text-slate-900">
                    {formatPrice(deliveryFee)} {t.etbCurrency}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100">
                  <span>{t.total}</span>
                  <span className="text-emerald-700 text-lg font-black">
                    {formatPrice(total)} {t.etbCurrency}
                  </span>
                </div>
              </div>

              {/* Phone Order callout */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs font-medium text-emerald-900">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
                  {t.orderCallNotice}
                </span>
                <a
                  href={`tel:${SUPPORT_PHONE}`}
                  className="font-bold underline text-emerald-800 hover:text-emerald-950 shrink-0 ml-1"
                >
                  {SUPPORT_PHONE}
                </a>
              </div>

              {/* Checkout Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsCheckingOut(true)}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-6 rounded-2xl text-sm transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{t.proceedToCheckout}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <h3 className="font-bold text-slate-900 text-base">{t.deliveryDetails}</h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.fullName}
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Abebe / Almaz"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.phoneNumber}
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="09..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.deliveryAddress}
                </label>
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Addis Ababa, Bole around Edna Mall"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t.paymentMethod}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('telebirr')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                      paymentMethod === 'telebirr'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    Telebirr
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cbe')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                      paymentMethod === 'cbe'
                        ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-500'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    CBE Birr
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                      paymentMethod === 'cod'
                        ? 'border-amber-600 bg-amber-50 text-amber-900 ring-2 ring-amber-500'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    Cash
                  </button>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCheckingOut(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  {t.back}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-colors shadow-xs cursor-pointer"
                >
                  {t.confirmOrder} ({formatPrice(total)} {t.etbCurrency})
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CheckoutModal } from './CheckoutModal';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Plus, 
  Minus 
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart, 
    language, 
    t 
  } = useApp();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (!isCartOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = cart.length > 0 ? 150 : 0; // Flat 150 ETB delivery fee for Addis Ababa
  const total = subtotal + deliveryFee;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div 
          onClick={() => setIsCartOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-gray-100 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-emerald-900 text-white">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-300" />
                <h2 className="text-lg font-bold">{t.cart_title}</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-800 text-emerald-200">
                  {cart.length}
                </span>
              </div>

              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 text-emerald-200 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-gray-800">{t.cart_empty}</h3>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto">
                    {language === 'am' 
                      ? 'ምርቶችን ለመጨመር ገበያውን ይጎብኙ።' 
                      : 'Explore our authentic Ethiopian marketplace and add items to your cart.'}
                  </p>
                </div>
              ) : (
                cart.map(({ product, quantity }) => (
                  <div 
                    key={product.id}
                    className="p-3.5 bg-gray-50 border border-gray-200/80 rounded-2xl flex gap-3.5 items-center justify-between"
                  >
                    {/* Item Photo */}
                    <img
                      src={product.image_url}
                      alt={product.title_en}
                      className="w-16 h-16 rounded-xl object-cover border border-gray-200 shrink-0 bg-white"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800';
                      }}
                    />

                    {/* Title & Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate">
                        {language === 'am' ? product.title_am : product.title_en}
                      </h4>
                      <p className="text-[11px] font-extrabold text-emerald-800 mt-0.5">
                        {product.price.toLocaleString()} {t.currency}
                      </p>

                      {/* Stepper */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden">
                          <button
                            onClick={() => updateCartQuantity(product.id, quantity - 1)}
                            className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 text-xs font-bold cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 py-0.5 text-xs font-bold text-gray-900">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(product.id, quantity + 1)}
                            className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 text-xs font-bold cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-[11px] font-bold text-gray-500">
                          = {(product.price * quantity).toLocaleString()} {t.currency}
                        </span>
                      </div>
                    </div>

                    {/* Delete Item */}
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer / Summary */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-gray-50/70 space-y-4">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>{t.cart_subtotal}</span>
                    <span className="font-bold text-gray-900">{subtotal.toLocaleString()} {t.currency}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>{t.cart_delivery}</span>
                    <span className="font-bold text-gray-900">{deliveryFee.toLocaleString()} {t.currency}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200 flex justify-between text-sm">
                    <span className="font-extrabold text-gray-950">{t.cart_total}</span>
                    <span className="font-black text-emerald-900">{total.toLocaleString()} {t.currency}</span>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => setIsCheckoutOpen(true)}
                    className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-800/20 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
                  >
                    <span>{t.btn_checkout}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={clearCart}
                    className="w-full py-2 text-xs text-gray-500 hover:text-red-600 font-semibold cursor-pointer text-center"
                  >
                    Clear Cart
                  </button>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Secure Local Dispatch & Telebirr Verification</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal 
          onClose={() => setIsCheckoutOpen(false)} 
          onSuccess={() => {
            setIsCheckoutOpen(false);
            setIsCartOpen(false);
          }} 
        />
      )}
    </>
  );
};

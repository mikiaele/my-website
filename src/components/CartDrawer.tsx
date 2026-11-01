import React from 'react';
import { X, Trash2, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export const CartDrawer: React.FC = () => {
  const {
    items,
    removeFromCart,
    updateQuantity,
    subtotal,
    itemCount,
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
  } = useCart();
  const { t, language } = useLanguage();

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-emerald-900 text-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-300" />
              <h2 className="text-base font-bold text-white">
                {t('cartTitle')} ({itemCount})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-emerald-200 hover:text-white rounded-full hover:bg-emerald-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="py-24 text-center text-gray-500">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-semibold">{t('cartEmpty')}</p>
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex gap-3.5 p-3 rounded-2xl bg-gray-50 border border-gray-100"
                >
                  <img
                    src={product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'}
                    alt={product.title}
                    className="w-16 h-16 rounded-xl object-cover bg-white shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-gray-900 line-clamp-1">
                          {language === 'am' && product.title_am ? product.title_am : product.title}
                        </h4>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Condition badge */}
                      <span className="text-[10px] font-semibold text-emerald-700">
                        {product.condition === 'new' ? t('conditionNew') : t('conditionUsed')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-black text-gray-900">
                        ETB {(product.price * quantity).toLocaleString()}
                      </span>

                      {/* Quantity Modifier */}
                      <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden text-xs">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 font-bold text-gray-900">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-gray-100 bg-gray-50/80 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>{t('cartSubtotal')}</span>
                  <span className="font-semibold text-gray-800">
                    ETB {subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>{t('cartDeliveryFee')}</span>
                  <span className="font-semibold text-emerald-700">{t('freeDelivery')}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-gray-900 pt-2 border-t border-gray-200">
                  <span>{language === 'am' ? 'አጠቃላይ ክፍያ' : 'Total Payable'}</span>
                  <span className="text-emerald-800">ETB {subtotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>{t('proceedToCheckout')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-700 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Telebirr & CBE Birr Supported</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

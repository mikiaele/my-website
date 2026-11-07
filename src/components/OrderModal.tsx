import React, { useState } from 'react';
import { X, ShoppingCart, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: { id: number; title: string; price: number };
}

export const OrderModal: React.FC<OrderModalProps> = ({ isOpen, onClose, product }) => {
  const { t } = useLanguage();
  const { user, token } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const totalPrice = product.price * quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          productId: product.id,
          quantity,
          customerName,
          customerPhone,
          deliveryAddress,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order request');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Error creating order');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-stone-900">{t.orderTitle}</h3>
          </div>
          <p className="text-xs text-stone-500 line-clamp-1">{product.title}</p>

          {/* Pricing summary */}
          <div className="my-4 p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-stone-500">{t.priceETB}:</span>
              <div className="font-bold text-stone-900 text-sm">
                {product.price.toLocaleString()} {t.currency}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-stone-500">{t.totalPrice}:</span>
              <div className="font-extrabold text-emerald-700 text-base">
                {totalPrice.toLocaleString()} {t.currency}
              </div>
            </div>
          </div>

          {/* Explicit payment disclosure */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2 mb-4">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{t.orderPaymentNotice}</span>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="py-8 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-stone-900 text-sm">{t.success}</h4>
              <p className="text-xs text-stone-600 max-w-xs mx-auto">{t.orderSuccess}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t.quantity} *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t.phone} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+251 9..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.fullName} *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.deliveryAddress} *
                </label>
                <textarea
                  required
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="ቦሌ መድኃኔዓለም አካባቢ፣ ህንፃ ወይም የሰፈር ስም..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>{isLoading ? t.loading : t.orderNow}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

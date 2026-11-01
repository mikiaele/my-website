import React, { useState, useEffect } from 'react';
import { X, Package, Clock, CheckCircle2, Truck, ShoppingBag } from 'lucide-react';
import { Order } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

interface OrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrdersModal: React.FC<OrdersModalProps> = ({ isOpen, onClose }) => {
  const { t, language, formatPrice } = useLanguage();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      api.getOrders().then((allOrders) => {
        // Show orders for current user or all if guest
        const userOrders = user
          ? allOrders.filter((o) => o.user_id === user.id || o.user_id === 'guest')
          : allOrders;
        setOrders(userOrders);
        setIsLoading(false);
      });
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden text-left">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold tracking-tight">{t.orders}</h3>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                {language === 'am' ? 'የትዕዛዝዎን ሁኔታና ታሪክ እዚህ ይከታተሉ' : 'Track your shipment and order delivery history'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-emerald-900/50 hover:bg-emerald-900 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {isLoading ? (
            <p className="text-center text-xs text-slate-500 py-8">Loading orders...</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Package className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">
                {language === 'am' ? 'እስካሁን ምንም ትዕዛዝ አልተመዘገበም' : 'No orders found yet'}
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Tracking ID</span>
                    <strong className="text-xs font-mono text-slate-800">{order.id}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Total</span>
                    <strong className="text-sm font-extrabold text-emerald-800">
                      {formatPrice(order.total)}
                    </strong>
                  </div>
                </div>

                {/* Timeline status */}
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-100/60 px-3 py-1.5 rounded-xl w-fit">
                  <Truck className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="capitalize">{order.status}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 font-medium">Payment: {order.payment_method.toUpperCase()}</span>
                </div>

                {/* Items */}
                <div className="space-y-2 pt-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <img
                          src={item.image_url}
                          alt=""
                          className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                        />
                        <span className="text-slate-800 font-medium truncate max-w-[200px] sm:max-w-xs">
                          {item.title} <span className="text-slate-400">× {item.quantity}</span>
                        </span>
                      </div>
                      <span className="font-bold text-slate-700">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

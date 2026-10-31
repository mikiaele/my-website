import React, { useState, useEffect } from 'react';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { Order, OrderStatus } from '../types/database.types.ts';
import { PageView } from '../types/index.ts';
import { getOrders } from '../lib/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

interface OrdersPageProps {
  setCurrentPage: (page: PageView) => void;
  onSelectOrder: (order: Order) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ setCurrentPage, onSelectOrder }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    async function loadUserOrders() {
      setIsLoading(true);
      const data = await getOrders(user?.id);
      setOrders(data);
      setIsLoading(false);
    }
    loadUserOrders();
  }, [user?.id]);

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> {t('orderDelivered')}
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <Truck className="w-3.5 h-3.5" /> {t('orderShipped')}
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5" /> {t('orderProcessing')}
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            {t('orderCancelled')}
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
            {language === 'am' ? 'በመጠባበቅ ላይ' : 'Pending'}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('orderHistory')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t('trackAndManageOrders')}
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {[
            { id: 'all', label: t('allOrders') },
            { id: 'processing', label: t('orderProcessing') },
            { id: 'shipped', label: t('orderShipped') },
            { id: 'delivered', label: t('orderDelivered') },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          {language === 'am' ? 'የትዕዛዝ ታሪክ በመጫን ላይ...' : 'Loading order history...'}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">{t('noOrdersFound')}</h3>
          <p className="text-xs text-slate-500">
            {statusFilter === 'all'
              ? (language === 'am' ? 'እስካሁን ምንም አይነት ትዕዛዝ አላስቀመጡም። ምርቶችን በመሸመት ይጀምሩ።' : "You haven't placed any orders yet. Discover our curated catalog to begin.")
              : (language === 'am' ? `በዚህ ምድብ ውስጥ ምንም ትዕዛዝ አልተገኘም።` : `No orders currently in this status.`)}
          </p>
          <button
            onClick={() => setCurrentPage('shop')}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            {t('continueShopping')}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Order Card Header */}
              <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  <div>
                    <span className="text-slate-400 uppercase tracking-wider block text-[10px] font-bold">
                      {t('orderPlaced')}
                    </span>
                    <span className="text-slate-800 font-medium">
                      {new Date(order.created_at).toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 uppercase tracking-wider block text-[10px] font-bold">
                      {t('totalDue')}
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      ${order.total_amount.toFixed(2)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 uppercase tracking-wider block text-[10px] font-bold">
                      {t('deliveryAddressSummary')}
                    </span>
                    <span className="text-slate-800 font-medium">
                      {order.shipping_address.full_name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(order.status)}
                  <span className="text-slate-400 font-mono text-xs">#{order.order_number}</span>
                </div>
              </div>

              {/* Items List Inside Card */}
              <div className="p-6 divide-y divide-slate-100">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.product_image}
                        alt=""
                        className="w-14 h-14 object-cover rounded-xl bg-slate-100 border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{item.product_name}</h4>
                        <p className="text-xs text-slate-400 font-mono">
                          {t('quantity')}: {item.quantity} • ${item.unit_price.toFixed(2)} {language === 'am' ? 'በአንዱ' : 'each'}
                        </p>
                      </div>
                    </div>

                    <span className="font-mono font-bold text-slate-900 text-sm shrink-0">
                      ${item.total_price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Card Footer Actions */}
              <div className="px-6 py-3.5 bg-slate-50/50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Truck className="w-4 h-4 text-emerald-700" />
                  <span>{t('trackingCode')}: <strong className="font-mono text-slate-800">{order.tracking_number || (language === 'am' ? 'በዝግጅት ላይ' : 'Pending Dispatch')}</strong></span>
                </div>

                <button
                  onClick={() => onSelectOrder(order)}
                  className="px-4 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 hover:border-emerald-600 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span>{t('viewOrderDetails')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

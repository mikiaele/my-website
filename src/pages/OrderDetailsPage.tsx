import React from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { Order } from '../types/database.types.ts';
import { PageView } from '../types/index.ts';
import { useLanguage } from '../context/LanguageContext.tsx';

interface OrderDetailsPageProps {
  order: Order;
  setCurrentPage: (page: PageView) => void;
}

export const OrderDetailsPage: React.FC<OrderDetailsPageProps> = ({ order, setCurrentPage }) => {
  const { t, language } = useLanguage();

  const steps = [
    {
      title: language === 'am' ? 'ትዕዛዝ ተቀምጧል' : 'Order Placed',
      desc: language === 'am' ? 'ተቀብለን በዝግጅት ላይ ነን' : 'Received & Queued',
      icon: Package,
    },
    {
      title: language === 'am' ? 'ክፍያ ተረጋግጧል' : 'Payment Confirmed',
      desc: language === 'am' ? 'ደህንነቱ የተረጋገጠ' : 'Secure 256-bit SSL',
      icon: ShieldCheck,
    },
    {
      title: language === 'am' ? 'በማሸግ ላይ' : 'Processing & Packaged',
      desc: language === 'am' ? 'ጥራቱ ተመርምሯል' : 'Quality inspected',
      icon: Clock,
    },
    {
      title: language === 'am' ? 'በመንገድ ላይ' : 'Dispatched & In Transit',
      desc: order.shipping_method,
      icon: Truck,
    },
    {
      title: language === 'am' ? 'ደርሷል' : 'Delivered',
      desc: language === 'am' ? 'ለደንበኛ ተረክቧል' : 'Handed to recipient',
      icon: CheckCircle2,
    },
  ];

  // Determine current active step based on status
  let currentStepIndex = 1;
  if (order.status === 'processing') currentStepIndex = 2;
  if (order.status === 'shipped') currentStepIndex = 3;
  if (order.status === 'delivered') currentStepIndex = 4;
  if (order.status === 'cancelled') currentStepIndex = 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <button
          onClick={() => setCurrentPage('orders')}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('backToOrders')}</span>
        </button>

        <button
          onClick={handlePrint}
          className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>{t('printReceipt')}</span>
        </button>
      </div>

      {/* Main Order Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                {order.status === 'delivered' ? t('orderDelivered') : order.status === 'shipped' ? t('orderShipped') : order.status === 'processing' ? t('orderProcessing') : order.status === 'cancelled' ? t('orderCancelled') : 'PENDING'}
              </span>
              <span className="text-xs text-slate-400">
                {language === 'am' ? 'የታዘዘበት ቀን፡ ' : 'Placed on '}
                {new Date(order.created_at).toLocaleString(language === 'am' ? 'am-ET' : 'en-US')}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              {language === 'am' ? 'ትዕዛዝ ቁጥር' : 'Order'} #{order.order_number}
            </h1>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">{t('totalDue')}</span>
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              ${order.total_amount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Live Shipment Timeline Tracker */}
        <div className="py-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
            {language === 'am' ? 'የማድረሻ ሁኔታ እና የክትትል ደረጃዎች' : 'Shipment Status & Tracking'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {steps.map((s, idx) => {
              const isCompleted = idx <= currentStepIndex && order.status !== 'cancelled';
              const isCurrent = idx === currentStepIndex && order.status !== 'cancelled';
              const Icon = s.icon;

              return (
                <div key={idx} className="flex flex-col items-center text-center space-y-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isCompleted
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/20'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h5
                      className={`text-xs font-bold ${
                        isCurrent
                          ? 'text-emerald-700'
                          : isCompleted
                          ? 'text-slate-900'
                          : 'text-slate-400'
                      }`}
                    >
                      {s.title}
                    </h5>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {order.tracking_number && (
            <div className="mt-8 p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-700" />
                <span className="text-emerald-950 font-medium">
                  {t('trackingCode')}:{' '}
                  <strong className="font-mono text-emerald-800">{order.tracking_number}</strong>
                </span>
              </div>
              <span className="text-emerald-700 font-semibold">{order.shipping_method}</span>
            </div>
          )}
        </div>

        {/* Items Table */}
        <div className="pt-6 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            {t('itemsInOrder')}
          </h3>

          <div className="divide-y divide-slate-100">
            {order.items?.map((item) => (
              <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={item.product_image}
                    alt=""
                    className="w-16 h-16 object-cover rounded-xl bg-slate-100 border border-slate-200"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{item.product_name}</h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {t('quantity')}: {item.quantity} × ${item.unit_price.toFixed(2)}
                    </p>
                  </div>
                </div>

                <span className="font-mono font-bold text-slate-900 text-base">
                  ${item.total_price.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Breakdown & Addresses */}
        <div className="pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
          
          <div className="space-y-4">
            <div>
              <span className="text-slate-400 uppercase tracking-wider block font-bold mb-1">
                {t('deliveryAddressSummary')}
              </span>
              <p className="font-bold text-slate-800 text-sm">{order.shipping_address.full_name}</p>
              <p className="text-slate-600">{order.shipping_address.address_line1}</p>
              {order.shipping_address.address_line2 && <p className="text-slate-600">{order.shipping_address.address_line2}</p>}
              <p className="text-slate-600">
                {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
              </p>
              <p className="text-slate-600">{order.shipping_address.country}</p>
              <p className="text-slate-500 mt-1">{t('phoneNumber')}: {order.shipping_address.phone}</p>
            </div>

            <div>
              <span className="text-slate-400 uppercase tracking-wider block font-bold mb-1">
                {t('paymentMethod')}
              </span>
              <p className="text-slate-800 font-semibold">{order.payment_method}</p>
              <p className="text-emerald-700 font-semibold uppercase">{order.payment_status}</p>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2.5">
            <h4 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-200">
              {t('orderSummary')}
            </h4>
            <div className="flex justify-between text-slate-600">
              <span>{t('subtotal')}</span>
              <span className="font-mono">${order.subtotal.toFixed(2)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>{t('discount')}</span>
                <span className="font-mono">-${order.discount_amount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>{t('shipping')}</span>
              <span className="font-mono">
                {order.shipping_fee === 0 ? t('freeShipping') : `$${order.shipping_fee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{t('tax')}</span>
              <span className="font-mono">${order.tax_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
              <span>{t('totalDue')}</span>
              <span className="font-mono text-emerald-800">${order.total_amount.toFixed(2)}</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

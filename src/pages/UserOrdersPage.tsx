import React, { useState, useEffect } from 'react';
import { ShoppingCart, MessageSquare, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface UserOrdersPageProps {
  onBrowse: () => void;
  onOpenProduct: (id: number) => void;
}

export const UserOrdersPage: React.FC<UserOrdersPageProps> = ({ onBrowse, onOpenProduct }) => {
  const { t } = useLanguage();
  const { token, user } = useAuth();

  const [activeTab, setActiveTab] = useState<'orders' | 'inquiries'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setIsLoading(true);

    Promise.all([
      fetch('/api/orders/my', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/inquiries/seller', { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(async ([ordRes, inqRes]) => {
        if (ordRes.ok) setOrders(await ordRes.json());
        if (inqRes.ok) setInquiries(await inqRes.json());
      })
      .catch((err) => console.error('Failed to load user orders:', err))
      .finally(() => setIsLoading(false));
  }, [token]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900">
            {t.myOrders} & {t.myInquiries}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            የላኳቸውን የትዕዛዝ ጥያቄዎችና ስለ እቃዎች የጠየቋቸውን መረጃዎች እዚህ ይከታተሉ።
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'orders'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>የትዕዛዝ ጥያቄዎች ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'inquiries'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>የላኳቸው ጥያቄዎች ({inquiries.length})</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-stone-500">{t.loading}</div>
      ) : activeTab === 'orders' ? (
        orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200/80 p-12 text-center space-y-3">
            <ShoppingCart className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="font-bold text-stone-800 text-sm">እስካሁን ምንም ትዕዛዝ አላስገቡም</h3>
            <p className="text-xs text-stone-500">በመላ ገበያ የሚፈልጓቸውን እቃዎች አሁኑኑ ያግኙ።</p>
            <button
              onClick={onBrowse}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
            >
              {t.browse}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 text-sm">{ord.productTitle}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {ord.status}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">
                    ብዛት፡ {ord.quantity} | ጠቅላላ ዋጋ፡{' '}
                    <span className="font-bold text-stone-900">{ord.totalPrice.toLocaleString()} {t.currency}</span>
                  </p>
                  <p className="text-[11px] text-stone-400">
                    የተላከበት ቀን፡ {new Date(ord.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={() => onOpenProduct(ord.productId)}
                  className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                >
                  <span>{t.viewDetails}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )
      ) : inquiries.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-12 text-center space-y-3">
          <MessageSquare className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-bold text-stone-800 text-sm">ምንም የተላከ ጥያቄ የለም</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <div
              key={inq.id}
              className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 text-xs">
                  ስለ እቃ፡ {inq.productTitle}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">
                  {inq.status}
                </span>
              </div>
              <p className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                "{inq.message}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

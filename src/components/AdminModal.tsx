import React from 'react';
import { X, Shield, Package, Check, Trash2, ShoppingCart, TrendingUp } from 'lucide-react';
import { Product, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  products: Product[];
  onDeleteProduct: (id: string) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  language,
  products,
  onDeleteProduct,
}) => {
  const t = TRANSLATIONS[language];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900">{t.adminDashboard}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="text-xs font-semibold text-emerald-800">{t.totalListings}</div>
              <div className="text-2xl font-black text-emerald-950 mt-1">{products.length}</div>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <div className="text-xs font-semibold text-amber-800">{t.activeOrders}</div>
              <div className="text-2xl font-black text-amber-950 mt-1">12</div>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
              <div className="text-xs font-semibold text-blue-800">{t.verifiedSellers}</div>
              <div className="text-2xl font-black text-blue-950 mt-1">48</div>
            </div>
          </div>

          {/* Listings Management Table */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-3">{t.manageListings}</h3>
            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
              {products.map((item) => {
                const title =
                  language === 'ti'
                    ? item.titleTi
                    : language === 'am'
                    ? item.titleAm
                    : item.titleEn;
                const price = new Intl.NumberFormat('en-US').format(item.price);

                return (
                  <div
                    key={item.id}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        <img src={item.imageUrl} alt={title} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-900 truncate">{title}</div>
                        <div className="text-xs text-slate-500">
                          {price} ETB • {item.sellerName}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onDeleteProduct(item.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title={t.deleteListing}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

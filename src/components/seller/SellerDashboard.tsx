import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductUploadForm } from './ProductUploadForm';
import { 
  Store, 
  PlusCircle, 
  ListFilter, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Tag, 
  Layers, 
  Eye,
  AlertCircle
} from 'lucide-react';

export const SellerDashboard: React.FC = () => {
  const { products, currentUser, language, t, categories, setSelectedProduct } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'create' | 'listings'>('create');

  // Filter listings by current user or all seller-created listings for preview
  const myListings = products.filter(
    p => p.seller_id === currentUser?.id || p.seller_id.startsWith('seller-') || p.status === 'pending'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Seller Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-xl shadow-emerald-950/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-600 text-xs font-semibold text-emerald-200">
              <Store className="w-3.5 h-3.5" />
              <span>{t.seller_dashboard_title}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {language === 'am' ? 'የመላ ገበያ ሻጭ ማዕከል' : 'Mela Market Merchant Hub'}
            </h1>
            <p className="text-sm text-emerald-200 max-w-2xl">
              {t.seller_dashboard_sub}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 shrink-0">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
              <div className="text-2xl font-black text-amber-300">{myListings.length}</div>
              <div className="text-xs text-emerald-200 font-medium">{t.tab_my_listings}</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
              <div className="text-2xl font-black text-emerald-300">
                {myListings.filter(p => p.status === 'approved').length}
              </div>
              <div className="text-xs text-emerald-200 font-medium">
                {language === 'am' ? 'የተፈቀዱ' : 'Approved'}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-emerald-700/50">
          <button
            onClick={() => setActiveSubTab('create')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'create'
                ? 'bg-amber-400 text-emerald-950 shadow-md shadow-amber-400/20'
                : 'bg-emerald-900/60 text-emerald-200 hover:bg-emerald-700/60'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.tab_new_listing}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('listings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'listings'
                ? 'bg-amber-400 text-emerald-950 shadow-md shadow-amber-400/20'
                : 'bg-emerald-900/60 text-emerald-200 hover:bg-emerald-700/60'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>{t.tab_my_listings} ({myListings.length})</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeSubTab === 'create' ? (
        <ProductUploadForm onSuccess={() => setActiveSubTab('listings')} />
      ) : (
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-700" />
              <span>{t.tab_my_listings}</span>
            </h2>
            <button
              onClick={() => setActiveSubTab('create')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t.tab_new_listing}</span>
            </button>
          </div>

          {myListings.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-700">{language === 'am' ? 'እስካሁን የተመዘገበ ምርት የለም' : 'No listings registered yet'}</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                {language === 'am' ? 'የመጀመሪያውን ምርትዎን ለመመዝገብ ከላይ ያለውን ቁልፍ ይጫኑ።' : 'Click the button above to upload your first authentic product.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myListings.map((product) => {
                const category = categories.find(c => c.id === product.category_id);
                return (
                  <div
                    key={product.id}
                    className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow flex flex-col bg-white"
                  >
                    {/* Real Uploaded Photo */}
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                      <img
                        src={product.image_url}
                        alt={product.title_en}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to placeholder if broken image
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800';
                        }}
                      />
                      {/* Status Badge */}
                      <div className="absolute top-3 left-3">
                        {product.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
                            <CheckCircle2 className="w-3 h-3" />
                            {language === 'am' ? 'የተፈቀደ' : 'Approved'}
                          </span>
                        )}
                        {product.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-xs">
                            <Clock className="w-3 h-3" />
                            {language === 'am' ? 'በግምገማ ላይ' : 'Pending Review'}
                          </span>
                        )}
                        {product.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-xs">
                            <XCircle className="w-3 h-3" />
                            {language === 'am' ? 'ውድቅ የተደረገ' : 'Rejected'}
                          </span>
                        )}
                      </div>

                      {/* Condition Badge */}
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[11px] font-bold bg-black/60 text-white backdrop-blur">
                        {product.condition}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[11px] text-gray-500">
                          <Tag className="w-3 h-3 text-emerald-600" />
                          <span>{language === 'am' ? category?.name_am : category?.name_en}</span>
                          <span>•</span>
                          <span>{language === 'am' ? 'ክምችት፡' : 'Stock:'} {product.stock}</span>
                        </div>

                        <h3 className="font-bold text-sm text-gray-900 line-clamp-1">
                          {language === 'am' ? product.title_am : product.title_en}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {language === 'am' ? product.title_en : product.title_am}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-gray-500">{t.field_price}: </span>
                          <span className="text-base font-extrabold text-emerald-800">
                            {product.price.toLocaleString()} {t.currency}
                          </span>
                        </div>

                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="p-2 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="View Product"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

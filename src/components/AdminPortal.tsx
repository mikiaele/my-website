import React, { useState } from 'react';
import { ShieldCheck, ArrowLeft, Trash2, Star, CheckCircle, Package, Users, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { deleteProductFromDb, updateProductInDb } from '../lib/supabase';
import { Product } from '../types';

interface AdminPortalProps {
  products: Product[];
  onBackToShopping: () => void;
  onRefreshProducts: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  products,
  onBackToShopping,
  onRefreshProducts,
}) => {
  const { user, isAdmin } = useAuth();
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.seller_name && p.seller_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Admin Confirmation: Permanently delete this product listing from Mela Market?')) {
      return;
    }
    try {
      await deleteProductFromDb(productId, user?.id || 'admin', true);
      onRefreshProducts();
    } catch (err: any) {
      alert(err?.message || 'Delete failed');
    }
  };

  const handleToggleFeature = async (product: Product) => {
    try {
      await updateProductInDb(
        product.id,
        { is_featured: !product.is_featured },
        user?.id || 'admin',
        true
      );
      onRefreshProducts();
    } catch (err: any) {
      alert(err?.message || 'Failed to update featured status');
    }
  };

  const totalMarketplaceValue = products.reduce((acc, p) => acc + p.price * p.stock, 0);
  const uniqueSellersCount = new Set(products.map((p) => p.seller_id)).size;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      {/* Header */}
      <div className="pb-6 mb-8 border-b border-gray-200">
        <button
          onClick={onBackToShopping}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:text-purple-900 mb-2 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'am' ? 'ወደ መነሻ ገጽ ተመለስ' : 'Back to Marketplace'}</span>
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                {t('adminTitle')}
              </h1>
              <p className="text-xs text-gray-500">{t('adminSubtitle')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Products</p>
            <p className="text-2xl font-black text-gray-900">{products.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Active Sellers</p>
            <p className="text-2xl font-black text-gray-900">{uniqueSellersCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Catalog Value</p>
            <p className="text-2xl font-black text-gray-900">
              ETB {totalMarketplaceValue.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Product Catalog Management */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-gray-900">{t('adminAllListings')}</h2>
          <input
            type="text"
            placeholder="Search listings or seller..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3.5 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">Seller</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Featured</th>
                <th className="py-3 px-4 text-right">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.images[0]}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0"
                      />
                      <span className="font-semibold text-gray-900 text-xs line-clamp-1">
                        {item.title}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-600">
                    {item.seller_name || item.seller_id}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        item.condition === 'new'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.condition === 'new' ? 'Brand New' : 'Used'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs font-bold text-gray-900">
                    ETB {item.price.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-600">{item.stock}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleFeature(item)}
                      className={`p-1 rounded cursor-pointer ${
                        item.is_featured ? 'text-amber-500 hover:text-amber-600' : 'text-gray-300 hover:text-gray-500'
                      }`}
                      title={item.is_featured ? 'Featured on homepage' : 'Not featured'}
                    >
                      <Star className={`w-4 h-4 ${item.is_featured ? 'fill-amber-400' : ''}`} />
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDeleteProduct(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Admin remove product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  ShoppingBag, 
  Tag, 
  ShieldCheck, 
  Phone, 
  Star, 
  CheckCircle2, 
  Truck, 
  RotateCcw,
  Store
} from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const { selectedProduct, setSelectedProduct, language, t, addToCart, categories } = useApp();
  const [quantity, setQuantity] = useState(1);

  if (!selectedProduct) return null;

  const category = categories.find(c => c.id === selectedProduct.category_id);
  const primaryTitle = language === 'am' ? selectedProduct.title_am : selectedProduct.title_en;
  const secondaryTitle = language === 'am' ? selectedProduct.title_en : selectedProduct.title_am;

  const handleAddToCart = () => {
    addToCart(selectedProduct, quantity);
    setSelectedProduct(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white text-gray-700 rounded-full shadow-md backdrop-blur transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Real Product Image Section */}
        <div className="w-full md:w-1/2 bg-gray-100 relative min-h-[300px] md:min-h-full flex items-center justify-center overflow-hidden">
          <img
            src={selectedProduct.image_url}
            alt={primaryTitle}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800';
            }}
          />
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-700 text-white shadow-md">
              {selectedProduct.condition}
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/60 text-emerald-300 backdrop-blur">
              {language === 'am' ? category?.name_am : category?.name_en}
            </span>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            {/* Title & Ratings */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-500 mb-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span>(4.9 • 38 Reviews)</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-gray-950 leading-tight">
                {primaryTitle}
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-1">
                {secondaryTitle}
              </p>
            </div>

            {/* Price & Stock */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  {t.field_price}
                </span>
                <div className="text-2xl font-black text-emerald-950">
                  {selectedProduct.price.toLocaleString()}{' '}
                  <span className="text-sm font-bold text-emerald-600">{t.currency}</span>
                </div>
              </div>

              <div className="text-right">
                <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                  selectedProduct.stock > 0 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {selectedProduct.stock > 0 ? `${selectedProduct.stock} ${t.in_stock}` : t.out_of_stock}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                {t.field_description}
              </h4>
              <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                {selectedProduct.description}
              </p>
            </div>

            {/* Seller Information */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">{selectedProduct.seller_name}</div>
                  <div className="text-[11px] text-gray-500 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Verified Mela Merchant</span>
                  </div>
                </div>
              </div>

              {selectedProduct.seller_phone && (
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block">Contact</span>
                  <a
                    href={`tel:${selectedProduct.seller_phone}`}
                    className="font-bold text-emerald-700 flex items-center gap-1 hover:underline text-xs"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{selectedProduct.seller_phone}</span>
                  </a>
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 pt-1">
              <div className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-lg">
                <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Fast Addis Delivery</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-lg">
                <RotateCcw className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Quality Guaranteed</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-6 mt-4 border-t border-gray-100 flex items-center gap-3">
            {/* Quantity Selector */}
            <div className="flex items-center border border-gray-300 rounded-xl bg-gray-50 overflow-hidden shrink-0">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 text-gray-600 hover:bg-gray-200 text-sm font-bold cursor-pointer"
              >
                -
              </button>
              <span className="px-3 py-2 text-xs font-bold text-gray-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                className="px-3 py-2 text-gray-600 hover:bg-gray-200 text-sm font-bold cursor-pointer"
              >
                +
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={selectedProduct.stock <= 0}
              className={`flex-1 py-3 px-5 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                selectedProduct.stock > 0
                  ? 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-800/20 hover:scale-[1.01]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t.add_to_cart} • {(selectedProduct.price * quantity).toLocaleString()} {t.currency}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

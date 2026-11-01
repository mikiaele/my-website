import React, { useState } from 'react';
import { X, ShoppingCart, Check, Star, ShieldCheck, MapPin, Package, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { Product } from '../types';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const { t, language } = useLanguage();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const handleAddToCart = () => {
    if (product.stock <= 0) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const isNew = product.condition === 'new';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full my-6 overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-gray-500 hover:text-gray-900 bg-white/80 hover:bg-white rounded-full shadow-xs transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Photos column */}
          <div className="bg-gray-100 p-6 flex flex-col justify-between">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white shadow-xs">
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />

              {/* Condition Badge (CRITICAL) */}
              <div className="absolute top-3 left-3">
                {isNew ? (
                  <span className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-600 text-white shadow-xs">
                    {t('conditionNew')}
                  </span>
                ) : (
                  <span className="text-xs font-bold px-3 py-1 rounded-lg bg-amber-500 text-gray-950 shadow-xs">
                    {t('conditionUsed')}
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail switcher if multiple images */}
            {product.images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedImageIndex === idx ? 'border-emerald-600 shadow-xs' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details column */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-700 font-semibold mb-2">
                <span>{product.category_name || product.category_id}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-600 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{product.rating || '4.8'}</span>
                  <span className="text-gray-700 font-normal">({product.reviews_count || 12})</span>
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug mb-3">
                {language === 'am' && product.title_am ? product.title_am : product.title}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-xs font-bold text-gray-500">ETB</span>
                <span className="text-3xl font-black text-emerald-800">
                  {product.price.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500">
                  ({language === 'am' ? 'የተጨማሪ እሴት ታክስን ጨምሮ' : 'VAT included'})
                </span>
              </div>

              {/* Condition explanation box */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl mb-4 text-xs">
                <div className="font-bold text-gray-900 flex items-center gap-1.5 mb-1">
                  <Package className="w-4 h-4 text-emerald-600" />
                  <span>{t('conditionLabel')}:</span>
                  <span className={isNew ? 'text-emerald-700 font-black' : 'text-amber-700 font-black'}>
                    {isNew ? t('conditionNew') : t('conditionUsed')}
                  </span>
                </div>
                <p className="text-gray-600 text-[11px]">
                  {isNew
                    ? (language === 'am' ? 'እቃው ኦሪጅናል እና ጥቅም ላይ ያልዋለ አዲስ ነው።' : 'Brand-new verified item in untouched original packaging.')
                    : (language === 'am' ? 'እቃው ቀደም ሲል በጥንቃቄ የተያዘ እና የተፈተሸ ነው።' : 'Carefully inspected, verified functional pre-owned merchandise.')}
                </p>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  {t('formDescription')}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {/* Seller details */}
              <div className="py-3 px-3.5 bg-emerald-50/70 border border-emerald-100 rounded-xl mb-6 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="font-bold text-gray-900">{product.seller_name || 'Verified Seller'}</p>
                    <p className="text-[10px] text-gray-500">Mela Market Verified Seller</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-800 bg-white px-2 py-0.5 rounded shadow-xs">
                  {product.stock > 0 ? `${product.stock} ${t('inStock')}` : t('outOfStock')}
                </span>
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer text-sm font-bold"
                >
                  -
                </button>
                <span className="px-3 py-2 text-xs font-bold text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer text-sm font-bold"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                  product.stock <= 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : added
                    ? 'bg-emerald-800 text-white shadow-emerald-800/30'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{t('addedToCart')}</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>{t('addToCart')} · ETB {(product.price * quantity).toLocaleString()}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

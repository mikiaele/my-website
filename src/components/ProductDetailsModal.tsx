import React, { useState } from 'react';
import {
  X,
  Star,
  ShoppingCart,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Tag,
  Store,
  Share2,
} from 'lucide-react';
import { Product } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ product, onClose }) => {
  const { t, language, formatPrice } = useLanguage();
  const { addToCart } = useCart();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const title = language === 'am' ? product.title_am || product.title_en : product.title_en;
  const description = language === 'am' ? product.description_am || product.description_en : product.description_en;
  const isUsed = product.condition === 'used';
  const hasDiscount = product.original_price && product.original_price > product.price;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden text-left">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Left: Images */}
            <div className="md:col-span-6 space-y-3">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={product.images[selectedImageIndex] || product.images[0]}
                  alt={title}
                  className="w-full h-full object-cover"
                />

                {/* Condition Tag */}
                <div className="absolute top-3 left-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-md backdrop-blur-md ${
                      isUsed
                        ? 'bg-amber-500 text-white border border-amber-300'
                        : 'bg-emerald-600 text-white border border-emerald-400'
                    }`}
                  >
                    {isUsed ? (
                      <>
                        <Tag className="w-3 h-3" />
                        <span>{t.condition_used_full}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        <span>{t.condition_new_full}</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Thumbnails if multiple */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        selectedImageIndex === idx
                          ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Info & Actions */}
            <div className="md:col-span-6 space-y-4">
              {/* Seller store badge */}
              {product.seller_name && (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-xl w-fit">
                  <Store className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{product.seller_name}</span>
                </div>
              )}

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                {title}
              </h1>

              {/* Ratings & Condition Summary */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-extrabold text-slate-800 text-sm">
                    {product.rating ? product.rating.toFixed(1) : '5.0'}
                  </span>
                  {product.reviews_count ? (
                    <span className="text-xs text-slate-400">({product.reviews_count} reviews)</span>
                  ) : null}
                </div>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-bold text-slate-600">
                  {t.condition_label}:{' '}
                  <strong className={isUsed ? 'text-amber-600' : 'text-emerald-700'}>
                    {isUsed ? t.condition_used_full : t.condition_new_full}
                  </strong>
                </span>
              </div>

              {/* Price */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-800">
                  {formatPrice(product.price)}
                </span>
                {hasDiscount && (
                  <span className="text-sm font-semibold text-slate-400 line-through">
                    {formatPrice(product.original_price!)}
                  </span>
                )}
              </div>

              {/* Stock status */}
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span>
                  {product.stock > 0 ? (
                    <>
                      {t.in_stock}: <strong>{product.stock} {t.items_available}</strong>
                    </>
                  ) : (
                    <span className="text-rose-600 font-bold">{t.out_of_stock}</span>
                  )}
                </span>
              </div>

              {/* Description */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Quantity Picker & Add to Cart */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-2 text-slate-600 hover:text-emerald-700 font-bold disabled:opacity-30 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-3 font-bold text-sm text-slate-800">{quantity}</span>
                    <button
                      type="button"
                      disabled={quantity >= product.stock}
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      className="px-3 py-2 text-slate-600 hover:text-emerald-700 font-bold disabled:opacity-30 cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className={`flex-1 py-3 px-5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      justAdded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-700/25'
                    } disabled:opacity-50`}
                  >
                    {justAdded ? (
                      <>
                        <Check className="w-5 h-5" />
                        <span>{t.added_to_cart}</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        <span>{t.add_to_cart}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                    {language === 'am' ? 'ፈጣን ማድረስ በኢትዮጵያ' : 'Fast Ethiopian Delivery'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    {language === 'am' ? 'የተረጋገጠ ምርት' : 'Quality Verified'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

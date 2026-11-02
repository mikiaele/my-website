import React from 'react';
import {
  X,
  Phone,
  ShoppingCart,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building2,
  Tag,
} from 'lucide-react';
import { Product, Language } from '../types';
import { SUPPORT_PHONE } from '../data/mockData';
import { TRANSLATIONS } from '../data/translations';

interface ProductModalProps {
  product: Product | null;
  language: Language;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  language,
  onClose,
  onAddToCart,
}) => {
  if (!product) return null;

  const t = TRANSLATIONS[language];

  const title =
    language === 'ti' ? product.titleTi : language === 'am' ? product.titleAm : product.titleEn;
  const description =
    language === 'ti'
      ? product.descriptionTi
      : language === 'am'
      ? product.descriptionAm
      : product.descriptionEn;
  const category =
    language === 'ti'
      ? product.categoryTi
      : language === 'am'
      ? product.categoryAm
      : product.category;
  const location =
    language === 'ti'
      ? product.locationTi
      : language === 'am'
      ? product.locationAm
      : product.location;
  const condition =
    language === 'ti'
      ? product.conditionTi
      : language === 'am'
      ? product.conditionAm
      : product.condition;
  const features =
    language === 'ti'
      ? product.featuresTi
      : language === 'am'
      ? product.featuresAm
      : product.featuresEn;

  const formatPrice = (price: number) => new Intl.NumberFormat('en-US').format(price);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-2.5 py-1 rounded-md">
              {category}
            </span>
            <span className="text-xs font-bold text-slate-700 bg-slate-200 px-2.5 py-1 rounded-md flex items-center gap-1">
              <Tag className="w-3 h-3 text-slate-500" />
              {condition}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Product Image */}
          <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative">
            <img
              src={product.imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
            {product.isVerified && (
              <div className="absolute top-3 right-3">
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-950 bg-emerald-400 px-3 py-1.5 rounded-full shadow-md">
                  <ShieldCheck className="w-4 h-4" />
                  {t.verifiedMerchant}
                </span>
              </div>
            )}
          </div>

          {/* Title & Price */}
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{location}</span>
              <span>•</span>
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{product.dateListed}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug mb-3">
              {title}
            </h2>

            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-emerald-800">ETB</span>
              <span className="text-3xl font-black text-slate-900">
                {formatPrice(product.price)}
              </span>
              <span className="text-sm font-bold text-slate-500">{t.etbCurrency}</span>
              {product.originalPrice && (
                <span className="text-sm text-slate-400 line-through ml-2">
                  {formatPrice(product.originalPrice)} {t.etbCurrency}
                </span>
              )}
            </div>
          </div>

          {/* Seller Information */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-base shadow-xs">
                <Building2 className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  {product.sellerName}
                  {product.isVerified && (
                    <span title={t.verifiedMerchant}>
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500">{t.verifiedMerchant}</div>
              </div>
            </div>

            <a
              href={`tel:${product.sellerPhone || SUPPORT_PHONE}`}
              className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition-all"
            >
              <Phone className="w-4 h-4 text-amber-300" />
              <span>{product.sellerPhone || SUPPORT_PHONE}</span>
            </a>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              {t.description}
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">{description}</p>
          </div>

          {/* Specifications / Features */}
          {features && features.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                {t.specifications}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
            <a
              href={`tel:${product.sellerPhone || SUPPORT_PHONE}`}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-2xl text-sm transition-colors cursor-pointer"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>{t.callToInquire}</span>
            </a>

            <button
              type="button"
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 px-6 rounded-2xl text-sm transition-colors shadow-md cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4 text-amber-300" />
              <span>{t.addToCart}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

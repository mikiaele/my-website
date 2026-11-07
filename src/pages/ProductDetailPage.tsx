import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Eye,
  MessageSquare,
  ShoppingCart,
  MessageCircle,
  Share2,
  CheckCircle,
  Camera,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { ProductItem } from '../components/ProductCard.tsx';
import { InquiryModal } from '../components/InquiryModal.tsx';
import { OrderModal } from '../components/OrderModal.tsx';
import { buildAdminWhatsAppLink, DEFAULT_ADMIN_WHATSAPP } from '../lib/whatsapp.ts';

interface ProductDetailPageProps {
  productId: number;
  onBack: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productId,
  onBack,
  onOpenAuth,
}) => {
  const { t, getLocalized } = useLanguage();

  const [product, setProduct] = useState<ProductItem | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [adminWhatsApp, setAdminWhatsApp] = useState<string>(DEFAULT_ADMIN_WHATSAPP);

  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    // Fetch product details
    setIsLoading(true);
    fetch(`/api/products/${productId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load product:', err);
        setIsLoading(false);
      });

    // Fetch official admin WhatsApp setting
    fetch('/api/settings/public')
      .then((res) => res.json())
      .then((data) => {
        if (data.admin_whatsapp_number) {
          setAdminWhatsApp(data.admin_whatsapp_number);
        }
      })
      .catch((err) => console.error('Failed to load WhatsApp:', err));
  }, [productId]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-stone-500">{t.loading}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h3 className="text-xl font-bold text-stone-800">እቃው አልተገኘም (Product Not Found)</h3>
        <p className="text-xs text-stone-500">የተሰረዘ ወይም ያልተገኘ እቃ ነው።</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
        >
          {t.browse}
        </button>
      </div>
    );
  }

  const isNew = product.condition === 'new';
  const categoryName = getLocalized(product.categoryNameAm, product.categoryNameEn, product.categoryNameTi);
  const regionName = getLocalized(product.regionNameAm, product.regionNameEn, product.regionNameTi);
  const woredaName = getLocalized(product.woredaNameAm, product.woredaNameEn, product.woredaNameTi);
  const cityName = getLocalized(product.cityNameAm, product.cityNameEn, product.cityNameTi);

  const images = product.images && product.images.length > 0 ? product.images : [product.primaryImage];

  // WhatsApp prefilled message for official administrator inquiry
  const whatsAppMessage = encodeURIComponent(
    `ሰላም መላ ገበያ አስተዳዳሪ፣ ስለ እቃ መረጃ እፈልጋለሁ፡\nየእቃ ስም: ${product.title}\nየእቃ መለያ ቁጥር (ID): #${product.id}\nዋጋ: ${product.price.toLocaleString()} ETB`
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-emerald-700 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ተመለስ</span>
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-sm"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{copiedLink ? 'ሊንኩ ተቀድቷል!' : 'አጋራ (Share)'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-5 sm:p-8 rounded-3xl border border-stone-200/80 shadow-sm">
        {/* Photos Column */}
        <div className="lg:col-span-7 space-y-3">
          {/* Main Large Image */}
          <div className="relative aspect-4/3 w-full bg-stone-900 rounded-2xl overflow-hidden border border-stone-200 shadow-md">
            <img
              src={images[selectedImageIndex] || images[0]}
              alt={product.title}
              className="w-full h-full object-cover"
            />

            {/* Condition Badge (REQUIRED) */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-md flex items-center gap-1.5 ${
                  isNew ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                {isNew ? `${t.newBadge} (${t.newProducts})` : `${t.usedBadge} (${t.usedProducts})`}
              </span>
            </div>

            {/* Camera verification stamp */}
            <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-stone-950/80 backdrop-blur-md text-emerald-400 text-[11px] font-semibold flex items-center gap-1.5 border border-emerald-900/60">
              <Camera className="w-3.5 h-3.5" />
              <span>የተረጋገጠ የካሜራ ፎቶ</span>
            </div>
          </div>

          {/* Thumbnails if multiple images */}
          {images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                    selectedImageIndex === idx ? 'border-emerald-600 shadow-md' : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Actions Column */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Category tag & status */}
            <div className="flex items-center justify-between">
              {categoryName && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {categoryName}
                </span>
              )}
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700">
                {product.status === 'active' ? 'በሽያጭ ላይ (Active)' : product.status}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 leading-snug">
              {product.title}
            </h1>

            {/* Price */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-stone-500 font-medium block">የእቃው ዋጋ</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                  {product.price.toLocaleString()}
                </span>
              </div>
              <span className="text-sm font-bold text-emerald-700 uppercase">{t.currency}</span>
            </div>

            {/* Location (Structured: Region, Woreda, City/Town) */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
              <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5 uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>የሽያጭ ቦታ / አድራሻ</span>
              </span>
              <div className="text-xs text-stone-800 space-y-1 pl-5">
                <div>
                  <span className="text-stone-500 font-medium">ክልል (Region):</span>{' '}
                  <span className="font-semibold">{regionName || 'አዲስ አበባ'}</span>
                </div>
                <div>
                  <span className="text-stone-500 font-medium">ወረዳ (Woreda):</span>{' '}
                  <span className="font-semibold">{woredaName || 'ቦሌ'}</span>
                </div>
                <div>
                  <span className="text-stone-500 font-medium">ከተማ (City/Town):</span>{' '}
                  <span className="font-semibold">{cityName || 'ቦሌ መድኃኔዓለም'}</span>
                </div>
              </div>
            </div>

            {/* Seller profile card (Notice: NO individual seller WhatsApp per Section 12) */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-stone-200 flex items-center justify-center text-stone-600 shrink-0">
                <UserIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] text-stone-500 block">የተመዘገበ ሻጭ</span>
                <h5 className="font-bold text-xs text-stone-900 truncate">
                  {product.sellerName || t.seller}
                </h5>
                <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> የተረጋገጠ መለያ
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5 pt-4 border-t border-stone-200">
            {/* Primary Action Buttons: Inquiry & Order */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setIsInquiryModalOpen(true)}
                className="py-3 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md transition active:scale-95"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>{t.sendInquiry}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOrderModalOpen(true)}
                className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/20 transition active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{t.orderNow}</span>
              </button>
            </div>

            {/* Single Official Administrator WhatsApp Link (Section 12 REQUIREMENT) */}
            <a
              href={buildAdminWhatsAppLink(
                adminWhatsApp || DEFAULT_ADMIN_WHATSAPP,
                `ሰላም መላ ገበያ አስተዳዳሪ፣ ስለ እቃ መረጃ እፈልጋለሁ፡\nየእቃ ስም: ${product.title}\nየእቃ መለያ ቁጥር (ID): #${product.id}\nዋጋ: ${product.price.toLocaleString()} ETB`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600/20" />
              <span>{t.contactAdminWhatsApp} (@brmiki21)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Description & Full Details */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-stone-900">{t.description}</h3>
        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line">
          {product.description}
        </p>

        <div className="pt-4 border-t border-stone-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-stone-400 block">{t.condition}</span>
            <span className="font-semibold text-stone-800">
              {isNew ? t.newProducts : t.usedProducts}
            </span>
          </div>
          <div>
            <span className="text-stone-400 block">የተለጠፈበት ቀን</span>
            <span className="font-semibold text-stone-800">
              {new Date(product.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="text-stone-400 block">የእይታ ብዛት</span>
            <span className="font-semibold text-stone-800">{product.views} ጊዜ</span>
          </div>
          <div>
            <span className="text-stone-400 block">የእቃ መለያ</span>
            <span className="font-semibold text-stone-800">#MM-{product.id}</span>
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      <InquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        product={product}
      />

      {/* Order Modal */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        product={product}
      />
    </div>
  );
};

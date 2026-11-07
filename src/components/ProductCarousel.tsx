import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  MapPin,
  CheckCircle,
  Tag,
  ArrowRight,
  Eye,
  Camera,
  Play,
  Pause,
} from 'lucide-react';
import { ProductItem } from './ProductCard.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  condition: 'new' | 'used';
  products: ProductItem[];
  onOpenProduct: (id: number) => void;
  onViewAll?: () => void;
  autoSlideInterval?: number;
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  title,
  subtitle,
  condition,
  products,
  onOpenProduct,
  onViewAll,
  autoSlideInterval = 3500,
}) => {
  const { t, getLocalized } = useLanguage();
  const isNew = condition === 'new';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [previewProduct, setPreviewProduct] = useState<ProductItem | null>(null);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);

  // Responsive items count
  const [itemsPerView, setItemsPerView] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else if (window.innerWidth < 1280) {
        setItemsPerView(3);
      } else {
        setItemsPerView(4);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalProducts = products.length;
  const maxIndex = Math.max(0, totalProducts - itemsPerView);

  // Auto-slide effect
  useEffect(() => {
    if (!isAutoPlay || isHovered || totalProducts <= itemsPerView) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= maxIndex) {
          return 0;
        }
        return prev + 1;
      });
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [isAutoPlay, isHovered, totalProducts, itemsPerView, maxIndex, autoSlideInterval]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
  };

  const openPreview = (product: ProductItem) => {
    setPreviewProduct(product);
    setPreviewImageIndex(0);
  };

  // Currently active focused product for the bottom Preview button
  const activeFocusProduct = products[currentIndex] || products[0];

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-stone-200/80 p-8 text-center text-xs text-stone-500">
        እስካሁን ምንም የተመዘገበ {isNew ? 'አዲስ' : 'ያገለገለ'} እቃ የለም።
      </div>
    );
  }

  // Calculate slide offset percentage
  const itemWidthPercent = 100 / itemsPerView;
  const translateX = currentIndex * itemWidthPercent;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isNew
            ? 'bg-gradient-to-r from-emerald-50 via-emerald-50/50 to-white border-emerald-200/80'
            : 'bg-gradient-to-r from-amber-50 via-amber-50/50 to-white border-amber-200/80'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              isNew ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'
            }`}
          />
          <div>
            <div className="flex items-center gap-2">
              <h2
                className={`text-lg sm:text-xl font-extrabold tracking-tight ${
                  isNew ? 'text-emerald-950' : 'text-amber-950'
                }`}
              >
                {title}
              </h2>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  isNew ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {products.length} እቃዎች
              </span>
            </div>
            {subtitle && (
              <p className={`text-xs mt-0.5 ${isNew ? 'text-emerald-800' : 'text-amber-800'}`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs self-start sm:self-auto ${
              isNew
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-amber-600 hover:bg-amber-500 text-white'
            }`}
          >
            <span>ተጨማሪ {isNew ? 'አዲስ' : 'ያገለገለ'} እይ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Horizontal Carousel Track Container */}
      <div
        className="relative overflow-hidden rounded-2xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${translateX}%)`,
          }}
        >
          {products.map((product) => {
            const categoryName = getLocalized(
              product.categoryNameAm,
              product.categoryNameEn,
              product.categoryNameTi
            );
            const cityName = getLocalized(
              product.cityNameAm,
              product.cityNameEn,
              product.cityNameTi
            );
            const regionName = getLocalized(
              product.regionNameAm,
              product.regionNameEn,
              product.regionNameTi
            );

            return (
              <div
                key={product.id}
                style={{ width: `${itemWidthPercent}%` }}
                className="shrink-0 p-2"
              >
                <div className="bg-white rounded-2xl border border-stone-200/80 hover:border-emerald-500 hover:shadow-lg transition flex flex-col justify-between h-full group overflow-hidden">
                  <div>
                    {/* Photo with badges & Quick Preview trigger */}
                    <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden">
                      <img
                        src={product.primaryImage}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* Condition badge */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide text-white shadow-sm flex items-center gap-1 ${
                            isNew ? 'bg-emerald-600' : 'bg-amber-600'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          {isNew ? t.newBadge : t.usedBadge}
                        </span>
                      </div>

                      {/* Camera badge */}
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-stone-900/70 backdrop-blur-sm text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        <span>ካሜራ</span>
                      </div>

                      {/* On-card preview trigger button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openPreview(product);
                        }}
                        className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-stone-900/75 hover:bg-emerald-600 text-white backdrop-blur-sm transition shadow-sm"
                        title={t.preview}
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Product Details */}
                    <div className="p-3.5 space-y-2">
                      {categoryName && (
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {categoryName}
                        </span>
                      )}

                      <h3
                        onClick={() => onOpenProduct(product.id)}
                        className="font-bold text-stone-900 text-xs sm:text-sm line-clamp-2 hover:text-emerald-700 cursor-pointer transition leading-snug"
                        title={product.title}
                      >
                        {product.title}
                      </h3>

                      {/* Price in ETB */}
                      <div className="pt-0.5 flex items-baseline gap-1">
                        <span className="text-base sm:text-lg font-black text-stone-900">
                          {product.price.toLocaleString()}
                        </span>
                        <span className="text-xs font-bold text-emerald-700 uppercase">
                          {t.currency}
                        </span>
                      </div>

                      {/* Location */}
                      <div className="pt-1 flex items-center gap-1 text-[11px] text-stone-500">
                        <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                        <span className="truncate">
                          {[cityName, regionName].filter(Boolean).join(', ') || 'አዲስ አበባ'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="px-3.5 py-2.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => openPreview(product)}
                      className="text-stone-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{t.preview}</span>
                    </button>
                    <button
                      onClick={() => onOpenProduct(product.id)}
                      className="text-emerald-700 font-bold hover:underline"
                    >
                      {t.viewDetails} →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CONTROLS BAR STRICTLY LOCATED BELOW THE PHOTOS (Requirements 4 & 5) */}
      <div className="bg-stone-50 border border-stone-200/90 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        {/* Previous, Indicator & Next Controls */}
        <div className="flex items-center gap-2">
          {/* Previous Button (ከፎቶዎቹ በታች) */}
          <button
            onClick={handlePrev}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 font-bold text-xs shadow-2xs transition active:scale-95"
            title={t.previous}
          >
            <ChevronLeft className="w-4 h-4 text-emerald-700" />
            <span className="hidden sm:inline">{t.previous}</span>
          </button>

          {/* Slide Indicator & Counter */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-stone-200 text-xs font-bold text-stone-700">
            <span className="text-emerald-700">{currentIndex + 1}</span>
            <span className="text-stone-300">/</span>
            <span>{totalProducts}</span>
          </div>

          {/* Next Button (ከፎቶዎቹ በታች) */}
          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 font-bold text-xs shadow-2xs transition active:scale-95"
            title={t.next}
          >
            <span className="hidden sm:inline">{t.next}</span>
            <ChevronRight className="w-4 h-4 text-emerald-700" />
          </button>

          {/* Auto-Slide Play/Pause indicator */}
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className={`p-1.5 rounded-lg border text-xs transition ${
              isAutoPlay
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-stone-100 border-stone-200 text-stone-500'
            }`}
            title={isAutoPlay ? 'Auto-slide active (Pause)' : 'Auto-slide paused (Play)'}
          >
            {isAutoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Dedicated PREVIEW Button Located Below the Photos (Requirement 4 & 5) */}
        <div className="flex items-center gap-2">
          {activeFocusProduct && (
            <button
              onClick={() => openPreview(activeFocusProduct)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white font-bold text-xs shadow-md transition active:scale-95 ${
                isNew
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-amber-600 hover:bg-amber-500'
              }`}
            >
              <Maximize2 className="w-4 h-4" />
              <span>{t.preview}</span>
              <span className="hidden md:inline text-[11px] font-normal opacity-90 truncate max-w-[140px]">
                ({activeFocusProduct.title})
              </span>
            </button>
          )}
        </div>
      </div>

      {/* ENLARGED PREVIEW MODAL / LIGHTBOX (Requirement: Preview ሲጫን የምርቱን ፎቶ በትልቅ መልኩ እንዲያሳይ) */}
      {previewProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setPreviewProduct(null)}
        >
          <div
            className="relative bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-stone-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2.5">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold text-white ${
                    previewProduct.condition === 'new' ? 'bg-emerald-600' : 'bg-amber-600'
                  }`}
                >
                  {previewProduct.condition === 'new' ? t.newBadge : t.usedBadge}
                </span>
                <h3 className="font-extrabold text-sm sm:text-base text-stone-900 truncate max-w-md">
                  {previewProduct.title}
                </h3>
              </div>

              <button
                onClick={() => setPreviewProduct(null)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Large Image & Gallery */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              {/* High-Resolution Large Image */}
              <div className="relative aspect-16/10 sm:aspect-16/9 w-full bg-stone-950 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
                {(() => {
                  const gallery =
                    previewProduct.images && previewProduct.images.length > 0
                      ? previewProduct.images
                      : [previewProduct.primaryImage];
                  const currentImg = gallery[previewImageIndex] || previewProduct.primaryImage;

                  return (
                    <>
                      <img
                        src={currentImg}
                        alt={previewProduct.title}
                        className="max-h-full max-w-full object-contain"
                      />

                      {/* Camera Authenticity Stamp */}
                      <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-stone-950/80 backdrop-blur-md text-emerald-400 text-xs font-bold flex items-center gap-1.5 border border-emerald-900/50">
                        <Camera className="w-4 h-4" />
                        <span>በካሜራ የተነሳ ትክክለኛ ፎቶ (Verified Camera Photo)</span>
                      </div>

                      {/* Modal Image Carousel Controls if multiple images exist */}
                      {gallery.length > 1 && (
                        <>
                          <button
                            onClick={() =>
                              setPreviewImageIndex((prev) =>
                                prev > 0 ? prev - 1 : gallery.length - 1
                              )
                            }
                            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white backdrop-blur-sm"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() =>
                              setPreviewImageIndex((prev) =>
                                prev < gallery.length - 1 ? prev + 1 : 0
                              )
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white backdrop-blur-sm"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Thumbnails if multiple images */}
              {previewProduct.images && previewProduct.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {previewProduct.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPreviewImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                        previewImageIndex === idx
                          ? 'border-emerald-600 scale-105'
                          : 'border-stone-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Product Info Bar */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-stone-500 font-medium">የእቃው ዋጋ</div>
                  <div className="text-2xl font-black text-stone-900">
                    {previewProduct.price.toLocaleString()}{' '}
                    <span className="text-emerald-700 text-sm font-bold uppercase">
                      {t.currency}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-stone-600 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span className="font-semibold">
                      {[
                        previewProduct.cityNameAm,
                        previewProduct.woredaNameAm,
                        previewProduct.regionNameAm,
                      ]
                        .filter(Boolean)
                        .join(', ') || 'አዲስ አበባ'}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400">ሻጭ፡</span>{' '}
                    <span className="font-semibold text-stone-800">
                      {previewProduct.sellerName || t.seller}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setPreviewProduct(null);
                    onOpenProduct(previewProduct.id);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition active:scale-95 shrink-0"
                >
                  <span>ሙሉ መረጃ እይ</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

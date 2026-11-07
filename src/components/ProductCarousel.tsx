import React, { useRef, useState, useEffect } from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { useLanguage } from '../context/LanguageContext';
import { ChevronLeft, ChevronRight, Eye, Sparkles } from 'lucide-react';

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onPreviewProduct: (product: Product) => void;
  badge?: string;
  badgeColor?: 'emerald' | 'amber';
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  title,
  subtitle,
  products,
  onSelectProduct,
  onPreviewProduct,
  badge,
  badgeColor = 'emerald',
}) => {
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Slow, smooth horizontal auto-scroll (strictly horizontal only, never moves the page!)
  useEffect(() => {
    if (products.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      if (!scrollRef.current) return;
      const el = scrollRef.current;
      const maxScroll = el.scrollWidth - el.clientWidth;

      if (el.scrollLeft >= maxScroll - 10) {
        // Smoothly loop back to start
        el.scrollTo({ left: 0, behavior: 'smooth' });
        setCurrentIndex(0);
      } else {
        const cardWidth = 300;
        el.scrollBy({ left: cardWidth, behavior: 'smooth' });
        setCurrentIndex((prev) => (prev + 1) % products.length);
      }
    }, 6000); // Gentle 6 second interval

    return () => clearInterval(timer);
  }, [products.length, isPaused]);

  // Update scroll button states
  const checkScrollState = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 320;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    setTimeout(checkScrollState, 300);
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {badge && (
              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  badgeColor === 'emerald'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {badge}
              </span>
            )}
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {title}
            </h2>
          </div>
          {subtitle && <p className="text-xs sm:text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div
        ref={scrollRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        onScroll={checkScrollState}
        className="flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product, idx) => (
          <div
            key={product.id ? `carousel-prod-${product.id}` : `carousel-idx-${idx}`}
            className="w-[260px] sm:w-[280px] md:w-[300px] shrink-0 snap-start"
          >
            <ProductCard
              product={product}
              onSelect={onSelectProduct}
              onPreview={onPreviewProduct}
            />
          </div>
        ))}
      </div>

      {/* Controls Below: Next and Previous controls + Preview option */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        {/* Preview option button below */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const activeProd = products[currentIndex] || products[0];
              if (activeProd) onPreviewProduct(activeProd);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200 shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{t('preview')}</span>
            <span className="text-emerald-700/70 font-normal truncate max-w-[150px]">
              ({products[currentIndex]?.name || products[0]?.name})
            </span>
          </button>
        </div>

        {/* Previous and Next Controls Below Carousel */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            aria-label={t('previous')}
            className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1 transition-all ${
              canScrollLeft
                ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-2xs cursor-pointer'
                : 'bg-slate-100 text-slate-300 border-slate-100 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t('previous')}</span>
          </button>

          <button
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            aria-label={t('next')}
            className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1 transition-all ${
              canScrollRight
                ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-2xs cursor-pointer'
                : 'bg-slate-100 text-slate-300 border-slate-100 cursor-not-allowed'
            }`}
          >
            <span className="hidden sm:inline">{t('next')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

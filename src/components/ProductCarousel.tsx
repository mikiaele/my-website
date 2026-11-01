import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  showIcon?: boolean;
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  title,
  subtitle,
  products,
  onSelectProduct,
  showIcon = true,
}) => {
  const { t } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [products]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    // Scroll by roughly the width of two cards or one page
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="my-10">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {showIcon && <Sparkles className="w-5 h-5 text-emerald-600" />}
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              {title}
            </h2>
          </div>
          {subtitle && <p className="text-xs sm:text-sm text-gray-500">{subtitle}</p>}
        </div>

        {/* Previous and Next Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label={t('previousItems')}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              canScrollLeft
                ? 'border-gray-200 bg-white text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 shadow-xs'
                : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label={t('nextItems')}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              canScrollRight
                ? 'border-gray-200 bg-white text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 shadow-xs'
                : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Carousel Track: 5 cards per view on large screens */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-4 pt-1 px-1 -mx-1"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[240px] sm:w-[220px] md:w-[230px] lg:w-[calc((100%-4*1rem)/5)] shrink-0"
            style={{ scrollSnapAlign: 'start' }}
          >
            <ProductCard product={product} onSelectProduct={onSelectProduct} />
          </div>
        ))}
      </div>
    </section>
  );
};

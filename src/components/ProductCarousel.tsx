import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Eye, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { useAuth } from '../context/AuthContext';

interface ProductCarouselProps {
  id: string;
  title: string;
  subtitle?: string;
  products: Product[];
  condition: 'new' | 'used';
  onSelectProduct: (product: Product) => void;
  onQuickPreview: (product: Product) => void;
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  id,
  title,
  subtitle,
  products,
  condition,
  onSelectProduct,
  onQuickPreview,
}) => {
  const { t } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState(0);

  // Slow, comfortable horizontal automatic movement (stops completely on user hover or touch)
  useEffect(() => {
    if (isPaused || products.length <= 1) return;

    const interval = setInterval(() => {
      if (!scrollRef.current) return;
      const container = scrollRef.current;
      const maxScrollLeft = container.scrollWidth - container.clientWidth;

      if (container.scrollLeft >= maxScrollLeft - 10) {
        // Smoothly loop back to start without jarring
        container.scrollTo({ left: 0, behavior: 'smooth' });
        setActiveItemIndex(0);
      } else {
        // Advance by approximately one card width (300px)
        container.scrollBy({ left: 300, behavior: 'smooth' });
        setActiveItemIndex(prev => (prev + 1) % products.length);
      }
    }, 4500); // Gentle 4.5s pace

    return () => clearInterval(interval);
  }, [isPaused, products.length]);

  const handleNext = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    setActiveItemIndex(prev => Math.min(prev + 1, products.length - 1));
  };

  const handlePrev = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    setActiveItemIndex(prev => Math.max(prev - 1, 0));
  };

  const handlePreviewCurrent = () => {
    if (products.length > 0) {
      const target = products[activeItemIndex] || products[0];
      onQuickPreview(target);
    }
  };

  return (
    <section id={id} className="py-8 border-b border-slate-100 last:border-b-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  condition === 'new' ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
              />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {title}
              </h2>
            </div>
            {subtitle && <p className="text-xs sm:text-sm text-slate-500">{subtitle}</p>}
          </div>

          <div className="text-xs text-slate-400 font-medium">
            {products.length} {condition === 'new' ? t.conditionNew : t.conditionUsed} items listed
          </div>
        </div>

        {/* Carousel Container */}
        {products.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center">
            <p className="text-sm text-slate-500">{t.noProductsFound}</p>
          </div>
        ) : (
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            className="relative"
          >
            {/* Horizontal Scrollable Track */}
            <div
              ref={scrollRef}
              className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 hide-scrollbar snap-x scroll-smooth"
            >
              {products.map((product) => (
                <div
                  key={product.id}
                  className="w-[260px] sm:w-[280px] md:w-[300px] shrink-0 snap-start flex"
                >
                  <ProductCard
                    product={product}
                    onSelect={onSelectProduct}
                    onQuickPreview={onQuickPreview}
                  />
                </div>
              ))}
            </div>

            {/* Bottom Controls Bar: Previous, Preview, Next */}
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title={t.prev}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{t.prev}</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title={t.next}
                >
                  <span>{t.next}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Functional Preview Option Below Section */}
              <button
                type="button"
                onClick={handlePreviewCurrent}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-slate-100 hover:bg-emerald-100/70 text-slate-700 hover:text-emerald-900 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-emerald-700" />
                <span>{t.quickPreview}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

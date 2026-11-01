import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, LucideIcon, Pause, Play } from 'lucide-react';
import { Product } from '../../types/database.types.ts';
import { ProductCard } from './ProductCard.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface ProductCarouselSectionProps {
  id?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: LucideIcon;
  badgeColor?: string;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onViewAll?: () => void;
  viewAllText?: string;
  autoScrollInterval?: number; // default 3500ms
}

export const ProductCarouselSection: React.FC<ProductCarouselSectionProps> = ({
  id,
  title,
  subtitle,
  badge,
  icon: Icon,
  badgeColor = 'bg-emerald-100 text-emerald-900 border-emerald-300',
  products,
  onSelectProduct,
  onViewAll,
  viewAllText,
  autoScrollInterval = 3500,
}) => {
  const { language } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 15);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [products]);

  // Smooth automatic right-to-left scrolling with pause on hover / touch
  useEffect(() => {
    if (isPaused || products.length <= 1) return;

    const timer = setInterval(() => {
      const el = scrollContainerRef.current;
      if (!el) return;

      // Scroll by one card width (approx 280px on desktop, 220px on mobile)
      const cardWidth = window.innerWidth < 640 ? 220 : 280;
      const isNearEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 20;

      if (isNearEnd) {
        // Loop back to start smoothly
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }, autoScrollInterval);

    return () => clearInterval(timer);
  }, [isPaused, products.length, autoScrollInterval]);

  const handleManualScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;

    // Temporarily pause auto-advance when user clicks
    setIsPaused(true);
    const scrollAmount = window.innerWidth < 640 ? 230 : 300;

    if (direction === 'left') {
      if (el.scrollLeft <= 15) {
        // Loop to the end if at the start
        el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      }
    } else {
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 15) {
        // Loop to start if at the end
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }

    // Resume auto-scroll after 4 seconds of inactivity
    setTimeout(() => {
      setIsPaused(false);
    }, 4000);
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section
      id={id}
      className="relative py-3 sm:py-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => {
        setTimeout(() => setIsPaused(false), 3000);
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4 sm:mb-5">
          <div>
            {badge && (
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border mb-1.5 ${badgeColor}`}>
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{badge}</span>
              </div>
            )}
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>

          {/* Right Controls: View All + Clearly Visible Previous (<) and Next (>) Buttons */}
          <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0">
            {onViewAll && (
              <button
                onClick={onViewAll}
                className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <span>{viewAllText || (language === 'am' ? 'ሁሉንም እይ' : 'View All')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Clearly Visible Next (<) and Next (>) Carousel Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleManualScroll('left')}
                aria-label="Previous items"
                title={language === 'am' ? 'ወደ ኋላ (Previous)' : 'Previous items'}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 border-2 border-slate-200 hover:border-emerald-500 shadow-sm flex items-center justify-center transition-all cursor-pointer active:scale-95"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={() => handleManualScroll('right')}
                aria-label="Next items"
                title={language === 'am' ? 'ወደ ፊት (Next)' : 'Next items'}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-900/20 flex items-center justify-center transition-all cursor-pointer active:scale-95"
              >
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Horizontal Scroll Track with Auto-Movement & Touch Support */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="shrink-0 w-[210px] sm:w-[250px] md:w-[270px] snap-start"
            >
              <ProductCard
                product={product}
                onSelect={onSelectProduct}
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

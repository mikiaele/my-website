import React, { useRef, useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Layers,
  Coffee,
  Smartphone,
  Sparkles,
  Headphones,
  Briefcase,
  Utensils,
  Car,
  Home,
  LucideIcon,
} from 'lucide-react';
import { Category, Product } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { ProductCard } from './ProductCard';

const iconMap: Record<string, LucideIcon> = {
  Coffee,
  Smartphone,
  Sparkles,
  Headphones,
  Briefcase,
  Utensils,
  Car,
  Home,
};

interface CategoryProductSectionProps {
  category: Category;
  products: Product[];
}

export const CategoryProductSection: React.FC<CategoryProductSectionProps> = ({
  category,
  products,
}) => {
  const { localize, language } = useLanguage();
  const trackRef = useRef<HTMLDivElement>(null);
  const [rotationOffset, setRotationOffset] = useState(0);

  useEffect(() => {
    setRotationOffset(0);
  }, [products.length]);

  if (products.length === 0) return null;

  const Icon = iconMap[category.iconName] || Layers;
  const prevLabel = language === 'am' ? 'ቀዳሚ' : language === 'ti' ? 'ዝሓለፈ' : 'Previous';
  const nextLabel = language === 'am' ? 'ቀጣይ' : language === 'ti' ? 'ቀፃሊ' : 'Next';

  const safeOffset = rotationOffset % products.length;
  const orderedProducts =
    safeOffset === 0
      ? products
      : [...products.slice(safeOffset), ...products.slice(0, safeOffset)];

  const getStepWidth = (container: HTMLDivElement): number => {
    const firstCard = container.firstElementChild as HTMLElement | null;
    if (firstCard) {
      return firstCard.offsetWidth + 16;
    }
    return Math.max(240, Math.round(container.clientWidth * 0.75));
  };

  const handlePrev = () => {
    const container = trackRef.current;
    if (!container || products.length <= 1) return;

    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    if (maxScrollLeft > 8) {
      if (container.scrollLeft <= 8) {
        container.scrollTo({ left: maxScrollLeft, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: -getStepWidth(container), behavior: 'smooth' });
      }
    } else {
      setRotationOffset((prev) => (prev - 1 + products.length) % products.length);
    }
  };

  const handleNext = () => {
    const container = trackRef.current;
    if (!container || products.length <= 1) return;

    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    if (maxScrollLeft > 8) {
      if (container.scrollLeft >= maxScrollLeft - 8) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: getStepWidth(container), behavior: 'smooth' });
      }
    } else {
      setRotationOffset((prev) => (prev + 1) % products.length);
    }
  };

  return (
    <section
      aria-label={localize(category.name)}
      data-category-section={category.id}
      className="space-y-4"
    >
      {/* Clean Section Header */}
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/80 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200/70">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight truncate">
          {localize(category.name)}
        </h2>
        <span className="shrink-0 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
          {products.length}
        </span>
      </div>

      {/* Horizontal Swipeable Product Carousel */}
      <div
        ref={trackRef}
        data-carousel-track={category.id}
        className="flex items-stretch gap-3.5 sm:gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth touch-pan-x pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {orderedProducts.map((product) => (
          <div
            key={product.id}
            className="shrink-0 snap-start w-[68%] min-w-[220px] max-w-[270px] sm:w-[46%] sm:max-w-none md:w-[31.5%] lg:w-[23.8%] flex flex-col"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Independent Previous & Next Buttons Directly Underneath Product Photos */}
      <div className="flex items-center justify-center sm:justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={handlePrev}
          aria-label={`${prevLabel} - ${localize(category.name)}`}
          className="inline-flex items-center justify-center gap-1.5 min-h-[42px] px-4 py-2 rounded-xl bg-white hover:bg-emerald-50 active:scale-95 text-slate-800 hover:text-emerald-900 border border-slate-300 hover:border-emerald-700/50 shadow-2xs text-xs sm:text-sm font-bold transition-all cursor-pointer flex-1 sm:flex-initial max-w-[160px]"
        >
          <ChevronLeft className="w-4 h-4 shrink-0" />
          <span>{prevLabel}</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          aria-label={`${nextLabel} - ${localize(category.name)}`}
          className="inline-flex items-center justify-center gap-1.5 min-h-[42px] px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-white border border-emerald-800 shadow-xs text-xs sm:text-sm font-bold transition-all cursor-pointer flex-1 sm:flex-initial max-w-[160px]"
        >
          <span>{nextLabel}</span>
          <ChevronRight className="w-4 h-4 shrink-0 text-amber-300" />
        </button>
      </div>
    </section>
  );
};

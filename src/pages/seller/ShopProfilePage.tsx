import React, { useState, useEffect } from 'react';
import {
  Store,
  MapPin,
  Phone,
  Mail,
  Star,
  CheckCircle2,
  Package,
  ArrowLeft,
  Share2,
} from 'lucide-react';
import { Shop, Product } from '../../types/database.types.ts';
import { PageView } from '../../types/index.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { getProducts } from '../../lib/api.ts';
import { ProductCard } from '../../components/products/ProductCard.tsx';

interface ShopProfilePageProps {
  shop: Shop;
  setCurrentPage: (page: PageView) => void;
  onSelectProduct: (product: Product) => void;
}

export const ShopProfilePage: React.FC<ShopProfilePageProps> = ({
  shop,
  setCurrentPage,
  onSelectProduct,
}) => {
  const { language } = useLanguage();
  const [shopProducts, setShopProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadShopItems() {
      setIsLoading(true);
      const prods = await getProducts({ sellerId: shop.id });
      setShopProducts(prods);
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    loadShopItems();
  }, [shop.id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Back to Marketplace */}
      <div>
        <button
          onClick={() => setCurrentPage('shop')}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'am' ? 'ወደ ዋናው ገበያ ተመለስ' : 'Back to All Marketplace Products'}</span>
        </button>
      </div>

      {/* Shop Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-xl">
        <div className="h-56 sm:h-64 w-full relative">
          <img
            src={shop.banner_url}
            alt=""
            className="w-full h-full object-cover opacity-65"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>

        <div className="px-6 sm:px-10 pb-8 -mt-20 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5">
            <div className="w-28 h-28 rounded-3xl overflow-hidden bg-white border-4 border-slate-900 shadow-2xl shrink-0">
              <img src={shop.logo_url} alt="" className="w-full h-full object-cover" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-md border border-emerald-800">
                  {language === 'am' ? 'የተረጋገጠ ሻጭ' : 'Verified Merchant'}
                </span>
                <div className="flex items-center text-amber-400 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                  <span>{shop.rating.toFixed(1)}</span>
                  <span className="text-slate-400 font-normal ml-1">({shop.review_count} reviews)</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {shop.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{shop.city}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{shop.phone}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-slate-800/90 border border-slate-700 px-4 py-2 rounded-2xl text-xs font-mono">
              <strong className="text-white text-base block">{shopProducts.length}</strong>
              <span className="text-slate-400 text-[10px] uppercase">
                {language === 'am' ? 'ምርቶች' : 'Products'}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Shop Bio */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-2">
        <h3 className="font-bold text-slate-900 text-sm">
          {language === 'am' ? 'ስለ ሱቁ አጭር ማብራሪያ' : 'About This Storefront'}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {shop.description}
        </p>
      </div>

      {/* Products from this Seller */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {language === 'am' ? `${shop.name} ያቀረባቸው ምርቶች` : `Catalog from ${shop.name}`}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'am'
                ? `በአጠቃላይ ${shopProducts.length} እቃዎች ይገኛሉ`
                : `${shopProducts.length} products available from this seller`}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-slate-400 text-sm">Loading storefront...</div>
        ) : shopProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
            {language === 'am'
              ? 'ይህ ሻጭ እስካሁን ምንም ምርት አልዘረዘረም።'
              : 'This vendor has not published any active listings yet.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {shopProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

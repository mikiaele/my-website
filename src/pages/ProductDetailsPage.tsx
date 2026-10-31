import React, { useState, useEffect } from 'react';
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  Plus,
  Minus,
  ArrowLeft,
  Share2,
  AlertCircle,
  MessageSquare,
  Store,
} from 'lucide-react';
import { Product, Review, Shop } from '../types/database.types.ts';
import { PageView } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { getReviews, addReview } from '../lib/api.ts';
import { ProductCard } from '../components/products/ProductCard.tsx';

interface ProductDetailsPageProps {
  product: Product;
  allProducts: Product[];
  setCurrentPage: (page: PageView) => void;
  onSelectProduct: (product: Product) => void;
  onSelectCategory: (slug: string) => void;
  onSelectShop?: (shop: Shop) => void;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({
  product,
  allProducts,
  setCurrentPage,
  onSelectProduct,
  onSelectCategory,
  onSelectShop,
}) => {
  const { addToCart, setIsCartOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews' | 'shipping'>('description');
  const [isAddedFeedback, setIsAddedFeedback] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    setSelectedImageIndex(0);
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    async function loadProductReviews() {
      const data = await getReviews(product.id);
      setReviews(data);
    }
    loadProductReviews();
  }, [product.id]);

  const images = product.images && product.images.length > 0 ? product.images : [product.image_url];
  const isFavorite = isInWishlist(product.id);
  const currentPrice = product.discount_price ?? product.price;
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discount_price!) / product.price) * 100)
    : 0;

  const isOutOfStock = product.availability_status === 'out_of_stock' || product.stock_quantity === 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setIsAddedFeedback(true);
    setTimeout(() => setIsAddedFeedback(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setIsCartOpen(false);
    setCurrentPage('checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingReview(true);
    const rev = await addReview({
      product_id: product.id,
      user_id: user?.id || 'guest',
      user_name: user?.full_name || (language === 'am' ? 'የተረጋገጠ ደንበኛ' : 'Verified Customer'),
      user_avatar: user?.avatar_url,
      rating: newRating,
      comment: newComment.trim(),
    });

    setReviews((prev) => [rev, ...prev]);
    setNewComment('');
    setIsSubmittingReview(false);
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && p.category_id === product.category_id)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <button onClick={() => setCurrentPage('home')} className="hover:text-emerald-700 transition-colors">
          {t('home')}
        </button>
        <span>/</span>
        <button onClick={() => setCurrentPage('shop')} className="hover:text-emerald-700 transition-colors">
          {t('shop')}
        </button>
        {product.category && (
          <>
            <span>/</span>
            <button onClick={() => onSelectCategory(product.category!.slug)} className="hover:text-emerald-700 transition-colors">
              {product.category.name}
            </button>
          </>
        )}
        <span>/</span>
        <span className="text-slate-800 font-medium truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left: Product Images Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs">
            <img
              src={images[selectedImageIndex] || product.image_url}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />

            {/* Discount Badge */}
            {hasDiscount && (
              <div className="absolute top-4 left-4 bg-rose-600 text-white font-extrabold text-xs px-3 py-1 rounded-md shadow-md uppercase tracking-wider">
                {language === 'am' ? `ቅናሽ -${discountPercent}%` : `Save ${discountPercent}%`}
              </div>
            )}

            {/* Wishlist Button */}
            <button
              onClick={() => toggleWishlist(product)}
              className={`absolute top-4 right-4 p-3 rounded-full transition-all shadow-sm ${
                isFavorite
                  ? 'bg-rose-50 text-rose-500'
                  : 'bg-white/90 backdrop-blur-xs text-slate-600 hover:text-rose-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>
          </div>

          {/* Thumbnails row */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border-2 transition-all shrink-0 ${
                    selectedImageIndex === idx
                      ? 'border-emerald-600 ring-2 ring-emerald-600/30'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Actions & Information */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            {/* Multi-Vendor Storefront Banner */}
            {product.shop && (
              <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl overflow-hidden bg-white border border-emerald-300 shrink-0">
                    <img src={product.shop.logo_url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                      {t('soldBy')}
                    </span>
                    <strong className="text-xs font-bold text-slate-900 truncate block">
                      {product.shop.name}
                    </strong>
                  </div>
                </div>

                {onSelectShop && (
                  <button
                    onClick={() => onSelectShop(product.shop!)}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-100/70 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold transition-colors shrink-0"
                  >
                    {t('visitShop')}
                  </button>
                )}
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Rating Stars and Review Count */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= Math.round(product.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-800">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-slate-400">•</span>
              <button
                onClick={() => setActiveTab('reviews')}
                className="text-xs text-emerald-700 hover:underline font-medium"
              >
                {product.review_count} {language === 'am' ? 'ግምገማዎች' : 'customer reviews'}
              </button>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">
                ${currentPrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-lg text-slate-400 line-through font-mono">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>

            {/* Stock Availability status */}
            <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">{language === 'am' ? 'የክምችት ሁኔታ፡' : 'Availability:'}</span>
              {isOutOfStock ? (
                <span className="text-rose-600 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {t('outOfStock')}
                </span>
              ) : product.stock_quantity <= 5 ? (
                <span className="text-amber-700 font-bold flex items-center gap-1">
                  {language === 'am' ? `${product.stock_quantity} ብቻ በክምችት ቀርቷል` : `Only ${product.stock_quantity} left in stock`}
                </span>
              ) : (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> {t('inStock')}
                </span>
              )}
            </div>
          </div>

          {/* Short description */}
          <p className="text-sm text-slate-600 leading-relaxed">
            {product.short_description || product.description}
          </p>

          {/* Quantity and Actions */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {t('quantity')}:
              </span>
              <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-2xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-l-xl transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-slate-900 font-mono">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_quantity || 1, quantity + 1))}
                  disabled={quantity >= product.stock_quantity}
                  className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-r-xl transition-colors disabled:opacity-30"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                  isOutOfStock
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : isAddedFeedback
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-900/10'
                }`}
              >
                {isAddedFeedback ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{t('addedToCart')}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>{t('addToCart')}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-colors cursor-pointer disabled:opacity-40"
              >
                {t('buyNow')}
              </button>
            </div>
          </div>

          {/* Guarantees Box */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{language === 'am' ? 'ነፃ ፈጣን ማድረሻ' : 'Free Express Delivery over $50'}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{language === 'am' ? 'የጥራት ዋስትና' : '2-Year Producer Warranty'}</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{language === 'am' ? 'የ30 ቀናት መመለሻ' : '30-Day Hassle-Free Returns'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{language === 'am' ? '100% ኦሪጅናል' : '100% Genuine Certified'}</span>
            </div>
          </div>

        </div>

      </div>

      {/* Details Tabs */}
      <div className="border-t border-slate-200 pt-10">
        <div className="flex border-b border-slate-200 overflow-x-auto gap-8">
          <button
            onClick={() => setActiveTab('description')}
            className={`pb-4 text-sm font-bold tracking-tight transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'description' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {language === 'am' ? 'ዝርዝር የምርት መግለጫ' : 'Detailed Description'}
          </button>

          <button
            onClick={() => setActiveTab('specifications')}
            className={`pb-4 text-sm font-bold tracking-tight transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'specifications' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t('specifications')}
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 text-sm font-bold tracking-tight transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'reviews' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t('customerReviews')} ({reviews.length})
          </button>
        </div>

        <div className="py-8">
          {activeTab === 'description' && (
            <div className="prose prose-slate max-w-3xl space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
              <p>{product.description}</p>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="max-w-2xl bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs sm:text-sm">
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-slate-50/60">
                    <th className="py-3 px-4 font-semibold text-slate-500 w-1/3">
                      {language === 'am' ? 'የሻጭ ሱቅ' : 'Vendor'}
                    </th>
                    <td className="py-3 px-4 text-slate-900 font-bold">{product.shop?.name || product.brand || 'MELA Exclusive'}</td>
                  </tr>
                  <tr>
                    <th className="py-3 px-4 font-semibold text-slate-500">
                      {language === 'am' ? 'የምርት ምድብ' : 'Department'}
                    </th>
                    <td className="py-3 px-4 text-slate-900 font-medium">{product.category?.name || 'General'}</td>
                  </tr>
                  {product.specifications &&
                    Object.entries(product.specifications).map(([key, val], idx) => (
                      <tr key={key} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                        <th className="py-3 px-4 font-semibold text-slate-500">{key}</th>
                        <td className="py-3 px-4 text-slate-900">{val}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 space-y-4">
                <h4 className="font-bold text-slate-900 text-base mb-4">
                  {t('customerReviews')} ({reviews.length})
                </h4>

                {reviews.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    {language === 'am' ? 'እስካሁን ምንም አስተያየት አልተሰጠም። የመጀመሪያው ይሁኑ!' : 'No reviews yet. Be the first to share your thoughts!'}
                  </p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                            {rev.user_name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 text-xs block">{rev.user_name}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(rev.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed pt-1">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Review input */}
              <div className="lg:col-span-5">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-700" />
                    <span>{t('writeReview')}</span>
                  </h4>

                  {reviewSuccess && (
                    <div className="p-3 bg-emerald-100 text-emerald-800 text-xs rounded-lg font-medium">
                      {language === 'am' ? 'አመሰግናለን! አስተያየትዎ ተመዝግቧል።' : 'Thank you! Your verified review has been posted.'}
                    </div>
                  )}

                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <div className="flex gap-1 text-amber-400">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            type="button"
                            key={val}
                            onClick={() => setNewRating(val)}
                            className="p-1 hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Star
                              className={`w-5 h-5 ${val <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <textarea
                        rows={3}
                        required
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={language === 'am' ? 'ስለ እቃው ጥራት ያለዎትን አስተያየት ያጋሩ...' : 'Share your experience with this item...'}
                        className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingReview || !newComment.trim()}
                      className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {t('shareReview')}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pt-8 border-t border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-6">
            {language === 'am' ? 'ተመሳሳይ ተዛማጅ ምርቶች' : 'You May Also Admire'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

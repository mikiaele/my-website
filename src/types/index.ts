export * from './database.types.ts';

export type PageView =
  | 'home'
  | 'shop'
  | 'product-details'
  | 'categories'
  | 'category-products'
  | 'cart'
  | 'checkout'
  | 'orders'
  | 'order-details'
  | 'profile'
  | 'about'
  | 'contact'
  | 'admin'
  | 'seller-dashboard'
  | 'seller-register'
  | 'seller-shop'
  | 'sellers';

export interface FilterState {
  categorySlug?: string;
  sellerId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  onSaleOnly?: boolean;
  rating?: number;
  sortBy?: 'featured' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
  searchQuery?: string;
}

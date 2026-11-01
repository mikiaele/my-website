export type Language = 'en' | 'am';

export type UserRole = 'admin' | 'seller' | 'customer';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  city?: string;
  is_verified?: boolean;
  created_at: string;
}

export type ProductCondition = 'Brand New' | 'Used';
export type ProductStatus = 'pending' | 'approved' | 'rejected';

export interface Product {
  id: string;
  title_am: string;
  title_en: string;
  price: number; // in ETB
  stock: number;
  category_id: string;
  condition: ProductCondition;
  description: string;
  image_url: string; // Stored Supabase storage public URL
  seller_id: string;
  seller_name: string;
  seller_phone?: string;
  status: ProductStatus;
  created_at: string;
  rating?: number;
  reviews_count?: number;
}

export interface Category {
  id: string;
  name_am: string;
  name_en: string;
  slug: string;
  icon: string;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type PaymentMethod = 'telebirr' | 'cbe_birr' | 'cash_on_delivery';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  product_id: string;
  title_en: string;
  title_am: string;
  price: number;
  quantity: number;
  image_url: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  delivery_city: string;
  payment_method: PaymentMethod;
  items: OrderItem[];
  total_etb: number;
  status: OrderStatus;
  created_at: string;
  notes?: string;
}

export interface MarketplaceStats {
  total_revenue: number;
  total_orders: number;
  active_products: number;
  pending_products: number;
  total_users: number;
  total_sellers: number;
}

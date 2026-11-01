export type ProductCondition = 'new' | 'used';

export interface Category {
  id: string;
  name_en: string;
  name_am: string;
  slug: string;
  description_en?: string;
  description_am?: string;
  icon?: string;
  image_url?: string;
}

export interface Product {
  id: string;
  seller_id: string;
  seller_name?: string;
  category_id: string;
  title_en: string;
  title_am: string;
  description_en: string;
  description_am: string;
  price: number; // in ETB
  original_price?: number; // in ETB
  stock: number;
  condition: ProductCondition; // 'new' | 'used'
  images: string[];
  rating?: number;
  reviews_count?: number;
  is_featured?: boolean;
  specifications?: Record<string, string>;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  city: string;
  role: 'buyer' | 'seller' | 'admin';
  created_at: string;
}

export interface SellerProfile {
  id: string;
  user_id: string;
  shop_name: string;
  shop_slug: string;
  city: string;
  phone_number: string;
  status: 'active' | 'pending' | 'suspended';
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  product_id: string;
  title: string;
  price: number;
  quantity: number;
  image_url: string;
  condition: ProductCondition;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'telebirr' | 'cbe_birr' | 'cash_on_delivery' | 'bank_transfer' | 'card';

export interface Order {
  id: string;
  user_id: string;
  customer_name: string;
  customer_phone: string;
  customer_city: string;
  customer_address: string;
  items: OrderItem[];
  subtotal: number;
  shipping_fee: number;
  discount: number;
  total: number;
  payment_method: PaymentMethod;
  status: OrderStatus;
  created_at: string;
}

export type Language = 'am' | 'en';

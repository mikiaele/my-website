export type Language = 'en' | 'am';

export type ProductCondition = 'new' | 'used';

export interface Category {
  id: string;
  slug?: string;
  name_en: string;
  name_am: string;
  description_en?: string;
  description_am?: string;
  icon?: string;
  image_url?: string;
  display_order?: number;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  phone_number?: string;
  city?: string;
  role: 'buyer' | 'customer' | 'seller' | 'admin';
  created_at?: string;
}

export interface Shop {
  id: string;
  seller_id?: string;
  user_id?: string;
  name?: string;
  shop_name?: string;
  shop_slug?: string;
  description?: string;
  city?: string;
  phone_number?: string;
  is_verified?: boolean;
  status?: 'active' | 'pending' | 'suspended';
  created_at?: string;
}

export interface Product {
  id: string;
  seller_id: string;
  seller_name?: string;
  shop_id?: string;
  title: string;
  title_en?: string;
  title_am?: string;
  description: string;
  description_en?: string;
  description_am?: string;
  price: number; // in ETB (Ethiopian Birr)
  original_price?: number;
  category_id: string;
  category_name?: string;
  images: string[];
  stock: number;
  condition: ProductCondition; // Exactly 'new' or 'used'
  is_featured?: boolean;
  rating?: number;
  reviews_count?: number;
  specifications?: Record<string, any>;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customer_id?: string;
  user_id?: string;
  customer_name: string;
  customer_phone: string;
  city?: string;
  customer_city?: string;
  delivery_address?: string;
  customer_address?: string;
  items: CartItem[];
  subtotal?: number;
  shipping_fee?: number;
  discount?: number;
  total_etb?: number;
  total?: number;
  payment_method: 'telebirr' | 'cbe_birr' | 'cash_on_delivery' | 'bank_transfer' | 'card';
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
}

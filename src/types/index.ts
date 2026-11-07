export type Language = 'am' | 'en' | 'ti';

export type ProductCondition = 'new' | 'used';

export interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin' | 'seller' | 'buyer';
  created_at?: string;
}

export interface Category {
  id: number;
  slug: string;
  name_am: string;
  name_en: string;
  name_ti: string;
  icon?: string;
}

export interface Product {
  id: number;
  user_id: number;
  name: string;
  category_slug: string;
  description: string;
  price: number;
  condition: ProductCondition;
  image_url: string;
  region: string;
  district: string;
  city: string;
  seller_name: string;
  seller_phone: string;
  status: 'active' | 'inactive' | 'sold';
  created_at: string;
}

export interface Inquiry {
  id: number;
  product_id: number;
  product_name?: string;
  customer_name: string;
  customer_contact: string;
  message: string;
  status: 'pending' | 'contacted' | 'resolved';
  created_at: string;
}

export interface AdminStats {
  totalProducts: number;
  newProductsCount: number;
  usedProductsCount: number;
  totalInquiries: number;
  pendingInquiries: number;
  totalUsers: number;
}

/**
 * MELA MARKET - Multi-Vendor Database Types
 * Compatible with PostgreSQL & Supabase Database Tables:
 * - profiles (roles: customer, seller, admin)
 * - shops (multi-vendor storefronts)
 * - categories
 * - products (with seller_id and approval_status)
 * - orders
 * - order_items (with seller_id and fulfillment_status)
 * - cart_items
 * - reviews
 */

export type UserRole = 'customer' | 'seller' | 'admin';

export interface Profile {
  id: string; // matches auth.users id (UUID)
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  created_at: string;
  updated_at: string;
}

export type ShopStatus = 'approved' | 'pending' | 'rejected' | 'suspended' | 'active' | 'pending_approval';

export interface Shop {
  id: string;
  user_id: string; // Profile.id of the vendor
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  banner_url: string;
  phone: string;
  email: string;
  city: string;
  address?: string;
  status: ShopStatus;
  rating: number;
  review_count: number;
  total_sales: number;
  verified: boolean;
  created_at: string;
  updated_at: string;
  // Joined relation:
  owner?: Profile;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url: string;
  icon: string;
  item_count?: number;
  created_at: string;
}

export type ProductAvailability = 'in_stock' | 'low_stock' | 'out_of_stock';
export type ProductApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Product {
  id: string;
  category_id: string;
  seller_id?: string; // Shop ID
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  price: number;
  discount_price?: number | null;
  image_url: string;
  images: string[];
  stock_quantity: number;
  availability_status: ProductAvailability;
  approval_status?: ProductApprovalStatus;
  rating: number;
  review_count: number;
  brand?: string;
  condition?: 'brand_new' | 'used' | 'refurbished';
  is_featured?: boolean;
  is_trending?: boolean;
  is_on_sale?: boolean;
  tags?: string[];
  specifications?: Record<string, string>;
  created_at: string;
  updated_at: string;
  // Joined relations:
  category?: Category;
  shop?: Shop;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type FulfillmentStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface ShippingAddress {
  full_name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  delivery_notes?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  seller_id?: string; // Multi-vendor shop ID
  shop_name?: string;
  product_name: string;
  product_image: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  fulfillment_status?: FulfillmentStatus;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  shipping_fee: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  shipping_address: ShippingAddress;
  shipping_method: string;
  payment_method: string;
  payment_status: PaymentStatus;
  tracking_number?: string;
  notes?: string;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  user_id?: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product: Product;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  comment: string;
  created_at: string;
}

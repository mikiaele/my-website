/**
 * MELA MARKET - Multi-Vendor API & Data Access Layer
 * Supports customers, independent sellers/vendors, and administrators.
 * Designed for both React Web and React Native / Expo Android applications.
 */

import { getSupabaseClient } from './supabase.ts';
import {
  Category,
  Product,
  Order,
  OrderItem,
  Profile,
  Review,
  Shop,
  ShopStatus,
  OrderStatus,
  FulfillmentStatus,
  UserRole,
} from '../types/database.types.ts';
import { FilterState } from '../types/index.ts';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_SHOPS,
  DEMO_PROFILES,
} from '../data/initialData.ts';

// Local storage keys
const STORAGE_PRODUCTS = 'mela_market_products';
const STORAGE_CATEGORIES = 'mela_market_categories';
const STORAGE_SHOPS = 'mela_market_shops';
const STORAGE_ORDERS = 'mela_market_orders';
const STORAGE_PROFILES = 'mela_market_profiles';
const STORAGE_REVIEWS = 'mela_market_reviews';

function initLocalStorage() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_SHOPS)) {
    localStorage.setItem(STORAGE_SHOPS, JSON.stringify(INITIAL_SHOPS));
  }
  if (!localStorage.getItem(STORAGE_CATEGORIES)) {
    localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  }
  if (!localStorage.getItem(STORAGE_PRODUCTS)) {
    localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem(STORAGE_PROFILES)) {
    localStorage.setItem(STORAGE_PROFILES, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_ORDERS)) {
    const sampleOrders: Order[] = [
      {
        id: 'ord-1001',
        user_id: 'usr-customer-1',
        order_number: 'MM-2026-9041',
        status: 'delivered',
        subtotal: 249.99,
        shipping_fee: 0,
        tax_amount: 22.50,
        discount_amount: 50.00,
        total_amount: 222.49,
        shipping_method: 'Standard Express (2-3 business days)',
        payment_method: 'Credit Card (•••• 4242)',
        payment_status: 'paid',
        tracking_number: 'TRK-98421035MELA',
        shipping_address: {
          full_name: 'Sarah Jenkins (ሳራ ጄንኪንስ)',
          email: 'sarah.jenkins@example.com',
          phone: '+1 (555) 234-5678',
          address_line1: '742 Evergreen Terrace',
          city: 'Seattle',
          state: 'WA',
          postal_code: '98101',
          country: 'United States',
        },
        items: [
          {
            id: 'item-101',
            order_id: 'ord-1001',
            product_id: 'prod-1',
            seller_id: 'shop-3',
            shop_name: 'Aether Precision Audio & Tech',
            product_name: 'Aether Pro Wireless ANC Headphones (የጆሮ ማዳመጫ)',
            product_image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
            unit_price: 199.99,
            quantity: 1,
            total_price: 199.99,
            fulfillment_status: 'delivered',
            created_at: '2026-02-14T10:00:00Z',
          },
        ],
        created_at: '2026-02-14T10:00:00Z',
        updated_at: '2026-02-16T15:30:00Z',
      },
      {
        id: 'ord-1002',
        user_id: 'usr-customer-1',
        order_number: 'MM-2026-9042',
        status: 'shipped',
        subtotal: 100.50,
        shipping_fee: 0,
        tax_amount: 9.05,
        discount_amount: 0,
        total_amount: 109.55,
        shipping_method: 'Standard Delivery',
        payment_method: 'Credit Card (•••• 4242)',
        payment_status: 'paid',
        tracking_number: 'TRK-77123908MELA',
        shipping_address: {
          full_name: 'Sarah Jenkins (ሳራ ጄንኪንስ)',
          email: 'sarah.jenkins@example.com',
          phone: '+1 (555) 234-5678',
          address_line1: '742 Evergreen Terrace',
          city: 'Seattle',
          state: 'WA',
          postal_code: '98101',
          country: 'United States',
        },
        items: [
          {
            id: 'item-102',
            order_id: 'ord-1002',
            product_id: 'prod-2',
            seller_id: 'shop-2',
            shop_name: 'Yirgacheffe Organic Highlands',
            product_name: 'Single-Origin Yirgacheffe Reserve Coffee 1kg (ይርጋጨፌ ቡና)',
            product_image: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=400&q=80',
            unit_price: 36.50,
            quantity: 2,
            total_price: 73.00,
            fulfillment_status: 'shipped',
            created_at: '2026-02-28T14:20:00Z',
          },
          {
            id: 'item-103',
            order_id: 'ord-1002',
            product_id: 'prod-10',
            seller_id: 'shop-2',
            shop_name: 'Yirgacheffe Organic Highlands',
            product_name: 'Mountain Wildflower Honey & Royal Jelly 500g (ማር)',
            product_image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80',
            unit_price: 28.00,
            quantity: 1,
            total_price: 28.00,
            fulfillment_status: 'shipped',
            created_at: '2026-02-28T14:20:00Z',
          },
        ],
        created_at: '2026-02-28T14:20:00Z',
        updated_at: '2026-03-01T08:15:00Z',
      },
    ];
    localStorage.setItem(STORAGE_ORDERS, JSON.stringify(sampleOrders));
  }
}

initLocalStorage();

// ==========================================
// MULTI-VENDOR SHOPS / SELLERS API
// ==========================================
export async function getShops(status?: ShopStatus): Promise<Shop[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      let query = supabase.from('shops').select('*');
      if (status) query = query.eq('status', status);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as Shop[];
    } catch (e) {
      console.warn('Supabase getShops failed, using local store:', e);
    }
  }

  const raw = localStorage.getItem(STORAGE_SHOPS);
  const list: Shop[] = raw ? JSON.parse(raw) : INITIAL_SHOPS;
  if (status) return list.filter((s) => s.status === status);
  return list;
}

export async function getShopById(id: string): Promise<Shop | null> {
  const shops = await getShops();
  return shops.find((s) => s.id === id) || null;
}

export async function getShopBySlug(slug: string): Promise<Shop | null> {
  const shops = await getShops();
  return shops.find((s) => s.slug === slug) || null;
}

export async function getShopByUserId(userId: string): Promise<Shop | null> {
  const shops = await getShops();
  return shops.find((s) => s.user_id === userId) || null;
}

export async function createShop(
  shopData: Omit<Shop, 'id' | 'created_at' | 'updated_at' | 'rating' | 'review_count' | 'total_sales' | 'verified'>
): Promise<Shop> {
  const now = new Date().toISOString();
  const newShop: Shop = {
    ...shopData,
    id: 'shop-' + Math.random().toString(36).substring(2, 9),
    rating: 5.0,
    review_count: 0,
    total_sales: 0,
    verified: false,
    created_at: now,
    updated_at: now,
  };

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('shops').insert(newShop).select().single();
      if (!error && data) return data as Shop;
    } catch (e) {
      console.warn('Supabase createShop error:', e);
    }
  }

  const list = await getShops();
  list.push(newShop);
  localStorage.setItem(STORAGE_SHOPS, JSON.stringify(list));

  // Also promote the user to seller role in profiles
  await updateProfile(shopData.user_id, { role: 'seller' });

  return newShop;
}

export async function updateShop(id: string, updates: Partial<Shop>): Promise<Shop | null> {
  const now = new Date().toISOString();
  const cleanUpdates = { ...updates, updated_at: now };

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('shops').update(cleanUpdates).eq('id', id).select().single();
      if (!error && data) return data as Shop;
    } catch (e) {
      console.warn('Supabase updateShop error:', e);
    }
  }

  const list = await getShops();
  const index = list.findIndex((s) => s.id === id);
  if (index === -1) return null;

  list[index] = { ...list[index], ...cleanUpdates };
  localStorage.setItem(STORAGE_SHOPS, JSON.stringify(list));
  return list[index];
}

export async function updateShopStatus(shopId: string, status: ShopStatus): Promise<Shop | null> {
  return updateShop(shopId, {
    status,
    verified: status === 'approved',
  });
}

// ==========================================
// CATEGORIES API
// ==========================================
export async function getCategories(): Promise<Category[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (!error && data && data.length > 0) return data as Category[];
    } catch (e) {
      console.warn('Supabase getCategories failed:', e);
    }
  }

  const raw = localStorage.getItem(STORAGE_CATEGORIES);
  return raw ? JSON.parse(raw) : INITIAL_CATEGORIES;
}

export async function createCategory(cat: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
  const newCat: Category = {
    ...cat,
    id: 'cat-' + Math.random().toString(36).substring(2, 9),
    created_at: new Date().toISOString(),
  };

  const list = await getCategories();
  list.push(newCat);
  localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(list));
  return newCat;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
  const list = await getCategories();
  const index = list.findIndex((c) => c.id === id);
  if (index === -1) return null;
  list[index] = { ...list[index], ...updates };
  localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(list));
  return list[index];
}

export async function deleteCategory(id: string): Promise<boolean> {
  const list = await getCategories();
  const filtered = list.filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(filtered));
  return true;
}

// ==========================================
// PRODUCTS API (with Shop relation & seller filter)
// ==========================================
export async function getProducts(filters?: Partial<FilterState> & { includeUnapproved?: boolean }): Promise<Product[]> {
  const [categories, shops] = await Promise.all([getCategories(), getShops()]);
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const shopMap = new Map(shops.map((s) => [s.id, s]));

  // 1. Load local persistent storage products
  const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_PRODUCTS) : null;
  const localList: Product[] = raw ? JSON.parse(raw) : INITIAL_PRODUCTS;

  // Use a map to merge items, ensuring no duplicates and preserving seller-published products
  const productMap = new Map<string, Product>();

  // Seed with initial products
  for (const item of INITIAL_PRODUCTS) {
    productMap.set(item.id, item);
  }

  // Merge local list (this has any seller products created locally)
  for (const item of localList) {
    productMap.set(item.id, item);
  }

  // 2. Query Supabase PostgreSQL if client is active
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      let query = supabase.from('products').select('*');
      if (filters?.sellerId) query = query.eq('seller_id', filters.sellerId);
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        for (const item of data as Product[]) {
          // Merge Supabase product
          productMap.set(item.id, {
            ...productMap.get(item.id),
            ...item,
          });
        }
      }
    } catch (e) {
      console.warn('Supabase getProducts failed, using local store:', e);
    }
  }

  // 3. Resolve relations (category & shop) and default flags
  let products: Product[] = Array.from(productMap.values()).map((p) => {
    const resolvedShop = p.seller_id ? shopMap.get(p.seller_id) || shops.find((s) => s.id === p.seller_id) : undefined;
    return {
      ...p,
      approval_status: p.approval_status || 'approved',
      availability_status: p.availability_status || 'in_stock',
      is_featured: p.is_featured !== undefined ? p.is_featured : true,
      category: categoryMap.get(p.category_id),
      shop: resolvedShop,
    };
  });

  // 4. Default approval filter:
  // If viewing publicly (no specific sellerId and not admin mode), exclude rejected products
  if (!filters?.sellerId && !filters?.includeUnapproved) {
    products = products.filter((p) => p.approval_status !== 'rejected');
  }

  // Filter by seller ID
  if (filters?.sellerId) {
    products = products.filter((p) => p.seller_id === filters.sellerId);
  }

  // Category filter
  if (filters?.categorySlug) {
    products = products.filter(
      (p) => p.category?.slug === filters.categorySlug || p.category_id === filters.categorySlug
    );
  }

  // Price range
  if (filters?.minPrice !== undefined) {
    products = products.filter((p) => (p.discount_price ?? p.price) >= (filters.minPrice ?? 0));
  }
  if (filters?.maxPrice !== undefined && filters.maxPrice > 0) {
    products = products.filter((p) => (p.discount_price ?? p.price) <= (filters.maxPrice ?? 10000));
  }

  // In stock
  if (filters?.inStockOnly) {
    products = products.filter((p) => p.availability_status !== 'out_of_stock' && p.stock_quantity > 0);
  }

  // On sale
  if (filters?.onSaleOnly) {
    products = products.filter((p) => p.is_on_sale || (p.discount_price && p.discount_price < p.price));
  }

  // Rating
  if (filters?.rating && filters.rating > 0) {
    products = products.filter((p) => p.rating >= (filters.rating ?? 0));
  }

  // Search query
  if (filters?.searchQuery) {
    const q = filters.searchQuery.toLowerCase().trim();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.shop?.name.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }

  // Sorting
  switch (filters?.sortBy) {
    case 'price_asc':
      products.sort((a, b) => (a.discount_price ?? a.price) - (b.discount_price ?? b.price));
      break;
    case 'price_desc':
      products.sort((a, b) => (b.discount_price ?? b.price) - (a.discount_price ?? a.price));
      break;
    case 'rating':
      products.sort((a, b) => b.rating - a.rating);
      break;
    case 'newest':
      products.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      break;
    case 'featured':
    default:
      products.sort((a, b) => {
        if ((b.is_featured ? 1 : 0) !== (a.is_featured ? 1 : 0)) {
          return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      break;
  }

  return products;
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.id === id) || null;
}

export function getAuthenticatedCaller(): { userId: string; role: UserRole; shopId?: string } | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('mela_current_user');
  if (!raw) return null;
  try {
    const user = JSON.parse(raw) as Profile;
    const rawShops = localStorage.getItem(STORAGE_SHOPS);
    const shops: Shop[] = rawShops ? JSON.parse(rawShops) : [];
    const shop = shops.find((s) => s.user_id === user.id);
    return {
      userId: user.id,
      role: user.role,
      shopId: shop?.id,
    };
  } catch (e) {
    return null;
  }
}

export async function createProduct(
  product: Omit<Product, 'id' | 'created_at' | 'updated_at'>,
  authContext?: { userId: string; role: UserRole; shopId?: string }
): Promise<Product> {
  // Authorization enforcement:
  const caller = authContext || getAuthenticatedCaller();
  if (!caller) {
    throw new Error('Authentication required: You must be signed in to add products.');
  }
  if (caller.role !== 'seller' && caller.role !== 'admin') {
    throw new Error('Unauthorized: Only registered sellers and administrators can create products.');
  }

  // Ensure seller can only add products to their own store
  if (caller.role === 'seller') {
    if (!caller.shopId) {
      throw new Error('Unauthorized: You must have an approved store to upload products.');
    }
    product.seller_id = caller.shopId;
  }

  const now = new Date().toISOString();
  const slug = product.name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const id = 'prod-' + Math.random().toString(36).substring(2, 9);
  const images = product.images && product.images.length > 0 ? product.images : [product.image_url];
  const approvalStatus = product.approval_status || 'approved';

  const newProd: Product = {
    ...product,
    id,
    slug: `${slug}-${Math.floor(Math.random() * 900 + 100)}`,
    images,
    approval_status: approvalStatus,
    is_featured: product.is_featured !== undefined ? product.is_featured : true,
    is_trending: product.is_trending !== undefined ? product.is_trending : true,
    is_on_sale: product.is_on_sale !== undefined ? product.is_on_sale : (!!product.discount_price && Number(product.discount_price) < Number(product.price)),
    created_at: now,
    updated_at: now,
  };

  // 1. Supabase PostgreSQL insert if connected
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      // Exclude virtual relational properties
      const { category, shop, ...dbPayload } = newProd;
      const { data, error } = await supabase.from('products').insert([dbPayload]).select().single();
      if (!error && data) {
        newProd.id = data.id;
      } else if (error) {
        console.warn('Supabase createProduct warning:', error.message);
      }
    } catch (err) {
      console.warn('Supabase createProduct exception:', err);
    }
  }

  // 2. Persist in local storage
  const raw = localStorage.getItem(STORAGE_PRODUCTS);
  const list: Product[] = raw ? JSON.parse(raw) : INITIAL_PRODUCTS;
  const existingIdx = list.findIndex((p) => p.id === newProd.id);
  if (existingIdx >= 0) {
    list[existingIdx] = newProd;
  } else {
    list.unshift(newProd);
  }
  localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(list));

  // 3. Dispatch real-time update event so all components immediately sync
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mela:products-updated', { detail: newProd }));
  }

  return newProd;
}

export async function updateProduct(
  id: string,
  updates: Partial<Product>,
  authContext?: { userId: string; role: UserRole; shopId?: string }
): Promise<Product | null> {
  const isInventoryDeduction = updates.stock_quantity !== undefined && Object.keys(updates).length <= 2;

  if (!isInventoryDeduction) {
    const caller = authContext || getAuthenticatedCaller();
    if (!caller) {
      throw new Error('Authentication required: You must be signed in to edit products.');
    }
    if (caller.role !== 'seller' && caller.role !== 'admin') {
      throw new Error('Unauthorized: Only registered sellers and administrators can edit products.');
    }

    if (caller.role === 'seller') {
      const existingProduct = await getProductById(id);
      if (!existingProduct) {
        throw new Error('Product not found.');
      }
      if (existingProduct.seller_id !== caller.shopId) {
        throw new Error('Forbidden: You can only edit products belonging to your own store.');
      }
      // Never allow seller to alter store ownership
      delete updates.seller_id;
    }
  }

  const now = new Date().toISOString();
  const cleanUpdates = { ...updates, updated_at: now };

  // Exclude virtual joined relation properties
  const { category, shop, ...dbUpdates } = cleanUpdates;

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('products').update(dbUpdates).eq('id', id).select().single();
      if (error) {
        console.warn('Supabase updateProduct warning:', error.message);
      }
    } catch (err) {
      console.warn('Supabase updateProduct exception:', err);
    }
  }

  const raw = localStorage.getItem(STORAGE_PRODUCTS);
  const list: Product[] = raw ? JSON.parse(raw) : INITIAL_PRODUCTS;
  const index = list.findIndex((p) => p.id === id);
  if (index === -1) return null;

  list[index] = { ...list[index], ...cleanUpdates };
  localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(list));

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mela:products-updated', { detail: list[index] }));
  }

  return list[index];
}

export async function deleteProduct(
  id: string,
  authContext?: { userId: string; role: UserRole; shopId?: string }
): Promise<boolean> {
  const caller = authContext || getAuthenticatedCaller();
  if (!caller) {
    throw new Error('Authentication required: You must be signed in to delete products.');
  }
  if (caller.role !== 'seller' && caller.role !== 'admin') {
    throw new Error('Unauthorized: Only registered sellers and administrators can delete products.');
  }

  if (caller.role === 'seller') {
    const existingProduct = await getProductById(id);
    if (!existingProduct) {
      throw new Error('Product not found.');
    }
    if (existingProduct.seller_id !== caller.shopId) {
      throw new Error('Forbidden: You can only delete products belonging to your own store.');
    }
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        console.warn('Supabase deleteProduct warning:', error.message);
      }
    } catch (err) {
      console.warn('Supabase deleteProduct exception:', err);
    }
  }

  const raw = localStorage.getItem(STORAGE_PRODUCTS);
  const list: Product[] = raw ? JSON.parse(raw) : INITIAL_PRODUCTS;
  const filtered = list.filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(filtered));

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mela:products-updated', { detail: { id } }));
  }

  return true;
}

// ==========================================
// ORDERS & MULTI-VENDOR ROUTING
// ==========================================
export async function getOrders(userId?: string): Promise<Order[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      let query = supabase.from('orders').select('*, items:order_items(*)').order('created_at', { ascending: false });
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as Order[];
      }
    } catch (err) {
      console.warn('Supabase getOrders warning:', err);
    }
  }

  const raw = localStorage.getItem(STORAGE_ORDERS);
  const list: Order[] = raw ? JSON.parse(raw) : [];
  if (userId) {
    return list.filter((o) => o.user_id === userId);
  }
  return list;
}

export async function getSellerOrders(sellerShopId: string): Promise<Order[]> {
  const allOrders = await getOrders();
  // Filter orders that have items sold by this shop
  return allOrders.filter((order) =>
    order.items?.some((item) => item.seller_id === sellerShopId)
  );
}

export async function createOrder(
  orderInput: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>,
  items: Omit<OrderItem, 'id' | 'order_id' | 'created_at'>[]
): Promise<Order> {
  const now = new Date().toISOString();
  const orderId = 'ord-' + Math.random().toString(36).substring(2, 9);
  const orderNumber = `MM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const orderItems: OrderItem[] = items.map((item, idx) => ({
    ...item,
    id: `item-${orderId}-${idx + 1}`,
    order_id: orderId,
    fulfillment_status: 'pending',
    created_at: now,
  }));

  const newOrder: Order = {
    ...orderInput,
    id: orderId,
    order_number: orderNumber,
    items: orderItems,
    created_at: now,
    updated_at: now,
  };

  // Try PostgreSQL insertion via Supabase
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { items: _, ...orderRow } = newOrder;
      const { error: orderError } = await supabase.from('orders').insert([orderRow]);
      if (!orderError) {
        await supabase.from('order_items').insert(orderItems);
      } else {
        console.warn('Supabase createOrder warning:', orderError.message);
      }
    } catch (err) {
      console.warn('Supabase createOrder exception:', err);
    }
  }

  const raw = localStorage.getItem(STORAGE_ORDERS);
  const list: Order[] = raw ? JSON.parse(raw) : [];
  list.unshift(newOrder);
  localStorage.setItem(STORAGE_ORDERS, JSON.stringify(list));

  // Deduct inventory stock
  for (const item of items) {
    const prod = await getProductById(item.product_id);
    if (prod) {
      const newStock = Math.max(0, prod.stock_quantity - item.quantity);
      await updateProduct(prod.id, {
        stock_quantity: newStock,
        availability_status: newStock === 0 ? 'out_of_stock' : newStock <= 5 ? 'low_stock' : 'in_stock',
      });
    }
  }

  return newOrder;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, trackingNumber?: string): Promise<Order | null> {
  const now = new Date().toISOString();
  const updates: Record<string, any> = {
    status,
    updated_at: now,
  };
  if (trackingNumber) updates.tracking_number = trackingNumber;

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('orders').update(updates).eq('id', orderId);
    } catch (err) {
      console.warn('Supabase updateOrderStatus warning:', err);
    }
  }

  const raw = localStorage.getItem(STORAGE_ORDERS);
  const list: Order[] = raw ? JSON.parse(raw) : [];
  const index = list.findIndex((o) => o.id === orderId);
  if (index === -1) return null;

  list[index] = {
    ...list[index],
    ...updates,
  };
  localStorage.setItem(STORAGE_ORDERS, JSON.stringify(list));
  return list[index];
}

export async function updateOrderItemFulfillment(
  orderId: string,
  itemId: string,
  status: FulfillmentStatus
): Promise<Order | null> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('order_items').update({ fulfillment_status: status }).eq('id', itemId);
    } catch (err) {
      console.warn('Supabase updateOrderItemFulfillment warning:', err);
    }
  }

  const raw = localStorage.getItem(STORAGE_ORDERS);
  const list: Order[] = raw ? JSON.parse(raw) : [];
  const orderIndex = list.findIndex((o) => o.id === orderId);
  if (orderIndex === -1) return null;

  const order = list[orderIndex];
  if (order.items) {
    order.items = order.items.map((it) => (it.id === itemId ? { ...it, fulfillment_status: status } : it));
  }
  order.updated_at = new Date().toISOString();
  list[orderIndex] = order;
  localStorage.setItem(STORAGE_ORDERS, JSON.stringify(list));
  return order;
}

// ==========================================
// PROFILES API
// ==========================================
export async function getProfiles(): Promise<Profile[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error && data && data.length > 0) {
        return data as Profile[];
      }
    } catch (err) {
      console.warn('Supabase getProfiles warning:', err);
    }
  }

  const raw = localStorage.getItem(STORAGE_PROFILES);
  return raw ? JSON.parse(raw) : DEMO_PROFILES;
}

export async function updateProfile(id: string, updates: Partial<Profile>): Promise<Profile | null> {
  const cleanUpdates = { ...updates, updated_at: new Date().toISOString() };

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('profiles').update(cleanUpdates).eq('id', id).select().single();
      if (!error && data) {
        // Continue to sync local storage
      }
    } catch (err) {
      console.warn('Supabase updateProfile warning:', err);
    }
  }

  const raw = localStorage.getItem(STORAGE_PROFILES);
  const list: Profile[] = raw ? JSON.parse(raw) : DEMO_PROFILES;
  const index = list.findIndex((p) => p.id === id);
  if (index === -1) return null;

  list[index] = { ...list[index], ...cleanUpdates };
  localStorage.setItem(STORAGE_PROFILES, JSON.stringify(list));
  return list[index];
}

// ==========================================
// REVIEWS API
// ==========================================
export async function getReviews(productId: string): Promise<Review[]> {
  const raw = localStorage.getItem(STORAGE_REVIEWS);
  const all: Review[] = raw ? JSON.parse(raw) : [];
  return all.filter((r) => r.product_id === productId);
}

export async function addReview(review: Omit<Review, 'id' | 'created_at'>): Promise<Review> {
  const newRev: Review = {
    ...review,
    id: 'rev-' + Math.random().toString(36).substring(2, 9),
    created_at: new Date().toISOString(),
  };

  const raw = localStorage.getItem(STORAGE_REVIEWS);
  const all: Review[] = raw ? JSON.parse(raw) : [];
  all.unshift(newRev);
  localStorage.setItem(STORAGE_REVIEWS, JSON.stringify(all));
  return newRev;
}

export function resetDatabaseToDefaults() {
  localStorage.setItem(STORAGE_SHOPS, JSON.stringify(INITIAL_SHOPS));
  localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  localStorage.setItem(STORAGE_PROFILES, JSON.stringify(DEMO_PROFILES));
  localStorage.removeItem(STORAGE_ORDERS);
  localStorage.removeItem(STORAGE_REVIEWS);
  initLocalStorage();
}

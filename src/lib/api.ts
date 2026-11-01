import { Category, Product, Order, ProductCondition } from '../types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from './constants';
import { getSupabase } from './supabase';

const LOCAL_PRODUCTS_KEY = 'mela_local_products';
const LOCAL_ORDERS_KEY = 'mela_local_orders';

// Helper to get local stored products
const getLocalProducts = (): Product[] => {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  const saved = localStorage.getItem(LOCAL_PRODUCTS_KEY);
  if (!saved) {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return INITIAL_PRODUCTS;
  }
};

const saveLocalProducts = (products: Product[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
  }
};

export const api = {
  // 1. Categories
  async getCategories(): Promise<Category[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('categories').select('*').order('name_en');
        if (!error && data && data.length > 0) {
          return data as Category[];
        }
      } catch (err) {
        console.warn('Supabase getCategories failed, falling back to local categories:', err);
      }
    }
    return INITIAL_CATEGORIES;
  },

  // 2. Products
  async getProducts(): Promise<Product[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          // Normalize condition if null or empty
          const normalized = data.map((item: any) => ({
            ...item,
            condition: (item.condition === 'used' ? 'used' : 'new') as ProductCondition,
            images: Array.isArray(item.images) ? item.images : [item.image_url || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e'],
          }));
          return normalized as Product[];
        }
      } catch (err) {
        console.warn('Supabase getProducts failed, falling back to local storage:', err);
      }
    }
    return getLocalProducts();
  },

  // 3. Create Product (Seller flow)
  async createProduct(
    productInput: Omit<Product, 'id' | 'created_at'>,
    authenticatedUserId: string,
    sellerDisplayName: string
  ): Promise<Product> {
    const newId = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newProduct: Product = {
      ...productInput,
      id: newId,
      seller_id: authenticatedUserId, // Authenticated user ID (never trusted blindly from client)
      seller_name: sellerDisplayName,
      condition: productInput.condition === 'used' ? 'used' : 'new',
      created_at: new Date().toISOString(),
      rating: 5.0,
      reviews_count: 0,
      images: productInput.images && productInput.images.length > 0
        ? productInput.images
        : ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80'],
    };

    // Attempt Supabase insert
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('products').insert([
          {
            id: newProduct.id,
            seller_id: newProduct.seller_id,
            seller_name: newProduct.seller_name,
            category_id: newProduct.category_id,
            title_en: newProduct.title_en,
            title_am: newProduct.title_am,
            description_en: newProduct.description_en,
            description_am: newProduct.description_am,
            price: newProduct.price,
            stock: newProduct.stock,
            condition: newProduct.condition, // Persist 'new' | 'used'
            images: newProduct.images,
            is_featured: newProduct.is_featured || false,
          },
        ]).select().single();

        if (error) {
          console.warn('Supabase createProduct returned error, keeping in local storage:', error.message);
        } else if (data) {
          newProduct.id = data.id;
        }
      } catch (err) {
        console.warn('Supabase insert failed:', err);
      }
    }

    // Always update local cached products so user sees immediate results
    const current = getLocalProducts();
    const updated = [newProduct, ...current];
    saveLocalProducts(updated);

    return newProduct;
  },

  // 4. Update Product
  async updateProduct(id: string, updates: Partial<Product>, sellerId: string): Promise<Product | null> {
    const current = getLocalProducts();
    const index = current.findIndex((p) => p.id === id && (p.seller_id === sellerId || sellerId === 'admin'));
    if (index === -1) return null;

    const updatedProduct = {
      ...current[index],
      ...updates,
      condition: updates.condition ? (updates.condition === 'used' ? 'used' : 'new') : current[index].condition,
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase
          .from('products')
          .update({
            title_en: updatedProduct.title_en,
            title_am: updatedProduct.title_am,
            description_en: updatedProduct.description_en,
            description_am: updatedProduct.description_am,
            price: updatedProduct.price,
            stock: updatedProduct.stock,
            condition: updatedProduct.condition,
            category_id: updatedProduct.category_id,
            images: updatedProduct.images,
          })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase updateProduct failed:', err);
      }
    }

    current[index] = updatedProduct;
    saveLocalProducts(current);
    return updatedProduct;
  },

  // 5. Delete Product
  async deleteProduct(id: string, sellerId: string): Promise<boolean> {
    const current = getLocalProducts();
    const filtered = current.filter((p) => !(p.id === id && (p.seller_id === sellerId || sellerId === 'admin')));

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('products').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteProduct error:', err);
      }
    }

    saveLocalProducts(filtered);
    return true;
  },

  // 6. Orders
  async createOrder(orderInput: Omit<Order, 'id' | 'created_at'>): Promise<Order> {
    const orderId = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const newOrder: Order = {
      ...orderInput,
      id: orderId,
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('orders').insert([
          {
            id: newOrder.id,
            user_id: newOrder.user_id || null,
            customer_name: newOrder.customer_name,
            customer_phone: newOrder.customer_phone,
            customer_city: newOrder.customer_city,
            customer_address: newOrder.customer_address,
            subtotal: newOrder.subtotal,
            shipping_fee: newOrder.shipping_fee,
            discount: newOrder.discount,
            total: newOrder.total,
            payment_method: newOrder.payment_method,
            status: newOrder.status,
          },
        ]);
      } catch (err) {
        console.warn('Supabase createOrder error:', err);
      }
    }

    if (typeof window !== 'undefined') {
      const existing = JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || '[]');
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify([newOrder, ...existing]));
    }

    return newOrder;
  },

  async getOrders(): Promise<Order[]> {
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem(LOCAL_ORDERS_KEY);
      if (existing) {
        try {
          return JSON.parse(existing);
        } catch {}
      }
    }
    return [];
  },
};

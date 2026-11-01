import { createClient } from '@supabase/supabase-js';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '../data/mockData';
import { Category, Product, Profile, Shop } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Detect if real Supabase credentials are configured
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project') &&
  supabaseUrl.startsWith('http')
);

// Real client when credentials exist
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ============================================================================
// LOCAL STORAGE KEYS & IN-MEMORY FALLBACK (Seamless preview & local development)
// ============================================================================
const PRODUCTS_KEY = 'mela_products_v1';
const CATEGORIES_KEY = 'mela_categories_v1';
const PROFILES_KEY = 'mela_profiles_v1';
const SHOPS_KEY = 'mela_shops_v1';
const CURRENT_USER_KEY = 'mela_current_user_v1';

function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Failed to save to localStorage', err);
  }
}

// Initialize seed data if not present
if (!localStorage.getItem(PRODUCTS_KEY)) {
  setStored(PRODUCTS_KEY, INITIAL_PRODUCTS);
}
if (!localStorage.getItem(CATEGORIES_KEY)) {
  setStored(CATEGORIES_KEY, INITIAL_CATEGORIES);
}

// Pre-seeded demo sellers for testing
const DEFAULT_PROFILES: Profile[] = [
  {
    id: 'seller-abebe',
    email: 'abebe@melamarket.et',
    full_name: 'Abebe Bikila',
    phone: '+251 911 234 567',
    city: 'Addis Ababa',
    role: 'seller',
  },
  {
    id: 'admin-mela',
    email: 'admin@melamarket.et',
    full_name: 'Mela Marketplace Admin',
    phone: '+251 922 999 888',
    city: 'Addis Ababa',
    role: 'admin',
  }
];

if (!localStorage.getItem(PROFILES_KEY)) {
  setStored(PROFILES_KEY, DEFAULT_PROFILES);
}

// Auto-created default shops linked to profiles
const DEFAULT_SHOPS: Shop[] = [
  {
    id: 'shop-abebe',
    seller_id: 'seller-abebe',
    name: "Abebe's Coffee Store",
    description: 'Specialty coffee roasters from Addis Ababa',
    city: 'Addis Ababa',
    is_verified: true,
  }
];

if (!localStorage.getItem(SHOPS_KEY)) {
  setStored(SHOPS_KEY, DEFAULT_SHOPS);
}

// ============================================================================
// DATA & AUTH API
// ============================================================================

export async function fetchCategories(): Promise<Category[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });
    if (!error && data && data.length > 0) {
      return data as Category[];
    }
  }
  return getStored<Category[]>(CATEGORIES_KEY, INITIAL_CATEGORIES);
}

export async function fetchProducts(): Promise<Product[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id,
          seller_id: item.seller_id,
          seller_name: item.seller_name || item.profiles?.full_name || 'Verified Seller',
          shop_id: item.shop_id,
          title: item.title_en || item.title || '',
          title_en: item.title_en || item.title || '',
          title_am: item.title_am || '',
          description: item.description_en || item.description || '',
          description_en: item.description_en || item.description || '',
          description_am: item.description_am || '',
          price: Number(item.price),
          category_id: item.category_id,
          images: Array.isArray(item.images) && item.images.length > 0
            ? item.images
            : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
          stock: Number(item.stock ?? 1),
          condition: (item.condition === 'used' ? 'used' : 'new') as 'new' | 'used',
          is_featured: Boolean(item.is_featured),
          created_at: item.created_at || new Date().toISOString(),
        }));
      }
    } catch (e) {
      console.warn('Error querying Supabase products:', e);
    }
  }
  return getStored<Product[]>(PRODUCTS_KEY, INITIAL_PRODUCTS);
}

export async function fetchSellerProducts(sellerId: string): Promise<Product[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((item: any) => ({
          ...item,
          price: Number(item.price),
          condition: (item.condition === 'used' ? 'used' : 'new') as 'new' | 'used',
        }));
      }
    } catch (e) {
      console.warn('Error querying seller products:', e);
    }
  }
  const all = getStored<Product[]>(PRODUCTS_KEY, INITIAL_PRODUCTS);
  return all.filter((p) => p.seller_id === sellerId);
}

export async function addProductToDb(
  productData: Omit<Product, 'id' | 'created_at' | 'seller_id' | 'seller_name'>,
  seller: Profile
): Promise<Product> {
  // Enforce condition choice is strictly 'new' or 'used'
  const condition: 'new' | 'used' = productData.condition === 'used' ? 'used' : 'new';
  const cleanTitle = productData.title.trim();
  const cleanDesc = productData.description.trim();

  if (isSupabaseConfigured && supabase) {
    // Look up auto-created shop for this seller
    let shopId: string | null = null;
    try {
      const { data: shopData } = await supabase
        .from('shops')
        .select('id')
        .or(`seller_id.eq.${seller.id},user_id.eq.${seller.id}`)
        .maybeSingle();

      if (shopData?.id) {
        shopId = shopData.id;
      } else {
        // Auto-provision shop behind the scenes if missing
        const cleanSlug = seller.full_name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + seller.id.slice(0, 4);
        const { data: createdShop } = await supabase
          .from('shops')
          .insert({
            user_id: seller.id,
            seller_id: seller.id,
            shop_name: `${seller.full_name}'s Store`,
            shop_slug: cleanSlug,
            city: seller.city || 'Addis Ababa',
            phone_number: seller.phone || seller.phone_number || '',
            status: 'active',
          })
          .select('id')
          .maybeSingle();
        if (createdShop?.id) shopId = createdShop.id;
      }
    } catch {}

    const insertPayload: Record<string, any> = {
      seller_id: seller.id,
      seller_name: seller.full_name,
      shop_id: shopId,
      category_id: productData.category_id,
      title: cleanTitle,
      title_en: cleanTitle,
      title_am: productData.title_am?.trim() || cleanTitle,
      description: cleanDesc,
      description_en: cleanDesc,
      description_am: productData.description_am?.trim() || cleanDesc,
      price: productData.price,
      images: productData.images.length > 0 ? productData.images : [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
      ],
      stock: Math.max(0, productData.stock),
      condition: condition,
      status: 'active',
      is_featured: false,
    };

    let { data, error } = await supabase
      .from('products')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      // Retry with core columns if optional columns differ
      const corePayload = {
        seller_id: seller.id,
        seller_name: seller.full_name,
        category_id: productData.category_id,
        title_en: cleanTitle,
        title_am: productData.title_am?.trim() || cleanTitle,
        description_en: cleanDesc,
        description_am: productData.description_am?.trim() || cleanDesc,
        price: productData.price,
        stock: Math.max(0, productData.stock),
        condition: condition,
        images: insertPayload.images,
      };
      const retry = await supabase.from('products').insert(corePayload).select().single();
      if (retry.error) {
        throw new Error(retry.error.message);
      }
      data = retry.data;
    }

    return {
      ...data,
      title: data.title_en || data.title || cleanTitle,
      description: data.description_en || data.description || cleanDesc,
      seller_name: data.seller_name || seller.full_name,
      condition: (data.condition === 'used' ? 'used' : 'new'),
      price: Number(data.price),
    };
  }

  // Local persistence fallback
  const newProduct: Product = {
    ...productData,
    id: 'prod-' + Date.now(),
    seller_id: seller.id,
    seller_name: seller.full_name,
    condition: condition,
    created_at: new Date().toISOString(),
  };

  const currentProducts = getStored<Product[]>(PRODUCTS_KEY, INITIAL_PRODUCTS);
  const updated = [newProduct, ...currentProducts];
  setStored(PRODUCTS_KEY, updated);
  return newProduct;
}

export async function updateProductInDb(
  productId: string,
  updates: Partial<Omit<Product, 'id' | 'created_at' | 'seller_id'>>,
  sellerId: string,
  isAdmin: boolean = false
): Promise<Product> {
  if (isSupabaseConfigured && supabase) {
    let query = supabase.from('products').update(updates).eq('id', productId);
    // Enforce RLS: seller can only update their own product unless admin
    if (!isAdmin) {
      query = query.eq('seller_id', sellerId);
    }
    const { data, error } = await query.select().single();
    if (error) throw new Error(error.message);
    return data as Product;
  }

  const all = getStored<Product[]>(PRODUCTS_KEY, INITIAL_PRODUCTS);
  const index = all.findIndex((p) => p.id === productId);
  if (index === -1) throw new Error('Product not found');

  // Verify ownership
  if (!isAdmin && all[index].seller_id !== sellerId) {
    throw new Error('Unauthorized: You can only edit your own products.');
  }

  const updatedProduct = {
    ...all[index],
    ...updates,
    condition: (updates.condition === 'used' ? 'used' : (updates.condition === 'new' ? 'new' : all[index].condition)),
  };
  all[index] = updatedProduct;
  setStored(PRODUCTS_KEY, all);
  return updatedProduct;
}

export async function deleteProductFromDb(
  productId: string,
  sellerId: string,
  isAdmin: boolean = false
): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    let query = supabase.from('products').delete().eq('id', productId);
    if (!isAdmin) {
      query = query.eq('seller_id', sellerId);
    }
    const { error } = await query;
    if (error) throw new Error(error.message);
    return;
  }

  const all = getStored<Product[]>(PRODUCTS_KEY, INITIAL_PRODUCTS);
  const product = all.find((p) => p.id === productId);
  if (!product) return;

  if (!isAdmin && product.seller_id !== sellerId) {
    throw new Error('Unauthorized: You can only delete your own products.');
  }

  const filtered = all.filter((p) => p.id !== productId);
  setStored(PRODUCTS_KEY, filtered);
}

// ============================================================================
// SIMPLIFIED SINGLE REGISTRATION FLOW:
// User enters: full_name, email, password, phone, city
// Account receives seller role automatically + linked safe shop auto-created.
// ============================================================================
export interface RegisterParams {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  city: string;
}

export async function registerUser(params: RegisterParams): Promise<{ profile: Profile; shop: Shop }> {
  const { email, password, fullName, phone, city } = params;

  if (isSupabaseConfigured && supabase) {
    // 1. Create Supabase Auth User with user metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          phone_number: phone,
          city,
          role: 'seller', // Receives seller permissions directly
        },
      },
    });

    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error('Failed to create account.');

    const userId = authData.user.id;
    const cleanSlug = fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + userId.slice(0, 4);

    // 2. Insert or verify profile with seller role
    const profilePayload: Profile = {
      id: userId,
      email,
      full_name: fullName,
      phone,
      phone_number: phone,
      city,
      role: 'seller',
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email,
        full_name: fullName,
        phone,
        phone_number: phone,
        city,
        role: 'seller',
      });

    if (profileError) {
      console.warn('Profile creation fallback:', profileError.message);
    }

    // 3. Automatically provision backend shop record with safe defaults
    // User is NEVER prompted to fill out a shop registration form!
    const shopPayload: any = {
      user_id: userId,
      seller_id: userId,
      name: `${fullName}'s Store`,
      shop_name: `${fullName}'s Store`,
      shop_slug: cleanSlug,
      description: 'Official seller store on Mela Market',
      city: city || 'Addis Ababa',
      phone_number: phone,
      status: 'active',
      is_verified: true,
    };

    const { data: shopData } = await supabase
      .from('shops')
      .upsert(shopPayload)
      .select()
      .maybeSingle();

    return {
      profile: profilePayload,
      shop: (shopData as Shop) || {
        id: 'shop-' + userId,
        ...shopPayload,
      },
    };
  }

  // Local/Offline Mode registration
  const profiles = getStored<Profile[]>(PROFILES_KEY, DEFAULT_PROFILES);
  const existing = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error('An account with this email already exists. Please log in.');
  }

  const userId = 'usr-' + Date.now();
  const newProfile: Profile = {
    id: userId,
    email,
    full_name: fullName,
    phone,
    city: city || 'Addis Ababa',
    role: 'seller', // Seller role by default!
  };

  const newShop: Shop = {
    id: 'shop-' + userId,
    seller_id: userId,
    name: `${fullName}'s Store`,
    description: 'Official seller store on Mela Market',
    city: city || 'Addis Ababa',
    is_verified: true,
  };

  profiles.push(newProfile);
  setStored(PROFILES_KEY, profiles);

  const shops = getStored<Shop[]>(SHOPS_KEY, DEFAULT_SHOPS);
  shops.push(newShop);
  setStored(SHOPS_KEY, shops);

  setStored(CURRENT_USER_KEY, newProfile);
  return { profile: newProfile, shop: newShop };
}

export async function loginUser(email: string, password?: string): Promise<{ profile: Profile; shop: Shop | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: password || 'Password123!',
    });
    if (authError) throw new Error(authError.message);

    const userId = authData.user.id;
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    const profile: Profile = profileData || {
      id: userId,
      email,
      full_name: authData.user.user_metadata?.full_name || email.split('@')[0],
      phone: authData.user.user_metadata?.phone || '',
      city: authData.user.user_metadata?.city || 'Addis Ababa',
      role: (authData.user.user_metadata?.role as any) || 'seller',
    };

    const { data: shopData } = await supabase
      .from('shops')
      .select('*')
      .or(`seller_id.eq.${userId},user_id.eq.${userId}`)
      .maybeSingle();

    let userShop = shopData;
    if (!userShop) {
      // Auto-provision safe default shop record if none exists yet!
      const cleanSlug = profile.full_name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + userId.slice(0, 4);
      const defaultShop = {
        user_id: userId,
        seller_id: userId,
        shop_name: `${profile.full_name}'s Store`,
        shop_slug: cleanSlug,
        city: profile.city || 'Addis Ababa',
        phone_number: profile.phone || profile.phone_number || '',
        status: 'active',
      };
      const { data: createdShop } = await supabase.from('shops').insert(defaultShop).select().maybeSingle();
      userShop = createdShop || defaultShop;
    }

    return { profile, shop: userShop as Shop | null };
  }

  // Local/Offline login
  const profiles = getStored<Profile[]>(PROFILES_KEY, DEFAULT_PROFILES);
  const found = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
  if (!found) {
    throw new Error('Account not found. Please register first.');
  }

  const shops = getStored<Shop[]>(SHOPS_KEY, DEFAULT_SHOPS);
  let shop = shops.find((s) => s.seller_id === found.id || s.user_id === found.id) || null;
  if (!shop) {
    shop = {
      id: 'shop-' + found.id,
      user_id: found.id,
      seller_id: found.id,
      name: `${found.full_name}'s Store`,
      shop_name: `${found.full_name}'s Store`,
      description: 'Official seller store on Mela Market',
      city: found.city || 'Addis Ababa',
      is_verified: true,
    };
    shops.push(shop);
    setStored(SHOPS_KEY, shops);
  }

  setStored(CURRENT_USER_KEY, found);
  return { profile: found, shop };
}

export function getCurrentStoredUser(): Profile | null {
  return getStored<Profile | null>(CURRENT_USER_KEY, null);
}

export function clearCurrentStoredUser(): void {
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
  } catch {}
}

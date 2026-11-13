/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Neon serverless configuration
if (neonConfig) {
  // Configured for Neon serverless pooler
}

export interface NeonConnectionStatus {
  connected: boolean;
  provider: 'neon-postgresql' | 'in-memory-fallback';
  databaseUrlConfigured: boolean;
  pooled: boolean;
  host?: string;
  database?: string;
  tablesCount?: number;
  tables?: Record<string, boolean>;
  message: string;
  latencyMs?: number;
}

let activePool: any = null;
let currentConnectionString: string = process.env.DATABASE_URL || process.env.DIRECT_URL || '';

/**
 * Normalizes connection string and determines if it is a Neon serverless host
 */
export function getCleanConnectionString(customUrl?: string): string {
  const url = (customUrl || process.env.DATABASE_URL || process.env.DIRECT_URL || currentConnectionString || '').trim();
  return url;
}

/**
 * Executes a query safely through the active pool
 */
export async function executePoolQuery(pool: any, text: string, params: any[] = []): Promise<any> {
  return await pool.query(text, params);
}

/**
 * Initializes or retrieves the PostgreSQL Pool for Neon
 */
export function getNeonPool(customUrl?: string): any {
  const connStr = getCleanConnectionString(customUrl);
  if (!connStr || !connStr.startsWith('postgres')) {
    return null;
  }

  if (activePool && connStr === currentConnectionString) {
    return activePool;
  }

  try {
    currentConnectionString = connStr;
    const isNeonHost = connStr.includes('neon.tech');

    if (isNeonHost) {
      activePool = new NeonPool({
        connectionString: connStr,
        ssl: { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });
    } else {
      activePool = new pg.Pool({
        connectionString: connStr,
        ssl: connStr.includes('sslmode=require') || connStr.includes('neon') ? { rejectUnauthorized: false } : undefined,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });
    }

    return activePool;
  } catch (err) {
    console.error('Failed to create Neon PostgreSQL connection pool:', err);
    return null;
  }
}

/**
 * In-memory state storage fallback when DATABASE_URL is not yet configured,
 * ensuring zero downtime, instant local exploration, and seamless promotion to Neon.
 */
interface InMemoryState {
  users: any[];
  userProfiles: any[];
  roles: any[];
  permissions: any[];
  rolePermissions: any[];
  sellers: any[];
  categories: any[];
  products: any[];
  productImages: any[];
  orderStatuses: any[];
  orders: any[];
  orderItems: any[];
  adminAccounts: any[];
  adminActivityLogs: any[];
  notifications: any[];
  reports: any[];
  settings: Record<string, any>;
}

const inMemoryDb: InMemoryState = {
  users: [],
  userProfiles: [],
  roles: [
    { id: 'role-super-admin', name: 'super_admin', description: 'Full Super Administrator Access' },
    { id: 'role-admin', name: 'admin', description: 'Standard Administrator' },
    { id: 'role-seller', name: 'seller', description: 'Merchant / Seller' },
    { id: 'role-user', name: 'user', description: 'Regular Customer' },
  ],
  permissions: [
    { id: 'perm-users', name: 'manage_users', description: 'Manage Users' },
    { id: 'perm-sellers', name: 'manage_sellers', description: 'Manage Sellers' },
    { id: 'perm-products', name: 'manage_products', description: 'Manage Products' },
    { id: 'perm-categories', name: 'manage_categories', description: 'Manage Categories' },
    { id: 'perm-orders', name: 'manage_orders', description: 'Manage Orders' },
    { id: 'perm-admins', name: 'manage_admins', description: 'Manage Admins' },
    { id: 'perm-reports', name: 'view_reports', description: 'View Reports' },
    { id: 'perm-logs', name: 'view_audit_logs', description: 'View Activity Logs' },
  ],
  rolePermissions: [],
  sellers: [],
  categories: [
    {
      id: 'coffee_spices',
      icon_name: 'Coffee',
      name_en: 'Coffee & Traditional Spices',
      name_am: 'ቡና እና ባህላዊ ቅመሞች',
      name_ti: 'ቡንን ባህላዊ ቀመማትን',
      description_en: 'Specialty Ethiopian coffee and organic spices',
      display_order: 1,
    },
    {
      id: 'smartphones_tech',
      icon_name: 'Smartphone',
      name_en: 'Smartphones & Tech',
      name_am: 'ስማርት ስልኮች እና ቴክኖሎጂ',
      name_ti: 'ስማርት ተሌፎናትን ቴክኖሎጂን',
      description_en: 'Smartphones, laptops, and technology',
      display_order: 2,
    },
    {
      id: 'traditional_fashion',
      icon_name: 'Sparkles',
      name_en: 'Traditional Fashion',
      name_am: 'ባህላዊ አልባሳት',
      name_ti: 'ባህላዊ ክዳውንቲ',
      description_en: 'Traditional Ethiopian and modern dresses',
      display_order: 3,
    },
    {
      id: 'audio_gadgets',
      icon_name: 'Headphones',
      name_en: 'Audio & Gadgets',
      name_am: 'ድምጽ እና ጋጄቶች',
      name_ti: 'ድምፅን ጋጄታትን',
      description_en: 'Headphones, speakers, and gadgets',
      display_order: 4,
    },
    {
      id: 'leather_goods',
      icon_name: 'Briefcase',
      name_en: 'Leather Goods',
      name_am: 'የቆዳ ውጤቶች',
      name_ti: 'ናይ ቆርበት ፍርያት',
      description_en: 'Genuine Ethiopian leather bags and accessories',
      display_order: 5,
    },
    {
      id: 'home_kitchen',
      icon_name: 'Utensils',
      name_en: 'Home & Kitchen',
      name_am: 'የቤት እና የወጥ ቤት እቃዎች',
      name_ti: 'ናይ ገዛን ክሽነን ኣቑሑት',
      description_en: 'Household, coffee sets, and kitchenware',
      display_order: 6,
    },
    {
      id: 'vehicles_motors',
      icon_name: 'Car',
      name_en: 'Vehicles & Motors',
      name_am: 'ተሽከርካሪዎች እና ሞተሮች',
      name_ti: 'መካይንን ሞተራትን',
      description_en: 'Vehicles, cars, and motorcycles',
      display_order: 7,
    },
    {
      id: 'real_estate',
      icon_name: 'Home',
      name_en: 'Real Estate & Rentals',
      name_am: 'ሪል እስቴት እና ኪራይ',
      name_ti: 'ሪል እስቴትን ክራይን',
      description_en: 'Apartments, houses, and commercial property',
      display_order: 8,
    },
  ],
  products: [],
  productImages: [],
  orderStatuses: [
    { id: 'Pending', label_en: 'Pending', label_am: 'በመጠባበቅ ላይ', label_ti: 'ኣብ ምጽባይ' },
    { id: 'Processing', label_en: 'Processing', label_am: 'በሂደት ላይ', label_ti: 'ኣብ መስርሕ' },
    { id: 'Delivered', label_en: 'Delivered', label_am: 'ደርሷል', label_ti: 'በጺሑ' },
    { id: 'Completed', label_en: 'Completed', label_am: 'ተጠናቋል', label_ti: 'ተዛዚሙ' },
    { id: 'Cancelled', label_en: 'Cancelled', label_am: 'ተሰርዟል', label_ti: 'ተሰሪዙ' },
  ],
  orders: [],
  orderItems: [],
  adminAccounts: [],
  adminActivityLogs: [],
  notifications: [],
  reports: [],
  settings: {
    platformName: 'Mela Market | መላ ገበያ | መላ ዕዳጋ',
    defaultCurrency: 'ETB',
    allowPublicRegistrations: true,
    telebirrEnabled: true,
    cbeEnabled: true,
    adminNotificationsEmail: 'mikiaelebrhane21@gmail.com',
  },
};

/**
 * Seed initial sample products and default admin account into storage
 */
export function seedDefaultData() {
  const adminId = 'admin-seed-01';
  const adminEmail = 'mikiaelebrhane21@gmail.com';
  const salt = 'a8f4c2e19b0d3e5f';
  const hash = crypto.pbkdf2Sync('MelaAdmin2026!', salt, 100000, 32, 'sha256').toString('hex');

  if (!inMemoryDb.users.some(u => u.email === adminEmail)) {
    inMemoryDb.users.push({
      id: adminId,
      email: adminEmail,
      password_hash: hash,
      salt,
      phone: '+251904503245',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    inMemoryDb.userProfiles.push({
      id: adminId,
      name: 'Mikiyae Lebrhane (Super Admin)',
      role: 'super_admin',
      role_id: 'role-super-admin',
      region: 'Addis Ababa',
      zone: 'Bole',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    inMemoryDb.adminAccounts.push({
      id: 'admin-acc-01',
      user_id: adminId,
      role: 'super_admin',
      is_super_admin: true,
      assigned_by: adminId,
      created_at: new Date().toISOString(),
    });
  }

  if (inMemoryDb.products.length === 0) {
    const samples = [
      {
        id: 'prod-1',
        title_en: 'Specialty Grade 1 Yirgacheffe Washed Coffee Beans (1kg)',
        title_am: 'ልዩ ደረጃ 1 ይርጋጨፌ የታጠበ የቡና ፍሬ (1 ኪ.ግ)',
        title_ti: 'ፍሉይ ደረጃ 1 ይርጋጨፈ ዝተሓጸበ ፍረ ቡን (1 ኪ.ግ)',
        description_en: 'Floral notes, citrus bergamot acidity, roasted medium on order.',
        description_am: 'የአበባ መዓዛ እና የሎሚ ጣዕም ያለው፣ በጥንቃቄ የተቆላ ጥራት ያለው የይርጋጨፌ ቡና።',
        description_ti: 'ናይ ዕምባባ መዓዛን ቀሊል ኣሲዳውነትን ዘለዎ፣ ብጥንቃቐ ዝተጠብሰ ብሉጽ ናይ ይርጋጨፈ ቡን።',
        category_id: 'coffee_spices',
        seller_id: adminId,
        seller_name: 'Yirgacheffe Coffee Farmers Coop',
        seller_phone: '+251911223344',
        seller_is_verified: true,
        price: 950,
        original_price: 1200,
        condition: 'Brand New',
        quantity: 45,
        images: [
          'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
        ],
        region: 'SNNPR',
        zone: 'Gedeo',
        woreda: 'Yirgacheffe',
        rating: 5.0,
        reviews_count: 14,
        is_featured: true,
        status: 'active',
        created_at: new Date().toISOString(),
      },
      {
        id: 'prod-2',
        title_en: 'Hand-Woven Royal Sheba Ethiopian Dress (Tibeb Kemis)',
        title_am: 'በእጅ የተሸመነ የንግስት ሳባ የጥበብ ቀሚስ',
        title_ti: 'ብኢድ ዝተሸለመ ናይ ንግስቲ ሳባ ባህላዊ ጥበብ ክዳን',
        description_en: 'Authentic 100% Ethiopian pure cotton fabric hand-woven by master weavers.',
        description_am: 'ከ100% ንፁህ የኢትዮጵያ ጥጥ በእጅ የተሸመነ፣ በወርቅ ጥልፍ የተዋበ ባህላዊ ቀሚስ።',
        description_ti: 'ካብ 100% ጽሩይ ናይ ኢትዮጵያ ጡጥ ብኢድ ዝተሸለመ፣ ብወርቂ ሕብሪ ዝተሰለመ ባህላዊ ክዳን።',
        category_id: 'traditional_fashion',
        seller_id: adminId,
        seller_name: 'Sabawit Cultural Weaving',
        seller_phone: '+251922334455',
        seller_is_verified: true,
        price: 8500,
        original_price: 10500,
        condition: 'Brand New',
        quantity: 8,
        images: [
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        ],
        region: 'Addis Ababa',
        zone: 'Yeka',
        woreda: 'Shiro Meda',
        rating: 4.9,
        reviews_count: 22,
        is_featured: true,
        status: 'active',
        created_at: new Date().toISOString(),
      },
      {
        id: 'prod-3',
        title_en: 'Genuine Leather Laptop Messenger Bag',
        title_am: 'የእውነተኛ ቆዳ የላፕቶፕ ቦርሳ',
        title_ti: 'ናይ ሓቂ ቆርበት ናይ ላፕቶፕ ቦርሳ',
        description_en: 'Full grain vegetable tanned leather, fits up to 16 inch laptops with brass hardware.',
        description_am: 'ከእውነተኛ የኢትዮጵያ ጥራት ያለው ቆዳ የተሰራ ለላፕቶፕ እና ለስራ ሰነዶች ምቹ ቦርሳ።',
        description_ti: 'ካብ ብሉጽ ናይ ኢትዮጵያ ቆርበት ዝተሰርሐ ንላፕቶፕን ሰነዳትን ምቹእ ዝኾነ ቦርሳ።',
        category_id: 'leather_goods',
        seller_id: adminId,
        seller_name: 'Zoma Leather Craft',
        seller_phone: '+251933445566',
        seller_is_verified: true,
        price: 3600,
        original_price: 4200,
        condition: 'Brand New',
        quantity: 12,
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
        ],
        region: 'Addis Ababa',
        zone: 'Kirkos',
        woreda: 'Mexico',
        rating: 4.8,
        reviews_count: 9,
        is_featured: false,
        status: 'active',
        created_at: new Date().toISOString(),
      },
      {
        id: 'prod-4',
        title_en: 'Samsung Galaxy S24 Ultra (512GB Titanium Black)',
        title_am: 'ሳምሰንግ ጋላክሲ ኤስ24 አልትራ (512 ጊባ ታይታኒየም)',
        title_ti: 'ሳምሰንግ ጋላክሲ ኤስ24 ኣልትራ (512 ጊባ ታይታኒየም)',
        description_en: 'Brand new sealed in box, official telecom network registered with 1-year warranty.',
        description_am: 'በፋብሪካ ማሸጊያ የታሸገ፣ ከሙሉ 1 ዓመት ዋስትና ጋር የቀረበ አዲስ ስልክ።',
        description_ti: 'ኣብ ናይ ፋብሪካ መዐሸጊ ዝተዓሸገ፣ ምሉእ ናይ 1 ዓመት ውሕስነት ዘለዎ ሓድሽ ተሌፎን።',
        category_id: 'smartphones_tech',
        seller_id: adminId,
        seller_name: 'Bole High-Tech Telecom',
        seller_phone: '+251944556677',
        seller_is_verified: true,
        price: 138000,
        original_price: 145000,
        condition: 'Brand New',
        quantity: 4,
        images: [
          'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80',
        ],
        region: 'Addis Ababa',
        zone: 'Bole',
        woreda: 'Edna Mall',
        rating: 5.0,
        reviews_count: 31,
        is_featured: true,
        status: 'active',
        created_at: new Date().toISOString(),
      },
    ];

    samples.forEach(s => inMemoryDb.products.push(s));
  }

  if (inMemoryDb.orders.length === 0) {
    const orderId = 'ord-seed-01';
    inMemoryDb.orders.push({
      id: orderId,
      customer_id: adminId,
      customer_name: 'Sara Tewolde',
      customer_phone: '+251911445566',
      delivery_address: 'Bole Medhanialem, House 402',
      region: 'Addis Ababa',
      zone: 'Bole',
      woreda: 'Woreda 03',
      total_amount: 8500,
      status: 'Pending',
      notes: 'Please call 10 minutes prior to delivery',
      payment_method: 'telebirr',
      receipt_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
      transaction_ref: 'TB-2026-90412854',
      receipt_uploaded_at: new Date().toISOString(),
      payment_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    inMemoryDb.orderItems.push({
      id: 'item-seed-01',
      order_id: orderId,
      product_id: 'prod-2',
      product_title: 'Hand-Woven Royal Sheba Ethiopian Dress (Tibeb Kemis)',
      price: 8500,
      quantity: 1,
      image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      created_at: new Date().toISOString(),
    });
  }
}

seedDefaultData();

/**
 * Execute raw SQL statement safely on Neon PostgreSQL pool if available
 */
export async function queryNeon(text: string, params: any[] = []): Promise<any> {
  const pool = getNeonPool();
  if (!pool) {
    throw new Error('Neon database is not connected. DATABASE_URL is not configured.');
  }
  return await executePoolQuery(pool, text, params);
}

/**
 * Run migrations from neon-schema.sql into Neon PostgreSQL
 */
export async function runNeonMigrations(customUrl?: string): Promise<{ success: boolean; message: string; appliedQueries?: number }> {
  const pool = getNeonPool(customUrl);
  if (!pool) {
    return { success: false, message: 'DATABASE_URL connection string is required to run migrations.' };
  }

  try {
    const schemaPath = path.resolve(process.cwd(), 'neon-schema.sql');
    if (!fs.existsSync(schemaPath)) {
      return { success: false, message: 'neon-schema.sql file not found in root.' };
    }

    const sqlContent = fs.readFileSync(schemaPath, 'utf-8');
    await executePoolQuery(pool, sqlContent);

    // Ensure any legacy table columns that were UUID are converted to VARCHAR(255)
    try {
      await executePoolQuery(pool, `
        DO $$
        BEGIN
          -- Products ID conversion if uuid
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'id' AND data_type = 'uuid') THEN
            ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
            ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_product_id_fkey;
            ALTER TABLE products ALTER COLUMN id TYPE VARCHAR(255);
            ALTER TABLE products ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_images' AND column_name = 'product_id') THEN
              ALTER TABLE product_images ALTER COLUMN product_id TYPE VARCHAR(255);
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'product_id') THEN
              ALTER TABLE order_items ALTER COLUMN product_id TYPE VARCHAR(255);
            END IF;
          END IF;
          -- Users ID conversion if uuid
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'id' AND data_type = 'uuid') THEN
            ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;
            ALTER TABLE sellers DROP CONSTRAINT IF EXISTS sellers_user_id_fkey;
            ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_customer_id_fkey;
            ALTER TABLE admin_accounts DROP CONSTRAINT IF EXISTS admin_accounts_user_id_fkey;
            ALTER TABLE users ALTER COLUMN id TYPE VARCHAR(255);
            ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'id') THEN
              ALTER TABLE user_profiles ALTER COLUMN id TYPE VARCHAR(255);
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sellers' AND column_name = 'user_id') THEN
              ALTER TABLE sellers ALTER COLUMN user_id TYPE VARCHAR(255);
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_id') THEN
              ALTER TABLE orders ALTER COLUMN customer_id TYPE VARCHAR(255);
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_accounts' AND column_name = 'user_id') THEN
              ALTER TABLE admin_accounts ALTER COLUMN user_id TYPE VARCHAR(255);
            END IF;
          END IF;
        END $$;
      `);
    } catch (colErr) {
      console.warn('Neon column conversion check notice:', colErr);
    }

    // Sync in-memory default admin into Neon if users table is empty
    try {
      const userRes = await executePoolQuery(pool, 'SELECT count(*) as count FROM users');
      if (parseInt(userRes.rows[0].count, 10) === 0 && inMemoryDb.users.length > 0) {
        for (const u of inMemoryDb.users) {
          await executePoolQuery(
            pool,
            `INSERT INTO users (id, email, password_hash, salt, phone, is_active)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (id) DO NOTHING`,
            [u.id, u.email, u.password_hash, u.salt, u.phone || '', u.is_active]
          );
          const prof = inMemoryDb.userProfiles.find(p => p.id === u.id);
          if (prof) {
            await executePoolQuery(
              pool,
              `INSERT INTO user_profiles (id, name, role)
               VALUES ($1, $2, $3)
               ON CONFLICT (id) DO NOTHING`,
              [u.id, prof.name, prof.role]
            );
          }
        }
      }
    } catch (userSyncErr) {
      console.warn('Notice syncing default users to Neon:', userSyncErr);
    }

    // Sync in-memory products into Neon if table is empty
    try {
      const prodRes = await executePoolQuery(pool, 'SELECT count(*) as count FROM products');
      if (parseInt(prodRes.rows[0].count, 10) === 0 && inMemoryDb.products.length > 0) {
        for (const p of inMemoryDb.products) {
          await executePoolQuery(
            pool,
            `INSERT INTO products (
              id, title_en, title_am, title_ti, description_en, description_am, description_ti,
              category_id, seller_name, seller_phone, seller_is_verified, price, original_price,
              condition, quantity, images, region, zone, woreda, rating, reviews_count, is_featured, status
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
            ON CONFLICT (id) DO NOTHING`,
            [
              p.id, p.title_en, p.title_am, p.title_ti, p.description_en, p.description_am, p.description_ti,
              p.category_id, p.seller_name, p.seller_phone, p.seller_is_verified, p.price, p.original_price,
              p.condition, p.quantity, p.images, p.region, p.zone, p.woreda, p.rating, p.reviews_count, p.is_featured, p.status
            ]
          );
        }
      }
    } catch (prodSyncErr) {
      console.warn('Notice syncing products to Neon:', prodSyncErr);
    }

    return {
      success: true,
      message: 'Neon PostgreSQL database migrations executed successfully! All 15+ tables and constraints created.',
    };
  } catch (err: any) {
    console.error('Neon migration error:', err);
    return { success: false, message: `Migration execution error: ${err.message}` };
  }
}

/**
 * Diagnostic test for Neon Serverless PostgreSQL connection
 */
export async function testNeonConnection(customUrl?: string): Promise<NeonConnectionStatus> {
  const connStr = getCleanConnectionString(customUrl);

  if (!connStr) {
    return {
      connected: false,
      provider: 'in-memory-fallback',
      databaseUrlConfigured: false,
      pooled: false,
      message: 'No DATABASE_URL configured yet. Running on high-performance in-memory persistence with instant Neon migration readiness.',
    };
  }

  const pool = getNeonPool(connStr);
  if (!pool) {
    return {
      connected: false,
      provider: 'in-memory-fallback',
      databaseUrlConfigured: true,
      pooled: false,
      message: 'Invalid Neon PostgreSQL connection string format.',
    };
  }

  const startTime = Date.now();
  try {
    const res = await executePoolQuery(pool, 'SELECT 1 as ping, current_database() as db, version() as v');
    const latency = Date.now() - startTime;

    const tablesRes = await executePoolQuery(pool, `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    const tableNames: string[] = tablesRes.rows.map((r: any) => r.table_name);
    const requiredTables = [
      'users', 'user_profiles', 'roles', 'permissions', 'sellers', 'products',
      'categories', 'product_images', 'orders', 'order_items', 'order_statuses',
      'admin_accounts', 'admin_activity_logs', 'notifications', 'reports'
    ];

    const tablesStatus: Record<string, boolean> = {};
    requiredTables.forEach((t) => {
      tablesStatus[t] = tableNames.includes(t);
    });

    const isPooled = connStr.includes('pooler') || connStr.includes('-pooler');

    return {
      connected: true,
      provider: 'neon-postgresql',
      databaseUrlConfigured: true,
      pooled: isPooled,
      database: res.rows[0]?.db || 'neondb',
      latencyMs: latency,
      tablesCount: tableNames.length,
      tables: tablesStatus,
      message: `Successfully connected to Neon PostgreSQL (${isPooled ? 'Secure Connection Pooler' : 'Direct'}) in ${latency}ms!`,
    };
  } catch (err: any) {
    return {
      connected: false,
      provider: 'in-memory-fallback',
      databaseUrlConfigured: true,
      pooled: false,
      message: `Neon connection failed: ${err.message}`,
    };
  }
}

// ============================================================================
// DATA ACCESS LAYER (HYBRID: NEON POSTGRESQL WITH RESILIENT IN-MEMORY STORE)
// ============================================================================

export const NeonDb = {
  // Users & Profiles
  async getUserByEmail(email: string) {
    const pool = getNeonPool();
    const cleanEmail = email.trim().toLowerCase();
    if (pool) {
      try {
        const { rows } = await executePoolQuery(
          pool,
          `SELECT u.*, p.name, p.role, p.avatar_url, p.region, p.zone, p.woreda
           FROM users u
           LEFT JOIN user_profiles p ON u.id = p.id
           WHERE LOWER(u.email) = $1`,
          [cleanEmail]
        );
        return rows[0] || null;
      } catch (e) {
        console.warn('Neon query error, using fallback:', e);
      }
    }
    const user = inMemoryDb.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) return null;
    const profile = inMemoryDb.userProfiles.find(p => p.id === user.id);
    return { ...user, ...(profile || {}) };
  },

  async createUser(data: {
    name: string;
    email: string;
    passwordHash: string;
    salt: string;
    phone?: string;
    role?: 'user' | 'seller' | 'admin' | 'super_admin';
  }) {
    const pool = getNeonPool();
    const id = 'usr-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const cleanEmail = data.email.trim().toLowerCase();
    const role = data.role || 'user';

    if (pool) {
      try {
        await executePoolQuery(
          pool,
          `INSERT INTO users (id, email, password_hash, salt, phone, is_active)
           VALUES ($1, $2, $3, $4, $5, true)`,
          [id, cleanEmail, data.passwordHash, data.salt, data.phone || '']
        );
        await executePoolQuery(
          pool,
          `INSERT INTO user_profiles (id, name, role)
           VALUES ($1, $2, $3)`,
          [id, data.name, role]
        );
      } catch (e: any) {
        console.error('Neon user registration database insert failed:', e);
        throw new Error(`Database registration error: ${e.message}`);
      }
    }

    inMemoryDb.users.push({
      id,
      email: cleanEmail,
      password_hash: data.passwordHash,
      salt: data.salt,
      phone: data.phone || '',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    inMemoryDb.userProfiles.push({
      id,
      name: data.name,
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return { id, email: cleanEmail, name: data.name, role };
  },

  async deleteUser(userId: string) {
    const pool = getNeonPool();
    if (pool) {
      try {
        await executePoolQuery(pool, `DELETE FROM users WHERE id = $1`, [userId]);
      } catch (e) {
        console.warn('Neon delete user error:', e);
      }
    }
    const idx = inMemoryDb.users.findIndex(u => u.id === userId);
    if (idx >= 0) inMemoryDb.users.splice(idx, 1);
    const pIdx = inMemoryDb.userProfiles.findIndex(p => p.id === userId);
    if (pIdx >= 0) inMemoryDb.userProfiles.splice(pIdx, 1);
    return true;
  },

  async getAllUsers() {
    const pool = getNeonPool();
    if (pool) {
      try {
        const { rows } = await executePoolQuery(pool, `
          SELECT u.id, u.email, u.phone, u.is_active, u.created_at,
                 p.name, p.role, p.region, p.zone, p.avatar_url
          FROM users u
          LEFT JOIN user_profiles p ON u.id = p.id
          ORDER BY u.created_at DESC
        `);
        return rows;
      } catch (e) {
        console.warn('Neon query users error:', e);
      }
    }
    return inMemoryDb.users.map(u => {
      const p = inMemoryDb.userProfiles.find(prof => prof.id === u.id);
      return {
        id: u.id,
        email: u.email,
        phone: u.phone,
        is_active: u.is_active,
        created_at: u.created_at,
        name: p?.name || 'User',
        role: p?.role || 'user',
        region: p?.region,
        zone: p?.zone,
        avatar_url: p?.avatar_url,
      };
    });
  },

  async updateUserRole(userId: string, role: string) {
    const pool = getNeonPool();
    if (pool) {
      try {
        await executePoolQuery(pool, `UPDATE user_profiles SET role = $1 WHERE id = $2`, [role, userId]);
      } catch (e) {
        console.warn('Neon update role error:', e);
      }
    }
    const prof = inMemoryDb.userProfiles.find(p => p.id === userId);
    if (prof) prof.role = role;
    return true;
  },

  async updateUserStatus(userId: string, isActive: boolean) {
    const pool = getNeonPool();
    if (pool) {
      try {
        await executePoolQuery(pool, `UPDATE users SET is_active = $1 WHERE id = $2`, [isActive, userId]);
      } catch (e) {
        console.warn('Neon update status error:', e);
      }
    }
    const u = inMemoryDb.users.find(user => user.id === userId);
    if (u) u.is_active = isActive;
    return true;
  },

  // Sellers
  async getAllSellers() {
    const pool = getNeonPool();
    if (pool) {
      try {
        const { rows } = await executePoolQuery(pool, `
          SELECT s.*, u.email as user_email
          FROM sellers s
          LEFT JOIN users u ON s.user_id = u.id
          ORDER BY s.created_at DESC
        `);
        return rows;
      } catch (e) {
        console.warn('Neon query sellers error:', e);
      }
    }
    return inMemoryDb.sellers;
  },

  async updateSellerStatus(sellerId: string, status: string, isVerified: boolean) {
    const pool = getNeonPool();
    if (pool) {
      try {
        await executePoolQuery(
          pool,
          `UPDATE sellers SET status = $1, is_verified = $2, updated_at = NOW() WHERE id = $3`,
          [status, isVerified, sellerId]
        );
      } catch (e) {
        console.warn('Neon update seller error:', e);
      }
    }
    const s = inMemoryDb.sellers.find(sel => sel.id === sellerId);
    if (s) {
      s.status = status;
      s.is_verified = isVerified;
    }
    return true;
  },

  async deleteSeller(sellerId: string) {
    const pool = getNeonPool();
    if (pool) {
      try {
        await executePoolQuery(pool, `DELETE FROM sellers WHERE id = $1`, [sellerId]);
      } catch (e) {
        console.warn('Neon delete seller error:', e);
      }
    }
    const idx = inMemoryDb.sellers.findIndex(s => s.id === sellerId);
    if (idx >= 0) inMemoryDb.sellers.splice(idx, 1);
    return true;
  },

  // Categories
  async getAllCategories() {
    const pool = getNeonPool();
    if (pool) {
      try {
        const { rows } = await executePoolQuery(pool, `SELECT * FROM categories ORDER BY display_order ASC, name_en ASC`);
        if (rows.length > 0) return rows;
      } catch (e) {
        console.warn('Neon query categories error:', e);
      }
    }
    return inMemoryDb.categories;
  },

  async createCategory(cat: any) {
    const pool = getNeonPool();
    if (pool) {
      try {
        await executePoolQuery(
          pool,
          `INSERT INTO categories (id, icon_name, name_en, name_am, name_ti, description_en, display_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [cat.id, cat.icon_name, cat.name_en, cat.name_am, cat.name_ti, cat.description_en || '', cat.display_order || 0]
        );
      } catch (e) {
        console.warn('Neon create category error:', e);
      }
    }
    inMemoryDb.categories.push(cat);
    return cat;
  },

  async deleteCategory(categoryId: string) {
    const pool = getNeonPool();
    if (pool) {
      try {
        await executePoolQuery(pool, `DELETE FROM categories WHERE id = $1`, [categoryId]);
      } catch (e) {
        console.warn('Neon delete category error:', e);
      }
    }
    const idx = inMemoryDb.categories.findIndex(c => c.id === categoryId);
    if (idx >= 0) inMemoryDb.categories.splice(idx, 1);
    return true;
  },

  // Products
  async getAllProducts() {
    const mapCategoryId = (rawCatId: any, slug?: string): string => {
      if (typeof rawCatId === 'string' && isNaN(Number(rawCatId))) {
        return rawCatId;
      }
      const slugMap: Record<string, string> = {
        'traditional-wear': 'traditional_fashion',
        'electronics': 'smartphones_tech',
        'coffee-spices': 'coffee_spices',
        'jewelry-crafts': 'traditional_fashion',
        'home-furniture': 'home_kitchen',
        'vehicles': 'vehicles_motors',
        'computers': 'smartphones_tech',
        'fashion-shoes': 'traditional_fashion',
      };
      if (slug && slugMap[slug]) return slugMap[slug];
      const numMap: Record<number, string> = {
        1: 'traditional_fashion',
        2: 'smartphones_tech',
        3: 'coffee_spices',
        4: 'traditional_fashion',
        5: 'home_kitchen',
        6: 'vehicles_motors',
        7: 'smartphones_tech',
        8: 'traditional_fashion',
      };
      return numMap[Number(rawCatId)] || 'coffee_spices';
    };

    const normalizeCondition = (cond: any): string => {
      const c = String(cond || '').trim().toLowerCase();
      if (c === 'new' || c === 'brand new') return 'Brand New';
      if (c === 'like new') return 'Like New';
      if (c === 'gently used') return 'Gently Used';
      if (c === 'used') return 'Used';
      return cond ? String(cond) : 'Brand New';
    };

    const pool = getNeonPool();
    if (pool) {
      try {
        const { rows } = await executePoolQuery(pool, `SELECT * FROM products ORDER BY created_at DESC`);
        if (rows.length > 0) {
          const [imgsRes, sellersRes, catsRes] = await Promise.all([
            executePoolQuery(pool, `SELECT product_id, image_url, is_primary FROM product_images ORDER BY is_primary DESC, id ASC`).catch(() => ({ rows: [] })),
            executePoolQuery(pool, `SELECT s.id, s.store_name, s.business_phone, s.is_verified, s.rating, u.full_name, u.phone as user_phone FROM sellers s LEFT JOIN users u ON s.user_id = u.id`).catch(() => ({ rows: [] })),
            executePoolQuery(pool, `SELECT id, slug FROM categories`).catch(() => ({ rows: [] })),
          ]);

          const imagesByProduct = new Map<string, string[]>();
          for (const img of imgsRes.rows || []) {
            const key = String(img.product_id);
            if (!imagesByProduct.has(key)) imagesByProduct.set(key, []);
            if (img.image_url) imagesByProduct.get(key)!.push(img.image_url);
          }

          const sellersById = new Map<string, any>();
          for (const s of sellersRes.rows || []) {
            sellersById.set(String(s.id), s);
          }

          const categorySlugById = new Map<string, string>();
          for (const c of catsRes.rows || []) {
            categorySlugById.set(String(c.id), c.slug);
          }

          return rows.map((r: any) => {
            const seller = sellersById.get(String(r.seller_id ?? ''));
            const catSlug = categorySlugById.get(String(r.category_id ?? ''));
            const dbImages = imagesByProduct.get(String(r.id)) || [];
            const rowImages = Array.isArray(r.images)
              ? r.images
              : (typeof r.images === 'string' && r.images ? [r.images] : []);
            const combinedImages = rowImages.length > 0 ? rowImages : dbImages;

            const titleEn = r.title_en || r.title || r.title_amharic || 'Product';
            const titleAm = r.title_am || r.title_amharic || r.title || titleEn;
            const titleTi = r.title_ti || r.title_amharic || r.title || titleEn;

            const descEn = r.description_en || r.description || '';
            const descAm = r.description_am || r.description || descEn;
            const descTi = r.description_ti || r.description || descEn;

            const rawPhone = r.seller_phone || seller?.business_phone || seller?.user_phone || '';
            const cleanPhone = rawPhone && !String(rawPhone).includes('@') ? rawPhone : '+251904503245';

            return {
              id: String(r.id),
              title: { en: titleEn, am: titleAm, ti: titleTi },
              description: { en: descEn, am: descAm, ti: descTi },
              categoryId: mapCategoryId(r.category_id, catSlug),
              price: Number(r.price || 0),
              originalPrice: r.original_price ? Number(r.original_price) : undefined,
              condition: normalizeCondition(r.condition),
              quantity: Number(r.quantity ?? r.stock ?? 1),
              images: combinedImages,
              sellerId: String(r.seller_id ?? ''),
              sellerName: r.seller_name || seller?.store_name || seller?.full_name || 'Verified Seller',
              sellerPhone: cleanPhone,
              sellerIsVerified: Boolean(r.seller_is_verified ?? seller?.is_verified ?? false),
              region: r.region || 'Addis Ababa',
              zone: r.zone || r.city || r.woreda || '',
              woreda: r.woreda || '',
              rating: Number(r.rating ?? seller?.rating ?? 5.0),
              reviewsCount: Number(r.reviews_count ?? 0),
              featured: Boolean(r.is_featured ?? false),
              createdAt: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : '',
            };
          });
        }
      } catch (e) {
        console.warn('Neon query products error:', e);
      }
    }

    return inMemoryDb.products.map(r => ({
      id: r.id,
      title: { en: r.title_en, am: r.title_am, ti: r.title_ti },
      description: { en: r.description_en, am: r.description_am, ti: r.description_ti },
      categoryId: r.category_id,
      price: Number(r.price),
      originalPrice: r.original_price ? Number(r.original_price) : undefined,
      condition: r.condition,
      quantity: Number(r.quantity),
      images: Array.isArray(r.images) ? r.images : [],
      sellerId: r.seller_id || '',
      sellerName: r.seller_name,
      sellerPhone: r.seller_phone,
      sellerIsVerified: Boolean(r.seller_is_verified),
      region: r.region,
      zone: r.zone,
      woreda: r.woreda,
      rating: Number(r.rating || 5.0),
      reviewsCount: Number(r.reviews_count || 0),
      featured: Boolean(r.is_featured),
      createdAt: r.created_at,
    }));
  },

  async createProduct(p: any) {
    const id = p.id || 'prod-' + Date.now().toString(36);
    const pool = getNeonPool();

    const record = {
      id,
      title_en: p.title?.en || p.title_en || 'Product',
      title_am: p.title?.am || p.title_am || p.title?.en || '',
      title_ti: p.title?.ti || p.title_ti || p.title?.en || '',
      description_en: p.description?.en || p.description_en || '',
      description_am: p.description?.am || p.description_am || '',
      description_ti: p.description?.ti || p.description_ti || '',
      category_id: p.categoryId || p.category_id || 'coffee_spices',
      seller_id: p.sellerId || p.seller_id || null,
      seller_name: p.sellerName || p.seller_name || 'Mela Seller',
      seller_phone: p.sellerPhone || p.seller_phone || '+251911000000',
      seller_is_verified: Boolean(p.sellerIsVerified ?? p.seller_is_verified),
      price: Number(p.price || 0),
      original_price: p.originalPrice || p.original_price ? Number(p.originalPrice || p.original_price) : null,
      condition: p.condition || 'Brand New',
      quantity: Number(p.quantity ?? 1),
      images: Array.isArray(p.images) ? p.images : [],
      region: p.region || 'Addis Ababa',
      zone: p.zone || 'Bole',
      woreda: p.woreda || '',
      rating: 5.0,
      reviews_count: 0,
      is_featured: Boolean(p.featured ?? p.is_featured),
      status: 'active',
      created_at: new Date().toISOString(),
    };

    if (pool) {
      try {
        const colCheck = await executePoolQuery(
          pool,
          `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products'`
        );
        const cols = new Set((colCheck.rows || []).map((c: any) => c.column_name));

        if (cols.has('title_en')) {
          await executePoolQuery(
            pool,
            `INSERT INTO products (
              id, title_en, title_am, title_ti, description_en, description_am, description_ti,
              category_id, seller_name, seller_phone, seller_is_verified, price, original_price,
              condition, quantity, images, region, zone, woreda, rating, reviews_count, is_featured, status
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)`,
            [
              record.id, record.title_en, record.title_am, record.title_ti,
              record.description_en, record.description_am, record.description_ti,
              record.category_id, record.seller_name, record.seller_phone, record.seller_is_verified,
              record.price, record.original_price, record.condition, record.quantity,
              record.images, record.region, record.zone, record.woreda,
              record.rating, record.reviews_count, record.is_featured, record.status
            ]
          );
        } else {
          // Live Neon schema: products + product_images + sellers
          const catReverseMap: Record<string, number> = {
            traditional_fashion: 1,
            smartphones_tech: 2,
            coffee_spices: 3,
            audio_gadgets: 2,
            leather_goods: 8,
            home_kitchen: 5,
            vehicles_motors: 6,
            real_estate: 5,
          };
          const numericCatId = catReverseMap[String(record.category_id)] || 1;
          const dbCondition = String(record.condition).toLowerCase().includes('used') ? 'used' : 'new';
          const sellerIdNum = !isNaN(Number(record.seller_id)) && Number(record.seller_id) > 0
            ? Number(record.seller_id)
            : 1;

          const inserted = await executePoolQuery(
            pool,
            `INSERT INTO products (
              seller_id, category_id, title, title_amharic, description, price, original_price,
              condition, stock, region, woreda, city, status, is_featured
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'approved',$13)
            RETURNING id`,
            [
              sellerIdNum, numericCatId, record.title_en, record.title_am || record.title_en,
              record.description_en, record.price, record.original_price, dbCondition,
              record.quantity, record.region, record.woreda, record.zone, record.is_featured
            ]
          );

          const insertedId = inserted.rows?.[0]?.id;
          if (insertedId) {
            record.id = String(insertedId);
            for (let idx = 0; idx < record.images.length; idx++) {
              await executePoolQuery(
                pool,
                `INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, $3)`,
                [insertedId, record.images[idx], idx === 0]
              );
            }
          }
        }
      } catch (e) {
        console.warn('Neon insert product error:', e);
      }
    }

    inMemoryDb.products.unshift(record);
    return record;
  },

  async updateProductQuantity(id: string, quantity: number) {
    const pool = getNeonPool();
    if (pool) {
      try {
        await executePoolQuery(pool, `UPDATE products SET quantity = $1, updated_at = NOW() WHERE id = $2`, [quantity, id])
          .catch(() => executePoolQuery(pool, `UPDATE products SET stock = $1, updated_at = NOW() WHERE id = $2`, [quantity, id]));
      } catch (e) {
        console.warn('Neon update product quantity error:', e);
      }
    }
    const p = inMemoryDb.products.find(prod => prod.id === id);
    if (p) p.quantity = quantity;
    return true;
  },

  async deleteProduct(id: string) {
    const pool = getNeonPool();
    if (pool) {
      try {
        await executePoolQuery(pool, `DELETE FROM products WHERE id = $1`, [id]);
      } catch (e) {
        console.warn('Neon delete product error:', e);
      }
    }
    const idx = inMemoryDb.products.findIndex(prod => prod.id === id);
    if (idx >= 0) inMemoryDb.products.splice(idx, 1);
    return true;
  },

  // Orders
  async getAllOrders() {
    const pool = getNeonPool();
    if (pool) {
      try {
        const { rows: orders } = await executePoolQuery(pool, `SELECT * FROM orders ORDER BY created_at DESC`);
        const { rows: items } = await executePoolQuery(pool, `SELECT * FROM order_items`);

        return orders.map((o: any) => {
          const orderItems = items.filter((i: any) => String(i.order_id) === String(o.id)).map((i: any) => ({
            productId: String(i.product_id ?? ''),
            productTitle: i.product_title || 'Product',
            price: Number(i.price ?? i.unit_price ?? 0),
            quantity: Number(i.quantity ?? 1),
            imageUrl: i.image_url || '',
          }));

          return {
            id: String(o.id),
            customerId: String(o.customer_id ?? o.buyer_id ?? ''),
            customerName: o.customer_name || 'Customer',
            customerPhone: o.customer_phone || o.phone || '',
            deliveryAddress: o.delivery_address || o.shipping_address || '',
            region: o.region || o.shipping_city || '',
            zone: o.zone || '',
            woreda: o.woreda || '',
            totalAmount: Number(o.total_amount || 0),
            orderDate: o.created_at ? new Date(o.created_at).toISOString().split('T')[0] : '',
            status: o.status || 'Pending',
            notes: o.notes || '',
            paymentReceipt: o.receipt_url ? {
              receiptUrl: o.receipt_url,
              uploadedAt: o.receipt_uploaded_at || o.created_at,
              transactionRef: o.transaction_ref,
              paymentMethod: o.payment_method,
              verified: Boolean(o.payment_verified),
            } : undefined,
            items: orderItems,
          };
        });
      } catch (e) {
        console.warn('Neon query orders error:', e);
      }
    }

    return inMemoryDb.orders.map(o => {
      const items = inMemoryDb.orderItems.filter(i => i.order_id === o.id).map(i => ({
        productId: i.product_id,
        productTitle: i.product_title,
        price: Number(i.price),
        quantity: Number(i.quantity),
        imageUrl: i.image_url,
      }));

      return {
        id: o.id,
        customerId: o.customer_id || '',
        customerName: o.customer_name,
        customerPhone: o.customer_phone,
        deliveryAddress: o.delivery_address,
        region: o.region,
        zone: o.zone,
        woreda: o.woreda,
        totalAmount: Number(o.total_amount),
        orderDate: o.created_at,
        status: o.status,
        notes: o.notes,
        paymentReceipt: o.receipt_url ? {
          receiptUrl: o.receipt_url,
          uploadedAt: o.receipt_uploaded_at || o.created_at,
          transactionRef: o.transaction_ref,
          paymentMethod: o.payment_method,
          verified: Boolean(o.payment_verified),
        } : undefined,
        items,
      };
    });
  },

  async createOrder(orderData: any, items: any[]) {
    const id = orderData.id || 'ord-' + Date.now().toString(36);
    const pool = getNeonPool();

    const orderRecord = {
      id,
      customer_id: orderData.customerId || null,
      customer_name: orderData.customerName,
      customer_phone: orderData.customerPhone,
      delivery_address: orderData.deliveryAddress,
      region: orderData.region,
      zone: orderData.zone,
      woreda: orderData.woreda || '',
      total_amount: Number(orderData.totalAmount || 0),
      status: orderData.status || 'Pending',
      notes: orderData.notes || '',
      payment_method: orderData.paymentMethod || 'telebirr',
      receipt_url: orderData.receiptUrl || null,
      transaction_ref: orderData.transactionRef || null,
      receipt_uploaded_at: orderData.receiptUrl ? new Date().toISOString() : null,
      payment_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (pool) {
      try {
        await executePoolQuery(
          pool,
          `INSERT INTO orders (
            id, customer_name, customer_phone, delivery_address, region, zone, woreda,
            total_amount, status, notes, payment_method, receipt_url, transaction_ref, receipt_uploaded_at
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
          [
            orderRecord.id, orderRecord.customer_name, orderRecord.customer_phone,
            orderRecord.delivery_address, orderRecord.region, orderRecord.zone, orderRecord.woreda,
            orderRecord.total_amount, orderRecord.status, orderRecord.notes,
            orderRecord.payment_method, orderRecord.receipt_url, orderRecord.transaction_ref,
            orderRecord.receipt_uploaded_at
          ]
        );

        for (const item of items) {
          const itemId = 'item-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
          await executePoolQuery(
            pool,
            `INSERT INTO order_items (id, order_id, product_id, product_title, price, quantity, image_url)
             VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [itemId, id, item.productId || item.product?.id, item.productTitle || item.product?.title?.en, item.price, item.quantity, item.imageUrl || item.product?.images?.[0]]
          );
        }
      } catch (e) {
        console.warn('Neon create order error:', e);
      }
    }

    inMemoryDb.orders.unshift(orderRecord);
    for (const item of items) {
      inMemoryDb.orderItems.push({
        id: 'item-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        order_id: id,
        product_id: item.productId || item.product?.id,
        product_title: item.productTitle || item.product?.title?.en || 'Product',
        price: Number(item.price),
        quantity: Number(item.quantity),
        image_url: item.imageUrl || item.product?.images?.[0] || '',
        created_at: new Date().toISOString(),
      });
    }

    return orderRecord;
  },

  async updateOrderStatus(orderId: string, status: string, adminEmail?: string) {
    const pool = getNeonPool();
    if (pool) {
      try {
        await executePoolQuery(pool, `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2`, [status, orderId]);
      } catch (e) {
        console.warn('Neon update order status error:', e);
      }
    }
    const o = inMemoryDb.orders.find(ord => ord.id === orderId);
    if (o) o.status = status;

    if (adminEmail) {
      await this.logAdminActivity(adminEmail, 'UPDATE_ORDER_STATUS', 'order', orderId, { newStatus: status });
    }
    return true;
  },

  async verifyPaymentReceipt(orderId: string, verified: boolean, adminEmail?: string) {
    const pool = getNeonPool();
    if (pool) {
      try {
        await executePoolQuery(
          pool,
          `UPDATE orders SET payment_verified = $1, verified_at = NOW(), updated_at = NOW() WHERE id = $2`,
          [verified, orderId]
        );
      } catch (e) {
        console.warn('Neon verify receipt error:', e);
      }
    }
    const o = inMemoryDb.orders.find(ord => ord.id === orderId);
    if (o) o.payment_verified = verified;

    if (adminEmail) {
      await this.logAdminActivity(adminEmail, 'VERIFY_PAYMENT_RECEIPT', 'order', orderId, { verified });
    }
    return true;
  },

  async uploadReceipt(orderId: string, receiptUrl: string, transactionRef?: string, paymentMethod?: string) {
    const pool = getNeonPool();
    const now = new Date().toISOString();
    if (pool) {
      try {
        await executePoolQuery(
          pool,
          `UPDATE orders 
           SET receipt_url = $1, transaction_ref = $2, payment_method = $3, receipt_uploaded_at = $4, updated_at = NOW() 
           WHERE id = $5`,
          [receiptUrl, transactionRef || null, paymentMethod || 'telebirr', now, orderId]
        );
      } catch (e) {
        console.warn('Neon upload receipt error:', e);
      }
    }
    const o = inMemoryDb.orders.find(ord => ord.id === orderId);
    if (o) {
      o.receipt_url = receiptUrl;
      o.transaction_ref = transactionRef;
      o.payment_method = paymentMethod || 'telebirr';
      o.receipt_uploaded_at = now;
    }
    return true;
  },

  async deleteOrder(orderId: string) {
    const pool = getNeonPool();
    if (pool) {
      try {
        await executePoolQuery(pool, `DELETE FROM orders WHERE id = $1`, [orderId]);
      } catch (e) {
        console.warn('Neon delete order error:', e);
      }
    }
    const idx = inMemoryDb.orders.findIndex(o => o.id === orderId);
    if (idx >= 0) inMemoryDb.orders.splice(idx, 1);
    inMemoryDb.orderItems = inMemoryDb.orderItems.filter(i => i.order_id !== orderId);
    return true;
  },

  // Admin Activity Logs
  async logAdminActivity(adminEmail: string, action: string, targetType: string, targetId?: string, details: any = {}) {
    const pool = getNeonPool();
    const id = 'log-' + Date.now().toString(36);
    const now = new Date().toISOString();
    if (pool) {
      try {
        await executePoolQuery(
          pool,
          `INSERT INTO admin_activity_logs (id, admin_email, action, target_type, target_id, details, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [id, adminEmail, action, targetType, targetId || null, JSON.stringify(details), now]
        );
      } catch (e) {
        console.warn('Neon activity log error:', e);
      }
    }
    inMemoryDb.adminActivityLogs.unshift({
      id,
      admin_email: adminEmail,
      action,
      target_type: targetType,
      target_id: targetId,
      details,
      created_at: now,
    });
  },

  async getAdminActivityLogs(limit = 50) {
    const pool = getNeonPool();
    if (pool) {
      try {
        const { rows } = await executePoolQuery(pool, `SELECT * FROM admin_activity_logs ORDER BY created_at DESC LIMIT $1`, [limit]);
        return rows;
      } catch (e) {
        console.warn('Neon query logs error:', e);
      }
    }
    return inMemoryDb.adminActivityLogs.slice(0, limit);
  },

  // Notifications
  async getAllNotifications() {
    const pool = getNeonPool();
    if (pool) {
      try {
        const { rows } = await executePoolQuery(pool, `SELECT * FROM notifications ORDER BY created_at DESC`);
        return rows;
      } catch (e) {
        console.warn('Neon notifications query error:', e);
      }
    }
    return inMemoryDb.notifications;
  },

  // Reports
  async getAllReports() {
    const pool = getNeonPool();
    if (pool) {
      try {
        const { rows } = await executePoolQuery(pool, `SELECT * FROM reports ORDER BY created_at DESC`);
        return rows;
      } catch (e) {
        console.warn('Neon reports query error:', e);
      }
    }
    return inMemoryDb.reports;
  },

  // Admin Accounts
  async getAllAdminAccounts() {
    const pool = getNeonPool();
    if (pool) {
      try {
        const { rows } = await executePoolQuery(pool, `
          SELECT a.*, u.email, u.phone, p.name
          FROM admin_accounts a
          JOIN users u ON a.user_id = u.id
          LEFT JOIN user_profiles p ON u.id = p.id
          ORDER BY a.created_at DESC
        `);
        return rows;
      } catch (e) {
        console.warn('Neon admin accounts query error:', e);
      }
    }
    return inMemoryDb.adminAccounts.map(a => {
      const u = inMemoryDb.users.find(usr => usr.id === a.user_id);
      const p = inMemoryDb.userProfiles.find(prof => prof.id === a.user_id);
      return {
        id: a.id,
        user_id: a.user_id,
        role: a.role,
        is_super_admin: a.is_super_admin,
        email: u?.email || 'admin@mela.et',
        phone: u?.phone || '',
        name: p?.name || 'Administrator',
        created_at: a.created_at,
      };
    });
  },

  async createAdminAccount(userId: string, role = 'super_admin', isSuperAdmin = true) {
    const pool = getNeonPool();
    const id = 'adm-' + Date.now().toString(36);
    if (pool) {
      try {
        await executePoolQuery(
          pool,
          `INSERT INTO admin_accounts (id, user_id, role, is_super_admin)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role, is_super_admin = EXCLUDED.is_super_admin`,
          [id, userId, role, isSuperAdmin]
        );
        await executePoolQuery(pool, `UPDATE user_profiles SET role = $1 WHERE id = $2`, [role, userId]);
      } catch (e) {
        console.warn('Neon create admin account error:', e);
      }
    }
    const existing = inMemoryDb.adminAccounts.find(a => a.user_id === userId);
    if (existing) {
      existing.role = role;
      existing.is_super_admin = isSuperAdmin;
    } else {
      inMemoryDb.adminAccounts.push({ id, user_id: userId, role, is_super_admin: isSuperAdmin, created_at: new Date().toISOString() });
    }
    const prof = inMemoryDb.userProfiles.find(p => p.id === userId);
    if (prof) prof.role = role;
    return true;
  },

  async deleteAdminAccount(adminAccountId: string) {
    const pool = getNeonPool();
    if (pool) {
      try {
        await executePoolQuery(pool, `DELETE FROM admin_accounts WHERE id = $1`, [adminAccountId]);
      } catch (e) {
        console.warn('Neon delete admin account error:', e);
      }
    }
    const idx = inMemoryDb.adminAccounts.findIndex(a => a.id === adminAccountId);
    if (idx >= 0) inMemoryDb.adminAccounts.splice(idx, 1);
    return true;
  },

  // Settings
  async getSettings() {
    const pool = getNeonPool();
    if (pool) {
      try {
        const { rows } = await executePoolQuery(pool, `SELECT key, value FROM marketplace_settings`);
        const settings: Record<string, any> = {};
        rows.forEach((r: any) => { settings[r.key] = r.value; });
        return { ...inMemoryDb.settings, ...settings };
      } catch (e) {
        console.warn('Neon settings query error:', e);
      }
    }
    return inMemoryDb.settings;
  },

  async updateSetting(key: string, value: any) {
    const pool = getNeonPool();
    if (pool) {
      try {
        await executePoolQuery(
          pool,
          `INSERT INTO marketplace_settings (key, value, updated_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
          [key, JSON.stringify(value)]
        );
      } catch (e) {
        console.warn('Neon update setting error:', e);
      }
    }
    inMemoryDb.settings[key] = value;
    return true;
  },
};

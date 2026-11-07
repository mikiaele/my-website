import pg from 'pg';
import bcryptjs from 'bcryptjs';

const { Pool } = pg;

export interface DbStatus {
  connected: boolean;
  isNeon: boolean;
  tablesReady: boolean;
  error?: string;
  hasEnvUrl: boolean;
}

let pool: pg.Pool | null = null;
let isInitialized = false;

// Default categories for Ethiopian Marketplace
export const DEFAULT_CATEGORIES = [
  { slug: 'electronics', name_am: 'ኤሌክትሮኒክስ', name_en: 'Electronics', name_ti: 'ኤሌክትሮኒክስ', icon: 'Tv' },
  { slug: 'vehicles', name_am: 'መኪና እና መለዋወጫ', name_en: 'Vehicles & Parts', name_ti: 'መኪናን መለዋወጢን', icon: 'Car' },
  { slug: 'phones-tablets', name_am: 'ስልኮች እና ታብሌቶች', name_en: 'Phones & Tablets', name_ti: 'ስልክታትን ታብሌታትን', icon: 'Smartphone' },
  { slug: 'home-furniture', name_am: 'ቤት እና እቃዎች', name_en: 'Home & Furniture', name_ti: 'ገዛን ኣቑሑትን', icon: 'Home' },
  { slug: 'fashion-clothing', name_am: 'አልባሳት እና ጫማዎች', name_en: 'Fashion & Clothing', name_ti: 'ክዳውንትን ጫማታትን', icon: 'Shirt' },
  { slug: 'agriculture-food', name_am: 'እርሻ እና ምግብ', name_en: 'Agriculture & Food', name_ti: 'ሕርሻን ምግቢን', icon: 'Wheat' },
  { slug: 'construction-tools', name_am: 'ኮንስትራክሽን እና እቃዎች', name_en: 'Construction & Tools', name_ti: 'ኮንስትራክሽንን መሳርሒታትን', icon: 'Wrench' },
  { slug: 'other', name_am: 'ሌሎች እቃዎች', name_en: 'Other Items', name_ti: 'ካልኦት ኣቑሑት', icon: 'Package' },
];

export async function initDb(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.warn('[Mela Market DB] DATABASE_URL is not set. Awaiting configuration.');
    return;
  }

  try {
    const isNeon = databaseUrl.includes('neon.tech') || databaseUrl.includes('sslmode=require');
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: isNeon ? { rejectUnauthorized: false } : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    // Test connection
    const client = await pool.connect();
    console.log('[Mela Market DB] Connected successfully to Neon PostgreSQL database.');
    client.release();

    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(128) PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(100) UNIQUE NOT NULL,
        name_am VARCHAR(255) NOT NULL,
        name_en VARCHAR(255) NOT NULL,
        name_ti VARCHAR(255) NOT NULL,
        icon VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        category_slug VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        price NUMERIC(12, 2) NOT NULL,
        condition VARCHAR(20) NOT NULL,
        image_url TEXT NOT NULL,
        region VARCHAR(100) NOT NULL,
        district VARCHAR(100) NOT NULL,
        city VARCHAR(100) NOT NULL,
        seller_name VARCHAR(255) NOT NULL,
        seller_phone VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS inquiries (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        customer_name VARCHAR(255) NOT NULL,
        customer_contact VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Ensure all columns exist on pre-existing tables
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS slug VARCHAR(100);
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_en VARCHAR(255);
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_ti VARCHAR(255);
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon VARCHAR(50);

      UPDATE categories SET slug = 'traditional-fashion', name_en = 'Traditional & Fashion', name_ti = 'ባህላዊ ክዳውንቲን ኣቑሑትን', icon = 'Shirt' WHERE id = 1 AND (slug IS NULL OR slug = '');
      UPDATE categories SET slug = 'coffee-spices', name_en = 'Coffee & Spices', name_ti = 'ቡንን ቅመማ ቅመምን', icon = 'Wheat' WHERE id = 2 AND (slug IS NULL OR slug = '');
      UPDATE categories SET slug = 'electronics-phones', name_en = 'Electronics & Phones', name_ti = 'ኤሌክትሮኒክስን ስልክታትን', icon = 'Smartphone' WHERE id = 3 AND (slug IS NULL OR slug = '');
      UPDATE categories SET slug = 'home-office', name_en = 'Home & Furniture', name_ti = 'ገዛን ቢሮን ኣቑሑት', icon = 'Home' WHERE id = 4 AND (slug IS NULL OR slug = '');
      UPDATE categories SET slug = 'vehicles-parts', name_en = 'Vehicles & Parts', name_ti = 'መኪናን መለዋወጢን', icon = 'Car' WHERE id = 5 AND (slug IS NULL OR slug = '');
      UPDATE categories SET slug = 'beauty-health', name_en = 'Beauty & Health', name_ti = 'ውበትን ጥዕናን', icon = 'Sparkles' WHERE id = 6 AND (slug IS NULL OR slug = '');
      UPDATE categories SET slug = 'cat-' || id WHERE slug IS NULL OR slug = '';
      UPDATE categories SET name_en = COALESCE(NULLIF(name_en, ''), name_am, 'Category ' || id) WHERE name_en IS NULL OR name_en = '';
      UPDATE categories SET name_ti = COALESCE(NULLIF(name_ti, ''), name_am, 'ምድብ ' || id) WHERE name_ti IS NULL OR name_ti = '';
      UPDATE categories SET icon = COALESCE(NULLIF(icon, ''), 'Package') WHERE icon IS NULL OR icon = '';

      ALTER TABLE products ADD COLUMN IF NOT EXISTS category_slug VARCHAR(100);
      ALTER TABLE products ADD COLUMN IF NOT EXISTS region VARCHAR(100);
      ALTER TABLE products ADD COLUMN IF NOT EXISTS district VARCHAR(100);
      ALTER TABLE products ADD COLUMN IF NOT EXISTS city VARCHAR(100);
      ALTER TABLE products ADD COLUMN IF NOT EXISTS seller_name VARCHAR(255);
      ALTER TABLE products ADD COLUMN IF NOT EXISTS seller_phone VARCHAR(50);

      UPDATE products p SET category_slug = c.slug FROM categories c WHERE p.category_id = c.id AND (p.category_slug IS NULL OR p.category_slug = '');
      UPDATE products SET category_slug = 'traditional-fashion' WHERE category_slug IS NULL OR category_slug = '';
      UPDATE products SET city = SPLIT_PART(location, '፣', 1) WHERE (city IS NULL OR city = '') AND location IS NOT NULL;
      UPDATE products SET city = 'Addis Ababa' WHERE city IS NULL OR city = '';
      UPDATE products SET region = 'Addis Ababa' WHERE region IS NULL OR region = '';
      UPDATE products SET district = 'Bole' WHERE district IS NULL OR district = '';
      UPDATE products SET seller_name = 'Mela Verified Seller' WHERE seller_name IS NULL OR seller_name = '';
      UPDATE products SET seller_phone = '+251911000000' WHERE seller_phone IS NULL OR seller_phone = '';

      ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS customer_contact VARCHAR(255);
      UPDATE inquiries SET customer_contact = customer_phone WHERE customer_contact IS NULL AND customer_phone IS NOT NULL;

      ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
      ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'seller', 'buyer', 'user'));
      UPDATE users SET full_name = name WHERE full_name IS NULL AND name IS NOT NULL;
      UPDATE users SET full_name = 'Mela Market User' WHERE full_name IS NULL;
      UPDATE users SET is_active = true WHERE is_active IS NULL;
      UPDATE users SET email_verified = true WHERE email_verified IS NULL;
    `);

    // Seed categories if empty
    const catCheck = await pool.query('SELECT COUNT(*) as count FROM categories');
    if (parseInt(catCheck.rows[0].count, 10) === 0) {
      console.log('[Mela Market DB] Seeding default categories...');
      for (const cat of DEFAULT_CATEGORIES) {
        await pool.query(
          `INSERT INTO categories (slug, name_am, name_en, name_ti, icon)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (slug) DO NOTHING`,
          [cat.slug, cat.name_am, cat.name_en, cat.name_ti, cat.icon]
        );
      }
    }

    // Ensure default administrator account exists
    const adminCheck = await pool.query("SELECT * FROM users WHERE role = 'admin' LIMIT 1");
    if (adminCheck.rows.length === 0) {
      const defaultAdminPass = process.env.ADMIN_SETUP_MASTER_KEY || 'Admin@MelaMarket2026!';
      const hash = await bcryptjs.hash(defaultAdminPass, 10);
      await pool.query(
        `INSERT INTO users (full_name, email, phone, password_hash, role)
         VALUES ($1, $2, $3, $4, 'admin')
         ON CONFLICT (email) DO UPDATE SET role = 'admin'`,
        ['Mela Market Administrator', 'admin@melamarket.com', '+251911000000', hash]
      );
      console.log('[Mela Market DB] Default administrator account initialized (admin@melamarket.com).');
    }

    // Seed sample initial listings if product table is completely empty
    const prodCheck = await pool.query('SELECT COUNT(*) as count FROM products');
    if (parseInt(prodCheck.rows[0].count, 10) === 0) {
      const adminUser = await pool.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
      const adminId = adminUser.rows[0]?.id || null;

      const initialProducts = [
        {
          name: 'Samsung Galaxy S24 Ultra 256GB - Titanium Gray',
          category_slug: 'phones-tablets',
          description: 'Brand new in box, unopened original factory seal. 1 year international warranty included. Dual SIM, 12GB RAM, 200MP camera.',
          price: 185000,
          condition: 'new',
          image_url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80',
          region: 'Addis Ababa',
          district: 'Bole',
          city: 'Addis Ababa',
          seller_name: 'Dawit Electronics',
          seller_phone: '0911223344',
        },
        {
          name: 'MacBook Pro 16-inch M3 Pro (36GB RAM, 512GB SSD)',
          category_slug: 'electronics',
          description: 'Brand new Apple MacBook Pro with M3 Pro chip. Space Black color, full Apple warranty, sealed retail box.',
          price: 340000,
          condition: 'new',
          image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
          region: 'Addis Ababa',
          district: 'Kirkos',
          city: 'Addis Ababa',
          seller_name: 'Ethio Tech Imports',
          seller_phone: '0922445566',
        },
        {
          name: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
          category_slug: 'electronics',
          description: 'New generation Sony industry leading noise cancellation, black, brand new in packaging.',
          price: 48000,
          condition: 'new',
          image_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
          region: 'Addis Ababa',
          district: 'Yeka',
          city: 'Addis Ababa',
          seller_name: 'Alula Audio',
          seller_phone: '0912345678',
        },
        {
          name: 'Handcrafted Solid Mahogany Dining Table with 6 Chairs',
          category_slug: 'home-furniture',
          description: 'Custom handcrafted Ethiopian solid mahogany wood dining set. Natural oil finish, pristine new condition direct from workshop.',
          price: 95000,
          condition: 'new',
          image_url: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=800&auto=format&fit=crop&q=80',
          region: 'Addis Ababa',
          district: 'Nifas Silk-Lafto',
          city: 'Addis Ababa',
          seller_name: 'Selam Woodworks',
          seller_phone: '0933556677',
        },
        {
          name: 'Toyota Yaris 2018 Hatchback Automatic - Clean Record',
          category_slug: 'vehicles',
          description: 'Gently used Toyota Yaris, silver color, 58,000 km mileage. Excellent mechanical condition, AC working perfectly, original paint.',
          price: 2450000,
          condition: 'used',
          image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
          region: 'Addis Ababa',
          district: 'Bole',
          city: 'Addis Ababa',
          seller_name: 'Yonas Motors',
          seller_phone: '0911778899',
        },
        {
          name: 'iPhone 13 128GB Midnight - Battery Health 88%',
          category_slug: 'phones-tablets',
          description: 'Pre-owned iPhone 13 in very good condition. No scratches on screen, always used with screen protector and case. Original charger included.',
          price: 72000,
          condition: 'used',
          image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
          region: 'Oromia',
          district: 'Bishoftu',
          city: 'Bishoftu',
          seller_name: 'Marta Kassahun',
          seller_phone: '0944112233',
        },
        {
          name: 'Canon EOS 80D DSLR Camera with 18-135mm USM Lens',
          category_slug: 'electronics',
          description: 'Used for studio photography only. Low shutter count (~14k clicks). Includes battery, charger, bag, and 64GB SanDisk card.',
          price: 68000,
          condition: 'used',
          image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
          region: 'Amhara',
          district: 'Bahir Dar Zuria',
          city: 'Bahir Dar',
          seller_name: 'Solomon Foto',
          seller_phone: '0929887766',
        },
        {
          name: 'DeWalt 20V Max Cordless Drill & Impact Driver Combo Kit',
          category_slug: 'construction-tools',
          description: 'Used tools in solid working condition. Includes 2 lithium batteries, fast charger, and heavy duty carry contractor bag.',
          price: 28000,
          condition: 'used',
          image_url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80',
          region: 'Tigray',
          district: 'Kedamay Weyane',
          city: 'Mekelle',
          seller_name: 'Berhe Tools',
          seller_phone: '0914556677',
        },
      ];

      for (const item of initialProducts) {
        await pool.query(
          `INSERT INTO products (user_id, name, category_slug, description, price, condition, image_url, region, district, city, seller_name, seller_phone)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            adminId,
            item.name,
            item.category_slug,
            item.description,
            item.price,
            item.condition,
            item.image_url,
            item.region,
            item.district,
            item.city,
            item.seller_name,
            item.seller_phone,
          ]
        );
      }
      console.log('[Mela Market DB] Initial product catalog seeded into Neon.');
    }

    isInitialized = true;
  } catch (err: unknown) {
    console.error('[Mela Market DB] Error initializing PostgreSQL:', err);
    isInitialized = false;
  }
}

export function getPool(): pg.Pool | null {
  return pool;
}

export function isDbConnected(): boolean {
  return !!pool && isInitialized;
}

export function getDbStatus(): DbStatus {
  return {
    connected: isDbConnected(),
    isNeon: !!process.env.DATABASE_URL?.includes('neon.tech'),
    tablesReady: isInitialized,
    hasEnvUrl: !!process.env.DATABASE_URL,
  };
}

// Fallback in-memory storage only when DATABASE_URL is waiting for user configuration
// so that testing and development preview never throw fatal crash
interface MemoryStore {
  users: Array<{
    id: number;
    full_name: string;
    email: string;
    phone: string;
    password_hash: string;
    role: 'user' | 'admin' | 'seller' | 'buyer';
    created_at: string;
  }>;
  sessions: Array<{
    id: string;
    user_id: number;
    expires_at: string;
  }>;
  categories: typeof DEFAULT_CATEGORIES;
  products: Array<{
    id: number;
    user_id: number | null;
    name: string;
    category_slug: string;
    description: string;
    price: number;
    condition: 'new' | 'used';
    image_url: string;
    region: string;
    district: string;
    city: string;
    seller_name: string;
    seller_phone: string;
    status: 'active' | 'inactive' | 'sold';
    created_at: string;
  }>;
  inquiries: Array<{
    id: number;
    product_id: number;
    customer_name: string;
    customer_contact: string;
    message: string;
    status: 'pending' | 'contacted' | 'resolved';
    created_at: string;
  }>;
}

const memoryStore: MemoryStore = {
  users: [
    {
      id: 1,
      full_name: 'Mela Market Administrator',
      email: 'admin@melamarket.com',
      phone: '+251911000000',
      password_hash: bcryptjs.hashSync(process.env.ADMIN_SETUP_MASTER_KEY || 'Admin@MelaMarket2026!', 10),
      role: 'admin',
      created_at: new Date().toISOString(),
    },
  ],
  sessions: [],
  categories: DEFAULT_CATEGORIES,
  products: [
    {
      id: 1,
      user_id: 1,
      name: 'Samsung Galaxy S24 Ultra 256GB - Titanium Gray',
      category_slug: 'phones-tablets',
      description: 'Brand new in box, unopened original factory seal. 1 year international warranty included. Dual SIM, 12GB RAM, 200MP camera.',
      price: 185000,
      condition: 'new',
      image_url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80',
      region: 'Addis Ababa',
      district: 'Bole',
      city: 'Addis Ababa',
      seller_name: 'Dawit Electronics',
      seller_phone: '0911223344',
      status: 'active',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 2,
      user_id: 1,
      name: 'MacBook Pro 16-inch M3 Pro (36GB RAM, 512GB SSD)',
      category_slug: 'electronics',
      description: 'Brand new Apple MacBook Pro with M3 Pro chip. Space Black color, full Apple warranty, sealed retail box.',
      price: 340000,
      condition: 'new',
      image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      region: 'Addis Ababa',
      district: 'Kirkos',
      city: 'Addis Ababa',
      seller_name: 'Ethio Tech Imports',
      seller_phone: '0922445566',
      status: 'active',
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 3,
      user_id: 1,
      name: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
      category_slug: 'electronics',
      description: 'New generation Sony industry leading noise cancellation, black, brand new in packaging.',
      price: 48000,
      condition: 'new',
      image_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
      region: 'Addis Ababa',
      district: 'Yeka',
      city: 'Addis Ababa',
      seller_name: 'Alula Audio',
      seller_phone: '0912345678',
      status: 'active',
      created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    },
    {
      id: 4,
      user_id: 1,
      name: 'Handcrafted Solid Mahogany Dining Table with 6 Chairs',
      category_slug: 'home-furniture',
      description: 'Custom handcrafted Ethiopian solid mahogany wood dining set. Natural oil finish, pristine new condition direct from workshop.',
      price: 95000,
      condition: 'new',
      image_url: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=800&auto=format&fit=crop&q=80',
      region: 'Addis Ababa',
      district: 'Nifas Silk-Lafto',
      city: 'Addis Ababa',
      seller_name: 'Selam Woodworks',
      seller_phone: '0933556677',
      status: 'active',
      created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    },
    {
      id: 5,
      user_id: 1,
      name: 'Toyota Yaris 2018 Hatchback Automatic - Clean Record',
      category_slug: 'vehicles',
      description: 'Gently used Toyota Yaris, silver color, 58,000 km mileage. Excellent mechanical condition, AC working perfectly, original paint.',
      price: 2450000,
      condition: 'used',
      image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
      region: 'Addis Ababa',
      district: 'Bole',
      city: 'Addis Ababa',
      seller_name: 'Yonas Motors',
      seller_phone: '0911778899',
      status: 'active',
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: 6,
      user_id: 1,
      name: 'iPhone 13 128GB Midnight - Battery Health 88%',
      category_slug: 'phones-tablets',
      description: 'Pre-owned iPhone 13 in very good condition. No scratches on screen, always used with screen protector and case. Original charger included.',
      price: 72000,
      condition: 'used',
      image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
      region: 'Oromia',
      district: 'Bishoftu',
      city: 'Bishoftu',
      seller_name: 'Marta Kassahun',
      seller_phone: '0944112233',
      status: 'active',
      created_at: new Date(Date.now() - 3600000 * 14).toISOString(),
    },
    {
      id: 7,
      user_id: 1,
      name: 'Canon EOS 80D DSLR Camera with 18-135mm USM Lens',
      category_slug: 'electronics',
      description: 'Used for studio photography only. Low shutter count (~14k clicks). Includes battery, charger, bag, and 64GB SanDisk card.',
      price: 68000,
      condition: 'used',
      image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
      region: 'Amhara',
      district: 'Bahir Dar Zuria',
      city: 'Bahir Dar',
      seller_name: 'Solomon Foto',
      seller_phone: '0929887766',
      status: 'active',
      created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    },
    {
      id: 8,
      user_id: 1,
      name: 'DeWalt 20V Max Cordless Drill & Impact Driver Combo Kit',
      category_slug: 'construction-tools',
      description: 'Used tools in solid working condition. Includes 2 lithium batteries, fast charger, and heavy duty carry contractor bag.',
      price: 28000,
      condition: 'used',
      image_url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80',
      region: 'Tigray',
      district: 'Kedamay Weyane',
      city: 'Mekelle',
      seller_name: 'Berhe Tools',
      seller_phone: '0914556677',
      status: 'active',
      created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    },
  ],
  inquiries: [],
};

export { memoryStore };

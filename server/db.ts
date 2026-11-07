import pg from 'pg';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

export interface DBUser {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  phone: string;
  profile_photo: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface DBProduct {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  condition: 'new' | 'used';
  price: number;
  currency: string;
  photo_url: string;
  region: string;
  district: string;
  city: string;
  seller_contact: string;
  seller_name?: string;
  seller_photo?: string;
  status: 'active' | 'sold' | 'hidden';
  created_at: string;
}

export interface DBInquiry {
  id: string;
  product_id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  message: string;
  status: 'pending' | 'responded' | 'closed';
  created_at: string;
}

export interface DBReport {
  id: string;
  product_id: string;
  reporter_email: string;
  reason: string;
  status: 'pending' | 'reviewed';
  created_at: string;
}

export interface DatabaseState {
  users: DBUser[];
  products: DBProduct[];
  inquiries: DBInquiry[];
  reports: DBReport[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'mela_market.json');

let pool: pg.Pool | null = null;
let isPostgresConnected = false;
let dbEngineName = 'Initializing';
let connectionError: string | null = null;

// Initial Seeds with generated authentic photos
const initialSeeds: DatabaseState = {
  users: [
    {
      id: 'admin-1',
      email: 'mikiaelebrhane21@gmail.com',
      password_hash: bcrypt.hashSync('MelaAdmin2026!', 10),
      full_name: 'Miki Alebrhane (Admin)',
      phone: '+251 91 100 0000',
      profile_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      role: 'admin',
      created_at: new Date().toISOString(),
    },
    {
      id: 'user-almaz',
      email: 'almaz.t@example.com',
      password_hash: bcrypt.hashSync('Password123!', 10),
      full_name: 'Almaz Tadesse',
      phone: '+251 92 345 6789',
      profile_photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      role: 'user',
      created_at: new Date().toISOString(),
    },
    {
      id: 'user-dawit',
      email: 'dawit.m@example.com',
      password_hash: bcrypt.hashSync('Password123!', 10),
      full_name: 'Dawit Mengistu',
      phone: '+251 93 456 7890',
      profile_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      role: 'user',
      created_at: new Date().toISOString(),
    }
  ],
  products: [
    {
      id: 'prod-new-1',
      user_id: 'user-almaz',
      title: 'Handcrafted Traditional Ethiopian Jebena Coffee Ceremony Set (የቡና ረከቦት)',
      description: 'Authentic pure black clay Jebena with 6 artisanal hand-fired cups and acacia wood serving tray. Brand new directly from craft masters.',
      category: 'crafts',
      condition: 'new',
      price: 3400,
      currency: 'ETB',
      photo_url: '/src/assets/images/product_ethiopian_coffee_set_1794060982321.jpg',
      region: 'Addis Ababa / አዲስ አበባ / ኣዲስ ኣበባ',
      district: 'Bole Sub-city',
      city: 'Addis Ababa',
      seller_contact: '+251 92 345 6789',
      seller_name: 'Almaz Tadesse',
      seller_photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      status: 'active',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'prod-new-2',
      user_id: 'user-dawit',
      title: 'Latest Flagship Smartphone 256GB - Brand New in Sealed Box',
      description: 'Original brand new factory unlocked smartphone with 1 year warranty, OLED 120Hz display, and rapid charger included.',
      category: 'electronics',
      condition: 'new',
      price: 88500,
      currency: 'ETB',
      photo_url: '/src/assets/images/product_modern_smartphone_1794060983386.jpg',
      region: 'Addis Ababa / አዲስ አበባ / ኣዲስ ኣበባ',
      district: 'Kirkos / Mexico Square',
      city: 'Addis Ababa',
      seller_contact: '+251 93 456 7890',
      seller_name: 'Dawit Mengistu',
      seller_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      status: 'active',
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'prod-new-3',
      user_id: 'user-almaz',
      title: 'Luxury Handwoven Habesha Kemis with Emerald & Gold Tilf (የባህል ቀሚስ)',
      description: 'Custom tailored 100% Ethiopian organic cotton dress with intricate hand embroidery. Brand new with matching Netela.',
      category: 'fashion',
      condition: 'new',
      price: 14500,
      currency: 'ETB',
      photo_url: '/src/assets/images/product_habesha_kemis_1794060983627.jpg',
      region: 'Addis Ababa / አዲስ አበባ / ኣዲስ ኣበባ',
      district: 'Yeka Sub-city',
      city: 'Addis Ababa',
      seller_contact: '+251 92 345 6789',
      seller_name: 'Almaz Tadesse',
      seller_photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      status: 'active',
      created_at: new Date(Date.now() - 10800000).toISOString(),
    },
    {
      id: 'prod-used-1',
      user_id: 'user-dawit',
      title: 'Full-Grain Cognac Leather Messenger Bag (Gently Used, Like New)',
      description: 'Ethiopian artisan-made leather bag with brass fittings and adjustable shoulder strap. Lightly used for 2 months, excellent condition with rich patina.',
      category: 'fashion',
      condition: 'used',
      price: 4200,
      currency: 'ETB',
      photo_url: '/src/assets/images/product_leather_bag_1794060984835.jpg',
      region: 'Oromia / ኦሮሚያ / ኦሮሚያ',
      district: 'Bishoftu Town',
      city: 'Bishoftu',
      seller_contact: '+251 93 456 7890',
      seller_name: 'Dawit Mengistu',
      seller_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      status: 'active',
      created_at: new Date(Date.now() - 14400000).toISOString(),
    },
    {
      id: 'prod-used-2',
      user_id: 'user-almaz',
      title: 'Toyota Corolla 2018 Executive Model (Clean Pre-Owned)',
      description: 'Accident free, original factory paint, automatic transmission, genuine low mileage (46,000 km). Full service history available.',
      category: 'vehicles',
      condition: 'used',
      price: 2850000,
      currency: 'ETB',
      photo_url: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80',
      region: 'Addis Ababa / አዲስ አበባ / ኣዲስ ኣበባ',
      district: 'Bole Bulbula',
      city: 'Addis Ababa',
      seller_contact: '+251 92 345 6789',
      seller_name: 'Almaz Tadesse',
      seller_photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      status: 'active',
      created_at: new Date(Date.now() - 18000000).toISOString(),
    },
    {
      id: 'prod-used-3',
      user_id: 'user-dawit',
      title: 'Sony Professional Wireless Noise-Cancelling Headphones (Pre-owned)',
      description: 'Used for 4 months. Flawless battery health (30+ hours), original USB-C cable and carrying travel case included. Sound quality is pristine.',
      category: 'electronics',
      condition: 'used',
      price: 18900,
      currency: 'ETB',
      photo_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      region: 'Tigray / ትግራይ / ትግራይ',
      district: 'Kedamay Weyane',
      city: 'Mekelle',
      seller_contact: '+251 93 456 7890',
      seller_name: 'Dawit Mengistu',
      seller_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      status: 'active',
      created_at: new Date(Date.now() - 21600000).toISOString(),
    }
  ],
  inquiries: [
    {
      id: 'inq-1',
      product_id: 'prod-new-1',
      buyer_name: 'Solomon Kebede',
      buyer_email: 'solomon@example.com',
      buyer_phone: '+251 91 222 3344',
      message: 'Hello, is the Jebena coffee set available for delivery around Bole Medhanialem?',
      status: 'pending',
      created_at: new Date(Date.now() - 1800000).toISOString(),
    }
  ],
  reports: []
};

// Fallback file storage management
function ensureDataFile(): DatabaseState {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialSeeds, null, 2), 'utf-8');
    return initialSeeds;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return data;
  } catch (err) {
    console.error('Error reading data file, reinitializing seeds:', err);
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialSeeds, null, 2), 'utf-8');
    return initialSeeds;
  }
}

function saveDataFile(data: DatabaseState) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Initialize Database with Neon PostgreSQL
export async function initDatabase(): Promise<{ connected: boolean; engine: string; error?: string }> {
  const databaseUrl = process.env.DATABASE_URL;

  dbEngineName = 'Neon PostgreSQL';

  if (databaseUrl && databaseUrl.trim() && !databaseUrl.includes('MY_REAL_NEON_CONNECTION_STRING')) {
    try {
      console.log('Connecting to Neon PostgreSQL via DATABASE_URL...');
      
      pool = new Pool({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false }, // Required for Neon PostgreSQL SSL
        connectionTimeoutMillis: 10000,
      });

      // Execute live connection test
      const client = await pool.connect();
      const testRes = await client.query('SELECT NOW() as current_time, version() as pg_version');
      console.log('Neon PostgreSQL Connection Test Succeeded:', testRes.rows[0]);

      // Create relational tables on Neon PostgreSQL
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(100) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          phone VARCHAR(100) NOT NULL,
          profile_photo TEXT,
          role VARCHAR(50) DEFAULT 'user',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS products (
          id VARCHAR(100) PRIMARY KEY,
          user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          category VARCHAR(100) NOT NULL,
          condition VARCHAR(50) NOT NULL,
          price NUMERIC NOT NULL,
          currency VARCHAR(20) DEFAULT 'ETB',
          photo_url TEXT NOT NULL,
          region VARCHAR(100) NOT NULL,
          district VARCHAR(100) NOT NULL,
          city VARCHAR(100) NOT NULL,
          seller_contact VARCHAR(100) NOT NULL,
          seller_name VARCHAR(255),
          seller_photo TEXT,
          status VARCHAR(50) DEFAULT 'active',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS inquiries (
          id VARCHAR(100) PRIMARY KEY,
          product_id VARCHAR(100) REFERENCES products(id) ON DELETE CASCADE,
          buyer_name VARCHAR(255) NOT NULL,
          buyer_email VARCHAR(255) NOT NULL,
          buyer_phone VARCHAR(100) NOT NULL,
          message TEXT NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS reports (
          id VARCHAR(100) PRIMARY KEY,
          product_id VARCHAR(100) REFERENCES products(id) ON DELETE CASCADE,
          reporter_email VARCHAR(255) NOT NULL,
          reason TEXT NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // Seed admin and baseline marketplace listings if empty on Neon
      const usersCountRes = await client.query('SELECT COUNT(*) FROM users');
      if (parseInt(usersCountRes.rows[0].count, 10) === 0) {
        for (const u of initialSeeds.users) {
          await client.query(
            `INSERT INTO users (id, email, password_hash, full_name, phone, profile_photo, role, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING`,
            [u.id, u.email, u.password_hash, u.full_name, u.phone, u.profile_photo, u.role, u.created_at]
          );
        }
        for (const p of initialSeeds.products) {
          await client.query(
            `INSERT INTO products (id, user_id, title, description, category, condition, price, currency, photo_url, region, district, city, seller_contact, seller_name, seller_photo, status, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) ON CONFLICT (id) DO NOTHING`,
            [p.id, p.user_id, p.title, p.description, p.category, p.condition, p.price, p.currency, p.photo_url, p.region, p.district, p.city, p.seller_contact, p.seller_name, p.seller_photo, p.status, p.created_at]
          );
        }
      }

      client.release();
      isPostgresConnected = true;
      connectionError = null;
      console.log('Neon PostgreSQL is fully connected, verified, and operational.');
      return { connected: true, engine: 'Neon PostgreSQL' };
    } catch (err: any) {
      console.error('Neon PostgreSQL connection test failed:', err.message);
      connectionError = err.message;
      isPostgresConnected = false;
      return { connected: false, engine: 'Neon PostgreSQL', error: err.message };
    }
  } else {
    isPostgresConnected = false;
    connectionError = 'DATABASE_URL environment variable is not set. Awaiting real Neon PostgreSQL connection string.';
    console.log('Neon PostgreSQL configured, waiting for user DATABASE_URL.');
    return { connected: false, engine: 'Neon PostgreSQL', error: connectionError };
  }
}

// Function to test and connect a new Neon connection string dynamically
export async function connectNeonDatabase(connectionString: string): Promise<{ success: boolean; message: string; latencyMs?: number; version?: string }> {
  if (!connectionString || !connectionString.trim()) {
    return { success: false, message: 'Please provide a valid Neon PostgreSQL connection string.' };
  }

  const start = Date.now();
  let testPool: pg.Pool | null = null;
  try {
    testPool = new Pool({
      connectionString: connectionString.trim(),
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });

    const client = await testPool.connect();
    const res = await client.query('SELECT NOW() as current_time, version() as pg_version');
    const latency = Date.now() - start;
    const version = res.rows[0]?.pg_version || 'PostgreSQL';

    // Apply tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(100) NOT NULL,
        profile_photo TEXT,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        condition VARCHAR(50) NOT NULL,
        price NUMERIC NOT NULL,
        currency VARCHAR(20) DEFAULT 'ETB',
        photo_url TEXT NOT NULL,
        region VARCHAR(100) NOT NULL,
        district VARCHAR(100) NOT NULL,
        city VARCHAR(100) NOT NULL,
        seller_contact VARCHAR(100) NOT NULL,
        seller_name VARCHAR(255),
        seller_photo TEXT,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS inquiries (
        id VARCHAR(100) PRIMARY KEY,
        product_id VARCHAR(100) REFERENCES products(id) ON DELETE CASCADE,
        buyer_name VARCHAR(255) NOT NULL,
        buyer_email VARCHAR(255) NOT NULL,
        buyer_phone VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS reports (
        id VARCHAR(100) PRIMARY KEY,
        product_id VARCHAR(100) REFERENCES products(id) ON DELETE CASCADE,
        reporter_email VARCHAR(255) NOT NULL,
        reason TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Seed baseline if empty
    const usersCountRes = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(usersCountRes.rows[0].count, 10) === 0) {
      for (const u of initialSeeds.users) {
        await client.query(
          `INSERT INTO users (id, email, password_hash, full_name, phone, profile_photo, role, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING`,
          [u.id, u.email, u.password_hash, u.full_name, u.phone, u.profile_photo, u.role, u.created_at]
        );
      }
      for (const p of initialSeeds.products) {
        await client.query(
          `INSERT INTO products (id, user_id, title, description, category, condition, price, currency, photo_url, region, district, city, seller_contact, seller_name, seller_photo, status, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) ON CONFLICT (id) DO NOTHING`,
          [p.id, p.user_id, p.title, p.description, p.category, p.condition, p.price, p.currency, p.photo_url, p.region, p.district, p.city, p.seller_contact, p.seller_name, p.seller_photo, p.status, p.created_at]
        );
      }
    }

    client.release();

    // Replace pool
    if (pool) {
      await pool.end().catch(() => {});
    }
    pool = testPool;
    isPostgresConnected = true;
    connectionError = null;
    process.env.DATABASE_URL = connectionString.trim();

    // Persist to .env file securely on server
    try {
      const envPath = path.resolve(process.cwd(), '.env');
      let envContent = '';
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf-8');
      }
      if (envContent.includes('DATABASE_URL=')) {
        envContent = envContent.replace(/DATABASE_URL=.*/, `DATABASE_URL="${connectionString.trim()}"`);
      } else {
        envContent += `\nDATABASE_URL="${connectionString.trim()}"\n`;
      }
      if (!envContent.includes('JWT_SECRET=')) {
        envContent += `JWT_SECRET="${process.env.JWT_SECRET || 'MY_SECURE_RANDOM_SECRET'}"\n`;
      }
      fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf-8');
    } catch (saveErr) {
      console.warn('Could not write to .env:', saveErr);
    }

    return {
      success: true,
      message: 'Neon PostgreSQL connection verified and active!',
      latencyMs: latency,
      version,
    };
  } catch (err: any) {
    if (testPool) {
      await testPool.end().catch(() => {});
    }
    return {
      success: false,
      message: 'Neon PostgreSQL connection test failed: ' + err.message,
    };
  }
}

// Get DB Health Status
export async function getDatabaseStatus() {
  const start = Date.now();
  if (isPostgresConnected && pool) {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      const latency = Date.now() - start;
      const uRes = await client.query('SELECT count(*) FROM users');
      const pRes = await client.query('SELECT count(*) FROM products');
      const iRes = await client.query('SELECT count(*) FROM inquiries');
      const rRes = await client.query('SELECT count(*) FROM reports');
      client.release();

      return {
        connected: true,
        engine: 'Neon PostgreSQL',
        message: 'Neon PostgreSQL connected, verified, and operational.',
        tablesVerified: true,
        latencyMs: latency,
        neonConfigured: true,
        tableCounts: {
          users: parseInt(uRes.rows[0].count, 10),
          products: parseInt(pRes.rows[0].count, 10),
          inquiries: parseInt(iRes.rows[0].count, 10),
          reports: parseInt(rRes.rows[0].count, 10),
        }
      };
    } catch (err: any) {
      return {
        connected: false,
        engine: 'Neon PostgreSQL',
        message: `Neon connection error: ${err.message}`,
        tablesVerified: false,
        neonConfigured: true,
      };
    }
  }

  // Not connected yet - waiting for real connection string
  return {
    connected: false,
    engine: 'Neon PostgreSQL',
    message: connectionError || 'Neon PostgreSQL is configured as the database provider. Awaiting your real DATABASE_URL connection string.',
    tablesVerified: false,
    latencyMs: 0,
    neonConfigured: Boolean(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('MY_REAL_NEON_CONNECTION_STRING')),
    tableCounts: {
      users: 0,
      products: 0,
      inquiries: 0,
      reports: 0,
    }
  };
}

// User Operations
export async function findUserByEmail(email: string): Promise<DBUser | null> {
  const normalizedEmail = email.toLowerCase().trim();
  if (isPostgresConnected && pool) {
    const res = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [normalizedEmail]);
    return res.rows[0] || null;
  }
  const data = ensureDataFile();
  return data.users.find(u => u.email.toLowerCase() === normalizedEmail) || null;
}

export async function findUserById(id: string): Promise<DBUser | null> {
  if (isPostgresConnected && pool) {
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0] || null;
  }
  const data = ensureDataFile();
  return data.users.find(u => u.id === id) || null;
}

export async function updateUserPassword(id: string, hash: string): Promise<boolean> {
  if (isPostgresConnected && pool) {
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, id]);
    return true;
  }
  const data = ensureDataFile();
  const user = data.users.find(u => u.id === id);
  if (user) {
    user.password_hash = hash;
    saveDataFile(data);
  }
  return true;
}

export async function createUser(user: DBUser): Promise<DBUser> {
  if (isPostgresConnected && pool) {
    await pool.query(
      `INSERT INTO users (id, email, password_hash, full_name, phone, profile_photo, role, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [user.id, user.email.toLowerCase(), user.password_hash, user.full_name, user.phone, user.profile_photo, user.role, user.created_at]
    );
    return user;
  }
  const data = ensureDataFile();
  data.users.push(user);
  saveDataFile(data);
  return user;
}

export async function getAllUsers(): Promise<Omit<DBUser, 'password_hash'>[]> {
  if (isPostgresConnected && pool) {
    const res = await pool.query('SELECT id, email, full_name, phone, profile_photo, role, created_at FROM users ORDER BY created_at DESC');
    return res.rows;
  }
  const data = ensureDataFile();
  return data.users.map(({ password_hash, ...u }) => u);
}

export async function deleteUser(id: string): Promise<boolean> {
  if (isPostgresConnected && pool) {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return true;
  }
  const data = ensureDataFile();
  data.users = data.users.filter(u => u.id !== id);
  data.products = data.products.filter(p => p.user_id !== id);
  saveDataFile(data);
  return true;
}

// Product Operations
export async function getProducts(filters?: { condition?: string; category?: string; region?: string; search?: string }): Promise<DBProduct[]> {
  let list: DBProduct[] = [];
  if (isPostgresConnected && pool) {
    const res = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    list = res.rows;
  } else {
    const data = ensureDataFile();
    list = [...data.products];
  }

  if (filters?.condition && filters.condition !== 'all') {
    list = list.filter(p => p.condition.toLowerCase() === filters.condition?.toLowerCase());
  }
  if (filters?.category && filters.category !== 'all') {
    list = list.filter(p => p.category.toLowerCase() === filters.category?.toLowerCase());
  }
  if (filters?.region && filters.region !== 'all') {
    list = list.filter(p => p.region.toLowerCase().includes(filters.region!.toLowerCase()) || filters.region!.toLowerCase().includes(p.region.toLowerCase()));
  }
  if (filters?.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q) || 
      p.city.toLowerCase().includes(q)
    );
  }

  return list;
}

export async function getProductById(id: string): Promise<DBProduct | null> {
  if (isPostgresConnected && pool) {
    const res = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    return res.rows[0] || null;
  }
  const data = ensureDataFile();
  return data.products.find(p => p.id === id) || null;
}

export async function createProduct(prod: DBProduct): Promise<DBProduct> {
  if (isPostgresConnected && pool) {
    await pool.query(
      `INSERT INTO products (id, user_id, title, description, category, condition, price, currency, photo_url, region, district, city, seller_contact, seller_name, seller_photo, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
      [prod.id, prod.user_id, prod.title, prod.description, prod.category, prod.condition, prod.price, prod.currency, prod.photo_url, prod.region, prod.district, prod.city, prod.seller_contact, prod.seller_name, prod.seller_photo, prod.status, prod.created_at]
    );
    return prod;
  }
  const data = ensureDataFile();
  data.products.unshift(prod);
  saveDataFile(data);
  return prod;
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (isPostgresConnected && pool) {
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    return true;
  }
  const data = ensureDataFile();
  data.products = data.products.filter(p => p.id !== id);
  data.inquiries = data.inquiries.filter(i => i.product_id !== id);
  data.reports = data.reports.filter(r => r.product_id !== id);
  saveDataFile(data);
  return true;
}

// Inquiries Operations
export async function createInquiry(inq: DBInquiry): Promise<DBInquiry> {
  if (isPostgresConnected && pool) {
    await pool.query(
      `INSERT INTO inquiries (id, product_id, buyer_name, buyer_email, buyer_phone, message, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [inq.id, inq.product_id, inq.buyer_name, inq.buyer_email, inq.buyer_phone, inq.message, inq.status, inq.created_at]
    );
    return inq;
  }
  const data = ensureDataFile();
  data.inquiries.unshift(inq);
  saveDataFile(data);
  return inq;
}

export async function getInquiries(): Promise<DBInquiry[]> {
  if (isPostgresConnected && pool) {
    const res = await pool.query('SELECT * FROM inquiries ORDER BY created_at DESC');
    return res.rows;
  }
  const data = ensureDataFile();
  return data.inquiries;
}

// Reports Operations
export async function createReport(rep: DBReport): Promise<DBReport> {
  if (isPostgresConnected && pool) {
    await pool.query(
      `INSERT INTO reports (id, product_id, reporter_email, reason, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [rep.id, rep.product_id, rep.reporter_email, rep.reason, rep.status, rep.created_at]
    );
    return rep;
  }
  const data = ensureDataFile();
  data.reports.unshift(rep);
  saveDataFile(data);
  return rep;
}

export async function getReports(): Promise<DBReport[]> {
  if (isPostgresConnected && pool) {
    const res = await pool.query('SELECT * FROM reports ORDER BY created_at DESC');
    return res.rows;
  }
  const data = ensureDataFile();
  return data.reports;
}

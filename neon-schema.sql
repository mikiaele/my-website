-- ============================================================================
-- MELA MARKET — OFFICIAL NEON POSTGRESQL DATABASE SCHEMA & MIGRATIONS
-- ============================================================================
-- Database: Neon Serverless PostgreSQL
-- Compatible with pooled and direct connection strings.
-- Supports both UUID strings and custom structured IDs (prod-*, usr-*, ord-*).
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- AUTOMATIC TABLE MIGRATION & TYPE UPGRADE
-- Converts existing UUID columns to VARCHAR(255) if tables were created previously
-- ----------------------------------------------------------------------------
DO $$ 
BEGIN
  -- Products and referencing tables
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'id' AND data_type = 'uuid'
  ) THEN
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

  -- Users and referencing tables
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;
    ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_id_fkey;
    ALTER TABLE sellers DROP CONSTRAINT IF EXISTS sellers_user_id_fkey;
    ALTER TABLE products DROP CONSTRAINT IF EXISTS products_seller_id_fkey;
    ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_customer_id_fkey;
    ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_verified_by_fkey;
    ALTER TABLE admin_accounts DROP CONSTRAINT IF EXISTS admin_accounts_user_id_fkey;
    ALTER TABLE admin_accounts DROP CONSTRAINT IF EXISTS admin_accounts_assigned_by_fkey;
    ALTER TABLE admin_activity_logs DROP CONSTRAINT IF EXISTS admin_activity_logs_admin_id_fkey;
    ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
    ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_reporter_id_fkey;
    ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_resolved_by_fkey;

    ALTER TABLE users ALTER COLUMN id TYPE VARCHAR(255);
    ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'id') THEN
      ALTER TABLE user_profiles ALTER COLUMN id TYPE VARCHAR(255);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sellers' AND column_name = 'user_id') THEN
      ALTER TABLE sellers ALTER COLUMN user_id TYPE VARCHAR(255);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'seller_id') THEN
      ALTER TABLE products ALTER COLUMN seller_id TYPE VARCHAR(255);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_id') THEN
      ALTER TABLE orders ALTER COLUMN customer_id TYPE VARCHAR(255);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'verified_by') THEN
      ALTER TABLE orders ALTER COLUMN verified_by TYPE VARCHAR(255);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_accounts' AND column_name = 'user_id') THEN
      ALTER TABLE admin_accounts ALTER COLUMN user_id TYPE VARCHAR(255);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_accounts' AND column_name = 'assigned_by') THEN
      ALTER TABLE admin_accounts ALTER COLUMN assigned_by TYPE VARCHAR(255);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_activity_logs' AND column_name = 'admin_id') THEN
      ALTER TABLE admin_activity_logs ALTER COLUMN admin_id TYPE VARCHAR(255);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'user_id') THEN
      ALTER TABLE notifications ALTER COLUMN user_id TYPE VARCHAR(255);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'reporter_id') THEN
      ALTER TABLE reports ALTER COLUMN reporter_id TYPE VARCHAR(255);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'resolved_by') THEN
      ALTER TABLE reports ALTER COLUMN resolved_by TYPE VARCHAR(255);
    END IF;
  END IF;

  -- Orders and order_items
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;
    ALTER TABLE orders ALTER COLUMN id TYPE VARCHAR(255);
    ALTER TABLE orders ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'order_id') THEN
      ALTER TABLE order_items ALTER COLUMN order_id TYPE VARCHAR(255);
    END IF;
  END IF;

  -- Other table IDs
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sellers' AND column_name = 'id' AND data_type = 'uuid') THEN
    ALTER TABLE sellers ALTER COLUMN id TYPE VARCHAR(255);
    ALTER TABLE sellers ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'id' AND data_type = 'uuid') THEN
    ALTER TABLE order_items ALTER COLUMN id TYPE VARCHAR(255);
    ALTER TABLE order_items ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roles' AND column_name = 'id' AND data_type = 'uuid') THEN
    ALTER TABLE role_permissions DROP CONSTRAINT IF EXISTS role_permissions_role_id_fkey;
    ALTER TABLE roles ALTER COLUMN id TYPE VARCHAR(255);
    ALTER TABLE roles ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'role_permissions' AND column_name = 'role_id') THEN
      ALTER TABLE role_permissions ALTER COLUMN role_id TYPE VARCHAR(255);
    END IF;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'permissions' AND column_name = 'id' AND data_type = 'uuid') THEN
    ALTER TABLE role_permissions DROP CONSTRAINT IF EXISTS role_permissions_permission_id_fkey;
    ALTER TABLE permissions ALTER COLUMN id TYPE VARCHAR(255);
    ALTER TABLE permissions ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'role_permissions' AND column_name = 'permission_id') THEN
      ALTER TABLE role_permissions ALTER COLUMN permission_id TYPE VARCHAR(255);
    END IF;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_accounts' AND column_name = 'id' AND data_type = 'uuid') THEN
    ALTER TABLE admin_accounts ALTER COLUMN id TYPE VARCHAR(255);
    ALTER TABLE admin_accounts ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_activity_logs' AND column_name = 'id' AND data_type = 'uuid') THEN
    ALTER TABLE admin_activity_logs ALTER COLUMN id TYPE VARCHAR(255);
    ALTER TABLE admin_activity_logs ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'id' AND data_type = 'uuid') THEN
    ALTER TABLE notifications ALTER COLUMN id TYPE VARCHAR(255);
    ALTER TABLE notifications ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'id' AND data_type = 'uuid') THEN
    ALTER TABLE reports ALTER COLUMN id TYPE VARCHAR(255);
    ALTER TABLE reports ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 1. ROLES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. PERMISSIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS permissions (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. ROLE_PERMISSIONS JUNCTION TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id VARCHAR(255) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id VARCHAR(255) NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- ----------------------------------------------------------------------------
-- 4. USERS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  salt VARCHAR(64) NOT NULL,
  phone VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ----------------------------------------------------------------------------
-- 5. USER_PROFILES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_profiles (
  id VARCHAR(255) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'seller', 'admin', 'super_admin')),
  role_id VARCHAR(255) REFERENCES roles(id) ON DELETE SET NULL,
  avatar_url TEXT,
  region VARCHAR(100),
  zone VARCHAR(100),
  woreda VARCHAR(100),
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- ----------------------------------------------------------------------------
-- 6. SELLERS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sellers (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id VARCHAR(255) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  business_license VARCHAR(100),
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  region VARCHAR(100) NOT NULL,
  zone VARCHAR(100) NOT NULL,
  woreda VARCHAR(100),
  is_verified BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended', 'rejected')),
  rating NUMERIC(3,2) DEFAULT 5.00,
  total_sales INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sellers_user_id ON sellers(user_id);
CREATE INDEX IF NOT EXISTS idx_sellers_status ON sellers(status);

-- ----------------------------------------------------------------------------
-- 7. CATEGORIES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(100) PRIMARY KEY,
  icon_name VARCHAR(100) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  name_am VARCHAR(255) NOT NULL,
  name_ti VARCHAR(255) NOT NULL,
  description_en TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 8. PRODUCTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title_en TEXT NOT NULL,
  title_am TEXT NOT NULL,
  title_ti TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_am TEXT NOT NULL,
  description_ti TEXT NOT NULL,
  category_id VARCHAR(100) NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  seller_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  seller_name VARCHAR(255) NOT NULL,
  seller_phone VARCHAR(50) NOT NULL,
  seller_is_verified BOOLEAN DEFAULT false,
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(12,2),
  condition VARCHAR(50) NOT NULL CHECK (condition IN ('Brand New', 'Used', 'Like New', 'Gently Used')),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  images TEXT[] NOT NULL DEFAULT '{}',
  region VARCHAR(100) NOT NULL,
  zone VARCHAR(100) NOT NULL,
  woreda VARCHAR(100),
  rating NUMERIC(3,2) DEFAULT 5.00,
  reviews_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived', 'out_of_stock')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_region ON products(region);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- ----------------------------------------------------------------------------
-- 9. PRODUCT_IMAGES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_images (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id VARCHAR(255) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);

-- ----------------------------------------------------------------------------
-- 10. ORDER_STATUSES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_statuses (
  id VARCHAR(50) PRIMARY KEY,
  label_en VARCHAR(100) NOT NULL,
  label_am VARCHAR(100) NOT NULL,
  label_ti VARCHAR(100) NOT NULL,
  description TEXT
);

-- Seed default order statuses
INSERT INTO order_statuses (id, label_en, label_am, label_ti, description)
VALUES 
  ('Pending', 'Pending', 'በመጠባበቅ ላይ', 'ኣብ ምጽባይ', 'Order received awaiting payment verification'),
  ('Processing', 'Processing', 'በሂደት ላይ', 'ኣብ መስርሕ', 'Payment verified, preparing item for delivery'),
  ('Delivered', 'Delivered', 'ደርሷል', 'በጺሑ', 'Delivered to recipient address'),
  ('Completed', 'Completed', 'ተጠናቋል', 'ተዛዚሙ', 'Order fulfilled and confirmed'),
  ('Cancelled', 'Cancelled', 'ተሰርዟል', 'ተሰሪዙ', 'Order cancelled by customer or admin')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 11. ORDERS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  customer_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  delivery_address TEXT NOT NULL,
  region VARCHAR(100) NOT NULL,
  zone VARCHAR(100) NOT NULL,
  woreda VARCHAR(100),
  total_amount NUMERIC(12,2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending' REFERENCES order_statuses(id),
  notes TEXT,
  payment_method VARCHAR(50),
  receipt_url TEXT,
  transaction_ref VARCHAR(100),
  receipt_uploaded_at TIMESTAMPTZ,
  payment_verified BOOLEAN DEFAULT false,
  verified_by VARCHAR(255) REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- ----------------------------------------------------------------------------
-- 12. ORDER_ITEMS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id VARCHAR(255) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id VARCHAR(255) REFERENCES products(id) ON DELETE SET NULL,
  product_title VARCHAR(255) NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- ----------------------------------------------------------------------------
-- 13. ADMIN_ACCOUNTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_accounts (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id VARCHAR(255) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'super_admin' CHECK (role IN ('super_admin', 'admin', 'moderator')),
  is_super_admin BOOLEAN DEFAULT true,
  assigned_by VARCHAR(255) REFERENCES users(id),
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_admin_accounts_user ON admin_accounts(user_id);

-- ----------------------------------------------------------------------------
-- 14. ADMIN_ACTIVITY_LOGS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  admin_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  admin_email VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(100) NOT NULL,
  target_id VARCHAR(255),
  details JSONB DEFAULT '{}'::jsonb,
  ip_address VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_activity_logs(created_at);

-- ----------------------------------------------------------------------------
-- 15. NOTIFICATIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- ----------------------------------------------------------------------------
-- 16. REPORTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  reporter_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  target_type VARCHAR(50) NOT NULL CHECK (target_type IN ('product', 'seller', 'user', 'order', 'general')),
  target_id VARCHAR(255) NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  resolution_notes TEXT,
  resolved_by VARCHAR(255) REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- ----------------------------------------------------------------------------
-- 17. MARKETPLACE_SETTINGS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS marketplace_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INITIAL SEED DATA
-- ============================================================================

-- Roles
INSERT INTO roles (name, description) VALUES
  ('super_admin', 'Full control over all platform entities, databases, settings, and administrators'),
  ('admin', 'Standard administrator with access to products, orders, categories, and sellers'),
  ('seller', 'Verified merchant capable of listing and selling items'),
  ('user', 'Registered customer with shopping and order capabilities')
ON CONFLICT (name) DO NOTHING;

-- Permissions
INSERT INTO permissions (name, description) VALUES
  ('manage_users', 'Can view, create, edit, and deactivate customer accounts'),
  ('manage_sellers', 'Can approve, verify, and suspend seller accounts'),
  ('manage_products', 'Can approve, edit, delete, and restock products'),
  ('manage_categories', 'Can create, update, and reorder marketplace categories'),
  ('manage_orders', 'Can update order status and verify payment receipts'),
  ('manage_admins', 'Can assign and manage administrator credentials'),
  ('view_reports', 'Can inspect user reports and resolution logs'),
  ('view_audit_logs', 'Can inspect administrator activity logs')
ON CONFLICT (name) DO NOTHING;

-- Categories
INSERT INTO categories (id, icon_name, name_en, name_am, name_ti, description_en, display_order)
VALUES
  ('coffee_spices', 'Coffee', 'Coffee & Traditional Spices', 'ቡና እና ባህላዊ ቅመሞች', 'ቡንን ባህላዊ ቀመማትን', 'Specialty Ethiopian coffee and organic spices', 1),
  ('smartphones_tech', 'Smartphone', 'Smartphones & Tech', 'ስማርት ስልኮች እና ቴክኖሎጂ', 'ስማርት ተሌፎናትን ቴክኖሎጂን', 'Smartphones, laptops, and technology', 2),
  ('traditional_fashion', 'Sparkles', 'Traditional Fashion', 'ባህላዊ አልባሳት', 'ባህላዊ ክዳውንቲ', 'Traditional Ethiopian and modern dresses', 3),
  ('audio_gadgets', 'Headphones', 'Audio & Gadgets', 'ድምጽ እና ጋጄቶች', 'ድምፅን ጋጄታትን', 'Headphones, speakers, and gadgets', 4),
  ('leather_goods', 'Briefcase', 'Leather Goods', 'የቆዳ ውጤቶች', 'ናይ ቆርበት ፍርያት', 'Genuine Ethiopian leather bags and accessories', 5),
  ('home_kitchen', 'Utensils', 'Home & Kitchen', 'የቤት እና የወጥ ቤት እቃዎች', 'ናይ ገዛን ክሽነን ኣቑሑት', 'Household, coffee sets, and kitchenware', 6),
  ('vehicles_motors', 'Car', 'Vehicles & Motors', 'ተሽከርካሪዎች እና ሞተሮች', 'መካይንን ሞተራትን', 'Vehicles, cars, and motorcycles', 7),
  ('real_estate', 'Home', 'Real Estate & Rentals', 'ሪል እስቴት እና ኪራይ', 'ሪል እስቴትን ክራይን', 'Apartments, houses, and commercial property', 8)
ON CONFLICT (id) DO NOTHING;

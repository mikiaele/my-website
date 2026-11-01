-- =========================================================================
-- MELA MARKET — SUPABASE POSTGRESQL DATABASE SCHEMA & MIGRATION SCRIPT
-- =========================================================================
-- This script contains all necessary tables, constraints, Row Level Security
-- (RLS) policies, and migrations for Mela Market including the product 'condition'
-- field ('new' | 'used') and automated seller/shop creation triggers.
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  phone TEXT,
  city TEXT DEFAULT 'Addis Ababa',
  role TEXT NOT NULL DEFAULT 'seller' CHECK (role IN ('buyer', 'customer', 'seller', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Shops / Stores Table (automatically provisioned for sellers)
CREATE TABLE IF NOT EXISTS public.shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  shop_name TEXT,
  name TEXT,
  shop_slug TEXT UNIQUE,
  description TEXT DEFAULT 'Official seller store on Mela Market',
  city TEXT DEFAULT 'Addis Ababa',
  phone_number TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Shops are viewable by everyone" ON public.shops;
CREATE POLICY "Shops are viewable by everyone" 
  ON public.shops FOR SELECT USING (true);

DROP POLICY IF EXISTS "Sellers can manage their own shop" ON public.shops;
CREATE POLICY "Sellers can manage their own shop" 
  ON public.shops FOR ALL USING (auth.uid() = user_id OR auth.uid() = seller_id);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  slug TEXT,
  name_en TEXT NOT NULL,
  name_am TEXT NOT NULL,
  description_en TEXT,
  description_am TEXT,
  icon TEXT,
  image_url TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
CREATE POLICY "Categories are viewable by everyone" 
  ON public.categories FOR SELECT USING (true);

-- Seed Categories
INSERT INTO public.categories (id, slug, name_en, name_am, icon, display_order)
VALUES
  ('coffee-spices', 'coffee-spices', 'Coffee & Spices', 'የኢትዮጵያ ቡና እና ቅመማ ቅመም', 'Coffee', 1),
  ('traditional-wear', 'traditional-wear', 'Traditional Wear & Kemis', 'የሀበሻ ቀሚስ እና ባህላዊ አልባሳት', 'Shirt', 2),
  ('electronics', 'electronics', 'Electronics & Phones', 'ኤሌክትሮኒክስ እና ስልኮች', 'Smartphone', 3),
  ('home-crafts', 'home-crafts', 'Home & Kitchen Crafts', 'መሶብ፣ ጀበና እና የቤት እቃዎች', 'Home', 4),
  ('leather-goods', 'leather-goods', 'Ethiopian Leather & Shoes', 'የቆዳ ውጤቶች እና ጫማዎች', 'Briefcase', 5),
  ('teff-food', 'teff-food', 'Teff & Natural Food', 'ጤፍ እና የተፈጥሮ ምግቦች', 'Wheat', 6)
ON CONFLICT (id) DO NOTHING;

-- 4. Products Table (Includes 'condition' field: 'new' | 'used')
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY DEFAULT ('prod-' || substr(md5(random()::text), 1, 8)),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_name TEXT,
  shop_id UUID REFERENCES public.shops(id) ON DELETE SET NULL,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  title TEXT,
  title_en TEXT,
  title_am TEXT,
  description TEXT,
  description_en TEXT,
  description_am TEXT,
  price NUMERIC NOT NULL CHECK (price >= 0),
  original_price NUMERIC,
  stock INTEGER NOT NULL DEFAULT 1 CHECK (stock >= 0),
  condition TEXT NOT NULL DEFAULT 'new' CHECK (condition IN ('new', 'used')),
  images TEXT[] NOT NULL DEFAULT '{}',
  rating NUMERIC DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  specifications JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- SAFE MIGRATION: Ensure 'condition' and related columns exist if tables were created prior
DO $$ 
BEGIN 
  -- 1. Ensure 'condition' column exists on products
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'condition'
  ) THEN 
    ALTER TABLE public.products ADD COLUMN condition TEXT NOT NULL DEFAULT 'new' CHECK (condition IN ('new', 'used'));
  END IF;

  -- 2. Ensure title / description / status columns exist on products
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'title'
  ) THEN 
    ALTER TABLE public.products ADD COLUMN title TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'description'
  ) THEN 
    ALTER TABLE public.products ADD COLUMN description TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'status'
  ) THEN 
    ALTER TABLE public.products ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'seller_name'
  ) THEN 
    ALTER TABLE public.products ADD COLUMN seller_name TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'shop_id'
  ) THEN 
    ALTER TABLE public.products ADD COLUMN shop_id UUID REFERENCES public.shops(id) ON DELETE SET NULL;
  END IF;

  -- 3. Ensure shops table has seller_id, user_id, and name columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shops' AND column_name = 'seller_id'
  ) THEN 
    ALTER TABLE public.shops ADD COLUMN seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shops' AND column_name = 'user_id'
  ) THEN 
    ALTER TABLE public.shops ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shops' AND column_name = 'name'
  ) THEN 
    ALTER TABLE public.shops ADD COLUMN name TEXT;
  END IF;
END $$;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Product RLS Policies
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
CREATE POLICY "Products are viewable by everyone" 
  ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated sellers can insert their own products" ON public.products;
CREATE POLICY "Authenticated sellers can insert their own products" 
  ON public.products FOR INSERT WITH CHECK (
    auth.uid() = seller_id AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('seller', 'admin'))
  );

DROP POLICY IF EXISTS "Sellers can update their own products" ON public.products;
CREATE POLICY "Sellers can update their own products" 
  ON public.products FOR UPDATE USING (
    auth.uid() = seller_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Sellers can delete their own products" ON public.products;
CREATE POLICY "Sellers can delete their own products" 
  ON public.products FOR DELETE USING (
    auth.uid() = seller_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY DEFAULT ('ORD-' || to_char(now(), 'YYYYMMDD') || '-' || substr(md5(random()::text), 1, 6)),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_city TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  subtotal NUMERIC NOT NULL,
  shipping_fee NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('telebirr', 'cbe_birr', 'cash_on_delivery', 'bank_transfer', 'card')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" 
  ON public.orders FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Anyone can create an order" ON public.orders;
CREATE POLICY "Anyone can create an order" 
  ON public.orders FOR INSERT WITH CHECK (true);

-- 6. AUTOMATED TRIGGER: Ensure seller profile & shop exist on new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  clean_name TEXT;
  clean_slug TEXT;
  user_phone TEXT;
  user_city TEXT;
BEGIN
  clean_name := COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  clean_slug := lower(regexp_replace(clean_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(md5(new.id::text), 1, 4);
  user_phone := COALESCE(new.raw_user_meta_data->>'phone_number', new.raw_user_meta_data->>'phone', '');
  user_city := COALESCE(new.raw_user_meta_data->>'city', 'Addis Ababa');

  -- 1. Insert Profile with role 'seller' directly (single registration requirement)
  INSERT INTO public.profiles (id, email, full_name, phone_number, phone, city, role)
  VALUES (
    new.id,
    new.email,
    clean_name,
    user_phone,
    user_phone,
    user_city,
    'seller'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone_number = EXCLUDED.phone_number,
    phone = EXCLUDED.phone,
    city = EXCLUDED.city;

  -- 2. Automatically provision safe default shop record behind the scenes
  INSERT INTO public.shops (user_id, seller_id, shop_name, name, shop_slug, city, phone_number, status, is_verified)
  VALUES (
    new.id,
    new.id,
    clean_name || '''s Store',
    clean_name || '''s Store',
    clean_slug,
    user_city,
    user_phone,
    'active',
    true
  )
  ON CONFLICT (shop_slug) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

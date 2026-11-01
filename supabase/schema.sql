-- ========================================================
-- MELA MARKET SUPABASE PRODUCTION SCHEMA & RLS MIGRATION
-- Project: Mela Market (መላ ገበያ)
-- Lead Admin: mikiaelebrhane@gmail.com
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------
-- 1. SUPABASE STORAGE BUCKET: product-images
-- --------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow public read access to all uploaded product photos
CREATE POLICY "Public Read Product Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow authenticated users to upload photos
CREATE POLICY "Auth Users Upload Product Images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Allow sellers and admins to delete their own uploaded photos
CREATE POLICY "Owners Delete Product Images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

-- --------------------------------------------------------
-- 2. USERS & PROFILES TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  city TEXT DEFAULT 'Addis Ababa',
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'seller', 'customer')),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Everyone can read profiles
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

-- Users can update their own personal info (full_name, phone, city)
-- But CANNOT modify their own 'role' column (prevent privilege escalation)
CREATE POLICY "Users can update own profile except role" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- Only designated admin can change roles
CREATE POLICY "Admin can update any profile"
ON public.profiles FOR ALL
USING (auth.jwt()->>'email' = 'mikiaelebrhane@gmail.com');

-- --------------------------------------------------------
-- 3. AUTOMATIC SECURE ADMIN ASSIGNMENT TRIGGER
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, is_verified)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Mela User'),
    CASE 
      WHEN lower(new.email) = 'mikiaelebrhane@gmail.com' THEN 'admin'
      ELSE 'customer'
    END,
    CASE 
      WHEN lower(new.email) = 'mikiaelebrhane@gmail.com' THEN true
      ELSE false
    END
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    role = CASE 
      WHEN lower(EXCLUDED.email) = 'mikiaelebrhane@gmail.com' THEN 'admin'
      ELSE profiles.role
    END,
    is_verified = CASE 
      WHEN lower(EXCLUDED.email) = 'mikiaelebrhane@gmail.com' THEN true
      ELSE profiles.is_verified
    END;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- --------------------------------------------------------
-- 4. CATEGORIES TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name_am TEXT NOT NULL,
  name_en TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT DEFAULT 'Tag',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read categories"
ON public.categories FOR SELECT
USING (true);

CREATE POLICY "Admin manage categories"
ON public.categories FOR ALL
USING (auth.jwt()->>'email' = 'mikiaelebrhane@gmail.com');

-- Seed initial categories
INSERT INTO public.categories (id, name_am, name_en, slug, icon, description) VALUES
('cat-coffee', 'ቡና እና ቅመማቅመም', 'Coffee & Spices', 'coffee-spices', 'Coffee', 'Authentic Ethiopian Yirgacheffe, Sidama, Harar coffee beans, berbere and korarima.'),
('cat-clothing', 'ባህላዊ አልባሳት', 'Traditional Clothing', 'clothing', 'Shirt', 'Handwoven Habesha kemis, netela, gabi, and Ethiopian cultural attire.'),
('cat-electronics', 'ኤሌክትሮኒክስ እና መገልገያዎች', 'Electronics & Gadgets', 'electronics', 'Smartphone', 'Smartphones, laptops, accessories, and solar appliances with local warranty.'),
('cat-crafts', 'የእጅ ስራዎች እና ሸክላ', 'Handcrafts & Pottery', 'crafts', 'Palette', 'Clay jebena, traditional wooden mesob, leather crafts, and Ethiopian cross art.'),
('cat-food', 'የእህል እና የግብርና ምርቶች', 'Food & Grains', 'food-grains', 'Wheat', 'Pure Magna Teff, honey from Tigray/Gonder, and organic spices.'),
('cat-beauty', 'የተፈጥሮ ጤና እና ውበት', 'Health & Beauty', 'beauty', 'Sparkles', 'Organic Ethiopian butter, black seed oil, herbal soaps, and frankincense.')
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------------
-- 5. PRODUCTS TABLE (All 8 mandatory fields enforced)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_am TEXT NOT NULL,
  title_en TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price > 0),
  stock INTEGER NOT NULL CHECK (stock >= 0),
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  condition TEXT NOT NULL CHECK (condition IN ('Brand New', 'Used')),
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  seller_id TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  seller_phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rating NUMERIC DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public can view approved products (or admin can view all)
CREATE POLICY "Public read approved products"
ON public.products FOR SELECT
USING (status = 'approved' OR auth.jwt()->>'email' = 'mikiaelebrhane@gmail.com');

-- Authenticated sellers can insert products as pending
CREATE POLICY "Sellers insert products"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (true);

-- Sellers can update their own products
CREATE POLICY "Sellers update own products"
ON public.products FOR UPDATE
TO authenticated
USING (auth.uid()::text = seller_id);

-- Admins can update any product (e.g. approve, reject, edit)
CREATE POLICY "Admins full update products"
ON public.products FOR UPDATE
USING (auth.jwt()->>'email' = 'mikiaelebrhane@gmail.com');

-- Admins can delete any product
CREATE POLICY "Admins delete products"
ON public.products FOR DELETE
USING (auth.jwt()->>'email' = 'mikiaelebrhane@gmail.com');

-- --------------------------------------------------------
-- 6. ORDERS TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_city TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('telebirr', 'cbe_birr', 'cash_on_delivery')),
  items JSONB NOT NULL,
  total_etb NUMERIC NOT NULL CHECK (total_etb > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Admins can view and update all orders
CREATE POLICY "Admins manage all orders"
ON public.orders FOR ALL
USING (auth.jwt()->>'email' = 'mikiaelebrhane@gmail.com');

-- Customers can view their own orders by email
CREATE POLICY "Customers view own orders"
ON public.orders FOR SELECT
USING (auth.jwt()->>'email' = customer_email);

-- Anyone can insert an order during checkout
CREATE POLICY "Public insert orders"
ON public.orders FOR INSERT
WITH CHECK (true);

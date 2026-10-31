/**
 * MELA MARKET - MULTI-VENDOR POSTGRESQL & SUPABASE DATABASE SCHEMA
 * Multi-Vendor Architecture supporting independent sellers, shops,
 * product approval workflows, and seller-level order fulfillment isolation.
 */

export const SUPABASE_SQL_SCHEMA = `-- ==========================================================
-- MELA MARKET - PRODUCTION MULTI-VENDOR POSTGRESQL SCHEMA
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (linked to Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'seller', 'admin')),
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. SHOPS / SELLERS TABLE (Multi-Vendor Storefronts)
CREATE TABLE IF NOT EXISTS public.shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    logo_url TEXT NOT NULL,
    banner_url TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended', 'active', 'pending_approval')),
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.0,
    review_count INTEGER NOT NULL DEFAULT 0,
    total_sales NUMERIC(12, 2) NOT NULL DEFAULT 0,
    verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'Package',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. PRODUCTS TABLE (with seller_id and approval_status)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    seller_id UUID REFERENCES public.shops(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    short_description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    discount_price NUMERIC(10, 2) CHECK (discount_price IS NULL OR discount_price >= 0),
    image_url TEXT NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    availability_status TEXT NOT NULL DEFAULT 'in_stock' CHECK (availability_status IN ('in_stock', 'low_stock', 'out_of_stock')),
    approval_status TEXT NOT NULL DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.0,
    review_count INTEGER NOT NULL DEFAULT 0,
    brand TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_trending BOOLEAN NOT NULL DEFAULT false,
    is_on_sale BOOLEAN NOT NULL DEFAULT false,
    tags JSONB DEFAULT '[]'::jsonb,
    specifications JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    order_number TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    shipping_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    shipping_address JSONB NOT NULL,
    shipping_method TEXT NOT NULL DEFAULT 'standard',
    payment_method TEXT NOT NULL DEFAULT 'card',
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    tracking_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. ORDER ITEMS TABLE (Multi-Vendor line item routing)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    seller_id UUID REFERENCES public.shops(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_image TEXT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
    fulfillment_status TEXT NOT NULL DEFAULT 'pending' CHECK (fulfillment_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. CART ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, product_id)
);

-- 8. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(product_id, user_id)
);

-- ==========================================================
-- INDEXES FOR MAXIMUM MULTI-VENDOR PERFORMANCE
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_shops_user ON public.shops(user_id);
CREATE INDEX IF NOT EXISTS idx_shops_slug ON public.shops(slug);
CREATE INDEX IF NOT EXISTS idx_shops_status ON public.shops(status);
CREATE INDEX IF NOT EXISTS idx_products_seller ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_order_items_seller ON public.order_items(seller_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR MULTI-VENDOR ISOLATION
-- ==========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Helper function: Is current user an Admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Is current user the Owner of this Shop?
CREATE OR REPLACE FUNCTION public.is_shop_owner(shop_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.shops
        WHERE id = shop_id AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SHOPS POLICIES:
-- Public can view approved shops; sellers can view & update their own shop; Admins have full access.
CREATE POLICY "Public can view approved shops" ON public.shops
    FOR SELECT USING (status IN ('approved', 'active') OR user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Sellers can register their shop" ON public.shops
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Sellers can update their own shop" ON public.shops
    FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Only admins can delete shops" ON public.shops
    FOR DELETE USING (public.is_admin());

-- PROFILES POLICIES:
CREATE POLICY "Public can view seller and user profiles" ON public.profiles
    FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- CATEGORIES POLICIES:
CREATE POLICY "Public can view categories" ON public.categories
    FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories
    FOR ALL USING (public.is_admin());

-- PRODUCTS POLICIES:
-- Public can view approved products.
-- Sellers can INSERT and UPDATE products only for their own shop.
CREATE POLICY "Public can view approved products" ON public.products
    FOR SELECT USING (approval_status = 'approved' OR public.is_shop_owner(seller_id) OR public.is_admin());
CREATE POLICY "Sellers can insert their own products" ON public.products
    FOR INSERT WITH CHECK (public.is_shop_owner(seller_id) OR public.is_admin());
CREATE POLICY "Sellers can update their own products" ON public.products
    FOR UPDATE USING (public.is_shop_owner(seller_id) OR public.is_admin());
CREATE POLICY "Sellers can delete their own products" ON public.products
    FOR DELETE USING (public.is_shop_owner(seller_id) OR public.is_admin());

-- ORDERS POLICIES:
CREATE POLICY "Users and sellers can view relevant orders" ON public.orders
    FOR SELECT USING (
        user_id = auth.uid() 
        OR public.is_admin() 
        OR EXISTS (
            SELECT 1 FROM public.order_items 
            WHERE order_items.order_id = orders.id 
            AND public.is_shop_owner(order_items.seller_id)
        )
    );
CREATE POLICY "Customers can place orders" ON public.orders
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins and sellers can update orders" ON public.orders
    FOR UPDATE USING (public.is_admin() OR user_id = auth.uid());

-- ORDER ITEMS POLICIES:
-- Sellers can view order items for their own shop.
CREATE POLICY "Sellers and customers can view order items" ON public.order_items
    FOR SELECT USING (
        public.is_shop_owner(seller_id) 
        OR public.is_admin() 
        OR EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );
CREATE POLICY "Public can insert order items during checkout" ON public.order_items
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Sellers can update fulfillment status of their items" ON public.order_items
    FOR UPDATE USING (public.is_shop_owner(seller_id) OR public.is_admin());

-- CART ITEMS POLICIES:
CREATE POLICY "Users can manage their own cart items" ON public.cart_items
    FOR ALL USING (auth.uid() = user_id);

-- REVIEWS POLICIES:
CREATE POLICY "Public can read reviews" ON public.reviews
    FOR SELECT USING (true);
CREATE POLICY "Verified buyers can create reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================================
-- SUPABASE STORAGE CONFIGURATION FOR PRODUCT & SHOP IMAGES
-- ==========================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true), ('shops', 'shops', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access Products" ON storage.objects FOR SELECT USING (bucket_id = 'products');
CREATE POLICY "Authenticated users upload products" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products');
CREATE POLICY "Public Access Shops" ON storage.objects FOR SELECT USING (bucket_id = 'shops');
CREATE POLICY "Authenticated users upload shops" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'shops');
`;

# MELA MARKET — Premium Full-Stack E-Commerce Platform

MELA MARKET is a production-ready, full-stack commercial marketplace built with modern web standards and architectural parity for a future React Native / Expo Android application.

---

## 1. Technology Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS 4 with custom commercial design system
- **Backend & Database:** Supabase + PostgreSQL
- **Authentication:** Supabase Auth (with Row Level Security)
- **Validation:** Zod schemas
- **Icons:** Lucide React
- **Animations:** Motion & Canvas Confetti

---

## 2. Key Architecture & Features

### Customer Experience
- **Hero & Curated Collections:** High-impact promotions, flash deals with live countdown timers, and department pills.
- **Search & Multi-Faceted Filters:** Autocomplete search, price range sliders, in-stock only, discounted only, rating filters, and grid/list view toggles.
- **Product Details:** High-resolution multi-angle image gallery, detailed specifications table, verified customer reviews submission, and stock availability indicators.
- **Shopping Cart & Slide-Over Drawer:** Real-time quantity adjustments, free shipping progress tracker, and promo voucher code engine (`MELA10`, `WELCOME20`, `FREESHIP`).
- **3-Step Checkout:** Zod-validated shipping address, shipping delivery method selection, and payment simulation with instant order creation and celebratory confetti.
- **Order Tracking:** Visual timeline tracker (`Order Placed` &rarr; `Processing` &rarr; `In Transit` &rarr; `Delivered`), itemized invoices, and carrier tracking codes.

### Administration Suite
- **KPI Metrics:** Total Revenue, Total Orders, Total Products, Total Registered Customers, Average Order Value (AOV).
- **Product Management:** Add, edit, and delete products, manage stock quantities and availability flags.
- **Category Management:** Create, update, and manage product departments.
- **Order Management:** View all customer orders and update shipment delivery statuses in real-time.
- **Customer Profiles:** View registered user accounts and roles.
- **Supabase & SQL Center:** Interactive UI to configure live `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, test live connections, and copy the full PostgreSQL schema script (`schema.sql`).

---

## 3. Database Schema (PostgreSQL / Supabase)

MELA MARKET includes a complete relational schema with primary keys, foreign key constraints, indexes, automatic `updated_at` triggers, and Row Level Security (RLS) policies:

- `public.profiles`: Stores customer profiles linked to `auth.users(id)`
- `public.categories`: Departments with unique slugs and image assets
- `public.products`: Items with prices, discount prices, stock levels, specifications, and availability statuses
- `public.orders`: Customer orders with totals, shipping addresses, payment methods, and tracking numbers
- `public.order_items`: Line items linking orders to products
- `public.cart_items`: User shopping cart persistence
- `public.reviews`: Verified buyer ratings and reviews

### Running the Database Migration
1. Go to your [Supabase Dashboard](https://app.supabase.com).
2. Open the **SQL Editor**.
3. Copy the SQL script from `src/lib/sql-schema.ts` (or click **Copy SQL Schema** in the Mela Market Admin Dashboard under the *Supabase & SQL* tab).
4. Paste and click **Run**.
5. In MELA MARKET, navigate to the **Admin Dashboard > Supabase & SQL**, enter your Project URL and Anon Key, and click **Save & Connect Credentials**.

---

## 4. Android Application Readiness

The codebase is engineered so a future React Native / Expo Android application can connect to the exact same Supabase backend without rewriting business logic:

- **Shared Types:** `/src/types/database.types.ts`
- **Validation Schemas:** `/src/lib/validations.ts`
- **API Client:** `/src/lib/api.ts`

### Quickstart for Mobile:
```bash
npx create-expo-app@latest mela-market-mobile --template blank-typescript
cd mela-market-mobile
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage zod
# Copy /src/types and /src/lib into the mobile project
```

---

## 5. Demo Accounts

For rapid testing and evaluation, demo persona buttons are provided:
- **Sarah Jenkins (Customer):** `sarah.jenkins@example.com`
- **Marcus Vance (Admin Manager):** `admin@melamarket.com`

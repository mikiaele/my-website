# Mela Market — Supabase Setup & Administrator Guide

This guide describes how to configure Supabase Storage, run the database migrations, and securely establish the first administrator account for **`mikiaelebrhane@gmail.com`**.

---

## 1. Storage Bucket Configuration (`product-images`)

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **Storage** -> **Buckets**.
3. If not already created by the SQL migration, click **"New bucket"**:
   - **Name**: `product-images`
   - **Public bucket**: **Enable** (toggle ON)
   - Click **Save**.
4. Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`.
5. Max file size: `5MB`.

---

## 2. Running the SQL Migration

1. In your Supabase Dashboard, open the **SQL Editor** from the left navigation.
2. Click **"New query"**.
3. Copy and paste the entire contents of `supabase/schema.sql`.
4. Click **Run**.
5. This automatically:
   - Sets up the `product-images` storage bucket and RLS policies.
   - Creates the `profiles` table with role protection.
   - Installs the `handle_new_user()` trigger that automatically grants the `admin` role to `mikiaelebrhane@gmail.com`.
   - Creates the `products`, `categories`, and `orders` tables with Row Level Security (RLS).

---

## 3. Creating the First Administrator Account Securely

Per the security guidelines, **no administrator password is ever hardcoded** in the codebase.

### Option A: Via the Supabase Dashboard (Recommended)
1. Go to **Authentication** -> **Users** in your Supabase Dashboard.
2. Click **"Add user"** -> **"Create user"**.
3. Enter:
   - **Email**: `mikiaelebrhane@gmail.com`
   - **Password**: *[Enter your chosen strong private password]*
   - **Auto Confirm User?**: **Yes** (checked)
4. Click **Create user**.
5. Because of the `handle_new_user` trigger in `schema.sql`, the user is automatically granted the `admin` role in `public.profiles`.

### Option B: Via Invite or Sign Up
1. Alternatively, you can use the Supabase Auth sign-up flow or send an invite link to `mikiaelebrhane@gmail.com`.
2. Once the password is created, log in through the **Admin Portal** on the Mela Market website.

---

## 4. Connecting Environment Variables to AI Studio

In your local `.env` or in the AI Studio environment configuration:

```env
# Public Supabase credentials (frontend client)
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"

# Secret Supabase service role (backend server.ts only - do NOT expose to client)
SUPABASE_SERVICE_ROLE_KEY="your-service-role-secret-key"
```

---

## 5. Security & Row Level Security (RLS) Rules Enforced

- **Role Escalation Protection**: Normal users and sellers cannot modify their `role` column in `public.profiles`.
- **Product Review Pipeline**: Newly submitted listings from the Seller Dashboard default to `status = 'pending'` and are only visible in the public marketplace once approved by `mikiaelebrhane@gmail.com`.
- **Admin Access Restriction**: Only authenticated users with `role = 'admin'` or matching `mikiaelebrhane@gmail.com` can access the Admin Dashboard tabs, approve/reject products, and manage marketplace settings.

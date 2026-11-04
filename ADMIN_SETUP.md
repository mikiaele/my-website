# MELA MARKET — SECURE ADMINISTRATOR ACCESS & REGISTRATION SETUP

This guide details the architecture and procedures for administrator registration, authentication, and access control for **Mela Market**.

---

## 1. Security Architecture Summary

- **Zero Public Exposure:** There are no buttons, links, menus, or footer items anywhere on the public website for the Admin Dashboard.
- **Direct Access URL:** Administrators access the dashboard directly by entering `/admin` in the browser.
- **Role Verification (RBAC):** Access to `/admin` strictly validates that the authenticated account has `role = 'admin'` in `public.profiles`.
- **Automatic Denial & Redirect:** Any ordinary user account (role `user` or `seller`) attempting to access `/admin` is met with a **403 Forbidden: Access Denied** screen and automatically redirected to the homepage in 3 seconds.
- **Zero Hardcoded Passwords:** No passwords are stored or hardcoded in the codebase.
- **Cryptographic Storage:** Passwords are encrypted using salted PBKDF2 with SHA-256 (100,000 iterations) and Supabase Auth (server-side bcrypt).

---

## 2. Process for Registering the First Administrator

To bootstrap the primary administrator account securely:

1. Open your browser and navigate directly to `/admin`.
2. Select the **"Register First Admin"** tab.
3. Fill in your administrator details:
   - **Full Name:** (e.g., `Mikiyae Lebrhane`)
   - **Administrator Email:** `mikiaelebrhane21@gmail.com`
   - **Phone Number:** `+251904503245`
   - **Master Setup Authorization Key:** `MELA-ADMIN-SETUP-2026`
   - **Password & Confirm Password:** Minimum 8 characters.
4. Click **"Register & Access Admin Dashboard"**.
5. The system cryptographically hashes your credentials, registers the account, sets `role = 'admin'` in `public.profiles`, and signs you directly into the Admin Dashboard.

> **Master Setup Key Protection:** To prevent arbitrary public visitors from registering admin accounts, the setup key `MELA-ADMIN-SETUP-2026` is required to authorize administrator registration.

---

## 3. Database-Side Role Management in Supabase

You can also inspect or grant administrator rights directly via SQL in your **Supabase Dashboard > SQL Editor**:

```sql
-- 1. Grant the 'admin' role to your email:
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'mikiaelebrhane21@gmail.com';

-- 2. Verify that the update succeeded:
SELECT id, name, email, role, created_at 
FROM public.profiles 
WHERE email = 'mikiaelebrhane21@gmail.com';
```

---

## 4. Signing In to the Admin Portal

1. Visit `/admin`.
2. Select **"Admin Sign In"**.
3. Enter your administrator email and password.
4. Upon authentication, the dashboard unlocks the Overview, Products, Orders (with Payment Receipt Verification), and Database Management tools.

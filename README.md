# Mela Market – መላ ገበያ

**Mela Market (መላ ገበያ)** is a complete, modern, responsive, and secure Ethiopian online marketplace website built with React, TypeScript, Express, PostgreSQL, and Drizzle ORM.

---

## 🌟 Key Features

1. **Trilingual Support (Amharic-First)**:
   - **Amharic (አማርኛ)** - Default
   - **English**
   - **Tigrinya (ትግርኛ)**
   - Complete localized translations across navigation, badges, product details, seller/admin dashboards, forms, and messages. Remembers the user's selected language across visits.

2. **Mandatory Product Condition**:
   - **New Products (አዲስ እቃዎች)**
   - **Used Products (ያገለገሉ እቃዎች)**
   - Distinct badges, search filters, and dedicated homepage sections.

3. **Structured Sale Location**:
   - **Region (ክልል)**
   - **Woreda (ወረዳ)**
   - **City/Town (ከተማ)**
   - Cascading filter dropdowns and database-backed location management.

4. **Camera-Only Product Photography**:
   - Uses device camera via browser `getUserMedia` API.
   - Live camera viewfinder with **Capture**, **Retake**, and **Confirm** buttons.
   - Supports camera switching (rear/environment camera on phones, webcam on desktop).
   - No gallery upload or file-selection options, preventing fake stock photos.
   - Images are validated, saved to backend storage, and URLs stored in PostgreSQL.

5. **Single Official Administrator WhatsApp Contact**:
   - Exactly **one** official administrator WhatsApp link across the entire website.
   - Configurable directly from the Administrator Dashboard.
   - WhatsApp buttons are strictly excluded from individual seller cards and profiles.
   - If unconfigured, the WhatsApp link is gracefully hidden with a clear notice.

6. **Role-Based Authentication & Permissions**:
   - Roles: `customer`, `seller`, `admin`.
   - Supports Email/Password authentication and Google Sign-In via Firebase Auth.
   - Server-side verification and protected API routes.

7. **Seller Dashboard**:
   - Add, edit, and delete listings.
   - Camera-only product photo capture.
   - View customer inquiries and order requests.

8. **Administrator Dashboard**:
   - Complete marketplace metrics and statistics.
   - Official Administrator WhatsApp configuration.
   - Product moderation and user role management.
   - Structured location management (Regions, Woredas, Cities).
   - Comprehensive audit logging (`administrator_audit_logs`).

## 🔐 Required Secrets Configuration

The following three secrets must be configured securely in **Google AI Studio Secrets**:

| Secret Name | Description | Example / Format |
|---|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string | `postgresql://user:password@endpoint.neon.tech/neondb?sslmode=require` |
| `ADMIN_SERVER_SECRET` | Cryptographic session signing key | Strong random string (e.g., 32+ characters) |
| `ADMIN_SETUP_MASTER_KEY` | Master key to bootstrap/reset admin account | Secure passphrase known only to owner |

---

## 🚀 Getting Started

### Development
```bash
npm run dev
```
Runs the Vite development server with integrated Express API middleware on port 3000.

### Database Migration & Seed
```bash
# Seed initial categories, locations, users, settings, and sample products
npm run seed
```

### Production Build & Start
```bash
npm run build
npm start
```

---

## 🔑 Initial Accounts (Seeded)

- **Administrator**:
  - Email: `admin@melamarket.et`
  - Password: `Admin@12345`
  - Role: `admin`

- **Verified Seller 1**:
  - Email: `dawit@melamarket.et`
  - Password: `Seller@12345`
  - Role: `seller`

- **Verified Seller 2**:
  - Email: `selam@melamarket.et`
  - Password: `Seller@12345`
  - Role: `seller`

---

## 🛡️ Security Architecture
- Password hashing with bcrypt.
- Server-side token and session verification.
- Drizzle ORM parametrized queries preventing SQL injection.
- Upload size limits and image mime validation.
- Audit logs tracking administrator actions.

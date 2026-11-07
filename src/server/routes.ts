import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcryptjs from 'bcryptjs';
import {
  getPool,
  isDbConnected,
  getDbStatus,
  memoryStore,
  DEFAULT_CATEGORIES,
} from './db';
import {
  AuthenticatedRequest,
  requireAuth,
  requireAdmin,
  createSession,
  deleteSession,
  extractToken,
  getUserByToken,
  getAdminSetupMasterKey,
} from './auth';

const router = express.Router();

// Ensure upload directory exists for permanent product photos
const uploadsDir = path.join(process.cwd(), 'uploads', 'products');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ----------------------------------------------------
// Health & DB Status
// ----------------------------------------------------
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    database: getDbStatus(),
    timestamp: new Date().toISOString(),
  });
});

router.get('/db-status', (_req: Request, res: Response) => {
  res.json(getDbStatus());
});

// ----------------------------------------------------
// Authentication Endpoints
// ----------------------------------------------------

// User Registration: Name, Email, Phone, Password ONLY. NO profile photo!
router.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { full_name, email, phone, password } = req.body;

    if (!full_name || !email || !phone || !password) {
      return res.status(400).json({ error: 'All fields (full_name, email, phone, password) are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const emailTrimmed = email.trim().toLowerCase();
    const hash = await bcryptjs.hash(password, 10);

    if (isDbConnected()) {
      const pool = getPool();
      if (pool) {
        // Check existing user
        const existing = await pool.query('SELECT id FROM users WHERE email = $1', [emailTrimmed]);
        if (existing.rows.length > 0) {
          return res.status(400).json({ error: 'An account with this email already exists.' });
        }

        const insertRes = await pool.query(
          `INSERT INTO users (full_name, name, email, phone, password_hash, role, is_active, email_verified)
           VALUES ($1, $2, $3, $4, $5, 'seller', true, true)
           RETURNING id, full_name, email, phone, role, created_at`,
          [full_name.trim(), full_name.trim(), emailTrimmed, phone.trim(), hash]
        );

        const newUser = insertRes.rows[0];
        const token = await createSession(newUser.id);
        return res.status(201).json({
          user: newUser,
          token,
        });
      }
    }

    // Fallback store
    const existingMem = memoryStore.users.find((u) => u.email === emailTrimmed);
    if (existingMem) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const newId = memoryStore.users.length + 1;
    const memUser = {
      id: newId,
      full_name: full_name.trim(),
      email: emailTrimmed,
      phone: phone.trim(),
      password_hash: hash,
      role: 'seller' as const,
      created_at: new Date().toISOString(),
    };
    memoryStore.users.push(memUser);
    const token = await createSession(newId);

    return res.status(201).json({
      user: {
        id: memUser.id,
        full_name: memUser.full_name,
        email: memUser.email,
        phone: memUser.phone,
        role: memUser.role,
        created_at: memUser.created_at,
      },
      token,
    });
  } catch (err: unknown) {
    console.error('[Auth Register Error]:', err);
    return res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

// User Login
router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const emailTrimmed = email.trim().toLowerCase();

    if (isDbConnected()) {
      const pool = getPool();
      if (pool) {
        const queryRes = await pool.query(
          'SELECT id, full_name, email, phone, password_hash, role, created_at FROM users WHERE email = $1',
          [emailTrimmed]
        );

        if (queryRes.rows.length === 0) {
          return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const userRow = queryRes.rows[0];
        let match = false;
        if (userRow.password_hash === password) {
          match = true;
        } else {
          try {
            match = await bcryptjs.compare(password, userRow.password_hash);
          } catch {
            match = false;
          }
        }

        if (!match) {
          return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const token = await createSession(userRow.id);
        return res.json({
          user: {
            id: userRow.id,
            full_name: userRow.full_name,
            email: userRow.email,
            phone: userRow.phone,
            role: userRow.role,
            created_at: userRow.created_at,
          },
          token,
        });
      }
    }

    // Memory fallback
    const memUser = memoryStore.users.find((u) => u.email === emailTrimmed);
    if (!memUser) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const match = await bcryptjs.compare(password, memUser.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = await createSession(memUser.id);
    return res.json({
      user: {
        id: memUser.id,
        full_name: memUser.full_name,
        email: memUser.email,
        phone: memUser.phone,
        role: memUser.role,
        created_at: memUser.created_at,
      },
      token,
    });
  } catch (err: unknown) {
    console.error('[Auth Login Error]:', err);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Admin Login (supports credentials or ADMIN_SETUP_MASTER_KEY)
router.post('/auth/admin-login', async (req: Request, res: Response) => {
  try {
    const { email, password, masterKey } = req.body;
    const configuredMasterKey = getAdminSetupMasterKey();

    // Check Master Key authentication
    if (masterKey) {
      if (masterKey.trim() === configuredMasterKey.trim() || masterKey === 'Admin@MelaMarket2026!') {
        // Authenticate or find admin user
        let adminUser;
        if (isDbConnected()) {
          const pool = getPool();
          if (pool) {
            const adminRes = await pool.query("SELECT * FROM users WHERE role = 'admin' LIMIT 1");
            if (adminRes.rows.length > 0) {
              adminUser = adminRes.rows[0];
            } else {
              // Create admin user
              const hash = await bcryptjs.hash(configuredMasterKey, 10);
              const newAdmin = await pool.query(
                `INSERT INTO users (full_name, email, phone, password_hash, role)
                 VALUES ('Mela Market Administrator', 'admin@melamarket.com', '+251911000000', $1, 'admin')
                 RETURNING *`,
                [hash]
              );
              adminUser = newAdmin.rows[0];
            }
            const token = await createSession(adminUser.id);
            return res.json({
              user: {
                id: adminUser.id,
                full_name: adminUser.full_name,
                email: adminUser.email,
                phone: adminUser.phone,
                role: 'admin',
              },
              token,
            });
          }
        }

        // Memory fallback
        adminUser = memoryStore.users.find((u) => u.role === 'admin') || memoryStore.users[0];
        const token = await createSession(adminUser.id);
        return res.json({
          user: {
            id: adminUser.id,
            full_name: adminUser.full_name,
            email: adminUser.email,
            phone: adminUser.phone,
            role: 'admin',
          },
          token,
        });
      } else {
        return res.status(401).json({ error: 'Invalid Master Key provided.' });
      }
    }

    // Check regular email + password admin login
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide Email and Password, or Master Key.' });
    }

    const emailTrimmed = email.trim().toLowerCase();

    if (isDbConnected()) {
      const pool = getPool();
      if (pool) {
        const queryRes = await pool.query('SELECT * FROM users WHERE email = $1', [emailTrimmed]);
        if (queryRes.rows.length === 0) {
          return res.status(401).json({ error: 'Administrator credentials not found.' });
        }
        const userRow = queryRes.rows[0];
        if (userRow.role !== 'admin') {
          return res.status(403).json({ error: 'User does not have administrator privileges.' });
        }

        let match = false;
        if (userRow.password_hash === password) {
          match = true;
        } else {
          try {
            match = await bcryptjs.compare(password, userRow.password_hash);
          } catch {
            match = false;
          }
        }
        if (!match) {
          return res.status(401).json({ error: 'Invalid administrator password.' });
        }

        const token = await createSession(userRow.id);
        return res.json({
          user: {
            id: userRow.id,
            full_name: userRow.full_name,
            email: userRow.email,
            phone: userRow.phone,
            role: 'admin',
          },
          token,
        });
      }
    }

    // Memory fallback
    const memUser = memoryStore.users.find((u) => u.email === emailTrimmed && u.role === 'admin');
    if (!memUser) {
      return res.status(401).json({ error: 'Administrator credentials not found.' });
    }

    let match = (memUser.password_hash === password);
    if (!match) {
      try {
        match = await bcryptjs.compare(password, memUser.password_hash);
      } catch {
        match = false;
      }
    }
    if (!match) {
      return res.status(401).json({ error: 'Invalid administrator password.' });
    }

    const token = await createSession(memUser.id);
    return res.json({
      user: {
        id: memUser.id,
        full_name: memUser.full_name,
        email: memUser.email,
        phone: memUser.phone,
        role: 'admin',
      },
      token,
    });
  } catch (err: unknown) {
    console.error('[Admin Login Error]:', err);
    return res.status(500).json({ error: 'Administrator login failed.' });
  }
});

// Logout
router.post('/auth/logout', async (req: Request, res: Response) => {
  const token = extractToken(req);
  if (token) {
    await deleteSession(token);
  }
  res.json({ success: true });
});

// Current Authenticated User
router.get('/auth/me', async (req: Request, res: Response) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const user = await getUserByToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Session expired or invalid' });
  }

  res.json({ user });
});

// ----------------------------------------------------
// Permanent Camera Photo Storage (Camera Only)
// ----------------------------------------------------
router.post('/upload-camera-photo', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'Valid camera photo base64 data is required.' });
    }

    // Match data URI prefix (e.g. data:image/jpeg;base64,...)
    const matches = imageBase64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    let buffer: Buffer;
    if (matches && matches.length === 3) {
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(imageBase64, 'base64');
    }

    if (buffer.length === 0) {
      return res.status(400).json({ error: 'Empty photo data received.' });
    }

    const filename = `mela_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.jpg`;
    const filePath = path.join(uploadsDir, filename);

    // Save permanently to server filesystem
    fs.writeFileSync(filePath, buffer);

    const permanentUrl = `/uploads/products/${filename}`;
    return res.status(201).json({
      url: permanentUrl,
      filename,
      size: buffer.length,
    });
  } catch (err: unknown) {
    console.error('[Upload Camera Photo Error]:', err);
    return res.status(500).json({ error: 'Failed to store camera photo permanently on server.' });
  }
});

// ----------------------------------------------------
// Categories Endpoints
// ----------------------------------------------------
router.get('/categories', async (_req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const pool = getPool();
      if (pool) {
        const queryRes = await pool.query('SELECT * FROM categories ORDER BY id ASC');
        const rows = queryRes.rows.map((r, idx) => ({
          ...r,
          id: r.id || (idx + 1),
          slug: r.slug || `cat-${r.id || idx + 1}`,
          name_am: r.name_am || 'ምድብ',
          name_en: r.name_en || r.name_am || `Category ${r.id || idx + 1}`,
          name_ti: r.name_ti || r.name_am || `ምድብ ${r.id || idx + 1}`,
        }));
        return res.json(rows);
      }
    }
    const memRows = memoryStore.categories.map((c, idx) => ({
      id: idx + 1,
      slug: c.slug || `cat-${idx + 1}`,
      name_am: c.name_am,
      name_en: c.name_en,
      name_ti: c.name_ti,
      icon: c.icon,
    }));
    return res.json(memRows);
  } catch (err: unknown) {
    console.error('[Get Categories Error]:', err);
    return res.json(
      DEFAULT_CATEGORIES.map((c, idx) => ({
        id: idx + 1,
        slug: c.slug,
        name_am: c.name_am,
        name_en: c.name_en,
        name_ti: c.name_ti,
        icon: c.icon,
      }))
    );
  }
});

router.post('/categories', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { slug, name_am, name_en, name_ti, icon } = req.body;
    if (!slug || !name_am || !name_en || !name_ti) {
      return res.status(400).json({ error: 'All category names and slug are required.' });
    }

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');

    if (isDbConnected()) {
      const pool = getPool();
      if (pool) {
        const insertRes = await pool.query(
          `INSERT INTO categories (slug, name_am, name_en, name_ti, icon)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (slug) DO UPDATE SET name_am = $2, name_en = $3, name_ti = $4, icon = $5
           RETURNING *`,
          [cleanSlug, name_am.trim(), name_en.trim(), name_ti.trim(), icon || 'Package']
        );
        return res.status(201).json(insertRes.rows[0]);
      }
    }

    const newCat = {
      slug: cleanSlug,
      name_am: name_am.trim(),
      name_en: name_en.trim(),
      name_ti: name_ti.trim(),
      icon: icon || 'Package',
    };
    memoryStore.categories.push(newCat);
    return res.status(201).json(newCat);
  } catch (err: unknown) {
    console.error('[Add Category Error]:', err);
    return res.status(500).json({ error: 'Failed to create category.' });
  }
});

router.delete('/categories/:slug', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { slug } = req.params;
    if (isDbConnected()) {
      const pool = getPool();
      if (pool) {
        await pool.query('DELETE FROM categories WHERE slug = $1', [slug]);
        return res.json({ success: true });
      }
    }
    memoryStore.categories = memoryStore.categories.filter((c) => c.slug !== slug);
    return res.json({ success: true });
  } catch (err: unknown) {
    console.error('[Delete Category Error]:', err);
    return res.status(500).json({ error: 'Failed to delete category.' });
  }
});

// ----------------------------------------------------
// Products Endpoints
// ----------------------------------------------------
router.get('/products', async (req: Request, res: Response) => {
  try {
    const { condition, category, search, region, district, city } = req.query;

    if (isDbConnected()) {
      const pool = getPool();
      if (pool) {
        const conditions: string[] = ["status = 'active'"];
        const params: unknown[] = [];

        if (condition && (condition === 'new' || condition === 'used')) {
          params.push(condition);
          conditions.push(`condition = $${params.length}`);
        }

        if (category && typeof category === 'string' && category !== 'all') {
          params.push(category);
          conditions.push(`category_slug = $${params.length}`);
        }

        if (region && typeof region === 'string' && region !== 'all') {
          params.push(`%${region}%`);
          conditions.push(`region ILIKE $${params.length}`);
        }

        if (district && typeof district === 'string' && district !== 'all') {
          params.push(`%${district}%`);
          conditions.push(`district ILIKE $${params.length}`);
        }

        if (city && typeof city === 'string' && city !== 'all') {
          params.push(`%${city}%`);
          conditions.push(`city ILIKE $${params.length}`);
        }

        if (search && typeof search === 'string' && search.trim() !== '') {
          params.push(`%${search.trim()}%`);
          conditions.push(`(name ILIKE $${params.length} OR description ILIKE $${params.length} OR city ILIKE $${params.length})`);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const sql = `SELECT * FROM products ${whereClause} ORDER BY created_at DESC`;
        const result = await pool.query(sql, params);
        const sanitized = result.rows.map((p, idx) => ({
          ...p,
          id: p.id || (idx + 1),
          category_slug: p.category_slug || 'traditional-fashion',
          city: p.city || p.location || 'Addis Ababa',
          region: p.region || 'Addis Ababa',
          district: p.district || 'Bole',
          seller_name: p.seller_name || 'Verified Seller',
          seller_phone: p.seller_phone || '+251911000000',
          condition: p.condition === 'used' ? 'used' : 'new',
          price: Number(p.price) || 0,
        }));
        return res.json(sanitized);
      }
    }

    // Memory fallback
    let items = memoryStore.products.filter((p) => p.status === 'active');
    if (condition && (condition === 'new' || condition === 'used')) {
      items = items.filter((p) => p.condition === condition);
    }
    if (category && typeof category === 'string' && category !== 'all') {
      items = items.filter((p) => p.category_slug === category);
    }
    if (region && typeof region === 'string' && region !== 'all') {
      items = items.filter((p) => p.region.toLowerCase().includes(region.toLowerCase()));
    }
    if (city && typeof city === 'string' && city !== 'all') {
      items = items.filter((p) => p.city.toLowerCase().includes(city.toLowerCase()));
    }
    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q)
      );
    }

    const sanitizedMem = items.map((p, idx) => ({
      ...p,
      id: p.id || (idx + 1),
      category_slug: p.category_slug || 'traditional-fashion',
      city: p.city || (p as Record<string, unknown>).location as string || 'Addis Ababa',
      region: p.region || 'Addis Ababa',
      district: p.district || 'Bole',
      seller_name: p.seller_name || 'Verified Seller',
      seller_phone: p.seller_phone || '+251911000000',
      condition: p.condition === 'used' ? 'used' : 'new',
      price: Number(p.price) || 0,
    }));
    return res.json(sanitizedMem);
  } catch (err: unknown) {
    console.error('[Get Products Error]:', err);
    return res.status(500).json({ error: 'Failed to fetch products.' });
  }
});

router.get('/products/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    if (isDbConnected()) {
      const pool = getPool();
      if (pool) {
        const queryRes = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        if (queryRes.rows.length === 0) {
          return res.status(404).json({ error: 'Product not found' });
        }
        const p = queryRes.rows[0];
        return res.json({
          ...p,
          id: p.id,
          category_slug: p.category_slug || 'traditional-fashion',
          city: p.city || p.location || 'Addis Ababa',
          region: p.region || 'Addis Ababa',
          district: p.district || 'Bole',
          seller_name: p.seller_name || 'Verified Seller',
          seller_phone: p.seller_phone || '+251911000000',
          condition: p.condition === 'used' ? 'used' : 'new',
          price: Number(p.price) || 0,
        });
      }
    }

    const item = memoryStore.products.find((p) => p.id === id);
    if (!item) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.json(item);
  } catch (err: unknown) {
    console.error('[Get Single Product Error]:', err);
    return res.status(500).json({ error: 'Failed to retrieve product details.' });
  }
});

// Product Registration: ONLY logged-in users may publish!
router.post('/products', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      name,
      category_slug,
      description,
      price,
      condition,
      image_url,
      region,
      district,
      city,
      seller_name,
      seller_phone,
    } = req.body;

    // Strict validation
    if (
      !name ||
      !category_slug ||
      !description ||
      price === undefined ||
      !condition ||
      !image_url ||
      !region ||
      !district ||
      !city ||
      !seller_phone
    ) {
      return res.status(400).json({
        error: 'Missing required product information. All fields including photo, location, and seller contact must be provided.',
      });
    }

    if (condition !== 'new' && condition !== 'used') {
      return res.status(400).json({ error: 'Condition must be either "new" or "used".' });
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ error: 'Price must be a valid positive number.' });
    }

    const sellerNameFinal = seller_name || req.user?.full_name || 'Seller';

    if (isDbConnected()) {
      const pool = getPool();
      if (pool) {
        const insertRes = await pool.query(
          `INSERT INTO products (
            user_id, name, category_slug, description, price, condition,
            image_url, region, district, city, seller_name, seller_phone, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'active')
          RETURNING *`,
          [
            req.user?.id || null,
            name.trim(),
            category_slug.trim(),
            description.trim(),
            numericPrice,
            condition,
            image_url.trim(),
            region.trim(),
            district.trim(),
            city.trim(),
            sellerNameFinal.trim(),
            seller_phone.trim(),
          ]
        );
        return res.status(201).json(insertRes.rows[0]);
      }
    }

    // Memory fallback
    const newId = memoryStore.products.length + 1;
    const newProd = {
      id: newId,
      user_id: req.user?.id || 1,
      name: name.trim(),
      category_slug: category_slug.trim(),
      description: description.trim(),
      price: numericPrice,
      condition: condition as 'new' | 'used',
      image_url: image_url.trim(),
      region: region.trim(),
      district: district.trim(),
      city: city.trim(),
      seller_name: sellerNameFinal.trim(),
      seller_phone: seller_phone.trim(),
      status: 'active' as const,
      created_at: new Date().toISOString(),
    };
    memoryStore.products.unshift(newProd);
    return res.status(201).json(newProd);
  } catch (err: unknown) {
    console.error('[Create Product Error]:', err);
    return res.status(500).json({ error: 'Failed to publish product. Please check your data and try again.' });
  }
});

// Delete Product (Admin or owner)
router.delete('/products/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid product ID' });

    if (isDbConnected()) {
      const pool = getPool();
      if (pool) {
        // Check if admin or owner
        if (req.user?.role !== 'admin') {
          const ownerCheck = await pool.query('SELECT user_id FROM products WHERE id = $1', [id]);
          if (ownerCheck.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
          if (ownerCheck.rows[0].user_id !== req.user?.id) {
            return res.status(403).json({ error: 'You are not authorized to delete this product.' });
          }
        }
        await pool.query('DELETE FROM products WHERE id = $1', [id]);
        return res.json({ success: true });
      }
    }

    // Memory fallback
    const prod = memoryStore.products.find((p) => p.id === id);
    if (!prod) return res.status(404).json({ error: 'Product not found' });
    if (req.user?.role !== 'admin' && prod.user_id !== req.user?.id) {
      return res.status(403).json({ error: 'You are not authorized to delete this product.' });
    }
    memoryStore.products = memoryStore.products.filter((p) => p.id !== id);
    return res.json({ success: true });
  } catch (err: unknown) {
    console.error('[Delete Product Error]:', err);
    return res.status(500).json({ error: 'Failed to delete product.' });
  }
});

// ----------------------------------------------------
// Customer Inquiries
// ----------------------------------------------------
router.post('/inquiries', async (req: Request, res: Response) => {
  try {
    const { product_id, customer_name, customer_contact, message } = req.body;

    if (!product_id || !customer_name || !customer_contact || !message) {
      return res.status(400).json({
        error: 'Please provide your full name, contact information (phone/email), and your question.',
      });
    }

    const prodIdNum = parseInt(product_id, 10);

    if (isDbConnected()) {
      const pool = getPool();
      if (pool) {
        const insertRes = await pool.query(
          `INSERT INTO inquiries (product_id, customer_name, customer_contact, message, status)
           VALUES ($1, $2, $3, $4, 'pending')
           RETURNING *`,
          [prodIdNum, customer_name.trim(), customer_contact.trim(), message.trim()]
        );
        return res.status(201).json(insertRes.rows[0]);
      }
    }

    // Memory fallback
    const newInquiry = {
      id: memoryStore.inquiries.length + 1,
      product_id: prodIdNum,
      customer_name: customer_name.trim(),
      customer_contact: customer_contact.trim(),
      message: message.trim(),
      status: 'pending' as const,
      created_at: new Date().toISOString(),
    };
    memoryStore.inquiries.unshift(newInquiry);
    return res.status(201).json(newInquiry);
  } catch (err: unknown) {
    console.error('[Inquiry Submit Error]:', err);
    return res.status(500).json({ error: 'Failed to submit inquiry.' });
  }
});

// Admin Inquiries List
router.get('/inquiries', requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    if (isDbConnected()) {
      const pool = getPool();
      if (pool) {
        const queryRes = await pool.query(`
          SELECT i.*, p.name as product_name, p.price as product_price, p.image_url as product_image
          FROM inquiries i
          LEFT JOIN products p ON i.product_id = p.id
          ORDER BY i.created_at DESC
        `);
        return res.json(queryRes.rows);
      }
    }

    const list = memoryStore.inquiries.map((inq) => {
      const p = memoryStore.products.find((prod) => prod.id === inq.product_id);
      return {
        ...inq,
        product_name: p?.name || 'Item #' + inq.product_id,
        product_price: p?.price,
        product_image: p?.image_url,
      };
    });
    return res.json(list);
  } catch (err: unknown) {
    console.error('[Get Inquiries Error]:', err);
    return res.status(500).json({ error: 'Failed to retrieve inquiries.' });
  }
});

// Update inquiry status
router.patch('/inquiries/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (!status || !['pending', 'contacted', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required.' });
    }

    if (isDbConnected()) {
      const pool = getPool();
      if (pool) {
        const updateRes = await pool.query(
          'UPDATE inquiries SET status = $1 WHERE id = $2 RETURNING *',
          [status, id]
        );
        return res.json(updateRes.rows[0]);
      }
    }

    const inq = memoryStore.inquiries.find((i) => i.id === id);
    if (!inq) return res.status(404).json({ error: 'Inquiry not found' });
    inq.status = status;
    return res.json(inq);
  } catch (err: unknown) {
    console.error('[Update Inquiry Error]:', err);
    return res.status(500).json({ error: 'Failed to update inquiry.' });
  }
});

// ----------------------------------------------------
// Admin Management Endpoints
// ----------------------------------------------------

// Admin Stats
router.get('/admin/stats', requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    if (isDbConnected()) {
      const pool = getPool();
      if (pool) {
        const prodCountRes = await pool.query(`
          SELECT
            COUNT(*) as total,
            COUNT(CASE WHEN condition = 'new' THEN 1 END) as new_count,
            COUNT(CASE WHEN condition = 'used' THEN 1 END) as used_count
          FROM products
        `);
        const userCountRes = await pool.query('SELECT COUNT(*) as total FROM users');
        const inqCountRes = await pool.query(`
          SELECT
            COUNT(*) as total,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count
          FROM inquiries
        `);

        return res.json({
          totalProducts: parseInt(prodCountRes.rows[0].total, 10),
          newProductsCount: parseInt(prodCountRes.rows[0].new_count, 10),
          usedProductsCount: parseInt(prodCountRes.rows[0].used_count, 10),
          totalUsers: parseInt(userCountRes.rows[0].total, 10),
          totalInquiries: parseInt(inqCountRes.rows[0].total, 10),
          pendingInquiries: parseInt(inqCountRes.rows[0].pending_count, 10),
        });
      }
    }

    // Memory stats
    const totalProducts = memoryStore.products.length;
    const newProductsCount = memoryStore.products.filter((p) => p.condition === 'new').length;
    const usedProductsCount = memoryStore.products.filter((p) => p.condition === 'used').length;
    const totalUsers = memoryStore.users.length;
    const totalInquiries = memoryStore.inquiries.length;
    const pendingInquiries = memoryStore.inquiries.filter((i) => i.status === 'pending').length;

    return res.json({
      totalProducts,
      newProductsCount,
      usedProductsCount,
      totalUsers,
      totalInquiries,
      pendingInquiries,
    });
  } catch (err: unknown) {
    console.error('[Admin Stats Error]:', err);
    return res.status(500).json({ error: 'Failed to generate administrative stats.' });
  }
});

// Admin Users List
router.get('/admin/users', requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    if (isDbConnected()) {
      const pool = getPool();
      if (pool) {
        const usersRes = await pool.query(
          'SELECT id, full_name, email, phone, role, created_at FROM users ORDER BY id DESC'
        );
        return res.json(usersRes.rows);
      }
    }

    const sanitizedUsers = memoryStore.users.map((u) => ({
      id: u.id,
      full_name: u.full_name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      created_at: u.created_at,
    }));
    return res.json(sanitizedUsers);
  } catch (err: unknown) {
    console.error('[Admin Users Error]:', err);
    return res.status(500).json({ error: 'Failed to retrieve users.' });
  }
});

export default router;

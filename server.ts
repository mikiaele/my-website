import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import {
  initDatabase,
  getDatabaseStatus,
  findUserByEmail,
  findUserById,
  createUser,
  getAllUsers,
  deleteUser,
  getProducts,
  getProductById,
  createProduct,
  deleteProduct,
  createInquiry,
  getInquiries,
  createReport,
  getReports,
  connectNeonDatabase,
  updateUserPassword,
  DBUser,
  DBProduct,
} from './server/db.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'mela_market_super_secure_jwt_token_2026_secret_key';

// Increase payload limit for camera photo uploads (base64)
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Auth Middleware
export interface AuthenticatedRequest extends Request {
  user?: DBUser;
}

const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    const user = await findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User account not found.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired session. Please log in again.' });
  }
};

const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
  next();
};

function formatSafeUser(u: DBUser) {
  const name = u.full_name || (u as any).fullName || 'User';
  const photo = u.profile_photo || (u as any).profilePhoto || '';
  const created = u.created_at || (u as any).createdAt || new Date().toISOString();
  return {
    id: u.id,
    email: u.email,
    fullName: name,
    full_name: name,
    phone: u.phone,
    profilePhoto: photo,
    profile_photo: photo,
    role: u.role,
    createdAt: created,
    created_at: created,
  };
}

// ---------------- API ROUTES ---------------- //

// Database Connection Status
app.get('/api/db/status', async (_req: Request, res: Response) => {
  try {
    const status = await getDatabaseStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin DB Test Ping
app.post('/api/admin/db-test', authenticateToken, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const status = await getDatabaseStatus();
    res.json({
      success: true,
      status,
      timestamp: new Date().toISOString(),
      message: status.connected 
        ? `Database ping verified. Engine: ${status.engine}`
        : `Database is currently awaiting connection: ${status.engine}`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Connect Neon Database
app.post('/api/admin/neon-connect', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { connectionString } = req.body;
    if (!connectionString) {
      return res.status(400).json({ error: 'Neon connection string is required.' });
    }
    const result = await connectNeonDatabase(connectionString);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Auth: Register with Camera Profile Photo
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, phone, profilePhoto } = req.body;

    if (!email || !password || !fullName || !phone) {
      return res.status(400).json({ error: 'All fields (full name, email, phone, password) are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Default admin check for mikiaelebrhane21@gmail.com
    const isOwner = email.toLowerCase().trim() === 'mikiaelebrhane21@gmail.com';
    const role = isOwner ? 'admin' : 'user';

    const newUser: DBUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      full_name: fullName.trim(),
      phone: phone.trim(),
      profile_photo: profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      role,
      created_at: new Date().toISOString(),
    };

    await createUser(newUser);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = formatSafeUser(newUser);
    res.status(201).json({
      message: 'Account created successfully',
      user: safeUser,
      token,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to create user account: ' + err.message });
  }
});

// Auth: Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = (email || '').trim().toLowerCase();
    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email address or password.' });
    }

    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password_hash);
    } catch {
      isMatch = false;
    }

    // Support auto-upgrade if password was stored in plain text
    if (!isMatch && user.password_hash === password) {
      isMatch = true;
      try {
        const newHash = await bcrypt.hash(password, 10);
        user.password_hash = newHash;
        await updateUserPassword(user.id, newHash);
      } catch (hashErr) {
        console.warn('Auto hash upgrade failed:', hashErr);
      }
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email address or password.' });
    }

    // Guarantee admin role for authorized owner emails
    if (normalizedEmail === 'mikiaelebrhane21@gmail.com' || normalizedEmail === 'mikiaelebrhane@gmail.com') {
      user.role = 'admin';
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = formatSafeUser(user);
    res.json({
      message: 'Logged in successfully',
      user: safeUser,
      token,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
});

// Auth: Me
app.get('/api/auth/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  const safeUser = formatSafeUser(req.user);
  res.json({ user: safeUser });
});

// Products: List / Search with Condition and Filters
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const { condition, category, region, search } = req.query;
    const products = await getProducts({
      condition: condition as string,
      category: category as string,
      region: region as string,
      search: search as string,
    });

    // Map DB fields to frontend format
    const formatted = products.map(p => ({
      id: p.id,
      userId: p.user_id,
      title: p.title,
      description: p.description,
      category: p.category,
      condition: p.condition,
      price: Number(p.price),
      currency: p.currency || 'ETB',
      photoUrl: p.photo_url,
      region: p.region,
      district: p.district,
      city: p.city,
      sellerContact: p.seller_contact,
      sellerName: p.seller_name || 'Verified Seller',
      sellerPhoto: p.seller_photo || '',
      status: p.status,
      createdAt: p.created_at,
    }));

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve products: ' + err.message });
  }
});

// Products: Get Single
app.get('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.json({
      id: product.id,
      userId: product.user_id,
      title: product.title,
      description: product.description,
      category: product.category,
      condition: product.condition,
      price: Number(product.price),
      currency: product.currency || 'ETB',
      photoUrl: product.photo_url,
      region: product.region,
      district: product.district,
      city: product.city,
      sellerContact: product.seller_contact,
      sellerName: product.seller_name || 'Verified Seller',
      sellerPhoto: product.seller_photo || '',
      status: product.status,
      createdAt: product.created_at,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Products: CREATE (STRICTLY PROTECTED - REGISTRATION REQUIRED)
app.post('/api/products', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const {
      title,
      description,
      category,
      condition,
      price,
      currency,
      photoUrl,
      region,
      district,
      city,
      sellerContact,
    } = req.body;

    if (!title || !category || !condition || !price || !photoUrl || !region || !city) {
      return res.status(400).json({ error: 'Please provide all required product details and a photo.' });
    }

    if (condition !== 'new' && condition !== 'used') {
      return res.status(400).json({ error: 'Condition must be either "new" or "used".' });
    }

    const newProduct: DBProduct = {
      id: 'prd_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      user_id: user.id,
      title: title.trim(),
      description: description ? description.trim() : '',
      category,
      condition,
      price: parseFloat(price),
      currency: currency || 'ETB',
      photo_url: photoUrl,
      region: region.trim(),
      district: district ? district.trim() : '',
      city: city.trim(),
      seller_contact: sellerContact ? sellerContact.trim() : (user.phone || ''),
      seller_name: user.full_name || (user as any).fullName || user.email || 'Seller',
      seller_photo: user.profile_photo || (user as any).profilePhoto || '',
      status: 'active',
      created_at: new Date().toISOString(),
    };

    const saved = await createProduct(newProduct);
    res.status(201).json({
      message: 'Product listed successfully!',
      product: {
        id: saved.id,
        userId: saved.user_id,
        title: saved.title,
        description: saved.description,
        category: saved.category,
        condition: saved.condition,
        price: Number(saved.price),
        currency: saved.currency,
        photoUrl: saved.photo_url,
        region: saved.region,
        district: saved.district,
        city: saved.city,
        sellerContact: saved.seller_contact,
        sellerName: saved.seller_name,
        sellerPhoto: saved.seller_photo,
        status: saved.status,
        createdAt: saved.created_at,
      },
    });
  } catch (err: any) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Failed to create product listing: ' + err.message });
  }
});

// Products: Delete
app.delete('/api/products/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Only creator or admin can delete
    if (product.user_id !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this product listing.' });
    }

    await deleteProduct(req.params.id);
    res.json({ success: true, message: 'Product removed.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Customer Inquiries
app.post('/api/inquiries', async (req: Request, res: Response) => {
  try {
    const { productId, buyerName, buyerEmail, buyerPhone, message } = req.body;
    if (!productId || !buyerName || !buyerPhone || !message) {
      return res.status(400).json({ error: 'Name, phone number, and message are required.' });
    }

    const product = await getProductById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product does not exist.' });
    }

    const inq = await createInquiry({
      id: 'inq_' + Date.now(),
      product_id: productId,
      buyer_name: buyerName.trim(),
      buyer_email: buyerEmail ? buyerEmail.trim() : '',
      buyer_phone: buyerPhone.trim(),
      message: message.trim(),
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    res.status(201).json({ success: true, message: 'Inquiry submitted successfully.', inquiry: inq });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/inquiries', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const all = await getInquiries();
    if (req.user!.role === 'admin') {
      return res.json(all);
    }
    // Sellers only see inquiries for their products
    const myProducts = await getProducts();
    const myProductIds = new Set(myProducts.filter(p => p.user_id === req.user!.id).map(p => p.id));
    const filtered = all.filter(i => myProductIds.has(i.product_id));
    res.json(filtered);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reports
app.post('/api/reports', async (req: Request, res: Response) => {
  try {
    const { productId, reporterEmail, reason } = req.body;
    if (!productId || !reason) {
      return res.status(400).json({ error: 'Reason for report is required.' });
    }

    const rep = await createReport({
      id: 'rep_' + Date.now(),
      product_id: productId,
      reporter_email: reporterEmail || 'anonymous',
      reason: reason.trim(),
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    res.status(201).json({ success: true, message: 'Report submitted for administrator review.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Overview & Security
app.get('/api/admin/overview', authenticateToken, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const dbStatus = await getDatabaseStatus();
    const users = await getAllUsers();
    const products = await getProducts();
    const inquiries = await getInquiries();
    const reports = await getReports();

    res.json({
      dbStatus,
      users,
      products: products.map(p => ({
        id: p.id,
        userId: p.user_id,
        title: p.title,
        category: p.category,
        condition: p.condition,
        price: Number(p.price),
        currency: p.currency,
        city: p.city,
        region: p.region,
        status: p.status,
        createdAt: p.created_at,
        photoUrl: p.photo_url,
      })),
      inquiries,
      reports,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Admin overview error: ' + err.message });
  }
});

// Admin: Delete user
app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.params.id === req.user!.id) {
      return res.status(400).json({ error: 'You cannot delete your own admin account.' });
    }
    await deleteUser(req.params.id);
    res.json({ success: true, message: 'User deleted.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- VITE MIDDLEWARE & SERVER START ---------------- //

async function startServer() {
  // Initialize Database
  const dbInitRes = await initDatabase();
  console.log(`Mela Market Database Init: ${dbInitRes.engine} (Connected: ${dbInitRes.connected})`);

  const server = http.createServer(app);

  // In dev mode, mount Vite middleware with HMR disabled
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Mela Market server is actively listening on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server boot failure:', err);
  process.exit(1);
});

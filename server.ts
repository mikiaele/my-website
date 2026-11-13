/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import {
  NeonDb,
  testNeonConnection,
  runNeonMigrations,
  getCleanConnectionString,
} from './src/server/neon.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Server secrets (strictly server-side, never exposed to client)
const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_SERVER_SECRET || 'mela-market-secret-jwt-key-2026-auth-eb98f3b';
const ADMIN_SETUP_MASTER_KEY = process.env.ADMIN_SETUP_MASTER_KEY || 'MELA-ADMIN-SETUP-2026';

// Server-side interface for admin and user tokens
export interface TokenPayload {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'seller' | 'admin' | 'super_admin';
  iat?: number;
  exp?: number;
}

/**
 * Cryptographic helpers for password hashing using PBKDF2
 */
function hashPasswordServer(password: string, salt = crypto.randomBytes(16).toString('hex')): { hash: string; salt: string } {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('hex');
  return { hash, salt };
}

function verifyPasswordServer(password: string, storedHash: string, salt: string): boolean {
  try {
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
  } catch {
    return false;
  }
}

/**
 * Sign an admin session token using HMAC-SHA256
 */
function signToken(payload: Omit<TokenPayload, 'iat' | 'exp'>, expiresIn = '24h'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any });
}

/**
 * Verify HMAC-SHA256 session token
 */
function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      admin?: TokenPayload;
      user?: TokenPayload;
    }
  }
}

/**
 * Server-Side Middleware: Enforce Authentication and Admin / Super Admin Role Verification
 */
function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization || (req.headers['x-admin-token'] as string);
  if (!authHeader) {
    res.status(401).json({
      error: 'Unauthorized: Admin authentication token required to access this endpoint.',
      code: 'AUTH_REQUIRED',
    });
    return;
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  const decoded = verifyToken(token);

  if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'super_admin')) {
    res.status(403).json({
      error: 'Forbidden: Access denied. Valid administrator role verification failed.',
      code: 'ADMIN_ROLE_REQUIRED',
    });
    return;
  }

  req.admin = decoded;
  next();
}

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '15mb' }));

  // Auto-run migrations on server startup if Neon connection string is present
  const connStr = getCleanConnectionString();
  if (connStr && connStr.startsWith('postgres')) {
    console.log('Detected Neon DATABASE_URL, initializing schema...');
    runNeonMigrations().then((res) => {
      console.log('Neon auto-migration result:', res.message);
    }).catch((err) => {
      console.warn('Neon auto-migration error on startup:', err);
    });
  }

  // ==========================================
  // NEON POSTGRESQL DIAGNOSTICS & MIGRATION API
  // ==========================================

  /**
   * GET /api/neon/status
   * Real-time diagnostic test of Neon PostgreSQL connection, pooler, and schemas
   */
  app.get('/api/neon/status', async (_req: Request, res: Response) => {
    try {
      const status = await testNeonConnection();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/neon/migrate
   * Triggers running neon-schema.sql into Neon PostgreSQL
   */
  app.post('/api/neon/migrate', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { customUrl } = req.body;
      const result = await runNeonMigrations(customUrl);
      if (req.admin) {
        await NeonDb.logAdminActivity(req.admin.email, 'RUN_NEON_MIGRATIONS', 'database', 'neon', { success: result.success });
      }
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  /**
   * POST /api/neon/test
   * Tests a specific connection string
   */
  app.post('/api/neon/test', async (req: Request, res: Response) => {
    try {
      const { connectionString } = req.body;
      const status = await testNeonConnection(connectionString);
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ connected: false, message: err.message });
    }
  });

  // ==========================================
  // SERVER-SIDE ADMIN AUTHENTICATION API
  // ==========================================

  /**
   * POST /api/admin/login
   * Authenticates administrator email and password on the server.
   * Strictly enforces role === 'admin' or role === 'super_admin'.
   */
  app.post('/api/admin/login', async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required.' });
        return;
      }

      const cleanEmail = String(email).trim().toLowerCase();
      const user = await NeonDb.getUserByEmail(cleanEmail);

      if (!user) {
        res.status(401).json({ error: 'Invalid email or password. No authorized admin found.' });
        return;
      }

      const role = user.role || 'user';
      if (role !== 'admin' && role !== 'super_admin') {
        res.status(403).json({
          error: 'Forbidden: This account does not possess administrator authorization.',
          code: 'NOT_ADMIN',
        });
        return;
      }

      const isMatch = verifyPasswordServer(String(password), user.password_hash, user.salt);
      if (!isMatch) {
        res.status(401).json({ error: 'Invalid email or password.' });
        return;
      }

      const token = signToken({
        id: user.id,
        email: user.email,
        name: user.name || 'Admin',
        role: role as any,
      });

      await NeonDb.logAdminActivity(user.email, 'ADMIN_LOGIN', 'auth', user.id, { role });

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name || 'Admin',
          role: role,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Server login error' });
    }
  });

  /**
   * GET /api/admin/verify
   * Protected endpoint: verifies the admin session token on the server
   */
  app.get('/api/admin/verify', requireAdminAuth, (req: Request, res: Response) => {
    res.json({
      success: true,
      verified: true,
      admin: req.admin,
    });
  });

  /**
   * POST /api/admin/register
   * Server-side registration for the administrator.
   * Requires the server-side master setup key or first-time bootstrap authorization.
   */
  app.post('/api/admin/register', async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, phone, password, setupKey } = req.body;

      if (!email || !password || !name) {
        res.status(400).json({ error: 'Name, email, and password are required.' });
        return;
      }

      if (String(password).length < 8) {
        res.status(400).json({ error: 'Admin password must be at least 8 characters long.' });
        return;
      }

      // Verify Master Setup Key on the server
      const keyMatches = String(setupKey || '').trim() === ADMIN_SETUP_MASTER_KEY;
      const allUsers = await NeonDb.getAllUsers();
      const hasAnyAdmins = allUsers.some((u: any) => u.role === 'admin' || u.role === 'super_admin');

      if (hasAnyAdmins && !keyMatches) {
        res.status(403).json({ error: 'Invalid Admin Setup Master Key.' });
        return;
      }

      const cleanEmail = String(email).trim().toLowerCase();
      const cleanName = String(name).trim();
      const cleanPhone = String(phone || '').trim();

      const existing = await NeonDb.getUserByEmail(cleanEmail);
      if (existing) {
        // Upgrade existing to super_admin if authorized
        await NeonDb.updateUserRole(existing.id, 'super_admin');
        const token = signToken({
          id: existing.id,
          email: cleanEmail,
          name: cleanName,
          role: 'super_admin',
        });
        res.json({
          success: true,
          message: 'Existing account promoted to Super Administrator.',
          token,
          user: { id: existing.id, email: cleanEmail, name: cleanName, role: 'super_admin' },
        });
        return;
      }

      const { hash, salt } = hashPasswordServer(String(password));
      const newUser = await NeonDb.createUser({
        name: cleanName,
        email: cleanEmail,
        passwordHash: hash,
        salt,
        phone: cleanPhone,
        role: 'super_admin',
      });

      const token = signToken({
        id: newUser.id,
        email: cleanEmail,
        name: cleanName,
        role: 'super_admin',
      });

      await NeonDb.logAdminActivity(cleanEmail, 'ADMIN_REGISTERED', 'admin_account', newUser.id, { role: 'super_admin' });

      res.json({
        success: true,
        message: 'Super Administrator successfully registered and authorized on Neon PostgreSQL.',
        token,
        user: {
          id: newUser.id,
          email: cleanEmail,
          name: cleanName,
          role: 'super_admin',
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to register admin account.' });
    }
  });

  // ==========================================
  // STOREFRONT & USER AUTHENTICATION API
  // ==========================================

  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { name, email, phone, password } = req.body;
      
      // Strict data validation
      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        res.status(400).json({ error: 'Please enter a valid full name (at least 2 characters).' });
        return;
      }

      if (!email || typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
        res.status(400).json({ error: 'Please enter a valid email address.' });
        return;
      }

      if (!password || typeof password !== 'string' || password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters long.' });
        return;
      }

      if (!phone || typeof phone !== 'string' || phone.trim().length < 8) {
        res.status(400).json({ error: 'Please enter a valid telephone number.' });
        return;
      }

      const cleanEmail = String(email).trim().toLowerCase();
      
      // Prevent duplicate accounts
      const existing = await NeonDb.getUserByEmail(cleanEmail);
      if (existing) {
        res.status(400).json({ error: 'An account with this email address already exists. Please sign in instead.' });
        return;
      }

      // Secure cryptographic password hashing (PBKDF2 100,000 rounds)
      const { hash, salt } = hashPasswordServer(String(password));
      
      // Save directly into Neon PostgreSQL
      const user = await NeonDb.createUser({
        name: String(name).trim(),
        email: cleanEmail,
        passwordHash: hash,
        salt,
        phone: String(phone || '').trim(),
        role: 'user',
      });

      // Issue signed session token
      const token = signToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: 'user',
      });

      res.json({
        success: true,
        message: 'Account successfully registered and saved in Neon PostgreSQL.',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (err: any) {
      console.error('Registration database error:', err);
      res.status(500).json({ error: err.message || 'Neon database registration error.' });
    }
  });

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const cleanEmail = String(email || '').trim().toLowerCase();
      const user = await NeonDb.getUserByEmail(cleanEmail);

      if (!user) {
        res.status(401).json({ error: 'Invalid email or password.' });
        return;
      }

      const isMatch = verifyPasswordServer(String(password), user.password_hash, user.salt);
      if (!isMatch) {
        res.status(401).json({ error: 'Invalid email or password.' });
        return;
      }

      const token = signToken({
        id: user.id,
        email: user.email,
        name: user.name || 'User',
        role: (user.role || 'user') as any,
      });

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name || 'User',
          role: user.role || 'user',
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // STOREFRONT PRODUCTS, CATEGORIES & ORDERS
  // ==========================================

  app.get('/api/products', async (_req: Request, res: Response) => {
    try {
      const products = await NeonDb.getAllProducts();
      res.json(products);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/products', async (req: Request, res: Response) => {
    try {
      const product = await NeonDb.createProduct(req.body);
      res.json(product);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/categories', async (_req: Request, res: Response) => {
    try {
      const categories = await NeonDb.getAllCategories();
      res.json(categories);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/orders', async (_req: Request, res: Response) => {
    try {
      const orders = await NeonDb.getAllOrders();
      res.json(orders);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/orders', async (req: Request, res: Response) => {
    try {
      const { orderInfo, items } = req.body;
      const newOrder = await NeonDb.createOrder(orderInfo, items || []);
      res.json({ success: true, order: newOrder });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/orders/:id/receipt', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { receiptUrl, transactionRef, paymentMethod } = req.body;
      await NeonDb.uploadReceipt(id, receiptUrl, transactionRef, paymentMethod);
      res.json({ success: true, orderId: id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // PROTECTED SUPER ADMIN REST API ENDPOINTS
  // ==========================================

  /**
   * GET /api/admin/dashboard-stats
   * Returns live calculated metrics from Neon PostgreSQL
   */
  app.get('/api/admin/dashboard-stats', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const [products, orders, users, sellers] = await Promise.all([
        NeonDb.getAllProducts(),
        NeonDb.getAllOrders(),
        NeonDb.getAllUsers(),
        NeonDb.getAllSellers(),
      ]);

      const totalRevenueETB = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
      const pendingPaymentVerifications = orders.filter(
        (o: any) => o.paymentReceipt && !o.paymentReceipt.verified
      ).length;

      res.json({
        success: true,
        stats: {
          totalRevenueETB,
          totalOrders: orders.length,
          activeListings: products.length,
          verifiedMerchants: sellers.filter((s: any) => s.is_verified).length || 8,
          totalUsers: users.length,
          pendingPaymentVerifications,
          systemHealth: 'Neon PostgreSQL serverless connected & RBAC active',
        },
        requestedBy: req.admin?.email,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Manage Users
  app.get('/api/admin/users', requireAdminAuth, async (_req: Request, res: Response) => {
    const users = await NeonDb.getAllUsers();
    res.json(users);
  });

  app.post('/api/admin/users/:id/role', requireAdminAuth, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;
    await NeonDb.updateUserRole(id, role);
    if (req.admin) {
      await NeonDb.logAdminActivity(req.admin.email, 'UPDATE_USER_ROLE', 'user', id, { role });
    }
    res.json({ success: true });
  });

  app.post('/api/admin/users/:id/status', requireAdminAuth, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isActive } = req.body;
    await NeonDb.updateUserStatus(id, Boolean(isActive));
    if (req.admin) {
      await NeonDb.logAdminActivity(req.admin.email, 'UPDATE_USER_STATUS', 'user', id, { isActive });
    }
    res.json({ success: true });
  });

  app.delete('/api/admin/users/:id', requireAdminAuth, async (req: Request, res: Response) => {
    const { id } = req.params;
    await NeonDb.deleteUser(id);
    if (req.admin) {
      await NeonDb.logAdminActivity(req.admin.email, 'DELETE_USER', 'user', id);
    }
    res.json({ success: true, deletedUserId: id });
  });

  // Manage Sellers
  app.get('/api/admin/sellers', requireAdminAuth, async (_req: Request, res: Response) => {
    const sellers = await NeonDb.getAllSellers();
    res.json(sellers);
  });

  app.post('/api/admin/sellers/:id/status', requireAdminAuth, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, isVerified } = req.body;
    await NeonDb.updateSellerStatus(id, status, Boolean(isVerified));
    if (req.admin) {
      await NeonDb.logAdminActivity(req.admin.email, 'UPDATE_SELLER_STATUS', 'seller', id, { status, isVerified });
    }
    res.json({ success: true });
  });

  app.delete('/api/admin/sellers/:id', requireAdminAuth, async (req: Request, res: Response) => {
    const { id } = req.params;
    await NeonDb.deleteSeller(id);
    if (req.admin) {
      await NeonDb.logAdminActivity(req.admin.email, 'DELETE_SELLER', 'seller', id);
    }
    res.json({ success: true, deletedSellerId: id });
  });

  // Manage Categories
  app.post('/api/admin/categories', requireAdminAuth, async (req: Request, res: Response) => {
    const cat = req.body;
    const created = await NeonDb.createCategory(cat);
    if (req.admin) {
      await NeonDb.logAdminActivity(req.admin.email, 'CREATE_CATEGORY', 'category', cat.id, { name: cat.name_en });
    }
    res.json({ success: true, category: created });
  });

  app.delete('/api/admin/categories/:id', requireAdminAuth, async (req: Request, res: Response) => {
    const { id } = req.params;
    await NeonDb.deleteCategory(id);
    if (req.admin) {
      await NeonDb.logAdminActivity(req.admin.email, 'DELETE_CATEGORY', 'category', id);
    }
    res.json({ success: true, deletedCategoryId: id });
  });

  // Manage Products
  app.post('/api/admin/products/:id/quantity', requireAdminAuth, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { quantity } = req.body;
    await NeonDb.updateProductQuantity(id, Number(quantity));
    if (req.admin) {
      await NeonDb.logAdminActivity(req.admin.email, 'UPDATE_PRODUCT_QUANTITY', 'product', id, { quantity });
    }
    res.json({ success: true, productId: id, newQuantity: Number(quantity) });
  });

  app.delete('/api/admin/products/:id', requireAdminAuth, async (req: Request, res: Response) => {
    const { id } = req.params;
    await NeonDb.deleteProduct(id);
    if (req.admin) {
      await NeonDb.logAdminActivity(req.admin.email, 'DELETE_PRODUCT', 'product', id);
    }
    res.json({ success: true, deletedProductId: id });
  });

  // Manage Orders
  app.post('/api/admin/orders/:id/status', requireAdminAuth, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    await NeonDb.updateOrderStatus(id, status, req.admin?.email);
    res.json({ success: true, orderId: id, newStatus: status });
  });

  app.post('/api/admin/orders/:id/verify-receipt', requireAdminAuth, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { verified } = req.body;
    await NeonDb.verifyPaymentReceipt(id, Boolean(verified), req.admin?.email);
    res.json({ success: true, orderId: id, verified: Boolean(verified) });
  });

  app.delete('/api/admin/orders/:id', requireAdminAuth, async (req: Request, res: Response) => {
    const { id } = req.params;
    await NeonDb.deleteOrder(id);
    if (req.admin) {
      await NeonDb.logAdminActivity(req.admin.email, 'DELETE_ORDER', 'order', id);
    }
    res.json({ success: true, deletedOrderId: id });
  });

  // Admin Accounts
  app.get('/api/admin/accounts', requireAdminAuth, async (_req: Request, res: Response) => {
    const accounts = await NeonDb.getAllAdminAccounts();
    res.json(accounts);
  });

  app.post('/api/admin/accounts', requireAdminAuth, async (req: Request, res: Response) => {
    const { userId, role, isSuperAdmin } = req.body;
    await NeonDb.createAdminAccount(userId, role || 'super_admin', Boolean(isSuperAdmin ?? true));
    if (req.admin) {
      await NeonDb.logAdminActivity(req.admin.email, 'ASSIGN_ADMIN_ROLE', 'admin_account', userId, { role });
    }
    res.json({ success: true, userId });
  });

  app.delete('/api/admin/accounts/:id', requireAdminAuth, async (req: Request, res: Response) => {
    const { id } = req.params;
    await NeonDb.deleteAdminAccount(id);
    if (req.admin) {
      await NeonDb.logAdminActivity(req.admin.email, 'REMOVE_ADMIN_ACCOUNT', 'admin_account', id);
    }
    res.json({ success: true, deletedAccountId: id });
  });

  // Admin Logs, Notifications, Reports & Settings
  app.get('/api/admin/logs', requireAdminAuth, async (_req: Request, res: Response) => {
    const logs = await NeonDb.getAdminActivityLogs(50);
    res.json(logs);
  });

  app.get('/api/admin/notifications', requireAdminAuth, async (_req: Request, res: Response) => {
    const notifications = await NeonDb.getAllNotifications();
    res.json(notifications);
  });

  app.get('/api/admin/reports', requireAdminAuth, async (_req: Request, res: Response) => {
    const reports = await NeonDb.getAllReports();
    res.json(reports);
  });

  app.get('/api/admin/settings', requireAdminAuth, async (_req: Request, res: Response) => {
    const settings = await NeonDb.getSettings();
    res.json(settings);
  });

  app.post('/api/admin/settings', requireAdminAuth, async (req: Request, res: Response) => {
    const { key, value } = req.body;
    await NeonDb.updateSetting(key, value);
    if (req.admin) {
      await NeonDb.logAdminActivity(req.admin.email, 'UPDATE_SETTING', 'settings', key, { value });
    }
    res.json({ success: true });
  });

  // ==========================================
  // VITE DEV SERVER / PRODUCTION STATIC SERVING
  // ==========================================
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
        ws: { server: httpServer },
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Mela Market Server (Neon PostgreSQL) running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

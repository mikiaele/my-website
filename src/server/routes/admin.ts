import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db, testDatabaseConnection, isDatabaseConfigured } from '../../db/index.ts';
import {
  products,
  users,
  inquiries,
  orders,
  administratorAuditLogs,
} from '../../db/schema.ts';
import { eq, sql, desc } from 'drizzle-orm';
import { requireAuth, requireAdmin, AuthRequest } from '../../middleware/auth.ts';

export const adminRouter = Router();

// System Secrets and Database Health Diagnostics
adminRouter.get('/db-health', async (req: Request, res: Response) => {
  try {
    const health = await testDatabaseConnection();
    res.json({
      ...health,
      secrets: {
        DATABASE_URL: Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0),
        ADMIN_SERVER_SECRET: Boolean(process.env.ADMIN_SERVER_SECRET && process.env.ADMIN_SERVER_SECRET.trim().length > 0),
        ADMIN_SETUP_MASTER_KEY: Boolean(process.env.ADMIN_SETUP_MASTER_KEY && process.env.ADMIN_SETUP_MASTER_KEY.trim().length > 0),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      connected: false,
      message: error.message || 'Health check failed',
      secrets: {
        DATABASE_URL: Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0),
        ADMIN_SERVER_SECRET: Boolean(process.env.ADMIN_SERVER_SECRET && process.env.ADMIN_SERVER_SECRET.trim().length > 0),
        ADMIN_SETUP_MASTER_KEY: Boolean(process.env.ADMIN_SETUP_MASTER_KEY && process.env.ADMIN_SETUP_MASTER_KEY.trim().length > 0),
      },
    });
  }
});

// Secure Administrator Bootstrap using ADMIN_SETUP_MASTER_KEY
adminRouter.post('/bootstrap', async (req: Request, res: Response) => {
  try {
    const { masterKey, email, password, name, phone } = req.body;

    const configuredMasterKey = process.env.ADMIN_SETUP_MASTER_KEY;
    if (!configuredMasterKey || configuredMasterKey.trim().length === 0) {
      return res.status(400).json({
        error: 'ADMIN_SETUP_MASTER_KEY is not configured in Google AI Studio Secrets. Please set it first.',
      });
    }

    if (!masterKey || masterKey !== configuredMasterKey) {
      return res.status(403).json({ error: 'Forbidden: Invalid administrator master setup key.' });
    }

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required to setup the admin account.' });
    }

    if (!isDatabaseConfigured()) {
      return res.status(503).json({
        error: 'DATABASE_URL is not configured. Please set DATABASE_URL in Google AI Studio Secrets with your Neon connection URL.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const adminUid = 'admin_master_' + Date.now();

    const [adminUser] = await db
      .insert(users)
      .values({
        uid: adminUid,
        email: email.toLowerCase().trim(),
        name: name.trim(),
        phone: phone || null,
        role: 'admin',
        passwordHash,
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          role: 'admin',
          name: name.trim(),
          passwordHash,
          updatedAt: new Date(),
        },
      })
      .returning();

    await db.insert(administratorAuditLogs).values({
      adminId: adminUser.id,
      adminEmail: adminUser.email,
      action: 'ADMIN_BOOTSTRAP_VIA_MASTER_KEY',
      details: `Administrator account ${adminUser.email} bootstrapped/reset using master setup key.`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json({
      success: true,
      message: `Administrator account for ${adminUser.email} has been securely initialized with admin privileges.`,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      },
    });
  } catch (error: any) {
    console.error('Admin bootstrap error:', error);
    res.status(500).json({ error: error.message || 'Failed to bootstrap admin account' });
  }
});

// Admin Statistics Dashboard
adminRouter.get('/stats', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    if (!isDatabaseConfigured()) {
      return res.status(503).json({
        error: 'DATABASE_URL is not set. Please configure DATABASE_URL in Google AI Studio Secrets.',
      });
    }

    const [totalProductsRes] = await db.select({ count: sql<number>`count(*)` }).from(products);
    const [newProductsRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(eq(products.condition, 'new'));
    const [usedProductsRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(eq(products.condition, 'used'));
    const [activeProductsRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(eq(products.status, 'active'));
    const [pendingProductsRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(eq(products.status, 'pending'));

    const [totalCustomersRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, 'customer'));
    const [totalSellersRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, 'seller'));

    const [totalInquiriesRes] = await db.select({ count: sql<number>`count(*)` }).from(inquiries);
    const [totalOrdersRes] = await db.select({ count: sql<number>`count(*)` }).from(orders);

    const recentLogs = await db
      .select()
      .from(administratorAuditLogs)
      .orderBy(desc(administratorAuditLogs.createdAt))
      .limit(10);

    res.json({
      totalProducts: Number(totalProductsRes.count),
      newProducts: Number(newProductsRes.count),
      usedProducts: Number(usedProductsRes.count),
      activeProducts: Number(activeProductsRes.count),
      pendingProducts: Number(pendingProductsRes.count),
      totalCustomers: Number(totalCustomersRes.count),
      totalSellers: Number(totalSellersRes.count),
      totalInquiries: Number(totalInquiriesRes.count),
      totalOrders: Number(totalOrdersRes.count),
      recentLogs,
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve admin stats' });
  }
});

// Admin: Manage Users List
adminRouter.get('/users', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const list = await db
      .select({
        id: users.id,
        uid: users.uid,
        email: users.email,
        name: users.name,
        phone: users.phone,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    res.json(list);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

// Admin: Change User Role
adminRouter.patch('/users/:id/role', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { role } = req.body;

    if (!['customer', 'seller', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const [updated] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
      });

    await db.insert(administratorAuditLogs).values({
      adminId: req.user!.id,
      adminEmail: req.user!.email,
      action: 'UPDATE_USER_ROLE',
      details: `Changed role of user ${updated.email} (ID: ${id}) to ${role}`,
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Admin: Audit Logs
adminRouter.get('/audit-logs', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const logs = await db
      .select()
      .from(administratorAuditLogs)
      .orderBy(desc(administratorAuditLogs.createdAt))
      .limit(100);

    res.json(logs);
  } catch (error: any) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to retrieve audit logs' });
  }
});

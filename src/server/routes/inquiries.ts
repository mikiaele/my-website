import { Router, Response } from 'express';
import { db } from '../../db/index.ts';
import { inquiries, products, users } from '../../db/schema.ts';
import { eq, desc } from 'drizzle-orm';
import { requireAuth, requireSeller, requireAdmin, optionalAuth, AuthRequest } from '../../middleware/auth.ts';

export const inquiriesRouter = Router();

// Submit an inquiry for a product
inquiriesRouter.post('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { productId, customerName, customerPhone, customerEmail, message } = req.body;

    if (!productId || !customerName || !customerPhone || !message) {
      return res.status(400).json({ error: 'Product ID, customer name, phone, and message are required' });
    }

    // Lookup product to get sellerId
    const prod = await db.select().from(products).where(eq(products.id, Number(productId))).limit(1);
    if (prod.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const sellerId = prod[0].sellerId;
    const customerId = req.user ? req.user.id : null;

    const [newInquiry] = await db
      .insert(inquiries)
      .values({
        productId: Number(productId),
        customerId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail ? customerEmail.trim() : null,
        message: message.trim(),
        sellerId,
        status: 'pending',
      })
      .returning();

    res.status(201).json({
      success: true,
      inquiry: newInquiry,
      message: 'Inquiry submitted successfully. The seller and administrator have been notified.',
    });
  } catch (error: any) {
    console.error('Error submitting inquiry:', error);
    res.status(500).json({ error: 'Failed to submit inquiry' });
  }
});

// Seller: View inquiries for their products
inquiriesRouter.get('/seller', requireAuth, requireSeller, async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = req.user!.id;

    const list = await db
      .select({
        id: inquiries.id,
        productId: inquiries.productId,
        productTitle: products.title,
        customerName: inquiries.customerName,
        customerPhone: inquiries.customerPhone,
        customerEmail: inquiries.customerEmail,
        message: inquiries.message,
        status: inquiries.status,
        createdAt: inquiries.createdAt,
      })
      .from(inquiries)
      .leftJoin(products, eq(inquiries.productId, products.id))
      .where(eq(inquiries.sellerId, sellerId))
      .orderBy(desc(inquiries.createdAt));

    res.json(list);
  } catch (error: any) {
    console.error('Error fetching seller inquiries:', error);
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

// Admin: View all inquiries
inquiriesRouter.get('/admin', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const list = await db
      .select({
        id: inquiries.id,
        productId: inquiries.productId,
        productTitle: products.title,
        customerName: inquiries.customerName,
        customerPhone: inquiries.customerPhone,
        customerEmail: inquiries.customerEmail,
        message: inquiries.message,
        status: inquiries.status,
        createdAt: inquiries.createdAt,
        sellerId: inquiries.sellerId,
        sellerName: users.name,
        sellerPhone: users.phone,
      })
      .from(inquiries)
      .leftJoin(products, eq(inquiries.productId, products.id))
      .leftJoin(users, eq(inquiries.sellerId, users.id))
      .orderBy(desc(inquiries.createdAt));

    res.json(list);
  } catch (error: any) {
    console.error('Error fetching admin inquiries:', error);
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

// Update inquiry status
inquiriesRouter.patch('/:id/status', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!['pending', 'replied', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const [updated] = await db
      .update(inquiries)
      .set({ status })
      .where(eq(inquiries.id, id))
      .returning();

    res.json(updated);
  } catch (error: any) {
    console.error('Error updating inquiry status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

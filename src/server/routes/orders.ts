import { Router, Response } from 'express';
import { db } from '../../db/index.ts';
import { orders, products, users } from '../../db/schema.ts';
import { eq, desc, or } from 'drizzle-orm';
import { requireAuth, requireAdmin, optionalAuth, AuthRequest } from '../../middleware/auth.ts';

export const ordersRouter = Router();

// Place an order request
ordersRouter.post('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity = 1, customerName, customerPhone, deliveryAddress } = req.body;

    if (!productId || !customerName || !customerPhone) {
      return res.status(400).json({ error: 'Product ID, customer name, and phone are required' });
    }

    const prod = await db.select().from(products).where(eq(products.id, Number(productId))).limit(1);
    if (prod.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = prod[0];
    const qty = Math.max(1, Number(quantity) || 1);
    const totalPrice = product.price * qty;
    const customerId = req.user ? req.user.id : null;

    const [newOrder] = await db
      .insert(orders)
      .values({
        productId: product.id,
        customerId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: deliveryAddress ? deliveryAddress.trim() : null,
        quantity: qty,
        totalPrice,
        status: 'pending',
        sellerId: product.sellerId,
      })
      .returning();

    res.status(201).json({
      success: true,
      order: newOrder,
      message: 'Order request received. The seller and administrator will contact you shortly.',
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// View orders for logged in user (as customer or seller)
ordersRouter.get('/my', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const isSeller = req.user!.role === 'seller';

    const whereCondition = isSeller
      ? or(eq(orders.sellerId, userId), eq(orders.customerId, userId))
      : eq(orders.customerId, userId);

    const list = await db
      .select({
        id: orders.id,
        productId: orders.productId,
        productTitle: products.title,
        productPrice: products.price,
        customerName: orders.customerName,
        customerPhone: orders.customerPhone,
        deliveryAddress: orders.deliveryAddress,
        quantity: orders.quantity,
        totalPrice: orders.totalPrice,
        status: orders.status,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .leftJoin(products, eq(orders.productId, products.id))
      .where(whereCondition)
      .orderBy(desc(orders.createdAt));

    res.json(list);
  } catch (error: any) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Failed to retrieve orders' });
  }
});

// Admin: View all orders
ordersRouter.get('/admin', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const list = await db
      .select({
        id: orders.id,
        productId: orders.productId,
        productTitle: products.title,
        productPrice: products.price,
        customerName: orders.customerName,
        customerPhone: orders.customerPhone,
        deliveryAddress: orders.deliveryAddress,
        quantity: orders.quantity,
        totalPrice: orders.totalPrice,
        status: orders.status,
        createdAt: orders.createdAt,
        sellerId: orders.sellerId,
        sellerName: users.name,
        sellerPhone: users.phone,
      })
      .from(orders)
      .leftJoin(products, eq(orders.productId, products.id))
      .leftJoin(users, eq(orders.sellerId, users.id))
      .orderBy(desc(orders.createdAt));

    res.json(list);
  } catch (error: any) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({ error: 'Failed to retrieve orders' });
  }
});

// Update order status
ordersRouter.patch('/:id/status', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    const [updated] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();

    res.json(updated);
  } catch (error: any) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

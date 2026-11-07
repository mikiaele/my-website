import express from 'express';
import cors from 'cors';
import path from 'path';
import { authRouter } from './routes/auth.ts';
import { productsRouter } from './routes/products.ts';
import { categoriesRouter } from './routes/categories.ts';
import { locationsRouter } from './routes/locations.ts';
import { inquiriesRouter } from './routes/inquiries.ts';
import { ordersRouter } from './routes/orders.ts';
import { settingsRouter } from './routes/settings.ts';
import { adminRouter } from './routes/admin.ts';
import { uploadRouter } from './routes/upload.ts';

export const app = express();

app.use(cors());
// Set 10MB limit for base64 camera image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve public uploads statically
const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Mount API routes
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/inquiries', inquiriesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/upload', uploadRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    marketplace: 'Mela Market (መላ ገበያ)',
    timestamp: new Date().toISOString(),
  });
});

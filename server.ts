import express, { Request, Response } from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Multer memory storage for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    const allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMime.includes(file.mimetype) || /\.(jpe?g|png|webp)$/i.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image type. Only JPG, JPEG, PNG, and WEBP are allowed.'));
    }
  },
});

// Supabase Server Client (using Service Role Key if available for administrative tasks)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabaseAdmin = (supabaseUrl && supabaseServiceRoleKey && !supabaseUrl.includes('your-project-id'))
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Health Check API
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'Mela Market',
    designatedAdmin: 'mikiaelebrhane@gmail.com',
    supabaseConfigured: Boolean(supabaseAdmin),
    time: new Date().toISOString(),
  });
});

// Admin verification endpoint
app.post('/api/admin/verify', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const isAdmin = email.trim().toLowerCase() === 'mikiaelebrhane@gmail.com';
  return res.json({
    isAdmin,
    email,
    role: isAdmin ? 'admin' : 'customer',
  });
});

// Image Upload API (proxies to Supabase Storage bucket 'product-images')
app.post('/api/upload', upload.single('photo'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No photo file provided' });
    }

    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniquePath = `products/${Date.now()}-${sanitizedName}`;

    // Upload to Supabase Storage if configured
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.storage
        .from('product-images')
        .upload(uniquePath, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: false,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabaseAdmin.storage
          .from('product-images')
          .getPublicUrl(data.path);

        return res.json({
          url: publicUrlData.publicUrl,
          path: data.path,
          storageProvider: 'supabase',
        });
      } else if (error) {
        console.warn('Server Supabase Storage upload error:', error.message);
      }
    }

    // Fallback data-url response if Supabase credentials or bucket are not yet created
    const base64 = file.buffer.toString('base64');
    const dataUrl = `data:${file.mimetype};base64,${base64}`;

    return res.json({
      url: dataUrl,
      path: uniquePath,
      storageProvider: 'server_fallback',
    });
  } catch (err: unknown) {
    console.error('Upload handler error:', err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Photo upload failed',
    });
  }
});

// Start Server & Mount Vite in dev or static files in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Vite middleware for development
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // Serve production static build
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Mela Market server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

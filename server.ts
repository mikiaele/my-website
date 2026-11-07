import http from 'http';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { initDb } from './src/server/db';
import apiRoutes from './src/server/routes';

dotenv.config();

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const PORT = parseInt(process.env.PORT || '3000', 10);

  // Parse JSON bodies (generous limit for high-res camera photos captured directly from user device)
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));
  app.use(cookieParser());

  // Initialize Neon PostgreSQL database
  await initDb();

  // Serve permanently stored product photos
  const uploadsPath = path.join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsPath));

  // Mount API endpoints
  app.use('/api', apiRoutes);

  // Development vs Production serving
  const isProduction = process.env.NODE_ENV === 'production';
  const isDisableHmr = process.env.DISABLE_HMR === 'true';

  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        ws: { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[Mela Market Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Mela Market Server] Fatal error starting server:', err);
  process.exit(1);
});

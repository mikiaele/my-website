import express from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import apiRouter from './server/api.ts';
import { initializeDatabase } from './server/db.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  // Dev server must run on port 3000 per environment constraints
  const PORT = process.env.NODE_ENV === 'production' && process.env.PORT
    ? parseInt(process.env.PORT, 10)
    : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Request JSON parsing
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Initialize Neon PostgreSQL database connection & schemas
  console.log('Connecting to Neon PostgreSQL database and checking migrations...');
  initializeDatabase().then((res) => {
    if (res.success) {
      console.log('Neon PostgreSQL ready:', res.message);
    } else {
      console.warn('Neon PostgreSQL initial notice:', res.message);
    }
  }).catch((err) => {
    console.error('Neon initialization error:', err);
  });

  // Mount API Router
  app.use('/api', apiRouter);

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  if (!isProd) {
    // Mount Vite dev server middleware in development with HMR disabled to prevent WebSocket errors
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware mounted in development mode (hmr: false)');
  } else {
    // Serve production static assets
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Mela Market full-stack server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server boot failure:', err);
  process.exit(1);
});

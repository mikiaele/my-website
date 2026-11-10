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

process.on('unhandledRejection', (reason, promise) => {
  console.warn('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  // Parse command-line args if passed (e.g. --port 3000 --host 0.0.0.0)
  const portArgIdx = process.argv.indexOf('--port');
  const portFromArg = portArgIdx !== -1 && process.argv[portArgIdx + 1] ? parseInt(process.argv[portArgIdx + 1], 10) : undefined;
  const PORT = portFromArg || (process.env.PORT ? parseInt(process.env.PORT, 10) : 3000);

  const hostArgIdx = process.argv.indexOf('--host');
  const HOST = (hostArgIdx !== -1 && process.argv[hostArgIdx + 1]) ? process.argv[hostArgIdx + 1] : '0.0.0.0';

  const isProd = process.env.NODE_ENV === 'production';

  // Request JSON parsing
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Initialize database connection & schemas (non-blocking fallback simulator if no DB url)
  console.log('Connecting to database and checking migrations...');
  initializeDatabase().then((res) => {
    if (res.success) {
      console.log('Database ready:', res.message);
    } else {
      console.warn('Database status notice:', res.message);
    }
  }).catch((err) => {
    console.error('Database initialization error:', err);
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

  httpServer.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use.`);
    } else {
      console.error('Server error:', err);
    }
  });

  httpServer.listen(PORT, HOST, () => {
    console.log(`Mela Market full-stack server running at http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server boot failure:', err);
  process.exit(1);
});

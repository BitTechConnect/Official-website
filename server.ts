import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { getEnvConfig } from './backend/config/env.ts';
import { publicApiLimiter } from './backend/middleware/security.ts';
import { publicRouter } from './backend/routes/public.ts';
import { adminRouter } from './backend/routes/admin.ts';
import { seoRouter } from './backend/routes/seo.ts';

async function startServer() {
  const cfg = getEnvConfig();
  const app = express();

  app.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (cfg.allowedOrigins.includes(origin) || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.endsWith('.run.app')) {
          return callback(null, true);
        }
        return callback(new Error('Origin not allowed by CORS'));
      },
      credentials: true,
    }),
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());

  // SEO endpoints
  app.use('/', seoRouter);

  // API Routes
  app.use('/api/public', publicApiLimiter, publicRouter);
  app.use('/api/admin', adminRouter);

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'CORESPACE API', timestamp: new Date().toISOString() });
  });

  // Error handler for Multer / JSON / CORS errors
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[Server Error]:', err.message);
    res.status(400).json({ error: err.message || 'Bad request.' });
  });

  if (!cfg.isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
    });
  }

  app.listen(cfg.port, '0.0.0.0', () => {
    console.log(`CORESPACE server listening on http://0.0.0.0:${cfg.port}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup failure:', err);
  process.exit(1);
});

import express, { type Request, type Response } from 'express';
import { publicRouter } from './routes/publicRoutes.ts';
import { adminRouter } from './routes/adminRoutes.ts';

export function createApiApp() {
  const app = express();
  app.set('trust proxy', 1);

  // Security headers (preserving iframe preview compatibility)
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });

  // Allow base64 media payloads up to 36MB (25MB binary + base64 overhead)
  app.use(express.json({ limit: '36mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.use('/api', publicRouter);
  app.use('/api/admin', adminRouter);

  app.use('/api', (_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: 'Rota da API não encontrada.',
      error: 'NOT_FOUND',
    });
  });

  return app;
}

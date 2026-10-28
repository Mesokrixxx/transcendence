import express, { type Express, type Router } from 'express';

export function createTestApp(router: Router, mountPath = '/api'): Express {
  const app = express();

  app.use(express.json());
  app.use(mountPath, router);

  return app;
}

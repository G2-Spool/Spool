import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'spool-auth-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

healthRouter.get('/ready', (req, res) => {
  // Check if all dependencies are ready
  const checks = {
    cognito: !!process.env.COGNITO_USER_POOL_ID,
    environment: !!process.env.NODE_ENV,
  };

  const allReady = Object.values(checks).every(check => check);

  res.status(allReady ? 200 : 503).json({
    ready: allReady,
    checks,
  });
}); 
import { Router } from 'express';
import authRoutes from './auth';
import inventoryRoutes from './inventory';
import orderRoutes from './orders';
import { authenticateToken } from '../middleware/auth';
import { databaseService } from '../config';

const router = Router();

// Public routes
router.use('/auth', authRoutes);

// Protected routes - require authentication
router.use('/inventory', authenticateToken, inventoryRoutes);
router.use('/orders', authenticateToken, orderRoutes);

// Health check route with database status
router.get('/health', async (_req, res) => {
  try {
    const dbHealthy = await databaseService.healthCheck();
    res.status(200).json({
      status: 'OK',
      service: "Bruno's IMS API",
      database: dbHealthy ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'Service Unavailable',
      service: "Bruno's IMS API",
      database: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

// API info route
router.get('/', (_req, res) => {
  res.json({
    message: "Welcome to Bruno's IMS API",
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      inventory: '/api/inventory',
      orders: '/api/orders',
      health: '/api/health',
    },
    documentation: '/api/docs', // Future implementation
  });
});

export default router;

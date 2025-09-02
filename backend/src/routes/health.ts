import express from 'express';
import { checkDatabaseHealth } from '../utils/database';
import { HealthCheckResponse } from '../models';

const router = express.Router();

// Health check endpoint
router.get('/health', async (_req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    
    const response: HealthCheckResponse = {
      status: dbHealth.status,
      message: `API is ${dbHealth.status}. ${dbHealth.message}`,
      timestamp: new Date(),
      version: process.env.API_VERSION || 'v1',
      uptime: process.uptime(),
    };

    const statusCode = dbHealth.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(response);
  } catch (error) {
    const response: HealthCheckResponse = {
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Unknown health check error',
      timestamp: new Date(),
      version: process.env.API_VERSION || 'v1',
      uptime: process.uptime(),
    };
    
    res.status(503).json(response);
  }
});

// Database-specific health check
router.get('/health/database', async (_req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    res.status(dbHealth.status === 'healthy' ? 200 : 503).json(dbHealth);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Database health check failed',
      timestamp: new Date(),
    });
  }
});

// Version endpoint
router.get('/version', (_req, res) => {
  res.json({
    version: process.env.API_VERSION || 'v1',
    name: 'Bruno\'s IMS API',
    description: 'Integrated Management System for multi-country restaurant groups',
    timestamp: new Date(),
  });
});

export default router;
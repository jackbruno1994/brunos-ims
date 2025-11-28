import express from 'express';
import { HealthCheckService } from '../services/healthCheck';
import prisma from '../lib/db';

const router = express.Router();
const healthCheck = new HealthCheckService(prisma);

router.get('/health', async (_req, res) => {
  try {
    const health = await healthCheck.checkDatabaseHealth();
    
    res.status(health.status === 'healthy' ? 200 : 503)
       .json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date(),
      details: {
        database: {
          status: 'down',
          responseTime: 0,
          connectionPool: {
            total: 0,
            active: 0,
            idle: 0
          }
        }
      }
    });
  }
});

export default router;
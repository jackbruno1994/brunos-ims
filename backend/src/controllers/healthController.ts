import { Request, Response } from 'express';
import { db } from '../config/database';

export const healthController = {
  // Basic health check
  async health(_req: Request, res: Response) {
    try {
      const dbHealth = await db.healthCheck();
      const health = {
        status: dbHealth.status === 'healthy' ? 'OK' : 'ERROR',
        timestamp: new Date().toISOString(),
        services: {
          database: dbHealth,
          server: {
            status: 'healthy',
            message: 'Server is running',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: process.version,
          },
        },
      };

      const statusCode = health.status === 'OK' ? 200 : 503;
      res.status(statusCode).json(health);
    } catch (error) {
      res.status(503).json({
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // Detailed metrics for monitoring
  async metrics(_req: Request, res: Response) {
    try {
      const [dbHealth, dbMetrics] = await Promise.all([
        db.healthCheck(),
        db.getMetrics(),
      ]);

      const metrics = {
        timestamp: new Date().toISOString(),
        database: {
          health: dbHealth,
          metrics: dbMetrics,
        },
        server: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          cpuUsage: process.cpuUsage(),
          version: process.version,
          platform: process.platform,
          arch: process.arch,
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
          port: process.env.PORT,
        },
      };

      res.json(metrics);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to retrieve metrics',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // Readiness check for Kubernetes/Docker
  async ready(_req: Request, res: Response) {
    try {
      const dbHealth = await db.healthCheck();
      
      if (dbHealth.status === 'healthy') {
        res.status(200).json({
          status: 'ready',
          timestamp: new Date().toISOString(),
        });
      } else {
        res.status(503).json({
          status: 'not ready',
          reason: 'Database not available',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      res.status(503).json({
        status: 'not ready',
        reason: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  },

  // Liveness check for Kubernetes/Docker
  async live(_req: Request, res: Response) {
    // Simple liveness check - if the server can respond, it's alive
    res.status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  },
};
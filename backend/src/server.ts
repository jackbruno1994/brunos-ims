import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { appConfig } from './config/index';
import { initializeDatabase, performHealthCheck, setupGracefulShutdown } from './utils/database';
import { DatabaseLogger, httpLoggerMiddleware, logStartup } from './utils/logger';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = appConfig.port;

// Middleware
app.use(helmet());
app.use(cors({
  origin: appConfig.corsOrigin,
  credentials: true,
}));
app.use(httpLoggerMiddleware());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic health check route
app.get('/health', async (_req: Request, res: Response) => {
  try {
    const healthCheck = await performHealthCheck();
    
    DatabaseLogger.logHealthCheck(healthCheck.status, healthCheck.details);
    
    res.status(healthCheck.status === 'healthy' ? 200 : 503).json({
      status: healthCheck.status === 'healthy' ? 'OK' : 'UNHEALTHY',
      message: "Bruno's IMS Backend API health check",
      database: healthCheck,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: appConfig.nodeEnv,
    });
  } catch (error) {
    DatabaseLogger.logError('Health check', error);
    res.status(503).json({
      status: 'UNHEALTHY',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// Database health check endpoint
app.get('/health/database', async (_req: Request, res: Response) => {
  try {
    const healthCheck = await performHealthCheck();
    DatabaseLogger.logHealthCheck(healthCheck.status, healthCheck.details);
    
    res.status(healthCheck.status === 'healthy' ? 200 : 503).json(healthCheck);
  } catch (error) {
    DatabaseLogger.logError('Database health check', error);
    res.status(503).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// API routes will be added here
app.get('/api', (_req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to Bruno's IMS API",
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/health',
    databaseHealth: '/health/database',
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: any) => {
  DatabaseLogger.logError('Application error', err);
  res.status(500).json({
    error: 'Internal server error',
    message: appConfig.nodeEnv === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString(),
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database connections
    await initializeDatabase();
    
    // Setup graceful shutdown handlers
    setupGracefulShutdown();
    
    // Start the server
    app.listen(PORT, () => {
      logStartup(PORT);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`📍 API endpoint: http://localhost:${PORT}/api`);
      console.log(`🗄️  Database health: http://localhost:${PORT}/health/database`);
    });
    
  } catch (error) {
    DatabaseLogger.logError('Server startup', error);
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectWithRetry, checkDatabaseHealth, disconnectDatabase } from './config/database';
import { appConfig } from './config';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = appConfig.port;

// Middleware
app.use(helmet());
app.use(cors({ origin: appConfig.corsOrigin }));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enhanced health check route with database status
app.get('/health', async (_req: Request, res: Response) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    
    res.status(dbHealth.status === 'healthy' ? 200 : 503).json({
      status: dbHealth.status === 'healthy' ? 'OK' : 'ERROR',
      message: "Bruno's IMS Backend API is running",
      timestamp: new Date().toISOString(),
      database: dbHealth,
      environment: appConfig.nodeEnv,
      version: '1.0.0',
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      message: "Bruno's IMS Backend API - Health check failed",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Database-specific health check endpoint
app.get('/health/database', async (_req: Request, res: Response) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    res.status(dbHealth.status === 'healthy' ? 200 : 503).json(dbHealth);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      message: 'Database health check failed',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// API routes will be added here
app.get('/api', (_req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to Bruno's IMS API",
    version: '1.0.0',
    environment: appConfig.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: any) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: appConfig.nodeEnv === 'development' ? err.message : 'Something went wrong',
  });
});

// Server startup with database connection
async function startServer() {
  try {
    // Connect to database with retry logic
    await connectWithRetry();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`📍 Database health: http://localhost:${PORT}/health/database`);
      console.log(`📍 API endpoint: http://localhost:${PORT}/api`);
      console.log(`🌍 Environment: ${appConfig.nodeEnv}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Gracefully shutting down...');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Gracefully shutting down...');
  await disconnectDatabase();
  process.exit(0);
});

// Start the server
startServer();

export default app;

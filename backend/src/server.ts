import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { db } from './database';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route with database status
app.get('/health', async (_req: Request, res: Response) => {
  try {
    const dbHealth = await db.healthCheck();
    
    res.status(200).json({
      status: 'OK',
      message: "Bruno's IMS Backend API is running",
      timestamp: new Date().toISOString(),
      database: dbHealth,
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    res.status(503).json({
      status: 'Service Unavailable',
      message: 'Database connection failed',
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
    documentation: '/api/docs',
  });
});

// Database connectivity test endpoint
app.get('/api/db/test', async (_req: Request, res: Response) => {
  try {
    const isConnected = await db.testConnection();
    if (isConnected) {
      res.json({ status: 'connected', message: 'Database connection successful' });
    } else {
      res.status(503).json({ status: 'disconnected', message: 'Database connection failed' });
    }
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      message: 'Database connection error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: any) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// Test database connection on startup
async function startServer() {
  try {
    console.log('🔌 Testing database connection...');
    const isConnected = await db.testConnection();
    
    if (!isConnected) {
      console.error('❌ Database connection failed. Server will start but database features may not work.');
    } else {
      console.log('✅ Database connection successful');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`📍 API endpoint: http://localhost:${PORT}/api`);
      console.log(`📍 Database test: http://localhost:${PORT}/api/db/test`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import { databaseService, appConfig } from './config';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = appConfig.port;

// Global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: appConfig.corsOrigin,
  credentials: true,
}));
app.use(limiter);
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
app.use('/api', routes);

// Basic health check route (without database)
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: "Bruno's IMS Backend API is running",
    timestamp: new Date().toISOString(),
  });
});

// Root route
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to Bruno's IMS API",
    version: '1.0.0',
    endpoints: {
      api: '/api',
      health: '/health',
    },
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    message: 'The requested resource could not be found.',
  });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: any) => {
  console.error('Global error handler:', err.stack);
  
  // Don't leak error details in production
  const isDevelopment = appConfig.nodeEnv === 'development';
  
  res.status(500).json({
    error: 'Internal server error',
    message: isDevelopment ? err.message : 'Something went wrong',
    ...(isDevelopment && { stack: err.stack }),
  });
});

// Start server function
async function startServer() {
  try {
    // Connect to database
    await databaseService.connect();
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 Environment: ${appConfig.nodeEnv}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`📍 API endpoint: http://localhost:${PORT}/api`);
      console.log(`📍 CORS origin: ${appConfig.corsOrigin}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await databaseService.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await databaseService.disconnect();
  process.exit(0);
});

// Start the server
startServer();

export default app;

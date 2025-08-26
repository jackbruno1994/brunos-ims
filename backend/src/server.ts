import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes';
import { CachingService } from './services/cachingService';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Initialize caching service
CachingService.initialize({
  maxSize: 1000,
  defaultTTL: 3600,
  cleanupInterval: 300
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic health check route
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: "Bruno's IMS Backend API is running",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api', routes);

// API info route
app.get('/api', (_req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to Bruno's IMS API",
    version: '1.0.0',
    features: [
      'Smart Prep-List Generator',
      'Order Processing Optimizations',
      'Advanced Analytics',
      'Smart Search with Learning',
      'Offline-First Architecture',
      'Intelligent Caching'
    ]
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
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 API endpoint: http://localhost:${PORT}/api`);
  console.log(`🧠 Advanced Order Processing System enabled`);
});

export default app;

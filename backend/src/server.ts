import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' })); // Increased limit for audit data
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Basic health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'Bruno\'s IMS Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: {
      auditSystem: true,
      analytics: true,
      compliance: true,
      security: true,
      integrations: true
    }
  });
});

// API routes
app.use('/api', routes);

// API info endpoint
app.get('/api', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to Bruno\'s IMS API with Enhanced Audit System',
    version: '1.0.0',
    endpoints: {
      restaurants: '/api/restaurants',
      audit: {
        logs: '/api/audit/logs',
        analytics: '/api/audit/analytics',
        security: '/api/audit/security/events',
        compliance: '/api/audit/compliance/reports',
        investigations: '/api/audit/investigations',
        search: '/api/audit/search',
        integrations: '/api/audit/integrations',
        metrics: '/api/audit/metrics',
        dashboard: '/api/audit/dashboard'
      }
    },
    documentation: '/api/docs'
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    availableEndpoints: [
      '/health',
      '/api',
      '/api/restaurants',
      '/api/audit/*'
    ]
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 API endpoint: http://localhost:${PORT}/api`);
  console.log(`🔍 Audit System: http://localhost:${PORT}/api/audit/dashboard`);
  console.log(`📊 Analytics: http://localhost:${PORT}/api/audit/analytics`);
  console.log(`🛡️  Security: http://localhost:${PORT}/api/audit/security/events`);
  console.log(`📋 Compliance: http://localhost:${PORT}/api/audit/compliance/reports`);
});

export default app;
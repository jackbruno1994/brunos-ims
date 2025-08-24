import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import errorHandler from './middleware/errorHandler';
import logger from './utils/logger';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bruno\'s IMS Backend is running',
    timestamp: new Date().toISOString()
  });
});

// API routes placeholder
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bruno\'s IMS API v1.0',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

// Error handler (must be last middleware)
app.use(errorHandler);

// Handle unhandled routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

export default app;
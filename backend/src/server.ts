import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes';
import { 
  globalErrorHandler, 
  notFoundHandler, 
  validationErrorHandler,
  requestLogger 
} from './middleware/errorHandler';

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
app.use(requestLogger);

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

// Error handling middleware (order matters!)
app.use(validationErrorHandler);
app.use(globalErrorHandler);

// 404 handler - must be last
app.use('*', notFoundHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 API endpoint: http://localhost:${PORT}/api`);
});

export default app;

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import routes from './routes';
import { AuditController } from './controllers';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Create HTTP server and Socket.IO instance
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Make io available globally for audit controller
declare global {
  var io: SocketIOServer;
}
global.io = io;

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  // Join audit room for real-time updates
  socket.join('audit-logs');
  
  // Send initial connection confirmation
  socket.emit('audit-connected', {
    message: 'Connected to audit system',
    timestamp: new Date().toISOString()
  });
  
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
  
  // Handle filter subscription for targeted updates
  socket.on('subscribe-filters', (filters) => {
    socket.data.filters = filters;
    console.log(`Client ${socket.id} subscribed to filters:`, filters);
  });
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', routes);

// Basic health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'Bruno\'s IMS Backend API is running',
    timestamp: new Date().toISOString(),
    websocket: 'enabled'
  });
});

// Root API endpoint
app.get('/api', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to Bruno\'s IMS API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      restaurants: '/api/restaurants',
      audit: '/api/audit'
    },
    features: {
      websocket: true,
      realTimeAudit: true
    }
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 API endpoint: http://localhost:${PORT}/api`);
  console.log(`🔌 WebSocket enabled for real-time audit updates`);
  
  // Seed sample audit data for development
  if (process.env.NODE_ENV !== 'production') {
    AuditController.seedSampleData();
    console.log('✅ Sample audit data seeded');
    
    // Start real-time simulation for demo
    setTimeout(() => {
      AuditController.startRealtimeSimulation();
    }, 5000); // Start after 5 seconds
  }
});

export default app;
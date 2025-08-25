import express, { Application, Request, Response } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes';
import { 
  errorHandler, 
  requestLogger, 
  generalRateLimit, 
  healthCheck 
} from './middleware';
import { orderService } from './services/orderService';

// Load environment variables
dotenv.config();

const app: Application = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(generalRateLimit);
app.use(requestLogger);

// Basic health check route
app.get('/health', healthCheck);

// API routes
app.use('/api', routes);

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Error handler (must be last)
app.use(errorHandler);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Join restaurant-specific room
  socket.on('join_restaurant', (restaurantId: string) => {
    socket.join(`restaurant_${restaurantId}`);
    console.log(`Client ${socket.id} joined restaurant ${restaurantId}`);
  });

  // Leave restaurant room
  socket.on('leave_restaurant', (restaurantId: string) => {
    socket.leave(`restaurant_${restaurantId}`);
    console.log(`Client ${socket.id} left restaurant ${restaurantId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Set up real-time order events
orderService.on('orderCreated', (order) => {
  io.to(`restaurant_${order.restaurantId}`).emit('order_created', order);
  io.emit('order_created_global', { restaurantId: order.restaurantId, orderId: order.id });
});

orderService.on('orderStatusUpdated', (data) => {
  orderService.getOrder(data.orderId).then(order => {
    if (order) {
      io.to(`restaurant_${order.restaurantId}`).emit('order_status_updated', {
        orderId: data.orderId,
        status: data.status,
        previousStatus: data.previousStatus,
        order
      });
    }
  });
});

orderService.on('orderQueued', (queueItem) => {
  orderService.getOrder(queueItem.orderId).then(order => {
    if (order) {
      io.to(`restaurant_${order.restaurantId}`).emit('order_queued', queueItem);
    }
  });
});

orderService.on('orderRemovedFromQueue', (orderId) => {
  orderService.getOrder(orderId).then(order => {
    if (order) {
      io.to(`restaurant_${order.restaurantId}`).emit('order_removed_from_queue', orderId);
    }
  });
});

orderService.on('metricsRecorded', (metrics) => {
  io.to(`restaurant_${metrics.restaurantId}`).emit('metrics_updated', metrics);
});

server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 API endpoint: http://localhost:${PORT}/api`);
  console.log(`📡 WebSocket enabled for real-time updates`);
});

export default app;
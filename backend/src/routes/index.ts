import { Router } from 'express';
import { RestaurantController, OrderController } from '../controllers';

const router = Router();

// API info route
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Bruno\'s IMS API',
    version: '1.0.0'
  });
});

// Restaurant routes
router.get('/restaurants', RestaurantController.getAllRestaurants);
router.post('/restaurants', RestaurantController.createRestaurant);

// Order routes
router.get('/orders', OrderController.getAllOrders);
router.get('/orders/:id', OrderController.getOrderById);
router.post('/orders', OrderController.createOrder);
router.put('/orders/:id', OrderController.updateOrder);
router.delete('/orders/:id', OrderController.cancelOrder);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Bruno\'s IMS API',
    timestamp: new Date().toISOString()
  });
});

export default router;
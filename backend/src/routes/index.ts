import { Router } from 'express';
import { RestaurantController, OrderController } from '../controllers';
import { 
  orderValidationRules, 
  restaurantValidationRules, 
  validateRequest, 
  orderRateLimit, 
  auditLogger,
  authorize 
} from '../middleware';

const router = Router();

// Restaurant routes
router.get('/restaurants', RestaurantController.getAllRestaurants);
router.post('/restaurants', 
  restaurantValidationRules, 
  validateRequest, 
  auditLogger('create_restaurant'),
  RestaurantController.createRestaurant
);

// Order routes
router.post('/orders', 
  orderRateLimit,
  orderValidationRules, 
  validateRequest, 
  auditLogger('create_order'),
  authorize(['admin', 'manager', 'staff']),
  OrderController.createOrder
);

router.get('/orders/:orderId', 
  auditLogger('get_order'),
  authorize(['admin', 'manager', 'staff']),
  OrderController.getOrder
);

router.patch('/orders/:orderId/status', 
  orderRateLimit,
  auditLogger('update_order_status'),
  authorize(['admin', 'manager', 'staff']),
  OrderController.updateOrderStatus
);

router.get('/restaurants/:restaurantId/orders', 
  auditLogger('get_restaurant_orders'),
  authorize(['admin', 'manager', 'staff']),
  OrderController.getOrdersByRestaurant
);

router.get('/orders/queue', 
  auditLogger('get_order_queue'),
  authorize(['admin', 'manager', 'staff']),
  OrderController.getOrderQueue
);

router.get('/restaurants/:restaurantId/analytics/orders', 
  auditLogger('get_order_analytics'),
  authorize(['admin', 'manager']),
  OrderController.getOrderAnalytics
);

router.get('/restaurants/:restaurantId/metrics/orders', 
  auditLogger('get_order_metrics'),
  authorize(['admin', 'manager']),
  OrderController.getOrderMetrics
);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Bruno\'s IMS API',
    timestamp: new Date().toISOString()
  });
});

export default router;
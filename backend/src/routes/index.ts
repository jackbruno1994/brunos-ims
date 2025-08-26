import { Router } from 'express';
import { RestaurantController } from '../controllers';
import purchaseOrderRoutes from './purchaseOrders';

const router = Router();

// Restaurant routes
router.get('/restaurants', RestaurantController.getAllRestaurants);
router.post('/restaurants', RestaurantController.createRestaurant);

// Purchase Order routes
router.use('/', purchaseOrderRoutes);

// Health check route
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    service: "Bruno's IMS API",
    timestamp: new Date().toISOString(),
  });
});

export default router;

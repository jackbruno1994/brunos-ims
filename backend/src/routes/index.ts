import { Router } from 'express';
import { RestaurantController } from '../controllers';
import inventoryRoutes from './inventoryRoutes';

const router = Router();

// Restaurant routes
router.get('/restaurants', RestaurantController.getAllRestaurants);
router.post('/restaurants', RestaurantController.createRestaurant);

// Inventory routes
router.use('/inventory', inventoryRoutes);

// Health check route
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    service: "Bruno's IMS API",
    timestamp: new Date().toISOString(),
  });
});

export default router;

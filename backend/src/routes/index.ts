import { Router } from 'express';
import { RestaurantController } from '../controllers';

const router = Router();

// Restaurant routes
router.get('/restaurants', RestaurantController.getAllRestaurants);
router.post('/restaurants', RestaurantController.createRestaurant);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Bruno\'s IMS API',
    timestamp: new Date().toISOString()
  });
});

export default router;
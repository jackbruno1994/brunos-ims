import { Router } from 'express';
import { RestaurantController } from '../controllers';
import { healthController } from '../controllers/healthController';

const router = Router();

// API Info
router.get('/', (_req, res) => {
  res.json({
    name: 'Bruno\'s IMS API',
    version: '1.0.0',
    status: 'active',
    timestamp: new Date().toISOString()
  });
});

// Health endpoints
router.get('/health', healthController.health);
router.get('/health/metrics', healthController.metrics);
router.get('/health/ready', healthController.ready);
router.get('/health/live', healthController.live);

// Restaurant routes
router.get('/restaurants', RestaurantController.getAllRestaurants);
router.post('/restaurants', RestaurantController.createRestaurant);

export default router;

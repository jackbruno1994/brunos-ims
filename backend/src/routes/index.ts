import { Router } from 'express';
import { RestaurantController, AuditController } from '../controllers';

const router = Router();

// Restaurant routes
router.get('/restaurants', RestaurantController.getAllRestaurants);
router.post('/restaurants', RestaurantController.createRestaurant);

// Audit routes
router.get('/audit/logs', AuditController.getAuditLogs);
router.post('/audit/logs', AuditController.createAuditLog);
router.get('/audit/logs/:id', AuditController.getAuditLogById);
router.post('/audit/export', AuditController.exportAuditLogs);
router.get('/audit/stats', AuditController.getAuditStats);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Bruno\'s IMS API',
    timestamp: new Date().toISOString()
  });
});

export default router;
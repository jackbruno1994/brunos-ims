import { Router } from 'express';
import { RestaurantController, RBACController } from '../controllers';
import { authenticate, requirePermission, requireRole, auditMiddleware } from '../middleware/auth';

const router = Router();

// Apply audit middleware to all routes
router.use(auditMiddleware);

// Public health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Bruno\'s IMS API',
    timestamp: new Date().toISOString()
  });
});

// Authentication middleware for protected routes
router.use(authenticate);

// RBAC routes
router.get('/rbac/permissions', RBACController.getUserPermissions);
router.get('/rbac/roles', requireRole(['super_admin', 'admin']), RBACController.getAllRoles);
router.get('/rbac/features', RBACController.getFeatureGroups);
router.get('/rbac/check/:featureGroup/:permissionType', RBACController.checkPermission);

// Restaurant routes with permission checks
router.get('/restaurants', 
  requirePermission('inventory_control', 'read'), 
  RestaurantController.getAllRestaurants
);
router.post('/restaurants', 
  requirePermission('system_administration', 'write'), 
  RestaurantController.createRestaurant
);

export default router;
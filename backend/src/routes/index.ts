import { Router } from 'express';
import { RestaurantController, InventoryController } from '../controllers';

const router = Router();

// Restaurant routes
router.get('/restaurants', RestaurantController.getAllRestaurants);
router.post('/restaurants', RestaurantController.createRestaurant);

// Inventory routes
// Specific routes first (before parameterized routes)
router.get('/inventory/alerts', InventoryController.getAlerts);
router.get('/inventory/movements', InventoryController.getStockMovements);
router.get('/inventory/low-stock', InventoryController.getLowStockItems);
router.get('/inventory/value', InventoryController.getStockValue);
router.post('/inventory/batch', InventoryController.batchUpdate);
router.post('/inventory/stock-movement', InventoryController.recordStockMovement);
router.put('/inventory/alerts/:id/read', InventoryController.markAlertAsRead);

// Core CRUD operations (parameterized routes last)
router.post('/inventory', InventoryController.createItem);
router.get('/inventory', InventoryController.getAllItems);
router.get('/inventory/:id', InventoryController.getItemById);
router.put('/inventory/:id', InventoryController.updateItem);
router.delete('/inventory/:id', InventoryController.deleteItem);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Bruno\'s IMS API',
    timestamp: new Date().toISOString()
  });
});

export default router;
import { Router } from 'express';
import { RestaurantController } from '../controllers';
import { inventoryController } from '../controllers/inventoryController';

const router = Router();

// Restaurant routes
router.get('/restaurants', RestaurantController.getAllRestaurants);
router.post('/restaurants', RestaurantController.createRestaurant);

// Inventory Item routes
router.get('/inventory/items', inventoryController.getAllItems);
router.post('/inventory/items', inventoryController.createItem);
router.get('/inventory/items/:id', inventoryController.getItem);
router.put('/inventory/items/:id', inventoryController.updateItem);
router.delete('/inventory/items/:id', inventoryController.deleteItem);

// Stock Movement routes
router.post('/inventory/stock-movements', inventoryController.recordStockMovement);
router.get('/inventory/stock-levels', inventoryController.getStockLevels);
router.get('/inventory/stock-history', inventoryController.getStockHistory);

// Location routes
router.get('/inventory/locations', inventoryController.getAllLocations);
router.post('/inventory/locations', inventoryController.createLocation);
router.put('/inventory/locations/:id', inventoryController.updateLocation);
router.delete('/inventory/locations/:id', inventoryController.deleteLocation);

// Category routes
router.get('/inventory/categories', inventoryController.getAllCategories);
router.post('/inventory/categories', inventoryController.createCategory);

// Health check route
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    service: "Bruno's IMS API",
    timestamp: new Date().toISOString(),
  });
});

export default router;

import { Router } from 'express';
import { inventoryController } from '../controllers/inventoryController';

const router = Router();

// Item routes
router.get('/items', inventoryController.getAllItems);
router.post('/items', inventoryController.createItem);
router.get('/items/low-stock', inventoryController.getLowStockItems);
router.get('/items/:id', inventoryController.getItem);
router.put('/items/:id', inventoryController.updateItem);
router.delete('/items/:id', inventoryController.deleteItem);

// Stock movement routes
router.post('/stock-movements', inventoryController.recordStockMovement);
router.get('/stock-movements', inventoryController.getStockHistory);
router.get('/stock-levels', inventoryController.getStockLevels);

// Location routes
router.get('/locations', inventoryController.getAllLocations);
router.post('/locations', inventoryController.createLocation);
router.get('/locations/:id', inventoryController.getLocation);
router.put('/locations/:id', inventoryController.updateLocation);
router.delete('/locations/:id', inventoryController.deleteLocation);

// Category routes
router.get('/categories', inventoryController.getAllCategories);
router.post('/categories', inventoryController.createCategory);
router.get('/categories/:id', inventoryController.getCategory);
router.put('/categories/:id', inventoryController.updateCategory);
router.delete('/categories/:id', inventoryController.deleteCategory);

export default router;
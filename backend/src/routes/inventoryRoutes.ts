import { Router } from 'express';
import { InventoryController } from '../controllers/inventoryController';

const router = Router();

// Item management routes
router.get('/items', InventoryController.getAllItems);
router.post('/items', InventoryController.createItem);
router.get('/items/:id', InventoryController.getItemById);
router.put('/items/:id', InventoryController.updateItem);
router.delete('/items/:id', InventoryController.deleteItem);

// Stock management routes
router.get('/stock', InventoryController.getCurrentStock);
router.post('/stock/movement', InventoryController.recordStockMovement);
router.get('/stock/movement/history', InventoryController.getStockMovementHistory);

// Location management routes
router.get('/locations', InventoryController.getAllLocations);
router.post('/locations', InventoryController.createLocation);

// Stock alerts route
router.get('/alerts', InventoryController.getStockAlerts);

export default router;
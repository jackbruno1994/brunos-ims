import { Router } from 'express';
import { RestaurantController } from '../controllers';
import { inventoryController } from '../controllers/inventoryController';
import healthRoutes from './health';

const router = Router();

// Health and system routes
router.use('/', healthRoutes);

// Restaurant routes
router.get('/restaurants', RestaurantController.getAllRestaurants);
router.post('/restaurants', RestaurantController.createRestaurant);

// Inventory routes
router.get('/inventory/items', inventoryController.getAllItems);
router.post('/inventory/items', inventoryController.createItem);
router.get('/inventory/items/:id', inventoryController.getItem);
router.put('/inventory/items/:id', inventoryController.updateItem);
router.delete('/inventory/items/:id', inventoryController.deleteItem);

export default router;

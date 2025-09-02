import { Router } from 'express';
import { orderController } from '../controllers/orderController';
import { requireStaff, requireManager } from '../middleware/auth';

const router = Router();

// Order routes
router.get('/orders', orderController.getAllOrders);
router.post('/orders', requireStaff, orderController.createOrder);
router.get('/orders/:id', orderController.getOrder);
router.put('/orders/:id', requireStaff, orderController.updateOrder);
router.delete('/orders/:id', requireManager, orderController.deleteOrder);

// Order status management
router.patch('/orders/:id/status', requireStaff, orderController.updateOrderStatus);

// Order item routes
router.get('/orders/:orderId/items', orderController.getOrderItems);
router.post('/orders/:orderId/items', requireStaff, orderController.addOrderItem);
router.put('/orders/:orderId/items/:itemId', requireStaff, orderController.updateOrderItem);
router.delete('/orders/:orderId/items/:itemId', requireStaff, orderController.deleteOrderItem);

// Supplier routes
router.get('/suppliers', orderController.getAllSuppliers);
router.post('/suppliers', requireStaff, orderController.createSupplier);
router.get('/suppliers/:id', orderController.getSupplier);
router.put('/suppliers/:id', requireStaff, orderController.updateSupplier);
router.delete('/suppliers/:id', requireManager, orderController.deleteSupplier);

export default router;
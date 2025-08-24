import { Router } from 'express';
import { body } from 'express-validator';
import { createOrder, getOrders, getOrderById, updateOrder, getOrderReports } from '../controllers/orderController';
import { authenticateToken, requireManagerOrAdmin } from '../middleware/auth';

const router = Router();

const orderValidation = [
  body('type').isIn(['purchase', 'sale', 'transfer']),
  body('products').isArray({ min: 1 }),
  body('products.*.productId').isMongoId(),
  body('products.*.quantity').isNumeric().isFloat({ min: 1 }),
  body('products.*.price').isNumeric().isFloat({ min: 0 }),
  body('restaurantId').isMongoId()
];

router.post('/', authenticateToken, orderValidation, createOrder);
router.get('/', authenticateToken, getOrders);
router.get('/reports', authenticateToken, requireManagerOrAdmin, getOrderReports);
router.get('/:id', authenticateToken, getOrderById);
router.put('/:id', authenticateToken, requireManagerOrAdmin, updateOrder);

export default router;
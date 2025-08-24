import { Router } from 'express';
import { body } from 'express-validator';
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct, getLowStockProducts } from '../controllers/productController';
import { authenticateToken, requireManagerOrAdmin } from '../middleware/auth';

const router = Router();

const productValidation = [
  body('name').isLength({ min: 1, max: 100 }).trim(),
  body('description').isLength({ min: 1, max: 500 }).trim(),
  body('categoryId').isMongoId(),
  body('currentStock').isNumeric().isFloat({ min: 0 }),
  body('price').isNumeric().isFloat({ min: 0 }),
  body('restaurantId').isMongoId(),
  body('minStockLevel').isNumeric().isFloat({ min: 0 }),
  body('unit').isLength({ min: 1 }).trim()
];

router.post('/', authenticateToken, requireManagerOrAdmin, productValidation, createProduct);
router.get('/', authenticateToken, getProducts);
router.get('/low-stock', authenticateToken, getLowStockProducts);
router.get('/:id', authenticateToken, getProductById);
router.put('/:id', authenticateToken, requireManagerOrAdmin, updateProduct);
router.delete('/:id', authenticateToken, requireManagerOrAdmin, deleteProduct);

export default router;
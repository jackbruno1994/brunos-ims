import { Router } from 'express';
import { body } from 'express-validator';
import { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory } from '../controllers/categoryController';
import { authenticateToken, requireManagerOrAdmin } from '../middleware/auth';

const router = Router();

const categoryValidation = [
  body('name').isLength({ min: 1, max: 100 }).trim(),
  body('description').isLength({ min: 1, max: 500 }).trim(),
  body('restaurantId').isMongoId()
];

router.post('/', authenticateToken, requireManagerOrAdmin, categoryValidation, createCategory);
router.get('/', authenticateToken, getCategories);
router.get('/:id', authenticateToken, getCategoryById);
router.put('/:id', authenticateToken, requireManagerOrAdmin, updateCategory);
router.delete('/:id', authenticateToken, requireManagerOrAdmin, deleteCategory);

export default router;
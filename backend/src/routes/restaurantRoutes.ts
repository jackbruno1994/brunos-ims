import { Router } from 'express';
import { body } from 'express-validator';
import { createRestaurant, getRestaurants, getRestaurantById, updateRestaurant, deleteRestaurant } from '../controllers/restaurantController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

const restaurantValidation = [
  body('name').isLength({ min: 1, max: 100 }).trim(),
  body('location').isLength({ min: 1 }).trim(),
  body('country').isLength({ min: 2, max: 50 }).trim(),
  body('operatingHours.open').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('operatingHours.close').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('contactInfo.phone').notEmpty().trim(),
  body('contactInfo.email').isEmail().normalizeEmail()
];

router.post('/', authenticateToken, requireAdmin, restaurantValidation, createRestaurant);
router.get('/', authenticateToken, getRestaurants);
router.get('/:id', authenticateToken, getRestaurantById);
router.put('/:id', authenticateToken, requireAdmin, updateRestaurant);
router.delete('/:id', authenticateToken, requireAdmin, deleteRestaurant);

export default router;
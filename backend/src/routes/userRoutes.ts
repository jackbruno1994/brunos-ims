import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getUsers, getUserById, updateUser, deleteUser } from '../controllers/userController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Validation rules
const registerValidation = [
  body('username').isLength({ min: 3, max: 50 }).trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['admin', 'manager', 'staff']),
  body('restaurantId').isMongoId(),
  body('country').isLength({ min: 2, max: 50 }).trim()
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes
router.get('/', authenticateToken, requireAdmin, getUsers);
router.get('/:id', authenticateToken, getUserById);
router.put('/:id', authenticateToken, requireAdmin, updateUser);
router.delete('/:id', authenticateToken, requireAdmin, deleteUser);

export default router;
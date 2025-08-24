import { Router } from 'express';
import {
  login,
  register,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  loginValidation
} from '../controllers/authDemoController';
import { authenticateToken, authorizeRoles } from '../middleware/authDemo';
import { handleValidationErrors } from '../middleware/errorHandler';
import { body } from 'express-validator';

const router = Router();

// Public routes
router.post('/login',
  loginValidation,
  handleValidationErrors,
  login
);

// Protected routes
router.use(authenticateToken);

// Register new user (admin only)
router.post('/register',
  authorizeRoles('admin'),
  register
);

// Logout
router.post('/logout', logout);

// Get current user profile
router.get('/profile', getProfile);

// Update profile
router.put('/profile',
  body('username').optional().isLength({ min: 3, max: 50 }).trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('country').optional().notEmpty().trim(),
  handleValidationErrors,
  updateProfile
);

// Change password
router.put('/change-password',
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }),
  handleValidationErrors,
  changePassword
);

export default router;
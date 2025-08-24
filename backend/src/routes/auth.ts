import { Router } from 'express';
import {
  login,
  register,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  loginValidation,
  registerValidation
} from '../controllers/authController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { logActivity } from '../middleware/activity';
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
  registerValidation,
  handleValidationErrors,
  authorizeRoles('admin'),
  logActivity('create', 'users'),
  register
);

// Logout
router.post('/logout',
  logActivity('logout', 'auth'),
  logout
);

// Get current user profile
router.get('/profile',
  logActivity('read', 'profile'),
  getProfile
);

// Update profile
router.put('/profile',
  body('username').optional().isLength({ min: 3, max: 50 }).trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('country').optional().notEmpty().trim(),
  handleValidationErrors,
  logActivity('update', 'profile'),
  updateProfile
);

// Change password
router.put('/change-password',
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }),
  handleValidationErrors,
  logActivity('password_reset', 'profile'),
  changePassword
);

export default router;
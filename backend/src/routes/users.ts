import { Router } from 'express';
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserStatus,
  resetPassword,
  getUserActivity,
  createUserValidation,
  updateUserValidation,
  getUsersValidation
} from '../controllers/userController';
import { authenticateToken, authorizeRoles, authorizePermissions } from '../middleware/auth';
import { logActivity } from '../middleware/activity';
import { handleValidationErrors } from '../middleware/errorHandler';
import { param } from 'express-validator';

const router = Router();

// All user routes require authentication
router.use(authenticateToken);

// Get all users with filtering and pagination
router.get('/', 
  getUsersValidation,
  handleValidationErrors,
  authorizePermissions('read_users'),
  logActivity('read', 'users'),
  getUsers
);

// Create new user
router.post('/',
  createUserValidation,
  handleValidationErrors,
  authorizePermissions('create_users'),
  logActivity('create', 'users'),
  createUser
);

// Get specific user
router.get('/:id',
  param('id').isMongoId(),
  handleValidationErrors,
  authorizePermissions('read_users'),
  logActivity('read', 'users'),
  getUserById
);

// Update user
router.put('/:id',
  updateUserValidation,
  handleValidationErrors,
  authorizePermissions('update_users'),
  logActivity('update', 'users'),
  updateUser
);

// Delete user
router.delete('/:id',
  param('id').isMongoId(),
  handleValidationErrors,
  authorizePermissions('delete_users'),
  logActivity('delete', 'users'),
  deleteUser
);

// Update user status
router.put('/:id/status',
  param('id').isMongoId(),
  handleValidationErrors,
  authorizePermissions('update_users'),
  logActivity('update', 'users'),
  updateUserStatus
);

// Reset user password
router.post('/:id/reset-password',
  param('id').isMongoId(),
  handleValidationErrors,
  authorizePermissions('reset_passwords'),
  logActivity('password_reset', 'users'),
  resetPassword
);

// Get user activity
router.get('/:id/activity',
  param('id').isMongoId(),
  handleValidationErrors,
  authorizePermissions('read_activity'),
  logActivity('read', 'activity'),
  getUserActivity
);

export default router;
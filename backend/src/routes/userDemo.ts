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
} from '../controllers/userDemoController';
import { authenticateToken, authorizeRoles, authorizePermissions } from '../middleware/authDemo';
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
  getUsers
);

// Create new user
router.post('/',
  createUserValidation,
  handleValidationErrors,
  authorizePermissions('create_users'),
  createUser
);

// Get specific user
router.get('/:id',
  param('id').notEmpty(),
  handleValidationErrors,
  authorizePermissions('read_users'),
  getUserById
);

// Update user
router.put('/:id',
  updateUserValidation,
  handleValidationErrors,
  authorizePermissions('update_users'),
  updateUser
);

// Delete user
router.delete('/:id',
  param('id').notEmpty(),
  handleValidationErrors,
  authorizePermissions('delete_users'),
  deleteUser
);

// Update user status
router.put('/:id/status',
  param('id').notEmpty(),
  handleValidationErrors,
  authorizePermissions('update_users'),
  updateUserStatus
);

// Reset user password
router.post('/:id/reset-password',
  param('id').notEmpty(),
  handleValidationErrors,
  authorizePermissions('reset_passwords'),
  resetPassword
);

// Get user activity
router.get('/:id/activity',
  param('id').notEmpty(),
  handleValidationErrors,
  authorizePermissions('read_activity'),
  getUserActivity
);

export default router;
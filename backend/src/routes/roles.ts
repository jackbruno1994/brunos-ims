import { Router } from 'express';
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  createRoleValidation,
  updateRoleValidation
} from '../controllers/roleController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { logActivity } from '../middleware/activity';
import { handleValidationErrors } from '../middleware/errorHandler';
import { param } from 'express-validator';

const router = Router();

// All role routes require authentication
router.use(authenticateToken);

// Get all roles
router.get('/',
  logActivity('read', 'roles'),
  getRoles
);

// Create new role (admin only)
router.post('/',
  createRoleValidation,
  handleValidationErrors,
  authorizeRoles('admin'),
  logActivity('create', 'roles'),
  createRole
);

// Update role (admin only)
router.put('/:id',
  updateRoleValidation,
  handleValidationErrors,
  authorizeRoles('admin'),
  logActivity('update', 'roles'),
  updateRole
);

// Delete role (admin only)
router.delete('/:id',
  param('id').isMongoId(),
  handleValidationErrors,
  authorizeRoles('admin'),
  logActivity('delete', 'roles'),
  deleteRole
);

export default router;
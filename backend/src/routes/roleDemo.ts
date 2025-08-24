import { Router } from 'express';
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  createRoleValidation,
  updateRoleValidation
} from '../controllers/roleDemoController';
import { authenticateToken, authorizeRoles } from '../middleware/authDemo';
import { handleValidationErrors } from '../middleware/errorHandler';
import { param } from 'express-validator';

const router = Router();

// All role routes require authentication
router.use(authenticateToken);

// Get all roles
router.get('/', getRoles);

// Create new role (admin only)
router.post('/',
  createRoleValidation,
  handleValidationErrors,
  authorizeRoles('admin'),
  createRole
);

// Update role (admin only)
router.put('/:id',
  updateRoleValidation,
  handleValidationErrors,
  authorizeRoles('admin'),
  updateRole
);

// Delete role (admin only)
router.delete('/:id',
  param('id').notEmpty(),
  handleValidationErrors,
  authorizeRoles('admin'),
  deleteRole
);

export default router;
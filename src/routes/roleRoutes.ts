import { Router } from 'express';
import { roleController } from '../controllers/roleController';
import { validateBody } from '../middleware/auth';
import { requirePermission, addUserToRequest } from '../middleware/auth';
import {
  createRoleSchema,
  updateRoleSchema,
  assignRoleSchema,
  permissionCheckSchema
} from '../middleware/validation';
import Joi from 'joi';

const router = Router();

// Add user to request for all routes
router.use(addUserToRequest);

// UUID validation schema
const uuidParamSchema = Joi.object({
  id: Joi.string().uuid().required()
});

const userIdParamSchema = Joi.object({
  userId: Joi.string().required()
});

// Helper middleware for parameter validation
const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error } = schema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: error.details[0].message
      });
    }
    next();
  };
};

// Role management routes
router.post(
  '/roles',
  validateBody(createRoleSchema),
  requirePermission('manage_roles', 'roles'),
  roleController.createRole.bind(roleController)
);

router.get(
  '/roles',
  requirePermission('view_roles', 'roles'),
  roleController.getAllRoles.bind(roleController)
);

router.get(
  '/roles/:id',
  validateParams(uuidParamSchema),
  requirePermission('view_roles', 'roles'),
  roleController.getRoleById.bind(roleController)
);

router.put(
  '/roles/:id',
  validateParams(uuidParamSchema),
  validateBody(updateRoleSchema),
  requirePermission('manage_roles', 'roles'),
  roleController.updateRole.bind(roleController)
);

router.delete(
  '/roles/:id',
  validateParams(uuidParamSchema),
  requirePermission('manage_roles', 'roles'),
  roleController.deleteRole.bind(roleController)
);

// User role assignment routes
router.put(
  '/users/:userId/role',
  validateParams(userIdParamSchema),
  validateBody(assignRoleSchema),
  requirePermission('manage_roles', 'users'),
  roleController.assignRoleToUser.bind(roleController)
);

router.get(
  '/users/:userId/role',
  validateParams(userIdParamSchema),
  requirePermission('view_staff', 'users'),
  roleController.getUserRole.bind(roleController)
);

// Permission routes
router.get(
  '/permissions',
  requirePermission('view_roles', 'permissions'),
  roleController.getAllPermissions.bind(roleController)
);

router.post(
  '/permissions/check',
  validateBody(permissionCheckSchema),
  roleController.checkPermission.bind(roleController)
);

export default router;
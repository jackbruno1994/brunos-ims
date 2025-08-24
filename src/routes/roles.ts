import express from 'express';
import { body, param } from 'express-validator';
import { RoleController } from '../controllers';
import { validateRequest } from '../middleware/validation';

const router = express.Router();
const roleController = new RoleController();

// Validation schemas
const createRoleValidation = [
  body('name')
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('description')
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be between 1 and 500 characters'),
  body('permissions')
    .isArray({ min: 1 })
    .withMessage('Permissions must be a non-empty array'),
  body('permissions.*')
    .isString()
    .withMessage('Each permission must be a string'),
  body('hierarchyLevel')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Hierarchy level must be between 1 and 100'),
  body('createdBy')
    .optional()
    .isMongoId()
    .withMessage('CreatedBy must be a valid user ID'),
];

const updateRoleValidation = [
  param('roleId')
    .isMongoId()
    .withMessage('Role ID must be a valid MongoDB ObjectId'),
  body('name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be between 1 and 500 characters'),
  body('permissions')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Permissions must be a non-empty array'),
  body('permissions.*')
    .optional()
    .isString()
    .withMessage('Each permission must be a string'),
  body('hierarchyLevel')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Hierarchy level must be between 1 and 100'),
];

const roleIdValidation = [
  param('roleId')
    .isMongoId()
    .withMessage('Role ID must be a valid MongoDB ObjectId'),
];

const userIdValidation = [
  param('userId')
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ObjectId'),
];

const assignRoleValidation = [
  param('userId')
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ObjectId'),
  body('roleId')
    .isMongoId()
    .withMessage('Role ID must be a valid MongoDB ObjectId'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  body('assignedBy')
    .isMongoId()
    .withMessage('AssignedBy must be a valid user ID'),
  body('reason')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason must be at most 500 characters'),
];

// Routes
router.post('/', createRoleValidation, validateRequest, roleController.createRole);
router.get('/', roleController.getAllRoles);
router.get('/:roleId', roleIdValidation, validateRequest, roleController.getRoleById);
router.get('/:roleId/permissions', roleIdValidation, validateRequest, roleController.getRolePermissions);
router.get('/:roleId/history', roleIdValidation, validateRequest, roleController.getPermissionHistory);
router.put('/:roleId', updateRoleValidation, validateRequest, roleController.updateRole);
router.delete('/:roleId', roleIdValidation, validateRequest, roleController.deleteRole);

export { router as roleRoutes };
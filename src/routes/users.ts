import express from 'express';
import { body, param } from 'express-validator';
import { UserController, RoleController } from '../controllers';
import { validateRequest } from '../middleware/validation';

const router = express.Router();
const userController = new UserController();
const roleController = new RoleController();

// Validation schemas
const createUserValidation = [
  body('username')
    .isString()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email address'),
  body('password')
    .isString()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name must be at most 50 characters'),
  body('lastName')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name must be at most 50 characters'),
  body('role')
    .optional()
    .isMongoId()
    .withMessage('Role must be a valid MongoDB ObjectId'),
];

const updateUserValidation = [
  param('userId')
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ObjectId'),
  body('username')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email address'),
  body('password')
    .optional()
    .isString()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name must be at most 50 characters'),
  body('lastName')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name must be at most 50 characters'),
  body('role')
    .optional()
    .isMongoId()
    .withMessage('Role must be a valid MongoDB ObjectId'),
];

const userIdValidation = [
  param('userId')
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ObjectId'),
];

const roleIdValidation = [
  param('roleId')
    .isMongoId()
    .withMessage('Role ID must be a valid MongoDB ObjectId'),
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

// User routes
router.post('/', createUserValidation, validateRequest, userController.createUser);
router.get('/', userController.getAllUsers);
router.get('/search', userController.searchUsers);
router.get('/count', userController.getUserCount);
router.get('/:userId', userIdValidation, validateRequest, userController.getUserById);
router.put('/:userId', updateUserValidation, validateRequest, userController.updateUser);
router.delete('/:userId', userIdValidation, validateRequest, userController.deleteUser);

// Role assignment routes
router.put('/:userId/role', assignRoleValidation, validateRequest, roleController.assignRoleToUser);
router.get('/:userId/permissions', userIdValidation, validateRequest, roleController.getUserPermissions);
router.get('/:userId/role-history', userIdValidation, validateRequest, roleController.getRoleChangeHistory);

// Users by role routes
router.get('/role/:roleId', roleIdValidation, validateRequest, userController.getUsersByRole);
router.get('/role/:roleId/count', roleIdValidation, validateRequest, userController.getUserCountByRole);

export { router as userRoutes };
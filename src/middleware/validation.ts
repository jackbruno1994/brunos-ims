import Joi from 'joi';

export const createRoleSchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    'string.empty': 'Role name is required',
    'string.min': 'Role name must be at least 3 characters long',
    'string.max': 'Role name must not exceed 50 characters'
  }),
  description: Joi.string().min(10).max(200).required().messages({
    'string.empty': 'Role description is required',
    'string.min': 'Role description must be at least 10 characters long',
    'string.max': 'Role description must not exceed 200 characters'
  }),
  permissions: Joi.array().items(Joi.string()).min(1).required().messages({
    'array.min': 'At least one permission is required',
    'array.empty': 'Permissions array cannot be empty'
  })
});

export const updateRoleSchema = Joi.object({
  name: Joi.string().min(3).max(50).optional().messages({
    'string.min': 'Role name must be at least 3 characters long',
    'string.max': 'Role name must not exceed 50 characters'
  }),
  description: Joi.string().min(10).max(200).optional().messages({
    'string.min': 'Role description must be at least 10 characters long',
    'string.max': 'Role description must not exceed 200 characters'
  }),
  permissions: Joi.array().items(Joi.string()).min(1).optional().messages({
    'array.min': 'At least one permission is required'
  })
});

export const assignRoleSchema = Joi.object({
  roleId: Joi.string().uuid().required().messages({
    'string.empty': 'Role ID is required',
    'string.guid': 'Role ID must be a valid UUID'
  }),
  startDate: Joi.string().isoDate().required().messages({
    'string.empty': 'Start date is required',
    'string.isoDate': 'Start date must be a valid ISO date'
  }),
  endDate: Joi.string().isoDate().optional().messages({
    'string.isoDate': 'End date must be a valid ISO date'
  }),
  assignedBy: Joi.string().required().messages({
    'string.empty': 'Assigned by user ID is required'
  })
});

export const permissionCheckSchema = Joi.object({
  permission: Joi.string().required().messages({
    'string.empty': 'Permission is required'
  }),
  resource: Joi.string().required().messages({
    'string.empty': 'Resource is required'
  })
});

export const uuidSchema = Joi.string().uuid().required().messages({
  'string.empty': 'ID is required',
  'string.guid': 'ID must be a valid UUID'
});
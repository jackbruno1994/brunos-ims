import { Response } from 'express';
import { body, param } from 'express-validator';
import { mockRoles } from '../utils/mockData';
import { AuthRequest } from '../middleware/auth';

// Validation rules (same as original)
export const createRoleValidation = [
  body('name').isIn(['admin', 'manager', 'staff']),
  body('description').notEmpty().trim(),
  body('permissions').isArray(),
  body('hierarchy').isInt({ min: 1, max: 10 })
];

export const updateRoleValidation = [
  param('id').notEmpty(),
  body('description').optional().notEmpty().trim(),
  body('permissions').optional().isArray(),
  body('hierarchy').optional().isInt({ min: 1, max: 10 })
];

// Get all roles (mock data)
export const getRoles = async (req: AuthRequest, res: Response) => {
  try {
    const roles = mockRoles.sort((a, b) => a.hierarchy - b.hierarchy);
    res.json({ roles });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
};

// Mock implementations for write operations
export const createRole = async (req: AuthRequest, res: Response) => {
  res.status(501).json({ error: 'Role creation not implemented in demo mode' });
};

export const updateRole = async (req: AuthRequest, res: Response) => {
  res.status(501).json({ error: 'Role update not implemented in demo mode' });
};

export const deleteRole = async (req: AuthRequest, res: Response) => {
  res.status(501).json({ error: 'Role deletion not implemented in demo mode' });
};
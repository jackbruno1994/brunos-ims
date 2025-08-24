import { Response } from 'express';
import { body, param, query } from 'express-validator';
import { mockUsers, mockRoles, getMockUsers } from '../utils/mockData';
import { AuthRequest } from '../middleware/auth';

// Validation rules (same as original)
export const createUserValidation = [
  body('username').isLength({ min: 3, max: 50 }).trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('role.type').isIn(['admin', 'manager', 'staff']),
  body('role.permissions').isArray(),
  body('restaurantId').notEmpty(),
  body('country').notEmpty().trim()
];

export const updateUserValidation = [
  param('id').notEmpty(),
  body('username').optional().isLength({ min: 3, max: 50 }).trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('role.type').optional().isIn(['admin', 'manager', 'staff']),
  body('role.permissions').optional().isArray(),
  body('restaurantId').optional().notEmpty(),
  body('country').optional().notEmpty().trim(),
  body('status').optional().isIn(['active', 'inactive'])
];

export const getUsersValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim(),
  query('role').optional().isIn(['admin', 'manager', 'staff']),
  query('status').optional().isIn(['active', 'inactive']),
  query('country').optional().trim(),
  query('restaurantId').optional().notEmpty()
];

// Get all users with filtering and pagination (mock data)
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const filters = req.query;
    const result = getMockUsers(filters);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get user by ID (mock data)
export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = mockUsers.find(u => u._id === id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Mock implementations for write operations
export const createUser = async (req: AuthRequest, res: Response) => {
  res.status(501).json({ error: 'User creation not implemented in demo mode' });
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  res.status(501).json({ error: 'User update not implemented in demo mode' });
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  res.status(501).json({ error: 'User deletion not implemented in demo mode' });
};

export const updateUserStatus = async (req: AuthRequest, res: Response) => {
  res.status(501).json({ error: 'Status update not implemented in demo mode' });
};

export const resetPassword = async (req: AuthRequest, res: Response) => {
  res.status(501).json({ error: 'Password reset not implemented in demo mode' });
};

export const getUserActivity = async (req: AuthRequest, res: Response) => {
  try {
    // Return mock activity data
    const activities = [
      {
        _id: '1',
        action: 'login',
        resource: 'auth',
        details: { method: 'email' },
        ipAddress: '192.168.1.100',
        timestamp: new Date()
      }
    ];
    
    res.json({
      activities,
      pagination: { page: 1, limit: 20, total: 1, pages: 1 }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user activity' });
  }
};
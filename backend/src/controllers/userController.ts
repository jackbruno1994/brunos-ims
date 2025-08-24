import { Response } from 'express';
import { body, param, query } from 'express-validator';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, IUser } from '../models/User';
import { Activity } from '../models/Activity';
import { AuthRequest } from '../middleware/auth';

// Validation rules
export const createUserValidation = [
  body('username').isLength({ min: 3, max: 50 }).trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('role.type').isIn(['admin', 'manager', 'staff']),
  body('role.permissions').isArray(),
  body('restaurantId').isMongoId(),
  body('country').notEmpty().trim()
];

export const updateUserValidation = [
  param('id').isMongoId(),
  body('username').optional().isLength({ min: 3, max: 50 }).trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('role.type').optional().isIn(['admin', 'manager', 'staff']),
  body('role.permissions').optional().isArray(),
  body('restaurantId').optional().isMongoId(),
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
  query('restaurantId').optional().isMongoId()
];

// Create user
export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const userData = req.body;
    
    // Check if user with email or username already exists
    const existingUser = await User.findOne({
      $or: [{ email: userData.email }, { username: userData.username }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email or username already exists' 
      });
    }

    const user = new User(userData);
    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// Get all users with filtering and pagination
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      status,
      country,
      restaurantId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter: any = {};

    // Apply filters
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) filter['role.type'] = role;
    if (status) filter.status = status;
    if (country) filter.country = country;
    if (restaurantId) filter.restaurantId = restaurantId;

    // For non-admin users, limit to their restaurant
    if (req.user?.role.type !== 'admin' && req.user) {
      filter.restaurantId = req.user.restaurantId;
    }

    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(filter)
        .populate('restaurantId', 'name country')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(filter)
    ]);

    res.json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get user by ID
export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).populate('restaurantId', 'name country');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Non-admin users can only view users from their restaurant
    if (req.user?.role.type !== 'admin' && req.user &&
        user.restaurantId.toString() !== req.user.restaurantId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Update user
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove password from updates if present - use separate endpoint
    delete updates.password;

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Non-admin users can only update users from their restaurant
    if (req.user?.role.type !== 'admin' && req.user &&
        user.restaurantId.toString() !== req.user.restaurantId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update user
    Object.assign(user, updates);
    await user.save();

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// Delete user
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent self-deletion
    if (user._id.toString() === req.user?._id.toString()) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Non-admin users can only delete users from their restaurant
    if (req.user?.role.type !== 'admin' && req.user &&
        user.restaurantId.toString() !== req.user.restaurantId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await User.findByIdAndDelete(id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Update user status
export const updateUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent self-deactivation
    if (user._id.toString() === req.user?._id.toString() && status === 'inactive') {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }

    user.status = status;
    await user.save();

    res.json({
      message: `User ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

// Reset password
export const resetPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex');
    user.password = tempPassword;
    
    // Set password reset token
    user.passwordResetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await user.save();

    res.json({
      message: 'Password reset successfully',
      tempPassword, // In real app, this would be sent via email
      resetToken: user.passwordResetToken
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

// Get user activity
export const getUserActivity = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [activities, total] = await Promise.all([
      Activity.find({ userId: id })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limitNum),
      Activity.countDocuments({ userId: id })
    ]);

    res.json({
      activities,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user activity' });
  }
};
import { Request, Response } from 'express';
import { body } from 'express-validator';
import * as jwt from 'jsonwebtoken';
import { mockUsers, getMockUser, mockRoles } from '../utils/mockData';
import { AuthRequest } from '../middleware/auth';

// Validation rules
export const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// Generate JWT token
const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign({ userId }, secret, { 
    expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
  } as jwt.SignOptions);
};

// Login with mock data
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Check mock users
    const user = getMockUser(email, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

// Get current user profile with mock data
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    // In a real app, this would get the user from the database
    // For demo, return the first mock user (admin)
    const user = mockUsers[0];
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// Mock implementations for other endpoints
export const register = async (req: AuthRequest, res: Response) => {
  res.status(501).json({ error: 'Registration not implemented in demo mode' });
};

export const logout = async (req: AuthRequest, res: Response) => {
  res.json({ message: 'Logout successful' });
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  res.status(501).json({ error: 'Profile update not implemented in demo mode' });
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  res.status(501).json({ error: 'Password change not implemented in demo mode' });
};
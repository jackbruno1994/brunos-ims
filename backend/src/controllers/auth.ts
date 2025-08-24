import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { appConfig } from '../config';
import { User } from '../models';

// Mock data storage - in a real app, this would be a database
const users: User[] = [
  {
    id: '1',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@brunosims.com',
    password: '$2b$10$7jdBffix/SEtqtLhQy9dJecwkZVNdLvhiIXl73DTVTcF6FE.skPja', // secret
    role: 'admin',
    country: 'US',
    status: 'active',
    permissions: ['*'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    firstName: 'Chef',
    lastName: 'Mario',
    email: 'chef@brunosims.com',
    password: '$2b$10$7jdBffix/SEtqtLhQy9dJecwkZVNdLvhiIXl73DTVTcF6FE.skPja', // secret
    role: 'chef',
    restaurantId: '1',
    country: 'US',
    status: 'active',
    permissions: ['recipe:read', 'recipe:write', 'recipe:delete', 'menu:read', 'menu:write', 'team:read'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    firstName: 'Line',
    lastName: 'Cook',
    email: 'linecook@brunosims.com',
    password: '$2b$10$7jdBffix/SEtqtLhQy9dJecwkZVNdLvhiIXl73DTVTcF6FE.skPja', // secret
    role: 'linecook',
    restaurantId: '1',
    country: 'US',
    status: 'active',
    permissions: ['recipe:read', 'preplist:read', 'preplist:write'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    firstName: 'Manager',
    lastName: 'Smith',
    email: 'manager@brunosims.com',
    password: '$2b$10$7jdBffix/SEtqtLhQy9dJecwkZVNdLvhiIXl73DTVTcF6FE.skPja', // secret
    role: 'manager',
    restaurantId: '1',
    country: 'US',
    status: 'active',
    permissions: ['*'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export class AuthController {
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const user = users.find(u => u.email === email && u.status === 'active');
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const token = jwt.sign(
        { user: { ...user, password: undefined } },
        appConfig.jwtSecret,
        { expiresIn: '24h' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        appConfig.jwtSecret,
        { expiresIn: '7d' }
      );

      res.status(200).json({
        message: 'Login successful',
        data: {
          token,
          refreshToken,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            restaurantId: user.restaurantId,
            permissions: user.permissions
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        error: 'Login failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { firstName, lastName, email, password, role, restaurantId, country } = req.body;

      if (!firstName || !lastName || !email || !password || !role) {
        res.status(400).json({ error: 'All fields are required' });
        return;
      }

      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        res.status(409).json({ error: 'User already exists' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Set default permissions based on role
      let permissions: string[] = [];
      switch (role) {
        case 'admin':
        case 'manager':
          permissions = ['*'];
          break;
        case 'chef':
          permissions = ['recipe:read', 'recipe:write', 'recipe:delete', 'menu:read', 'menu:write', 'team:read'];
          break;
        case 'linecook':
          permissions = ['recipe:read', 'preplist:read', 'preplist:write'];
          break;
      }

      const newUser: User = {
        id: Date.now().toString(),
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
        restaurantId,
        country,
        status: 'active',
        permissions,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      users.push(newUser);

      res.status(201).json({
        message: 'User registered successfully',
        data: {
          id: newUser.id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          role: newUser.role,
          restaurantId: newUser.restaurantId,
          permissions: newUser.permissions
        }
      });
    } catch (error) {
      res.status(500).json({
        error: 'Registration failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({ error: 'Refresh token is required' });
        return;
      }

      const decoded = jwt.verify(refreshToken, appConfig.jwtSecret) as any;
      const user = users.find(u => u.id === decoded.userId && u.status === 'active');

      if (!user) {
        res.status(401).json({ error: 'Invalid refresh token' });
        return;
      }

      const newToken = jwt.sign(
        { user: { ...user, password: undefined } },
        appConfig.jwtSecret,
        { expiresIn: '24h' }
      );

      res.status(200).json({
        message: 'Token refreshed successfully',
        data: { token: newToken }
      });
    } catch (error) {
      res.status(401).json({ error: 'Invalid refresh token' });
    }
  }

  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as any;
      const user = authReq.user;

      if (!user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      res.status(200).json({
        message: 'Profile retrieved successfully',
        data: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          restaurantId: user.restaurantId,
          permissions: user.permissions
        }
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to retrieve profile',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    try {
      // In a real app, you would invalidate the token in the database
      res.status(200).json({
        message: 'Logout successful'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Logout failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
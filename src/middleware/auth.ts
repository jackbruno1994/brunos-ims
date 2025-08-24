import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { roleService } from '../services/roleService';
import { ApiResponse } from '../types';

/**
 * Middleware to validate request body against Joi schema
 */
export const validateBody = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Validation Error',
        message: error.details[0].message
      };
      return res.status(400).json(response);
    }
    
    next();
  };
};

/**
 * Middleware to check if user has specific permission
 */
export const requirePermission = (permission: string, resource: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // In a real app, you would extract user ID from JWT token
      // For this demo, we'll use a hardcoded user ID or one from headers
      const userId = req.headers['x-user-id'] as string || 'test_user_1';
      
      const hasPermission = await roleService.checkPermission(userId, permission, resource);
      
      if (!hasPermission) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Forbidden',
          message: `Insufficient permissions. Required: ${permission} on ${resource}`
        };
        return res.status(403).json(response);
      }
      
      req.user = { id: userId }; // Add user to request for controllers
      next();
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Authorization Error',
        message: 'Failed to verify permissions'
      };
      return res.status(500).json(response);
    }
  };
};

/**
 * Global error handler middleware
 */
export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', error);
  
  const response: ApiResponse<null> = {
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  };
  
  res.status(500).json(response);
};

/**
 * Middleware to add user information to request
 */
export const addUserToRequest = (req: Request, res: Response, next: NextFunction) => {
  // In a real app, this would extract user from JWT token
  const userId = req.headers['x-user-id'] as string || 'test_user_1';
  req.user = { id: userId };
  next();
};

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}
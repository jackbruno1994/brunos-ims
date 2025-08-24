import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { appConfig } from '../config';
import { User } from '../models';

export interface AuthRequest extends Request {
  user?: User;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ error: 'Access denied. No token provided.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, appConfig.jwtSecret) as any;
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

export const authorize = (permissions: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Access denied. User not authenticated.' });
      return;
    }

    const hasPermission = permissions.some(permission => 
      req.user!.permissions.includes(permission) || 
      req.user!.role === 'admin'
    );

    if (!hasPermission) {
      res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
      return;
    }

    next();
  };
};

export const authorizeRoles = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Access denied. User not authenticated.' });
      return;
    }

    if (!roles.includes(req.user.role) && req.user.role !== 'admin') {
      res.status(403).json({ error: 'Access denied. Insufficient role.' });
      return;
    }

    next();
  };
};
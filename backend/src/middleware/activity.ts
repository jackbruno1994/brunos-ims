import { Request, Response, NextFunction } from 'express';
import { Activity } from '../models/Activity';
import { AuthRequest } from './auth';

export const logActivity = (action: string, resource: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (req.user) {
        await Activity.create({
          userId: req.user._id,
          action,
          resource,
          details: {
            method: req.method,
            path: req.path,
            body: action !== 'read' ? req.body : undefined,
            query: req.query
          },
          ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown'
        });
      }
      next();
    } catch (error) {
      // Don't fail the request if logging fails
      console.error('Activity logging error:', error);
      next();
    }
  };
};
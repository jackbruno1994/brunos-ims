import { Request, Response, NextFunction } from 'express';

// Placeholder auth middleware - would integrate with actual auth system
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // For now, just add a mock user to request for development
  // In production, this would validate JWT tokens and extract user info
  (req as any).user = {
    id: 'mock-user-id',
    role: 'admin'
  };
  next();
};
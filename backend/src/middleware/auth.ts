import { Request, Response, NextFunction } from 'express';

// Basic auth middleware for demonstration
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // In a real implementation, validate JWT token here
  // For now, just check for a basic auth header or add a fake user
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // For demonstration, add a default user
    (req as any).user = {
      id: 'demo-user',
      role: 'admin'
    };
  } else {
    // In a real implementation, decode JWT token
    (req as any).user = {
      id: 'authenticated-user',
      role: 'admin'
    };
  }
  
  next();
};
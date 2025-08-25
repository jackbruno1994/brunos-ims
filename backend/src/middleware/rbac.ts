import { Request, Response, NextFunction } from 'express';

interface Permission {
  resource: string;
  action: string;
}

// Basic RBAC middleware for demonstration
export const validatePermission = (permission: Permission) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // In a real implementation, check user permissions against resource/action
    // For now, just allow admin users
    if (user.role === 'admin') {
      next();
      return;
    }

    // Basic permission check for audit logs
    if (permission.resource === 'audit_logs' && permission.action === 'READ') {
      if (user.role === 'manager' || user.role === 'admin') {
        next();
        return;
      }
    }

    res.status(403).json({ 
      error: 'Forbidden', 
      message: `Insufficient permissions for ${permission.action} on ${permission.resource}` 
    });
  };
};
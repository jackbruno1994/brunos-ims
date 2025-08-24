import { Request, Response, NextFunction } from 'express';
import { UserRole, PermissionType, AuditLog } from '../models';
import { PermissionService } from '../utils/permissions';

// Extended request interface to include user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    restaurantId?: string;
  };
}

// Mock authentication middleware (in real implementation, this would verify JWT tokens)
export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // For demo purposes, we'll mock a user. In production, this would decode JWT token
  const mockUser = {
    id: '1',
    email: 'admin@brunos-ims.com',
    role: 'super_admin' as UserRole,
    restaurantId: '1'
  };

  req.user = mockUser;
  next();
};

// Permission check middleware factory
export const requirePermission = (featureGroup: string, permissionType: PermissionType) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
      return;
    }

    const hasPermission = PermissionService.hasPermission(
      req.user.role,
      featureGroup,
      permissionType
    );

    if (!hasPermission) {
      // Log access attempt
      auditLog(req, 'PERMISSION_DENIED', featureGroup, undefined, 
        `Access denied to ${featureGroup} with ${permissionType} permission`);

      res.status(403).json({
        error: 'Access denied',
        message: `You don't have ${permissionType} permission for ${featureGroup}`,
        requiredPermission: {
          featureGroup,
          permissionType
        }
      });
      return;
    }

    // Log successful access
    auditLog(req, 'PERMISSION_GRANTED', featureGroup, undefined,
      `Access granted to ${featureGroup} with ${permissionType} permission`);

    next();
  };
};

// Role-based access control middleware
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      auditLog(req, 'ROLE_ACCESS_DENIED', 'system', undefined,
        `Role ${req.user.role} attempted to access resource requiring roles: ${allowedRoles.join(', ')}`);

      res.status(403).json({
        error: 'Access denied',
        message: 'Your role does not have access to this resource',
        currentRole: req.user.role,
        requiredRoles: allowedRoles
      });
      return;
    }

    next();
  };
};

// Check if feature should be hidden from user
export const checkFeatureVisibility = (featureGroup: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required'
      });
      return;
    }

    if (PermissionService.isFeatureHidden(req.user.role, featureGroup)) {
      res.status(404).json({
        error: 'Resource not found'
      });
      return;
    }

    next();
  };
};

// Audit logging function
export const auditLog = (
  req: AuthenticatedRequest, 
  action: string, 
  resource: string, 
  resourceId?: string, 
  details?: string
) => {
  const log: Omit<AuditLog, 'id'> = {
    userId: req.user?.id || 'anonymous',
    action,
    resource,
    resourceId,
    details,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    timestamp: new Date()
  };

  // In production, this would be saved to database
  console.log('AUDIT LOG:', JSON.stringify(log, null, 2));
};

// Middleware to log all requests for audit purposes
export const auditMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  auditLog(req, 'API_REQUEST', req.path, undefined, `${req.method} ${req.originalUrl}`);
  next();
};
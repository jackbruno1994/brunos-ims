/**
 * RBAC Authentication and Authorization Middleware
 * Provides JWT authentication and role-based authorization
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { rbacService } from '../services/rbac';
import { RBACUser, PermissionString, ResourceType, ActionType } from '../types/rbac';

// Extend Express Request to include user information
declare global {
  namespace Express {
    interface Request {
      user?: RBACUser;
      permissions?: string[];
    }
  }
}

/**
 * JWT payload interface
 */
interface JWTPayload {
  userId: string;
  email: string;
  sessionId?: string;
  iat?: number;
  exp?: number;
}

/**
 * Authentication middleware - verifies JWT token
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Authorization header missing or invalid',
        code: 'AUTH_HEADER_MISSING'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

    try {
      const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
      
      // Here we would typically fetch the full user from database
      // For now, we'll create a minimal user object
      const mockUser: RBACUser = {
        id: decoded.userId,
        firstName: 'Test',
        lastName: 'User',
        email: decoded.email,
        status: 'active',
        country: 'US',
        roles: [],
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        ...(decoded.sessionId && { sessionId: decoded.sessionId }),
      };

      req.user = mockUser;
      next();
    } catch (jwtError) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Authentication error',
      code: 'AUTH_ERROR'
    });
    return;
  }
};

/**
 * Authorization middleware factory - checks if user has required permission
 */
export const authorize = (permissionString: PermissionString) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
        return;
      }

      const hasPermission = await rbacService.hasPermission(req.user.id, permissionString);
      
      if (!hasPermission) {
        res.status(403).json({
          success: false,
          error: `Access denied. Required permission: ${permissionString}`,
          code: 'PERMISSION_DENIED'
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Authorization error',
        code: 'AUTHZ_ERROR'
      });
      return;
    }
  };
};

/**
 * Role-based authorization middleware factory
 */
export const requireRole = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
        return;
      }

      const userRolesResult = await rbacService.getUserRoles(req.user.id);
      
      if (!userRolesResult.success || !userRolesResult.data) {
        res.status(403).json({
          success: false,
          error: 'Unable to verify user roles',
          code: 'ROLE_VERIFICATION_FAILED'
        });
        return;
      }

      // Check if user has any of the allowed roles
      const userRoleNames = await Promise.all(
        userRolesResult.data.map(async (userRole) => {
          const roleResult = await rbacService.getRoleById(userRole.roleId);
          return roleResult.success ? roleResult.data?.name : null;
        })
      );

      const hasAllowedRole = userRoleNames.some(roleName => 
        roleName && allowedRoles.includes(roleName)
      );

      if (!hasAllowedRole) {
        res.status(403).json({
          success: false,
          error: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
          code: 'ROLE_DENIED'
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Role authorization error',
        code: 'ROLE_AUTHZ_ERROR'
      });
      return;
    }
  };
};

/**
 * Resource-specific authorization middleware
 * Checks permission with optional resource ID context
 */
export const authorizeResource = (resource: ResourceType, action: ActionType) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
        return;
      }

      const context = {
        userId: req.user.id,
        resource,
        action,
        ...(req.params.id && { resourceId: req.params.id }),
        ...(req.user.restaurantId && { restaurantId: req.user.restaurantId }),
      };

      const permissionResult = await rbacService.checkPermission(context);
      
      if (!permissionResult.granted) {
        res.status(403).json({
          success: false,
          error: permissionResult.reason || 'Access denied',
          code: 'RESOURCE_ACCESS_DENIED'
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Resource authorization error',
        code: 'RESOURCE_AUTHZ_ERROR'
      });
      return;
    }
  };
};

/**
 * Middleware to load user permissions into request object
 */
export const loadUserPermissions = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      next();
      return;
    }

    const permissionsResult = await rbacService.getUserPermissions(req.user.id);
    
    if (permissionsResult.success && permissionsResult.data) {
      req.permissions = permissionsResult.data.map(p => p.name);
    }

    next();
  } catch (error) {
    // Don't fail the request if permission loading fails
    // Just continue without loaded permissions
    next();
  }
};

/**
 * Utility function to check permission in controllers
 */
export const checkUserPermission = async (userId: string, permissionString: PermissionString): Promise<boolean> => {
  try {
    return await rbacService.hasPermission(userId, permissionString);
  } catch (error) {
    return false;
  }
};

/**
 * Utility function to generate JWT token
 */
export const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>, expiresIn: string = '24h'): string => {
  const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
  return jwt.sign(payload, jwtSecret, { expiresIn } as jwt.SignOptions);
};

/**
 * Utility function to decode JWT token without verification
 */
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Middleware to validate session if session management is enabled
 */
export const validateSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.sessionId) {
      next();
      return;
    }

    // Session validation would be implemented here
    // For now, just continue
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Session validation failed',
      code: 'INVALID_SESSION'
    });
    return;
  }
};

/**
 * Admin-only middleware (super_admin or admin roles)
 */
export const requireAdmin = requireRole(['super_admin', 'admin']);

/**
 * Manager or above middleware (super_admin, admin, or manager roles)
 */
export const requireManager = requireRole(['super_admin', 'admin', 'manager']);

/**
 * Staff or above middleware (all roles except readonly)
 */
export const requireStaff = requireRole(['super_admin', 'admin', 'manager', 'staff']);

// Export commonly used middleware combinations
export const authMiddleware = {
  authenticate,
  authorize,
  requireRole,
  authorizeResource,
  loadUserPermissions,
  validateSession,
  requireAdmin,
  requireManager,
  requireStaff,
};

export default authMiddleware;
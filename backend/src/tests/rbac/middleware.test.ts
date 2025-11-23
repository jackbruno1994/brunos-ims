/**
 * Authentication Middleware Tests
 * Tests for JWT authentication and RBAC authorization middleware
 */

import { Request, Response, NextFunction } from 'express';
import { authenticate, authorize, requireRole, generateToken } from '../../middleware/auth';
import { rbacService } from '../../services/rbac';

// Mock the RBAC service
jest.mock('../../services/rbac', () => ({
  rbacService: {
    hasPermission: jest.fn(),
    getUserRoles: jest.fn(),
    getRoleById: jest.fn(),
  },
}));

const mockRBACService = rbacService as jest.Mocked<typeof rbacService>;

describe('Authentication Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('authenticate middleware', () => {
    const validToken = generateToken({
      userId: 'user-123',
      email: 'test@example.com',
      sessionId: 'session-123',
    });

    it('should authenticate valid JWT token', async () => {
      mockRequest.headers = {
        authorization: `Bearer ${validToken}`,
      };

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user?.id).toBe('user-123');
      expect(mockRequest.user?.email).toBe('test@example.com');
    });

    it('should reject request without authorization header', async () => {
      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authorization header missing or invalid',
        code: 'AUTH_HEADER_MISSING',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with invalid authorization header format', async () => {
      mockRequest.headers = {
        authorization: 'Invalid token',
      };

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authorization header missing or invalid',
        code: 'AUTH_HEADER_MISSING',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with invalid JWT token', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('authorize middleware', () => {
    beforeEach(() => {
      mockRequest.user = {
        id: 'user-123',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        status: 'active',
        country: 'US',
        roles: [],
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    it('should allow access when user has required permission', async () => {
      mockRBACService.hasPermission.mockResolvedValue(true);

      const authorizeMiddleware = authorize('user:read');
      await authorizeMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRBACService.hasPermission).toHaveBeenCalledWith('user-123', 'user:read');
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access when user lacks required permission', async () => {
      mockRBACService.hasPermission.mockResolvedValue(false);

      const authorizeMiddleware = authorize('user:delete');
      await authorizeMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRBACService.hasPermission).toHaveBeenCalledWith('user-123', 'user:delete');
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access denied. Required permission: user:delete',
        code: 'PERMISSION_DENIED',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should deny access when user is not authenticated', async () => {
      delete mockRequest.user;

      const authorizeMiddleware = authorize('user:read');
      await authorizeMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle permission check errors gracefully', async () => {
      mockRBACService.hasPermission.mockRejectedValue(new Error('Database error'));

      const authorizeMiddleware = authorize('user:read');
      await authorizeMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authorization error',
        code: 'AUTHZ_ERROR',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireRole middleware', () => {
    beforeEach(() => {
      mockRequest.user = {
        id: 'user-123',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        status: 'active',
        country: 'US',
        roles: [],
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    it('should allow access when user has required role', async () => {
      mockRBACService.getUserRoles.mockResolvedValue({
        success: true,
        data: [
          {
            id: 'ur-1',
            userId: 'user-123',
            roleId: 'role-admin',
            assignedBy: 'admin',
            assignedAt: new Date(),
            isActive: true,
          },
        ],
      });

      mockRBACService.getRoleById.mockResolvedValue({
        success: true,
        data: {
          id: 'role-admin',
          name: 'admin',
          displayName: 'Administrator',
          description: 'Admin role',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const requireRoleMiddleware = requireRole(['admin', 'manager']);
      await requireRoleMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRBACService.getUserRoles).toHaveBeenCalledWith('user-123');
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access when user lacks required role', async () => {
      mockRBACService.getUserRoles.mockResolvedValue({
        success: true,
        data: [
          {
            id: 'ur-1',
            userId: 'user-123',
            roleId: 'role-staff',
            assignedBy: 'admin',
            assignedAt: new Date(),
            isActive: true,
          },
        ],
      });

      mockRBACService.getRoleById.mockResolvedValue({
        success: true,
        data: {
          id: 'role-staff',
          name: 'staff',
          displayName: 'Staff',
          description: 'Staff role',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const requireRoleMiddleware = requireRole(['admin', 'manager']);
      await requireRoleMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access denied. Required roles: admin, manager',
        code: 'ROLE_DENIED',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should deny access when user is not authenticated', async () => {
      delete mockRequest.user;

      const requireRoleMiddleware = requireRole(['admin']);
      await requireRoleMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle role verification errors gracefully', async () => {
      mockRBACService.getUserRoles.mockResolvedValue({
        success: false,
        error: 'Database error',
      });

      const requireRoleMiddleware = requireRole(['admin']);
      await requireRoleMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Unable to verify user roles',
        code: 'ROLE_VERIFICATION_FAILED',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('generateToken utility', () => {
    it('should generate a valid JWT token', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
        sessionId: 'session-123',
      };

      const token = generateToken(payload);
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should generate token with custom expiration', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
      };

      const token = generateToken(payload, '1h');
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });
  });
});
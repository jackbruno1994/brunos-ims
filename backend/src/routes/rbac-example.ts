/**
 * RBAC Integration Example
 * Demonstrates how to use the RBAC system in routes and controllers
 */

import { Router } from 'express';
import { authenticate, authorize, requireRole, authorizeResource } from '../middleware/auth';
import { rbacService } from '../services/rbac';

const router = Router();

// Example: Public route (no authentication required)
router.get('/health', (_req, res) => {
  res.json({ status: 'OK', message: 'RBAC system is operational' });
});

// Example: Protected route with authentication only
router.get('/profile', authenticate, (req, res) => {
  res.json({
    message: 'User profile',
    user: req.user,
  });
});

// Example: Route requiring specific permission
router.get('/users', 
  authenticate, 
  authorize('user:read'), 
  async (_req, res) => {
    try {
      // Get all users logic here
      res.json({
        message: 'Users retrieved successfully',
        users: [], // Would be populated from database
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve users' });
    }
  }
);

// Example: Route requiring admin role
router.post('/users',
  authenticate,
  requireRole(['super_admin', 'admin']),
  async (req, res) => {
    try {
      // Create user logic here
      res.status(201).json({
        message: 'User created successfully',
        user: req.body, // Would be the created user
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
);

// Example: Resource-specific authorization
router.put('/users/:id',
  authenticate,
  authorizeResource('user', 'update'),
  async (req, res) => {
    try {
      const userId = req.params.id;
      // Update user logic here
      res.json({
        message: 'User updated successfully',
        userId,
        updates: req.body,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update user' });
    }
  }
);

// Example: Role management routes (admin only)
router.get('/roles',
  authenticate,
  requireRole(['super_admin', 'admin']),
  async (_req, res) => {
    try {
      const result = await rbacService.getAllRoles();
      if (result.success) {
        res.json({
          message: 'Roles retrieved successfully',
          roles: result.data,
        });
      } else {
        res.status(500).json({ error: result.error });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve roles' });
    }
  }
);

router.post('/roles',
  authenticate,
  requireRole(['super_admin']),
  async (req, res) => {
    try {
      const result = await rbacService.createRole(req.body);
      if (result.success) {
        res.status(201).json({
          message: 'Role created successfully',
          role: result.data,
        });
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to create role' });
    }
  }
);

// Example: Permission management routes
router.get('/permissions',
  authenticate,
  authorize('permission:read'),
  async (_req, res) => {
    try {
      const result = await rbacService.getAllPermissions();
      if (result.success) {
        res.json({
          message: 'Permissions retrieved successfully',
          permissions: result.data,
        });
      } else {
        res.status(500).json({ error: result.error });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve permissions' });
    }
  }
);

// Example: User role assignment (manager or above)
router.post('/users/:userId/roles',
  authenticate,
  requireRole(['super_admin', 'admin', 'manager']),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { roleId, restaurantId } = req.body;
      
      const result = await rbacService.assignUserRole({
        userId,
        roleId,
        restaurantId,
        assignedBy: req.user!.id,
      });
      
      if (result.success) {
        res.status(201).json({
          message: 'Role assigned successfully',
          assignment: result.data,
        });
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to assign role' });
    }
  }
);

// Example: Check user permissions
router.get('/users/:userId/permissions',
  authenticate,
  authorize('user:read'),
  async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Check if user can view this user's permissions
      if (req.user!.id !== userId) {
        const canViewOthers = await rbacService.hasPermission(req.user!.id, 'user:manage');
        if (!canViewOthers) {
          res.status(403).json({ 
            error: 'Cannot view other users permissions' 
          });
          return;
        }
      }
      
      const result = await rbacService.getUserPermissions(userId);
      if (result.success) {
        res.json({
          message: 'User permissions retrieved successfully',
          permissions: result.data,
        });
      } else {
        res.status(500).json({ error: result.error });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve user permissions' });
    }
  }
);

// Example: Restaurant-specific operations
router.get('/restaurants/:restaurantId/menu',
  authenticate,
  authorize('menu:read'),
  async (req, res) => {
    try {
      const { restaurantId } = req.params;
      
      // Check if user has access to this restaurant
      if (req.user!.restaurantId && req.user!.restaurantId !== restaurantId) {
        const canAccessAll = await rbacService.hasPermission(req.user!.id, 'restaurant:manage');
        if (!canAccessAll) {
          res.status(403).json({ 
            error: 'Access denied to this restaurant' 
          });
          return;
        }
      }
      
      res.json({
        message: 'Menu retrieved successfully',
        restaurantId,
        menu: [], // Would be populated from database
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve menu' });
    }
  }
);

export default router;
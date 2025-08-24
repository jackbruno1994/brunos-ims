import { Request, Response } from 'express';
import { roleService } from '../services/roleService';
import { ApiResponse, CreateRoleRequest, AssignRoleRequest, PermissionCheck } from '../types';

export class RoleController {
  /**
   * Create a new role
   * POST /api/roles
   */
  async createRole(req: Request, res: Response) {
    try {
      const roleData: CreateRoleRequest = req.body;
      const createdBy = req.user?.id || 'system';

      const role = await roleService.createRole(roleData, createdBy);

      const response: ApiResponse<typeof role> = {
        success: true,
        data: role,
        message: 'Role created successfully'
      };

      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Role Creation Failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      res.status(400).json(response);
    }
  }

  /**
   * Get all roles
   * GET /api/roles
   */
  async getAllRoles(req: Request, res: Response) {
    try {
      const roles = await roleService.getAllRoles();

      const response: ApiResponse<typeof roles> = {
        success: true,
        data: roles,
        message: 'Roles retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to Retrieve Roles',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      res.status(500).json(response);
    }
  }

  /**
   * Get role by ID
   * GET /api/roles/:id
   */
  async getRoleById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const role = await roleService.getRoleById(id);

      if (!role) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Role Not Found',
          message: `Role with ID '${id}' not found`
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<typeof role> = {
        success: true,
        data: role,
        message: 'Role retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to Retrieve Role',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      res.status(500).json(response);
    }
  }

  /**
   * Update role
   * PUT /api/roles/:id
   */
  async updateRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedBy = req.user?.id || 'system';

      const role = await roleService.updateRole(id, updates, updatedBy);

      const response: ApiResponse<typeof role> = {
        success: true,
        data: role,
        message: 'Role updated successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Role Update Failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      res.status(400).json(response);
    }
  }

  /**
   * Delete role
   * DELETE /api/roles/:id
   */
  async deleteRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deletedBy = req.user?.id || 'system';

      await roleService.deleteRole(id, deletedBy);

      const response: ApiResponse<null> = {
        success: true,
        message: 'Role deleted successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Role Deletion Failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      res.status(400).json(response);
    }
  }

  /**
   * Assign role to user
   * PUT /api/users/:userId/role
   */
  async assignRoleToUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const assignmentData: AssignRoleRequest = req.body;

      await roleService.assignRoleToUser(userId, assignmentData);

      const response: ApiResponse<null> = {
        success: true,
        message: 'Role assigned successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Role Assignment Failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      res.status(400).json(response);
    }
  }

  /**
   * Check permission
   * POST /api/permissions/check
   */
  async checkPermission(req: Request, res: Response) {
    try {
      const { permission, resource } = req.body;
      const userId = req.user?.id || 'test_user_1';

      const hasPermission = await roleService.checkPermission(userId, permission, resource);

      const permissionCheck: PermissionCheck = {
        userId,
        permission,
        resource,
        expected: hasPermission
      };

      const response: ApiResponse<typeof permissionCheck> = {
        success: true,
        data: permissionCheck,
        message: `Permission check completed`
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Permission Check Failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      res.status(500).json(response);
    }
  }

  /**
   * Get all permissions
   * GET /api/permissions
   */
  async getAllPermissions(req: Request, res: Response) {
    try {
      const permissions = await roleService.getAllPermissions();

      const response: ApiResponse<typeof permissions> = {
        success: true,
        data: permissions,
        message: 'Permissions retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to Retrieve Permissions',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      res.status(500).json(response);
    }
  }

  /**
   * Get user role information
   * GET /api/users/:userId/role
   */
  async getUserRole(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const userRole = await roleService.getUserRole(userId);

      const response: ApiResponse<typeof userRole> = {
        success: true,
        data: userRole,
        message: 'User role information retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to Retrieve User Role',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      res.status(400).json(response);
    }
  }
}

export const roleController = new RoleController();
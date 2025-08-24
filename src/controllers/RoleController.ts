import { Request, Response } from 'express';
import { RoleService } from '../services';
import { createSuccessResponse, createErrorResponse } from '../utils';
import { Role as IRole } from '../types';

export class RoleController {
  private roleService: RoleService;

  constructor() {
    this.roleService = new RoleService();
  }

  // Create a new role
  createRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const roleData: Omit<IRole, '_id' | 'createdAt' | 'updatedAt'> = {
        name: req.body.name,
        description: req.body.description,
        permissions: req.body.permissions,
        hierarchyLevel: req.body.hierarchyLevel || 10,
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
        createdBy: req.body.createdBy,
      };

      const role = await this.roleService.createRole(roleData);
      res.status(201).json(createSuccessResponse(role, 'Role created successfully'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(400).json(createErrorResponse(errorMessage, 'Failed to create role'));
    }
  };

  // Get all roles
  getAllRoles = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortBy = (req.query.sortBy as string) || 'hierarchyLevel';
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

      const roles = await this.roleService.getAllRoles({
        page,
        limit,
        sortBy,
        sortOrder,
      });

      res.json(createSuccessResponse(roles, 'Roles retrieved successfully'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json(createErrorResponse(errorMessage, 'Failed to retrieve roles'));
    }
  };

  // Get role by ID
  getRoleById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { roleId } = req.params;
      const role = await this.roleService.getRoleById(roleId);

      if (!role) {
        res.status(404).json(createErrorResponse('Role not found'));
        return;
      }

      res.json(createSuccessResponse(role, 'Role retrieved successfully'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json(createErrorResponse(errorMessage, 'Failed to retrieve role'));
    }
  };

  // Get role permissions
  getRolePermissions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { roleId } = req.params;
      const permissions = await this.roleService.getRolePermissions(roleId);

      res.json(createSuccessResponse(permissions, 'Role permissions retrieved successfully'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json(createErrorResponse(errorMessage, 'Failed to retrieve role permissions'));
    }
  };

  // Update role
  updateRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const { roleId } = req.params;
      const updateData = req.body;
      const updatedBy = req.body.updatedBy;

      const role = await this.roleService.updateRole(roleId, updateData, updatedBy);

      if (!role) {
        res.status(404).json(createErrorResponse('Role not found'));
        return;
      }

      res.json(createSuccessResponse(role, 'Role updated successfully'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(400).json(createErrorResponse(errorMessage, 'Failed to update role'));
    }
  };

  // Delete role
  deleteRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const { roleId } = req.params;
      await this.roleService.deleteRole(roleId);

      res.json(createSuccessResponse(null, 'Role deleted successfully'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(400).json(createErrorResponse(errorMessage, 'Failed to delete role'));
    }
  };

  // Assign role to user
  assignRoleToUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { roleId, startDate, assignedBy, reason } = req.body;

      await this.roleService.assignRoleToUser({
        userId,
        roleId,
        startDate: startDate ? new Date(startDate) : new Date(),
        assignedBy,
        reason,
        isActive: true,
      });

      res.json(createSuccessResponse(null, 'Role assigned to user successfully'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(400).json(createErrorResponse(errorMessage, 'Failed to assign role to user'));
    }
  };

  // Update user role
  updateUserRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { roleId, assignedBy, reason } = req.body;

      await this.roleService.updateUserRole(userId, roleId, assignedBy, reason);

      res.json(createSuccessResponse(null, 'User role updated successfully'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(400).json(createErrorResponse(errorMessage, 'Failed to update user role'));
    }
  };

  // Get user permissions
  getUserPermissions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const permissions = await this.roleService.getUserPermissions(userId);

      res.json(createSuccessResponse(permissions, 'User permissions retrieved successfully'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json(createErrorResponse(errorMessage, 'Failed to retrieve user permissions'));
    }
  };

  // Get role change history for user
  getRoleChangeHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const history = await this.roleService.getRoleChangeHistory(userId);

      res.json(createSuccessResponse(history, 'Role change history retrieved successfully'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json(createErrorResponse(errorMessage, 'Failed to retrieve role change history'));
    }
  };

  // Get permission history for role
  getPermissionHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { roleId } = req.params;
      const history = await this.roleService.getPermissionHistory(roleId);

      res.json(createSuccessResponse(history, 'Permission history retrieved successfully'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json(createErrorResponse(errorMessage, 'Failed to retrieve permission history'));
    }
  };
}
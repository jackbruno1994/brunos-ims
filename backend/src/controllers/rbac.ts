import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { PermissionService } from '../utils/permissions';
import { FEATURE_GROUPS } from '../config/rbac';
import { UserRole } from '../models';

export class RBACController {
  // Get current user's permissions
  static async getUserPermissions(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const permissions = PermissionService.getRolePermissions(req.user.role);
      const accessibleFeatures = PermissionService.getAccessibleFeatureGroups(req.user.role);

      return res.status(200).json({
        message: 'User permissions retrieved successfully',
        data: {
          userId: req.user.id,
          role: req.user.role,
          roleDisplayName: PermissionService.getRoleDisplayName(req.user.role),
          permissions,
          accessibleFeatures,
          featureGroups: FEATURE_GROUPS.filter(fg => !PermissionService.isFeatureHidden(req.user!.role, fg.name))
        }
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to retrieve user permissions',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get all available roles (admin only)
  static async getAllRoles(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const roles = PermissionService.getAllRoles().map(role => ({
        name: role,
        displayName: PermissionService.getRoleDisplayName(role),
        permissions: PermissionService.getRolePermissions(role)
      }));

      return res.status(200).json({
        message: 'Roles retrieved successfully',
        data: roles
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to retrieve roles',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get all feature groups
  static async getFeatureGroups(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Filter feature groups based on user's role
      const visibleFeatureGroups = FEATURE_GROUPS.filter(fg => 
        !PermissionService.isFeatureHidden(req.user!.role, fg.name)
      );

      return res.status(200).json({
        message: 'Feature groups retrieved successfully',
        data: visibleFeatureGroups
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to retrieve feature groups',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Check specific permission
  static async checkPermission(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { featureGroup, permissionType } = req.params;

      if (!featureGroup || !permissionType) {
        return res.status(400).json({
          error: 'Missing parameters',
          message: 'featureGroup and permissionType are required'
        });
      }

      if (!['read', 'write', 'hide'].includes(permissionType)) {
        return res.status(400).json({
          error: 'Invalid permission type',
          message: 'permissionType must be one of: read, write, hide'
        });
      }

      const hasPermission = PermissionService.hasPermission(
        req.user.role,
        featureGroup,
        permissionType as any
      );

      return res.status(200).json({
        message: 'Permission check completed',
        data: {
          userId: req.user.id,
          role: req.user.role,
          featureGroup,
          permissionType,
          hasPermission
        }
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to check permission',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
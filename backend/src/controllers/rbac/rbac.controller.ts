import { Request, Response } from 'express';
import { RBACService } from '../../services/rbac/rbac.service';

export class RBACController {
  private service: RBACService;

  constructor() {
    this.service = RBACService.getInstance();
  }

  // Permission controllers
  public createPermission = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id || 'anonymous';
      const permission = await this.service.createPermission(req.body, userId);
      res.status(201).json(permission);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  public updatePermission = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id || 'anonymous';
      const permission = await this.service.updatePermission(
        req.params.id,
        req.body,
        userId
      );
      res.status(200).json(permission);
    } catch (error) {
      if (error instanceof Error && error.message === 'Permission not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }
  };

  public deletePermission = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id || 'anonymous';
      const deleted = await this.service.deletePermission(req.params.id, userId);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Permission not found' });
      }
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  public getPermission = async (req: Request, res: Response): Promise<void> => {
    try {
      const permission = await this.service.getPermissionById(req.params.id);
      if (permission) {
        res.status(200).json(permission);
      } else {
        res.status(404).json({ error: 'Permission not found' });
      }
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  public getAllPermissions = async (req: Request, res: Response): Promise<void> => {
    try {
      const permissions = await this.service.getAllPermissions();
      res.status(200).json(permissions);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  // Role controllers
  public createRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id || 'anonymous';
      const role = await this.service.createRole(req.body, userId);
      res.status(201).json(role);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  public updateRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id || 'anonymous';
      const role = await this.service.updateRole(
        req.params.id,
        req.body,
        userId
      );
      res.status(200).json(role);
    } catch (error) {
      if (error instanceof Error && error.message === 'Role not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }
  };

  public deleteRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id || 'anonymous';
      const deleted = await this.service.deleteRole(req.params.id, userId);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Role not found' });
      }
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  public getRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const role = await this.service.getRoleById(req.params.id);
      if (role) {
        res.status(200).json(role);
      } else {
        res.status(404).json({ error: 'Role not found' });
      }
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  public getAllRoles = async (req: Request, res: Response): Promise<void> => {
    try {
      const roles = await this.service.getAllRoles();
      res.status(200).json(roles);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  // UserRole controllers
  public assignRoleToUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, roleId } = req.body;
      const assignedBy = (req as any).user?.id || 'anonymous';
      const userRole = await this.service.assignRoleToUser(userId, roleId, assignedBy);
      res.status(201).json(userRole);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  public removeRoleFromUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, roleId } = req.body;
      const removedBy = (req as any).user?.id || 'anonymous';
      const removed = await this.service.removeRoleFromUser(userId, roleId, removedBy);
      if (removed) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'User role assignment not found' });
      }
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  public getUserRoles = async (req: Request, res: Response): Promise<void> => {
    try {
      const userRoles = await this.service.getUserRoles(req.params.userId);
      res.status(200).json(userRoles);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  public getRoleUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const roleUsers = await this.service.getRoleUsers(req.params.roleId);
      res.status(200).json(roleUsers);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };
}

export default RBACController;
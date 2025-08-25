import { Router, Request, Response } from 'express';
import { RBACService } from '../services/rbac/rbac.service';

const router = Router();
const rbacService = RBACService.getInstance();

// Permission routes
router.post('/permissions', async (req: Request, res: Response) => {
  try {
    const permission = await rbacService.createPermission(req.body);
    res.status(201).json(permission);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to create permission',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/permissions/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const permission = await rbacService.getPermissionById(req.params.id);
    if (!permission) {
      return res.status(404).json({ error: 'Permission not found' });
    }
    return res.json(permission);
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to fetch permission',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Role routes
router.post('/roles', async (req: Request, res: Response) => {
  try {
    const role = await rbacService.createRole(req.body);
    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to create role',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/roles/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const role = await rbacService.getRoleById(req.params.id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    return res.json(role);
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to fetch role',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Role-Permission routes
router.post('/roles/:roleId/permissions/:permissionId', async (req: Request, res: Response): Promise<Response> => {
  try {
    const role = await rbacService.addPermissionToRole(req.params.roleId, req.params.permissionId);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    return res.json(role);
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to add permission to role',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// User-Role routes
router.post('/users/:userId/roles/:roleId', async (req: Request, res: Response) => {
  try {
    const userRole = await rbacService.assignRoleToUser(req.params.userId, req.params.roleId, 'admin');
    res.status(201).json(userRole);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to assign role to user',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/users/:userId/roles', async (req: Request, res: Response) => {
  try {
    const roles = await rbacService.getUserRoles(req.params.userId);
    res.json(roles);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch user roles',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
import { Router } from 'express';
import { RBACController } from '../../controllers/rbac/rbac.controller';

const router = Router();
const rbacController = new RBACController();

// Middleware to simulate authentication for demo purposes
// In a real application, this would be replaced with proper JWT authentication
const mockAuthMiddleware = (req: any, res: any, next: any) => {
  // Mock user for demonstration
  req.user = {
    id: 'demo-user-id',
    name: 'Demo User',
    email: 'demo@example.com'
  };
  next();
};

// Permission routes
router.post('/permissions', mockAuthMiddleware, rbacController.createPermission);
router.get('/permissions/:id', rbacController.getPermission);
router.put('/permissions/:id', mockAuthMiddleware, rbacController.updatePermission);
router.delete('/permissions/:id', mockAuthMiddleware, rbacController.deletePermission);
router.get('/permissions', rbacController.getAllPermissions);

// Role routes
router.post('/roles', mockAuthMiddleware, rbacController.createRole);
router.get('/roles/:id', rbacController.getRole);
router.put('/roles/:id', mockAuthMiddleware, rbacController.updateRole);
router.delete('/roles/:id', mockAuthMiddleware, rbacController.deleteRole);
router.get('/roles', rbacController.getAllRoles);

// User role assignment routes
router.post('/user-roles', mockAuthMiddleware, rbacController.assignRoleToUser);
router.delete('/user-roles', mockAuthMiddleware, rbacController.removeRoleFromUser);
router.get('/users/:userId/roles', rbacController.getUserRoles);
router.get('/roles/:roleId/users', rbacController.getRoleUsers);

export default router;
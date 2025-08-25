import { RBACService } from '../rbac.service';
import { Permission, Role } from '../../../types/rbac.types';

describe('RBACService', () => {
  let rbacService: RBACService;

  beforeEach(() => {
    // Get a fresh instance for each test
    rbacService = RBACService.getInstance();
  });

  describe('Role Management', () => {
    const testRole = {
      name: 'editor',
      description: 'Can edit content',
      permissions: [{
        id: '1',
        name: 'edit_content',
        description: 'Can edit content items',
        resource: 'content',
        action: 'UPDATE' as const,
        createdAt: new Date('2025-08-25T09:17:19Z'),
        updatedAt: new Date('2025-08-25T09:17:19Z')
      }]
    };

    it('should create a new role', async () => {
      const role = await rbacService.createRole(testRole);
      
      expect(role.id).toBeDefined();
      expect(role.name).toBe(testRole.name);
      expect(role.description).toBe(testRole.description);
      expect(role.permissions).toHaveLength(1);
      expect(role.createdAt).toBeDefined();
      expect(role.updatedAt).toBeDefined();
    });

    it('should update an existing role', async () => {
      const role = await rbacService.createRole(testRole);
      const updates = {
        name: 'senior_editor',
        description: 'Can edit and publish content'
      };

      const updatedRole = await rbacService.updateRole(role.id, updates);

      expect(updatedRole.name).toBe(updates.name);
      expect(updatedRole.description).toBe(updates.description);
      expect(updatedRole.permissions).toEqual(role.permissions);
    });

    it('should throw error when updating non-existent role', async () => {
      await expect(
        rbacService.updateRole('non-existent', { name: 'test' })
      ).rejects.toThrow('Role not found');
    });
  });

  describe('User Role Assignment', () => {
    let roleId: string;
    const userId = 'user123';
    const assignedBy = 'admin';

    beforeEach(async () => {
      const role = await rbacService.createRole({
        name: 'test_role',
        description: 'Test role',
        permissions: []
      });
      roleId = role.id;
    });

    it('should assign role to user', async () => {
      const assignment = await rbacService.assignRoleToUser(userId, roleId, assignedBy);

      expect(assignment.userId).toBe(userId);
      expect(assignment.roleId).toBe(roleId);
      expect(assignment.assignedBy).toBe(assignedBy);
      expect(assignment.assignedAt).toBeDefined();
    });

    it('should throw error when assigning non-existent role', async () => {
      await expect(
        rbacService.assignRoleToUser(userId, 'non-existent', assignedBy)
      ).rejects.toThrow('Role not found');
    });

    it('should retrieve user roles', async () => {
      await rbacService.assignRoleToUser(userId, roleId, assignedBy);
      const roles = await rbacService.getUserRoles(userId);

      expect(roles).toHaveLength(1);
      expect(roles[0].id).toBe(roleId);
    });
  });

  describe('Permission Checking', () => {
    let roleId: string;
    const userId = 'user123';
    const permission: Permission = {
      id: '1',
      name: 'edit_content',
      description: 'Can edit content items',
      resource: 'content',
      action: 'UPDATE' as const,
      createdAt: new Date('2025-08-25T09:17:19Z'),
      updatedAt: new Date('2025-08-25T09:17:19Z')
    };

    beforeEach(async () => {
      const role = await rbacService.createRole({
        name: 'test_role',
        description: 'Test role',
        permissions: [permission]
      });
      roleId = role.id;
      await rbacService.assignRoleToUser(userId, roleId, 'admin');
    });

    it('should return true for permitted action', async () => {
      const hasPermission = await rbacService.hasPermission(userId, permission);
      expect(hasPermission).toBe(true);
    });

    it('should return false for non-permitted action', async () => {
      const nonPermitted = {
        ...permission,
        action: 'DELETE' as const
      };
      const hasPermission = await rbacService.hasPermission(userId, nonPermitted);
      expect(hasPermission).toBe(false);
    });

    it('should return false for non-existent user', async () => {
      const hasPermission = await rbacService.hasPermission('non-existent', permission);
      expect(hasPermission).toBe(false);
    });
  });
});
import {
  Role,
  Permission,
  UserRole,
  RolePermission,
  RBACUser
} from '../index';

describe('RBAC Types', () => {
  describe('Role interface', () => {
    it('should define a valid Role structure', () => {
      const role: Role = {
        id: 'role-1',
        name: 'admin',
        description: 'Administrator role',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(role.id).toBe('role-1');
      expect(role.name).toBe('admin');
      expect(role.description).toBe('Administrator role');
      expect(role.createdAt).toBeInstanceOf(Date);
      expect(role.updatedAt).toBeInstanceOf(Date);
    });

    it('should allow optional description', () => {
      const role: Role = {
        id: 'role-2',
        name: 'manager',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(role.description).toBeUndefined();
      expect(role.id).toBe('role-2');
      expect(role.name).toBe('manager');
    });
  });

  describe('Permission interface', () => {
    it('should define a valid Permission structure', () => {
      const permission: Permission = {
        id: 'perm-1',
        name: 'read-users',
        description: 'Read user information',
        resource: 'users',
        action: 'read',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(permission.id).toBe('perm-1');
      expect(permission.name).toBe('read-users');
      expect(permission.description).toBe('Read user information');
      expect(permission.resource).toBe('users');
      expect(permission.action).toBe('read');
      expect(permission.createdAt).toBeInstanceOf(Date);
      expect(permission.updatedAt).toBeInstanceOf(Date);
    });

    it('should enforce valid action types', () => {
      const actions: Permission['action'][] = ['create', 'read', 'update', 'delete', 'manage'];
      
      actions.forEach(action => {
        const permission: Permission = {
          id: 'perm-test',
          name: 'test-permission',
          resource: 'test',
          action,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        expect(permission.action).toBe(action);
      });
    });

    it('should allow optional description', () => {
      const permission: Permission = {
        id: 'perm-2',
        name: 'update-inventory',
        resource: 'inventory',
        action: 'update',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(permission.description).toBeUndefined();
      expect(permission.resource).toBe('inventory');
      expect(permission.action).toBe('update');
    });
  });

  describe('UserRole interface', () => {
    it('should define a valid UserRole relationship', () => {
      const userRole: UserRole = {
        userId: 'user-1',
        roleId: 'role-1',
        assignedAt: new Date()
      };

      expect(userRole.userId).toBe('user-1');
      expect(userRole.roleId).toBe('role-1');
      expect(userRole.assignedAt).toBeInstanceOf(Date);
    });
  });

  describe('RolePermission interface', () => {
    it('should define a valid RolePermission relationship', () => {
      const rolePermission: RolePermission = {
        roleId: 'role-1',
        permissionId: 'perm-1',
        assignedAt: new Date()
      };

      expect(rolePermission.roleId).toBe('role-1');
      expect(rolePermission.permissionId).toBe('perm-1');
      expect(rolePermission.assignedAt).toBeInstanceOf(Date);
    });
  });

  describe('RBACUser interface', () => {
    it('should define a valid RBACUser structure', () => {
      const mockRole: Role = {
        id: 'role-1',
        name: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockPermission: Permission = {
        id: 'perm-1',
        name: 'read-users',
        resource: 'users',
        action: 'read',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const rbacUser: RBACUser = {
        id: 'user-1',
        roles: [mockRole],
        permissions: [mockPermission],
        hasRole: jest.fn((role: string) => role === 'admin'),
        hasPermission: jest.fn((permission: string) => permission === 'read-users')
      };

      expect(rbacUser.id).toBe('user-1');
      expect(rbacUser.roles).toHaveLength(1);
      expect(rbacUser.permissions).toHaveLength(1);
      expect(rbacUser.roles[0]).toEqual(mockRole);
      expect(rbacUser.permissions[0]).toEqual(mockPermission);
      expect(typeof rbacUser.hasRole).toBe('function');
      expect(typeof rbacUser.hasPermission).toBe('function');
    });

    it('should validate hasRole method signature', () => {
      const rbacUser: RBACUser = {
        id: 'user-1',
        roles: [],
        permissions: [],
        hasRole: (_role: string): boolean => false,
        hasPermission: (_permission: string): boolean => false
      };

      expect(rbacUser.hasRole('admin')).toBe(false);
      expect(rbacUser.hasPermission('read-users')).toBe(false);
    });
  });

  describe('Type exports', () => {
    it('should export all RBAC types', () => {
      // This test verifies that all types are properly exported
      // and can be imported without TypeScript compilation errors
      // TypeScript interfaces don't exist at runtime, so we just verify compilation
      expect(true).toBe(true);
    });
  });
});
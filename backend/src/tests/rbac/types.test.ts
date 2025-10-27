/**
 * RBAC Types Tests
 * Unit tests for RBAC type definitions and interfaces
 */

import {
  Role,
  Permission,
  UserRole,
  RBACUser,
  PermissionString,
  RoleType,
  CreateRoleInput,
  CreatePermissionInput,
  AssignUserRoleInput,
} from '../../types/rbac';

describe('RBAC Types', () => {
  describe('Role Type', () => {
    it('should accept valid role types', () => {
      const validRoles: RoleType[] = ['super_admin', 'admin', 'manager', 'staff', 'readonly'];
      expect(validRoles).toHaveLength(5);
      expect(validRoles).toContain('super_admin');
      expect(validRoles).toContain('admin');
      expect(validRoles).toContain('manager');
      expect(validRoles).toContain('staff');
      expect(validRoles).toContain('readonly');
    });
  });

  describe('Permission String Format', () => {
    it('should create valid permission strings', () => {
      const permission: PermissionString = 'user:create';
      expect(permission).toBe('user:create');
      
      const permissions: PermissionString[] = [
        'user:create',
        'user:read',
        'user:update',
        'user:delete',
        'restaurant:manage',
        'menu:read',
        'inventory:update',
        'order:delete',
        'report:execute',
        'system:manage'
      ];
      
      expect(permissions).toHaveLength(10);
      permissions.forEach(perm => {
        expect(perm).toMatch(/^[a-z_]+:[a-z_]+$/);
      });
    });
  });

  describe('Role Interface', () => {
    it('should create a valid role object', () => {
      const role: Role = {
        id: 'role-123',
        name: 'admin',
        displayName: 'Administrator',
        description: 'Administrative access',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(role.id).toBe('role-123');
      expect(role.name).toBe('admin');
      expect(role.displayName).toBe('Administrator');
      expect(role.isActive).toBe(true);
      expect(role.createdAt).toBeInstanceOf(Date);
      expect(role.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Permission Interface', () => {
    it('should create a valid permission object', () => {
      const permission: Permission = {
        id: 'perm-123',
        name: 'user:create',
        resource: 'user',
        action: 'create',
        description: 'Create new users',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(permission.id).toBe('perm-123');
      expect(permission.name).toBe('user:create');
      expect(permission.resource).toBe('user');
      expect(permission.action).toBe('create');
      expect(permission.isActive).toBe(true);
    });
  });

  describe('UserRole Interface', () => {
    it('should create a valid user role assignment', () => {
      const userRole: UserRole = {
        id: 'ur-123',
        userId: 'user-123',
        roleId: 'role-123',
        restaurantId: 'restaurant-123',
        assignedBy: 'admin-123',
        assignedAt: new Date(),
        isActive: true,
      };

      expect(userRole.userId).toBe('user-123');
      expect(userRole.roleId).toBe('role-123');
      expect(userRole.restaurantId).toBe('restaurant-123');
      expect(userRole.assignedBy).toBe('admin-123');
      expect(userRole.isActive).toBe(true);
    });

    it('should allow optional restaurant ID', () => {
      const userRole: UserRole = {
        id: 'ur-123',
        userId: 'user-123',
        roleId: 'role-123',
        assignedBy: 'admin-123',
        assignedAt: new Date(),
        isActive: true,
      };

      expect(userRole.restaurantId).toBeUndefined();
    });
  });

  describe('RBACUser Interface', () => {
    it('should create a valid RBAC user object', () => {
      const user: RBACUser = {
        id: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        status: 'active',
        country: 'US',
        roles: [],
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(user.id).toBe('user-123');
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.email).toBe('john.doe@example.com');
      expect(user.status).toBe('active');
      expect(user.roles).toEqual([]);
      expect(user.permissions).toEqual([]);
    });
  });

  describe('Input Types', () => {
    it('should create valid CreateRoleInput', () => {
      const input: CreateRoleInput = {
        name: 'manager',
        displayName: 'Restaurant Manager',
        description: 'Manages restaurant operations',
        isActive: true,
      };

      expect(input.name).toBe('manager');
      expect(input.displayName).toBe('Restaurant Manager');
      expect(input.isActive).toBe(true);
    });

    it('should create valid CreatePermissionInput', () => {
      const input: CreatePermissionInput = {
        name: 'menu:update',
        resource: 'menu',
        action: 'update',
        description: 'Update menu items',
        isActive: true,
      };

      expect(input.name).toBe('menu:update');
      expect(input.resource).toBe('menu');
      expect(input.action).toBe('update');
    });

    it('should create valid AssignUserRoleInput', () => {
      const input: AssignUserRoleInput = {
        userId: 'user-123',
        roleId: 'role-123',
        restaurantId: 'restaurant-123',
        assignedBy: 'admin-123',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      };

      expect(input.userId).toBe('user-123');
      expect(input.roleId).toBe('role-123');
      expect(input.restaurantId).toBe('restaurant-123');
      expect(input.assignedBy).toBe('admin-123');
      expect(input.expiresAt).toBeInstanceOf(Date);
    });
  });
});
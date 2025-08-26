/**
 * Tests for RBAC Schema Definitions
 * 
 * This file tests the TypeScript interfaces and DTOs for the RBAC system.
 */

import { 
  Role, 
  Permission, 
  UserRole, 
  RolePermission,
  CreateRoleDto,
  UpdateRoleDto,
  CreatePermissionDto,
  UpdatePermissionDto,
  RoleWithPermissions,
  UserWithRoles,
  PermissionCheck
} from '@/db/schemas/rbac.schema';

describe('RBAC Schema Definitions', () => {
  describe('Role interface', () => {
    it('should have correct structure for Role', () => {
      const role: Role = {
        id: 'test-uuid',
        name: 'admin',
        description: 'Administrator role',
        created_at: new Date(),
        updated_at: new Date()
      };

      expect(role.id).toBeDefined();
      expect(role.name).toBeDefined();
      expect(role.created_at).toBeInstanceOf(Date);
      expect(role.updated_at).toBeInstanceOf(Date);
    });

    it('should allow optional description for Role', () => {
      const role: Role = {
        id: 'test-uuid',
        name: 'user',
        created_at: new Date(),
        updated_at: new Date()
      };

      expect(role.description).toBeUndefined();
    });
  });

  describe('Permission interface', () => {
    it('should have correct structure for Permission', () => {
      const permission: Permission = {
        id: 'test-uuid',
        name: 'create_user',
        description: 'Create new users',
        resource: 'users',
        action: 'create',
        created_at: new Date(),
        updated_at: new Date()
      };

      expect(permission.id).toBeDefined();
      expect(permission.name).toBeDefined();
      expect(permission.resource).toBeDefined();
      expect(permission.action).toBeDefined();
      expect(['create', 'read', 'update', 'delete', 'manage']).toContain(permission.action);
    });

    it('should validate action values', () => {
      const validActions: Array<'create' | 'read' | 'update' | 'delete' | 'manage'> = [
        'create', 'read', 'update', 'delete', 'manage'
      ];

      validActions.forEach(action => {
        const permission: Permission = {
          id: 'test-uuid',
          name: `test_${action}`,
          resource: 'test',
          action,
          created_at: new Date(),
          updated_at: new Date()
        };

        expect(permission.action).toBe(action);
      });
    });
  });

  describe('UserRole interface', () => {
    it('should have correct structure for UserRole', () => {
      const userRole: UserRole = {
        user_id: 'user-uuid',
        role_id: 'role-uuid',
        assigned_at: new Date()
      };

      expect(userRole.user_id).toBeDefined();
      expect(userRole.role_id).toBeDefined();
      expect(userRole.assigned_at).toBeInstanceOf(Date);
    });
  });

  describe('RolePermission interface', () => {
    it('should have correct structure for RolePermission', () => {
      const rolePermission: RolePermission = {
        role_id: 'role-uuid',
        permission_id: 'permission-uuid',
        assigned_at: new Date()
      };

      expect(rolePermission.role_id).toBeDefined();
      expect(rolePermission.permission_id).toBeDefined();
      expect(rolePermission.assigned_at).toBeInstanceOf(Date);
    });
  });

  describe('DTO interfaces', () => {
    it('should validate CreateRoleDto', () => {
      const createRoleDto: CreateRoleDto = {
        name: 'new_role'
      };

      expect(createRoleDto.name).toBeDefined();
      expect(createRoleDto.description).toBeUndefined();

      const createRoleDtoWithDescription: CreateRoleDto = {
        name: 'new_role',
        description: 'A new role'
      };

      expect(createRoleDtoWithDescription.description).toBeDefined();
    });

    it('should validate UpdateRoleDto', () => {
      const updateRoleDto: UpdateRoleDto = {};
      expect(updateRoleDto.name).toBeUndefined();
      expect(updateRoleDto.description).toBeUndefined();

      const updateRoleDtoWithData: UpdateRoleDto = {
        name: 'updated_role',
        description: 'Updated description'
      };

      expect(updateRoleDtoWithData.name).toBe('updated_role');
      expect(updateRoleDtoWithData.description).toBe('Updated description');
    });

    it('should validate CreatePermissionDto', () => {
      const createPermissionDto: CreatePermissionDto = {
        name: 'new_permission',
        resource: 'users',
        action: 'create'
      };

      expect(createPermissionDto.name).toBeDefined();
      expect(createPermissionDto.resource).toBeDefined();
      expect(createPermissionDto.action).toBeDefined();
      expect(createPermissionDto.description).toBeUndefined();
    });

    it('should validate UpdatePermissionDto', () => {
      const updatePermissionDto: UpdatePermissionDto = {};
      expect(Object.keys(updatePermissionDto)).toHaveLength(0);

      const updatePermissionDtoWithData: UpdatePermissionDto = {
        name: 'updated_permission',
        action: 'manage'
      };

      expect(updatePermissionDtoWithData.name).toBe('updated_permission');
      expect(updatePermissionDtoWithData.action).toBe('manage');
    });
  });

  describe('Response DTO interfaces', () => {
    it('should validate RoleWithPermissions', () => {
      const roleWithPermissions: RoleWithPermissions = {
        id: 'role-uuid',
        name: 'admin',
        created_at: new Date(),
        updated_at: new Date(),
        permissions: [
          {
            id: 'permission-uuid',
            name: 'manage_users',
            resource: 'users',
            action: 'manage',
            created_at: new Date(),
            updated_at: new Date()
          }
        ]
      };

      expect(roleWithPermissions.permissions).toHaveLength(1);
      expect(roleWithPermissions.permissions[0].action).toBe('manage');
    });

    it('should validate UserWithRoles', () => {
      const userWithRoles: UserWithRoles = {
        user_id: 'user-uuid',
        roles: [
          {
            id: 'role-uuid',
            name: 'admin',
            created_at: new Date(),
            updated_at: new Date()
          }
        ]
      };

      expect(userWithRoles.user_id).toBe('user-uuid');
      expect(userWithRoles.roles).toHaveLength(1);
    });

    it('should validate PermissionCheck', () => {
      const permissionCheck: PermissionCheck = {
        resource: 'users',
        action: 'create',
        allowed: true
      };

      expect(permissionCheck.resource).toBe('users');
      expect(permissionCheck.action).toBe('create');
      expect(permissionCheck.allowed).toBe(true);
    });
  });
});
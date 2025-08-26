/**
 * Tests for RBAC Repository
 * 
 * This file tests the RbacRepository class methods for managing roles, permissions,
 * and their assignments.
 */

import { RbacRepository } from '@/db/repositories/rbac.repository';
import { 
  Role, 
  Permission,
  CreateRoleDto,
  UpdateRoleDto,
  CreatePermissionDto
} from '@/db/schemas/rbac.schema';

// Mock database connection
interface MockDatabaseConnection {
  query: jest.Mock;
  transaction: jest.Mock;
}

const createMockDb = (): MockDatabaseConnection => ({
  query: jest.fn(),
  transaction: jest.fn()
});

describe('RbacRepository', () => {
  let repository: RbacRepository;
  let mockDb: MockDatabaseConnection;

  beforeEach(() => {
    mockDb = createMockDb();
    repository = new RbacRepository(mockDb as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Role management', () => {
    describe('createRole', () => {
      it('should create a new role', async () => {
        const createRoleDto: CreateRoleDto = {
          name: 'admin',
          description: 'Administrator role'
        };

        const mockRole: Role = {
          id: 'role-uuid',
          name: 'admin',
          description: 'Administrator role',
          created_at: new Date(),
          updated_at: new Date()
        };

        mockDb.query.mockResolvedValue({ rows: [mockRole] });

        const result = await repository.createRole(createRoleDto);

        expect(mockDb.query).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO roles'),
          ['admin', 'Administrator role']
        );
        expect(result).toEqual(mockRole);
      });
    });

    describe('getRoleById', () => {
      it('should return role when found', async () => {
        const mockRole: Role = {
          id: 'role-uuid',
          name: 'admin',
          description: 'Administrator role',
          created_at: new Date(),
          updated_at: new Date()
        };

        mockDb.query.mockResolvedValue({ rows: [mockRole] });

        const result = await repository.getRoleById('role-uuid');

        expect(mockDb.query).toHaveBeenCalledWith(
          expect.stringContaining('SELECT'),
          ['role-uuid']
        );
        expect(result).toEqual(mockRole);
      });

      it('should return null when role not found', async () => {
        mockDb.query.mockResolvedValue({ rows: [] });

        const result = await repository.getRoleById('non-existent-uuid');

        expect(result).toBeNull();
      });
    });

    describe('getRoleByName', () => {
      it('should return role when found by name', async () => {
        const mockRole: Role = {
          id: 'role-uuid',
          name: 'admin',
          description: 'Administrator role',
          created_at: new Date(),
          updated_at: new Date()
        };

        mockDb.query.mockResolvedValue({ rows: [mockRole] });

        const result = await repository.getRoleByName('admin');

        expect(mockDb.query).toHaveBeenCalledWith(
          expect.stringContaining('WHERE name = $1'),
          ['admin']
        );
        expect(result).toEqual(mockRole);
      });
    });

    describe('getAllRoles', () => {
      it('should return all roles', async () => {
        const mockRoles: Role[] = [
          {
            id: 'role1-uuid',
            name: 'admin',
            description: 'Administrator role',
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            id: 'role2-uuid',
            name: 'user',
            created_at: new Date(),
            updated_at: new Date()
          }
        ];

        mockDb.query.mockResolvedValue({ rows: mockRoles });

        const result = await repository.getAllRoles();

        expect(mockDb.query).toHaveBeenCalledWith(
          expect.stringContaining('ORDER BY name')
        );
        expect(result).toEqual(mockRoles);
      });
    });

    describe('updateRole', () => {
      it('should update role with provided fields', async () => {
        const updateRoleDto: UpdateRoleDto = {
          name: 'super_admin',
          description: 'Super administrator role'
        };

        const mockUpdatedRole: Role = {
          id: 'role-uuid',
          name: 'super_admin',
          description: 'Super administrator role',
          created_at: new Date(),
          updated_at: new Date()
        };

        mockDb.query.mockResolvedValue({ rows: [mockUpdatedRole] });

        const result = await repository.updateRole('role-uuid', updateRoleDto);

        expect(mockDb.query).toHaveBeenCalledWith(
          expect.stringContaining('UPDATE roles'),
          ['super_admin', 'Super administrator role', 'role-uuid']
        );
        expect(result).toEqual(mockUpdatedRole);
      });

      it('should return existing role when no fields to update', async () => {
        const updateRoleDto: UpdateRoleDto = {};

        const mockRole: Role = {
          id: 'role-uuid',
          name: 'admin',
          created_at: new Date(),
          updated_at: new Date()
        };

        mockDb.query.mockResolvedValue({ rows: [mockRole] });

        const result = await repository.updateRole('role-uuid', updateRoleDto);

        expect(mockDb.query).toHaveBeenCalledWith(
          expect.stringContaining('SELECT'),
          ['role-uuid']
        );
        expect(result).toEqual(mockRole);
      });
    });

    describe('deleteRole', () => {
      it('should delete role and return true when successful', async () => {
        mockDb.query.mockResolvedValue({ rowCount: 1 });

        const result = await repository.deleteRole('role-uuid');

        expect(mockDb.query).toHaveBeenCalledWith(
          'DELETE FROM roles WHERE id = $1',
          ['role-uuid']
        );
        expect(result).toBe(true);
      });

      it('should return false when role not found', async () => {
        mockDb.query.mockResolvedValue({ rowCount: 0 });

        const result = await repository.deleteRole('non-existent-uuid');

        expect(result).toBe(false);
      });
    });
  });

  describe('Permission management', () => {
    describe('createPermission', () => {
      it('should create a new permission', async () => {
        const createPermissionDto: CreatePermissionDto = {
          name: 'create_user',
          description: 'Create new users',
          resource: 'users',
          action: 'create'
        };

        const mockPermission: Permission = {
          id: 'permission-uuid',
          name: 'create_user',
          description: 'Create new users',
          resource: 'users',
          action: 'create',
          created_at: new Date(),
          updated_at: new Date()
        };

        mockDb.query.mockResolvedValue({ rows: [mockPermission] });

        const result = await repository.createPermission(createPermissionDto);

        expect(mockDb.query).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO permissions'),
          ['create_user', 'Create new users', 'users', 'create']
        );
        expect(result).toEqual(mockPermission);
      });
    });

    describe('getPermissionById', () => {
      it('should return permission when found', async () => {
        const mockPermission: Permission = {
          id: 'permission-uuid',
          name: 'create_user',
          resource: 'users',
          action: 'create',
          created_at: new Date(),
          updated_at: new Date()
        };

        mockDb.query.mockResolvedValue({ rows: [mockPermission] });

        const result = await repository.getPermissionById('permission-uuid');

        expect(result).toEqual(mockPermission);
      });

      it('should return null when permission not found', async () => {
        mockDb.query.mockResolvedValue({ rows: [] });

        const result = await repository.getPermissionById('non-existent-uuid');

        expect(result).toBeNull();
      });
    });

    describe('getPermissionByResourceAction', () => {
      it('should return permission when found by resource and action', async () => {
        const mockPermission: Permission = {
          id: 'permission-uuid',
          name: 'create_user',
          resource: 'users',
          action: 'create',
          created_at: new Date(),
          updated_at: new Date()
        };

        mockDb.query.mockResolvedValue({ rows: [mockPermission] });

        const result = await repository.getPermissionByResourceAction('users', 'create');

        expect(mockDb.query).toHaveBeenCalledWith(
          expect.stringContaining('WHERE resource = $1 AND action = $2'),
          ['users', 'create']
        );
        expect(result).toEqual(mockPermission);
      });
    });
  });

  describe('User-Role assignments', () => {
    describe('assignRoleToUser', () => {
      it('should assign role to user', async () => {
        const mockUserRole = {
          user_id: 'user-uuid',
          role_id: 'role-uuid',
          assigned_at: new Date()
        };

        mockDb.query.mockResolvedValue({ rows: [mockUserRole] });

        const result = await repository.assignRoleToUser('user-uuid', 'role-uuid');

        expect(mockDb.query).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO user_roles'),
          ['user-uuid', 'role-uuid']
        );
        expect(result).toEqual(mockUserRole);
      });
    });

    describe('getUserRoles', () => {
      it('should return user roles', async () => {
        const mockRoles: Role[] = [
          {
            id: 'role-uuid',
            name: 'admin',
            created_at: new Date(),
            updated_at: new Date()
          }
        ];

        mockDb.query.mockResolvedValue({ rows: mockRoles });

        const result = await repository.getUserRoles('user-uuid');

        expect(result.user_id).toBe('user-uuid');
        expect(result.roles).toEqual(mockRoles);
      });
    });
  });

  describe('Permission checking', () => {
    describe('userHasPermission', () => {
      it('should return true when user has permission', async () => {
        mockDb.query.mockResolvedValue({ rows: [{ count: '1' }] });

        const result = await repository.userHasPermission('user-uuid', 'users', 'create');

        expect(result.allowed).toBe(true);
        expect(result.resource).toBe('users');
        expect(result.action).toBe('create');
      });

      it('should return false when user does not have permission', async () => {
        mockDb.query.mockResolvedValue({ rows: [{ count: '0' }] });

        const result = await repository.userHasPermission('user-uuid', 'users', 'delete');

        expect(result.allowed).toBe(false);
        expect(result.resource).toBe('users');
        expect(result.action).toBe('delete');
      });
    });
  });
});
import { RBACService } from '../../services/rbac/rbac.service';
import RBACRepository from '../../database/repositories/rbac.repository';
import { Permission, Role, UserRole } from '../../types/rbac.types';

// Mock the repository
jest.mock('../../database/repositories/rbac.repository');

describe('RBACService', () => {
  let service: RBACService;
  let mockRepository: jest.Mocked<RBACRepository>;

  beforeEach(() => {
    // Clear all mocks and reset the singleton
    jest.clearAllMocks();
    
    // Create a fresh mock repository
    mockRepository = {
      createPermission: jest.fn(),
      getPermissionById: jest.fn(),
      updatePermission: jest.fn(),
      deletePermission: jest.fn(),
      createRole: jest.fn(),
      getRoleById: jest.fn(),
      getRoleByName: jest.fn(),
      updateRole: jest.fn(),
      deleteRole: jest.fn(),
      addPermissionToRole: jest.fn(),
      removePermissionFromRole: jest.fn(),
      assignRoleToUser: jest.fn(),
      removeRoleFromUser: jest.fn(),
      getUserRoles: jest.fn(),
      getUserPermissions: jest.fn(),
      hasPermission: jest.fn(),
    } as unknown as jest.Mocked<RBACRepository>;

    // Mock the getInstance method to return our mock
    (RBACRepository as jest.MockedClass<typeof RBACRepository>).getInstance = jest.fn().mockReturnValue(mockRepository);
    
    // Reset the singleton to force a new instance with our mock
    (RBACService as any).instance = undefined;
    service = RBACService.getInstance();
  });

  describe('Permission Management', () => {
    const mockPermission: Permission = {
      id: '1',
      resource: 'users',
      action: 'READ',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    test('createPermission should create a new permission', async () => {
      mockRepository.createPermission.mockResolvedValue(mockPermission);

      const result = await service.createPermission({
        resource: 'users',
        action: 'READ'
      });

      expect(result).toEqual(mockPermission);
      expect(mockRepository.createPermission).toHaveBeenCalledWith({
        resource: 'users',
        action: 'READ'
      });
    });

    test('getPermissionById should return a permission', async () => {
      mockRepository.getPermissionById.mockResolvedValue(mockPermission);

      const result = await service.getPermissionById('1');

      expect(result).toEqual(mockPermission);
      expect(mockRepository.getPermissionById).toHaveBeenCalledWith('1');
    });

    test('updatePermission should update a permission', async () => {
      mockRepository.updatePermission.mockResolvedValue(mockPermission);

      const result = await service.updatePermission('1', { action: 'WRITE' });

      expect(result).toEqual(mockPermission);
      expect(mockRepository.updatePermission).toHaveBeenCalledWith('1', { action: 'WRITE' });
    });

    test('deletePermission should delete a permission', async () => {
      mockRepository.deletePermission.mockResolvedValue(true);

      await service.deletePermission('1');

      expect(mockRepository.deletePermission).toHaveBeenCalledWith('1');
    });
  });

  describe('Role Management', () => {
    const mockRole: Role = {
      id: '1',
      name: 'admin',
      description: 'Administrator',
      permissions: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    test('createRole should create a new role', async () => {
      mockRepository.createRole.mockResolvedValue(mockRole);

      const result = await service.createRole({
        name: 'admin',
        description: 'Administrator',
        permissions: []
      });

      expect(result).toEqual(mockRole);
      expect(mockRepository.createRole).toHaveBeenCalledWith({
        name: 'admin',
        description: 'Administrator',
        permissions: []
      });
    });

    test('getRoleById should return a role', async () => {
      mockRepository.getRoleById.mockResolvedValue(mockRole);

      const result = await service.getRoleById('1');

      expect(result).toEqual(mockRole);
      expect(mockRepository.getRoleById).toHaveBeenCalledWith('1');
    });

    test('getRoleByName should return a role', async () => {
      mockRepository.getRoleByName.mockResolvedValue(mockRole);

      const result = await service.getRoleByName('admin');

      expect(result).toEqual(mockRole);
      expect(mockRepository.getRoleByName).toHaveBeenCalledWith('admin');
    });

    test('updateRole should update a role', async () => {
      mockRepository.updateRole.mockResolvedValue(mockRole);

      const result = await service.updateRole('1', { description: 'Updated description' });

      expect(result).toEqual(mockRole);
      expect(mockRepository.updateRole).toHaveBeenCalledWith('1', { description: 'Updated description' });
    });

    test('deleteRole should delete a role', async () => {
      mockRepository.deleteRole.mockResolvedValue(true);

      await service.deleteRole('1');

      expect(mockRepository.deleteRole).toHaveBeenCalledWith('1');
    });
  });

  describe('Role Permission Management', () => {
    const mockRole: Role = {
      id: '1',
      name: 'admin',
      description: 'Administrator',
      permissions: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    test('addPermissionToRole should add a permission to a role', async () => {
      mockRepository.addPermissionToRole.mockResolvedValue(mockRole);

      const result = await service.addPermissionToRole('1', '2');

      expect(result).toEqual(mockRole);
      expect(mockRepository.addPermissionToRole).toHaveBeenCalledWith('1', '2');
    });

    test('removePermissionFromRole should remove a permission from a role', async () => {
      mockRepository.removePermissionFromRole.mockResolvedValue(mockRole);

      const result = await service.removePermissionFromRole('1', '2');

      expect(result).toEqual(mockRole);
      expect(mockRepository.removePermissionFromRole).toHaveBeenCalledWith('1', '2');
    });
  });

  describe('User Role Management', () => {
    const mockUserRole: UserRole = {
      userId: '1',
      roleId: '2',
      assignedBy: '3',
      assignedAt: new Date()
    };

    const mockRoles: Role[] = [{
      id: '2',
      name: 'user',
      description: 'Regular user',
      permissions: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }];

    test('assignRoleToUser should assign a role to a user', async () => {
      mockRepository.assignRoleToUser.mockResolvedValue(mockUserRole);

      const result = await service.assignRoleToUser('1', '2', '3');

      expect(result).toEqual(mockUserRole);
      expect(mockRepository.assignRoleToUser).toHaveBeenCalledWith('1', '2', '3');
    });

    test('removeRoleFromUser should remove a role from a user', async () => {
      mockRepository.removeRoleFromUser.mockResolvedValue(true);

      await service.removeRoleFromUser('1', '2');

      expect(mockRepository.removeRoleFromUser).toHaveBeenCalledWith('1', '2');
    });

    test('getUserRoles should return user roles', async () => {
      mockRepository.getUserRoles.mockResolvedValue(mockRoles);

      const result = await service.getUserRoles('1');

      expect(result).toEqual(mockRoles);
      expect(mockRepository.getUserRoles).toHaveBeenCalledWith('1');
    });
  });

  describe('Permission Checking', () => {
    test('hasPermission should check if user has permission', async () => {
      mockRepository.hasPermission.mockResolvedValue(true);

      const result = await service.hasPermission('1', { resource: 'users', action: 'READ' });

      expect(result).toBe(true);
      expect(mockRepository.hasPermission).toHaveBeenCalledWith('1', { resource: 'users', action: 'READ' });
    });

    test('validatePermission should not throw error when user has permission', async () => {
      mockRepository.hasPermission.mockResolvedValue(true);

      await expect(service.validatePermission('1', { resource: 'users', action: 'READ' }))
        .resolves.not.toThrow();
    });

    test('validatePermission should throw error when user does not have permission', async () => {
      mockRepository.hasPermission.mockResolvedValue(false);

      await expect(service.validatePermission('1', { resource: 'users', action: 'READ' }))
        .rejects.toThrow('Permission denied');
    });
  });
});
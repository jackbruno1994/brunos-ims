import { roleService } from '../services/roleService';
import { dataStore } from '../models/dataStore';
import { CreateRoleRequest, AssignRoleRequest } from '../types';

describe('RoleService', () => {
  beforeEach(() => {
    // Reset data store before each test
    dataStore.reset();
  });

  describe('createRole', () => {
    it('should create a role successfully', async () => {
      const roleData: CreateRoleRequest = {
        name: 'Kitchen Manager',
        description: 'Manages kitchen inventory and staff',
        permissions: ['view_inventory', 'manage_inventory', 'view_staff', 'manage_orders']
      };

      const role = await roleService.createRole(roleData, 'test_user_1');

      expect(role).toBeDefined();
      expect(role.name).toBe('Kitchen Manager');
      expect(role.description).toBe('Manages kitchen inventory and staff');
      expect(role.permissions).toEqual(['view_inventory', 'manage_inventory', 'view_staff', 'manage_orders']);
      expect(role.createdBy).toBe('test_user_1');
      expect(role.id).toBeDefined();
      expect(role.createdAt).toBeDefined();
      expect(role.updatedAt).toBeDefined();
    });

    it('should fail when creating role with invalid permissions', async () => {
      const roleData: CreateRoleRequest = {
        name: 'Invalid Role',
        description: 'Role with invalid permissions',
        permissions: ['invalid_permission']
      };

      await expect(roleService.createRole(roleData, 'test_user_1'))
        .rejects.toThrow('Invalid permissions: invalid_permission');
    });

    it('should fail when creating role with duplicate name', async () => {
      const roleData: CreateRoleRequest = {
        name: 'Duplicate Role Test',
        description: 'First role',
        permissions: ['view_inventory']
      };

      await roleService.createRole(roleData, 'test_user_1');

      const duplicateRoleData: CreateRoleRequest = {
        name: 'Duplicate Role Test',
        description: 'Duplicate role',
        permissions: ['view_inventory']
      };

      await expect(roleService.createRole(duplicateRoleData, 'test_user_1'))
        .rejects.toThrow("Role with name 'Duplicate Role Test' already exists");
    });
  });

  describe('getRoleById', () => {
    it('should return role when it exists', async () => {
      const roleData: CreateRoleRequest = {
        name: 'Get Role Test',
        description: 'A test role',
        permissions: ['view_inventory']
      };

      const createdRole = await roleService.createRole(roleData, 'test_user_1');
      const foundRole = await roleService.getRoleById(createdRole.id);

      expect(foundRole).toEqual(createdRole);
    });

    it('should return null when role does not exist', async () => {
      const foundRole = await roleService.getRoleById('non-existent-id');
      expect(foundRole).toBeNull();
    });
  });

  describe('getAllRoles', () => {
    it('should return all roles', async () => {
      const roleData1: CreateRoleRequest = {
        name: 'Get All Role 1',
        description: 'First role',
        permissions: ['view_inventory']
      };

      const roleData2: CreateRoleRequest = {
        name: 'Get All Role 2',
        description: 'Second role',
        permissions: ['manage_inventory']
      };

      await roleService.createRole(roleData1, 'test_user_1');
      await roleService.createRole(roleData2, 'test_user_1');

      const roles = await roleService.getAllRoles();
      expect(roles.length).toBeGreaterThanOrEqual(2);
      expect(roles.some(role => role.name === 'Get All Role 1')).toBe(true);
      expect(roles.some(role => role.name === 'Get All Role 2')).toBe(true);
    });
  });

  describe('assignRoleToUser', () => {
    it('should assign role to user successfully', async () => {
      const roleData: CreateRoleRequest = {
        name: 'Assignment Test Role',
        description: 'A test role',
        permissions: ['view_inventory']
      };

      const role = await roleService.createRole(roleData, 'test_user_1');

      const assignmentData: AssignRoleRequest = {
        roleId: role.id,
        startDate: '2025-08-24',
        assignedBy: 'test_user_1'
      };

      await expect(roleService.assignRoleToUser('test_user_1', assignmentData))
        .resolves.not.toThrow();

      const userRole = await roleService.getUserRole('test_user_1');
      expect(userRole.role).toBeDefined();
      expect(userRole.role?.id).toBe(role.id);
    });

    it('should fail when assigning non-existent role', async () => {
      const assignmentData: AssignRoleRequest = {
        roleId: 'non-existent-role-id',
        startDate: '2025-08-24',
        assignedBy: 'test_user_1'
      };

      await expect(roleService.assignRoleToUser('test_user_1', assignmentData))
        .rejects.toThrow("Role with ID 'non-existent-role-id' not found");
    });

    it('should fail when assigning role to non-existent user', async () => {
      const roleData: CreateRoleRequest = {
        name: 'Non-existent User Test Role',
        description: 'A test role',
        permissions: ['view_inventory']
      };

      const role = await roleService.createRole(roleData, 'test_user_1');

      const assignmentData: AssignRoleRequest = {
        roleId: role.id,
        startDate: '2025-08-24',
        assignedBy: 'test_user_1'
      };

      await expect(roleService.assignRoleToUser('non-existent-user', assignmentData))
        .rejects.toThrow("User with ID 'non-existent-user' not found");
    });
  });

  describe('checkPermission', () => {
    it('should return true when user has permission', async () => {
      const roleData: CreateRoleRequest = {
        name: 'Permission Test Role',
        description: 'A test role',
        permissions: ['view_inventory', 'manage_inventory']
      };

      const role = await roleService.createRole(roleData, 'test_user_1');

      const assignmentData: AssignRoleRequest = {
        roleId: role.id,
        startDate: '2025-08-24',
        assignedBy: 'test_user_1'
      };

      await roleService.assignRoleToUser('test_user_1', assignmentData);

      const hasPermission = await roleService.checkPermission('test_user_1', 'view_inventory', 'inventory');
      expect(hasPermission).toBe(true);
    });

    it('should return false when user does not have permission', async () => {
      const roleData: CreateRoleRequest = {
        name: 'Limited Permission Test Role',
        description: 'A test role',
        permissions: ['view_inventory']
      };

      const role = await roleService.createRole(roleData, 'test_user_1');

      const assignmentData: AssignRoleRequest = {
        roleId: role.id,
        startDate: '2025-08-24',
        assignedBy: 'test_user_1'
      };

      await roleService.assignRoleToUser('test_user_1', assignmentData);

      const hasPermission = await roleService.checkPermission('test_user_1', 'manage_staff', 'staff');
      expect(hasPermission).toBe(false);
    });

    it('should return false when user has no role', async () => {
      // Create a user without a role
      dataStore.updateUser('test_user_1', { roleId: undefined, roleStartDate: undefined, roleAssignedBy: undefined });
      
      const hasPermission = await roleService.checkPermission('test_user_1', 'view_inventory', 'inventory');
      expect(hasPermission).toBe(false);
    });
  });

  describe('updateRole', () => {
    it('should update role successfully', async () => {
      const roleData: CreateRoleRequest = {
        name: 'Update Test Role',
        description: 'Original description',
        permissions: ['view_inventory']
      };

      const role = await roleService.createRole(roleData, 'test_user_1');

      const updates = {
        name: 'Updated Role',
        description: 'Updated description',
        permissions: ['view_inventory', 'manage_inventory']
      };

      const updatedRole = await roleService.updateRole(role.id, updates, 'test_user_1');

      expect(updatedRole).toBeDefined();
      expect(updatedRole?.name).toBe('Updated Role');
      expect(updatedRole?.description).toBe('Updated description');
      expect(updatedRole?.permissions).toEqual(['view_inventory', 'manage_inventory']);
    });

    it('should fail when updating non-existent role', async () => {
      const updates = { name: 'Updated Role' };

      await expect(roleService.updateRole('non-existent-id', updates, 'test_user_1'))
        .rejects.toThrow("Role with ID 'non-existent-id' not found");
    });
  });

  describe('deleteRole', () => {
    it('should delete role successfully', async () => {
      const roleData: CreateRoleRequest = {
        name: 'Delete Test Role',
        description: 'This role will be deleted',
        permissions: ['view_inventory']
      };

      const role = await roleService.createRole(roleData, 'test_user_1');
      const success = await roleService.deleteRole(role.id, 'test_user_1');

      expect(success).toBe(true);

      const deletedRole = await roleService.getRoleById(role.id);
      expect(deletedRole).toBeNull();
    });

    it('should fail when deleting non-existent role', async () => {
      await expect(roleService.deleteRole('non-existent-id', 'test_user_1'))
        .rejects.toThrow("Role with ID 'non-existent-id' not found");
    });
  });
});
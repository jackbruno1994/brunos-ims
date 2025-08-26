/**
 * RBAC Service Tests
 * Integration tests for the RBAC service implementation
 */

import { RBACService } from '../../services/rbac';
import {
  CreateRoleInput,
  CreatePermissionInput,
  AssignUserRoleInput,
  AssignRolePermissionInput,
} from '../../types/rbac';

describe('RBAC Service', () => {
  let rbacService: RBACService;

  beforeEach(() => {
    // Create a new instance for each test to ensure clean state
    rbacService = new RBACService();
  });

  describe('Role Management', () => {
    const mockRole: CreateRoleInput = {
      name: 'manager',
      displayName: 'Restaurant Manager',
      description: 'Manages restaurant operations',
      isActive: true,
    };

    it('should create a new role successfully', async () => {
      const result = await rbacService.createRole(mockRole);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.name).toBe(mockRole.name);
      expect(result.data?.displayName).toBe(mockRole.displayName);
      expect(result.data?.description).toBe(mockRole.description);
      expect(result.data?.isActive).toBe(true);
      expect(result.data?.id).toBeDefined();
      expect(result.data?.createdAt).toBeInstanceOf(Date);
      expect(result.data?.updatedAt).toBeInstanceOf(Date);
    });

    it('should not create duplicate roles', async () => {
      // Create first role
      const firstResult = await rbacService.createRole(mockRole);
      expect(firstResult.success).toBe(true);

      // Try to create duplicate
      const secondResult = await rbacService.createRole(mockRole);
      expect(secondResult.success).toBe(false);
      expect(secondResult.error).toBe('Role with this name already exists');
      expect(secondResult.code).toBe('ROLE_EXISTS');
    });

    it('should retrieve role by ID', async () => {
      const createResult = await rbacService.createRole(mockRole);
      expect(createResult.success).toBe(true);
      expect(createResult.data?.id).toBeDefined();

      const getResult = await rbacService.getRoleById(createResult.data!.id);
      expect(getResult.success).toBe(true);
      expect(getResult.data?.id).toBe(createResult.data!.id);
      expect(getResult.data?.name).toBe(mockRole.name);
    });

    it('should return error for non-existent role', async () => {
      const result = await rbacService.getRoleById('non-existent-id');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Role not found');
      expect(result.code).toBe('ROLE_NOT_FOUND');
    });

    it('should retrieve all roles', async () => {
      // Create multiple roles
      await rbacService.createRole(mockRole);
      await rbacService.createRole({
        name: 'staff',
        displayName: 'Staff Member',
        description: 'Basic staff permissions',
      });

      const result = await rbacService.getAllRoles();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.length).toBeGreaterThanOrEqual(2);
    });

    it('should update role successfully', async () => {
      const createResult = await rbacService.createRole(mockRole);
      expect(createResult.success).toBe(true);

      const updateResult = await rbacService.updateRole(createResult.data!.id, {
        displayName: 'Updated Manager',
        description: 'Updated description',
      });

      expect(updateResult.success).toBe(true);
      expect(updateResult.data?.displayName).toBe('Updated Manager');
      expect(updateResult.data?.description).toBe('Updated description');
      expect(updateResult.data?.name).toBe(mockRole.name); // Should remain unchanged
    });

    it('should delete role successfully', async () => {
      const createResult = await rbacService.createRole(mockRole);
      expect(createResult.success).toBe(true);

      const deleteResult = await rbacService.deleteRole(createResult.data!.id);
      expect(deleteResult.success).toBe(true);
      expect(deleteResult.data).toBe(true);

      // Verify role is no longer in active roles list
      const getAllResult = await rbacService.getAllRoles();
      expect(getAllResult.success).toBe(true);
      const activeRole = getAllResult.data?.find(r => r.id === createResult.data!.id);
      expect(activeRole).toBeUndefined();
    });
  });

  describe('Permission Management', () => {
    const mockPermission: CreatePermissionInput = {
      name: 'menu:update',
      resource: 'menu',
      action: 'update',
      description: 'Update menu items',
      isActive: true,
    };

    it('should create a new permission successfully', async () => {
      const result = await rbacService.createPermission(mockPermission);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.name).toBe(mockPermission.name);
      expect(result.data?.resource).toBe(mockPermission.resource);
      expect(result.data?.action).toBe(mockPermission.action);
      expect(result.data?.description).toBe(mockPermission.description);
      expect(result.data?.isActive).toBe(true);
      expect(result.data?.id).toBeDefined();
    });

    it('should not create duplicate permissions', async () => {
      const firstResult = await rbacService.createPermission(mockPermission);
      expect(firstResult.success).toBe(true);

      const secondResult = await rbacService.createPermission(mockPermission);
      expect(secondResult.success).toBe(false);
      expect(secondResult.error).toBe('Permission with this name already exists');
      expect(secondResult.code).toBe('PERMISSION_EXISTS');
    });

    it('should retrieve all permissions', async () => {
      await rbacService.createPermission(mockPermission);
      await rbacService.createPermission({
        name: 'user:read',
        resource: 'user',
        action: 'read',
        description: 'View user information',
      });

      const result = await rbacService.getAllPermissions();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('User-Role Assignment', () => {
    let roleId: string;

    beforeEach(async () => {
      const roleResult = await rbacService.createRole({
        name: 'manager',
        displayName: 'Manager',
        description: 'Manager role',
      });
      roleId = roleResult.data!.id;
    });

    const mockAssignment: AssignUserRoleInput = {
      userId: 'user-123',
      roleId: '', // Will be set in test
      assignedBy: 'admin-123',
      restaurantId: 'restaurant-123',
    };

    it('should assign role to user successfully', async () => {
      const assignment = { ...mockAssignment, roleId };
      const result = await rbacService.assignUserRole(assignment);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.userId).toBe(assignment.userId);
      expect(result.data?.roleId).toBe(assignment.roleId);
      expect(result.data?.restaurantId).toBe(assignment.restaurantId);
      expect(result.data?.assignedBy).toBe(assignment.assignedBy);
      expect(result.data?.isActive).toBe(true);
    });

    it('should remove user role successfully', async () => {
      const assignment = { ...mockAssignment, roleId };
      const assignResult = await rbacService.assignUserRole(assignment);
      expect(assignResult.success).toBe(true);

      const removeResult = await rbacService.removeUserRole(
        assignment.userId,
        assignment.roleId,
        assignment.restaurantId
      );
      expect(removeResult.success).toBe(true);
      expect(removeResult.data).toBe(true);
    });

    it('should get user roles', async () => {
      const assignment = { ...mockAssignment, roleId };
      await rbacService.assignUserRole(assignment);

      const result = await rbacService.getUserRoles(assignment.userId);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.length).toBe(1);
      expect(result.data![0].roleId).toBe(roleId);
    });
  });

  describe('Role-Permission Assignment', () => {
    let roleId: string;
    let permissionId: string;

    beforeEach(async () => {
      const roleResult = await rbacService.createRole({
        name: 'manager',
        displayName: 'Manager',
        description: 'Manager role',
      });
      roleId = roleResult.data!.id;

      const permissionResult = await rbacService.createPermission({
        name: 'menu:update',
        resource: 'menu',
        action: 'update',
        description: 'Update menu items',
      });
      permissionId = permissionResult.data!.id;
    });

    it('should assign permission to role successfully', async () => {
      const assignment: AssignRolePermissionInput = {
        roleId,
        permissionId,
        grantedBy: 'admin-123',
      };

      const result = await rbacService.assignRolePermission(assignment);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.roleId).toBe(roleId);
      expect(result.data?.permissionId).toBe(permissionId);
      expect(result.data?.grantedBy).toBe(assignment.grantedBy);
      expect(result.data?.isActive).toBe(true);
    });
  });

  describe('Permission Verification', () => {
    let userId: string;
    let roleId: string;
    let permissionId: string;

    beforeEach(async () => {
      userId = 'test-user-123';

      // Create role
      const roleResult = await rbacService.createRole({
        name: 'manager',
        displayName: 'Manager',
        description: 'Manager role',
      });
      roleId = roleResult.data!.id;

      // Create permission
      const permissionResult = await rbacService.createPermission({
        name: 'menu:update',
        resource: 'menu',
        action: 'update',
        description: 'Update menu items',
      });
      permissionId = permissionResult.data!.id;

      // Assign permission to role
      await rbacService.assignRolePermission({
        roleId,
        permissionId,
        grantedBy: 'admin-123',
      });

      // Assign role to user
      await rbacService.assignUserRole({
        userId,
        roleId,
        assignedBy: 'admin-123',
      });
    });

    it('should verify user has permission', async () => {
      const result = await rbacService.checkPermission({
        userId,
        resource: 'menu',
        action: 'update',
      });

      expect(result.granted).toBe(true);
      expect(result.reason).toBe('Permission granted');
    });

    it('should deny permission user does not have', async () => {
      const result = await rbacService.checkPermission({
        userId,
        resource: 'user',
        action: 'delete',
      });

      expect(result.granted).toBe(false);
      expect(result.reason).toBe('Permission denied');
    });

    it('should check permission using string format', async () => {
      const hasPermission = await rbacService.hasPermission(userId, 'menu:update');
      expect(hasPermission).toBe(true);

      const lacksPermission = await rbacService.hasPermission(userId, 'user:delete');
      expect(lacksPermission).toBe(false);
    });

    it('should get user permissions', async () => {
      const result = await rbacService.getUserPermissions(userId);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.length).toBe(1);
      expect(result.data![0].name).toBe('menu:update');
    });
  });
});
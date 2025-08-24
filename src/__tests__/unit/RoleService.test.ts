import { RoleService } from '../../services/RoleService';
import { setupTestDatabase, teardownTestDatabase, clearTestDatabase, createTestRole, createTestUser } from '../helpers';
import { permissions } from '../../config';
import { Role, User, RoleChangeLog, PermissionLog } from '../../models';

describe('RoleService Unit Tests', () => {
  let roleService: RoleService;

  beforeAll(async () => {
    await setupTestDatabase();
    roleService = new RoleService();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  describe('createRole', () => {
    it('should create a role successfully', async () => {
      const roleData = {
        name: 'Test Role',
        description: 'A test role',
        permissions: [permissions.VIEW_INVENTORY, permissions.VIEW_ORDERS],
        hierarchyLevel: 20,
        isActive: true,
      };

      const role = await roleService.createRole(roleData);

      expect(role.name).toBe(roleData.name);
      expect(role.description).toBe(roleData.description);
      expect(role.permissions).toEqual(roleData.permissions);
      expect(role.hierarchyLevel).toBe(roleData.hierarchyLevel);
      expect(role.isActive).toBe(true);
    });

    it('should reject duplicate role names', async () => {
      const roleData = {
        name: 'Duplicate Role',
        description: 'A test role',
        permissions: [permissions.VIEW_INVENTORY],
        hierarchyLevel: 20,
        isActive: true,
      };

      await roleService.createRole(roleData);

      await expect(roleService.createRole(roleData)).rejects.toThrow('already exists');
    });

    it('should reject invalid hierarchy levels', async () => {
      const roleData = {
        name: 'Invalid Role',
        description: 'A test role',
        permissions: [permissions.VIEW_INVENTORY],
        hierarchyLevel: 150, // Invalid: > 100
        isActive: true,
      };

      await expect(roleService.createRole(roleData)).rejects.toThrow('between 1 and 100');
    });
  });

  describe('getRoleById', () => {
    it('should return role by ID', async () => {
      const testRole = await createTestRole();
      const role = await roleService.getRoleById(testRole._id.toString());

      expect(role).toBeTruthy();
      expect(role!.name).toBe(testRole.name);
    });

    it('should return null for non-existent ID', async () => {
      const role = await roleService.getRoleById('60f7b3b3b3b3b3b3b3b3b3b3');
      expect(role).toBeNull();
    });
  });

  describe('getRoleByName', () => {
    it('should return role by name', async () => {
      const testRole = await createTestRole({ name: 'Unique Role Name' });
      const role = await roleService.getRoleByName('Unique Role Name');

      expect(role).toBeTruthy();
      expect(role!._id.toString()).toBe(testRole._id.toString());
    });

    it('should return null for non-existent name', async () => {
      const role = await roleService.getRoleByName('Non-existent Role');
      expect(role).toBeNull();
    });
  });

  describe('updateRole', () => {
    it('should update role successfully', async () => {
      const testRole = await createTestRole();
      const updateData = {
        name: 'Updated Role Name',
        description: 'Updated description',
      };

      const updatedRole = await roleService.updateRole(testRole._id.toString(), updateData);

      expect(updatedRole).toBeTruthy();
      expect(updatedRole!.name).toBe(updateData.name);
      expect(updatedRole!.description).toBe(updateData.description);
    });

    it('should reject updates to non-existent role', async () => {
      await expect(
        roleService.updateRole('60f7b3b3b3b3b3b3b3b3b3b3', { name: 'New Name' })
      ).rejects.toThrow('Role not found');
    });
  });

  describe('deleteRole', () => {
    it('should deactivate role successfully', async () => {
      const testRole = await createTestRole();
      const result = await roleService.deleteRole(testRole._id.toString());

      expect(result).toBe(true);

      const deletedRole = await Role.findById(testRole._id);
      expect(deletedRole!.isActive).toBe(false);
    });

    it('should reject deletion of assigned role', async () => {
      const testRole = await createTestRole();
      const { user } = await createTestUser();

      // Assign role to user
      await roleService.assignRoleToUser({
        userId: user._id.toString(),
        roleId: testRole._id.toString(),
        startDate: new Date(),
        assignedBy: user._id.toString(),
        isActive: true,
      });

      await expect(roleService.deleteRole(testRole._id.toString())).rejects.toThrow('assigned to users');
    });
  });

  describe('assignRoleToUser', () => {
    it('should assign role to user successfully', async () => {
      const testRole = await createTestRole();
      const { user } = await createTestUser();

      await roleService.assignRoleToUser({
        userId: user._id.toString(),
        roleId: testRole._id.toString(),
        startDate: new Date(),
        assignedBy: user._id.toString(),
        reason: 'Test assignment',
        isActive: true,
      });

      const permissions = await roleService.getUserPermissions(user._id.toString());
      expect(permissions).toEqual(testRole.permissions);
    });

    it('should reject assignment with invalid role', async () => {
      const { user } = await createTestUser();

      await expect(
        roleService.assignRoleToUser({
          userId: user._id.toString(),
          roleId: '60f7b3b3b3b3b3b3b3b3b3b3',
          startDate: new Date(),
          assignedBy: user._id.toString(),
          isActive: true,
        })
      ).rejects.toThrow('Role not found');
    });
  });

  describe('updateUserRole', () => {
    it('should update user role successfully', async () => {
      const firstRole = await createTestRole({ name: 'First Role' });
      const secondRole = await createTestRole({ name: 'Second Role' });
      const { user } = await createTestUser();

      // Initial assignment
      await roleService.assignRoleToUser({
        userId: user._id.toString(),
        roleId: firstRole._id.toString(),
        startDate: new Date(),
        assignedBy: user._id.toString(),
        isActive: true,
      });

      // Update role
      await roleService.updateUserRole(
        user._id.toString(),
        secondRole._id.toString(),
        user._id.toString(),
        'Promotion'
      );

      const permissions = await roleService.getUserPermissions(user._id.toString());
      expect(permissions).toEqual(secondRole.permissions);
    });
  });

  describe('getUserPermissions', () => {
    it('should return user permissions correctly', async () => {
      const testRole = await createTestRole();
      const { user } = await createTestUser();

      await roleService.assignRoleToUser({
        userId: user._id.toString(),
        roleId: testRole._id.toString(),
        startDate: new Date(),
        assignedBy: user._id.toString(),
        isActive: true,
      });

      const permissions = await roleService.getUserPermissions(user._id.toString());
      expect(permissions).toEqual(testRole.permissions);
    });

    it('should return empty array for user without role', async () => {
      const { user } = await createTestUser();
      const permissions = await roleService.getUserPermissions(user._id.toString());
      expect(permissions).toEqual([]);
    });
  });

  describe('validateRoleHierarchy', () => {
    it('should validate role hierarchy correctly', async () => {
      const higherRole = await createTestRole({ hierarchyLevel: 80 });
      const lowerRole = await createTestRole({ name: 'Lower Role', hierarchyLevel: 20 });

      const isValid = await roleService.validateRoleHierarchy(
        higherRole._id.toString(),
        lowerRole._id.toString()
      );

      expect(isValid).toBe(true);
    });

    it('should reject invalid hierarchy', async () => {
      const higherRole = await createTestRole({ hierarchyLevel: 80 });
      const lowerRole = await createTestRole({ name: 'Lower Role', hierarchyLevel: 20 });

      const isValid = await roleService.validateRoleHierarchy(
        lowerRole._id.toString(),
        higherRole._id.toString()
      );

      expect(isValid).toBe(false);
    });
  });

  describe('audit logging', () => {
    it('should log role changes', async () => {
      const testRole = await createTestRole();
      const { user } = await createTestUser();

      await roleService.assignRoleToUser({
        userId: user._id.toString(),
        roleId: testRole._id.toString(),
        startDate: new Date(),
        assignedBy: user._id.toString(),
        reason: 'Test logging',
        isActive: true,
      });

      const logs = await RoleChangeLog.find({ userId: user._id });
      expect(logs).toHaveLength(1);
      expect(logs[0].newRole).toBe(testRole.name);
      expect(logs[0].reason).toBe('Test logging');
    });

    it('should log permission changes', async () => {
      const adminUser = await createTestUser({ username: 'admin' });

      const testRole = await createTestRole({
        createdBy: adminUser.user._id.toString(),
      });

      const logs = await PermissionLog.find({ roleId: testRole._id });
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].action).toBe('added');
    });
  });
});
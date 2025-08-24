import { dataStore } from '../models/dataStore';
import { Role, User, Permission, PermissionCheck, CreateRoleRequest, AssignRoleRequest } from '../types';

export class RoleService {
  /**
   * Create a new role
   */
  async createRole(roleData: CreateRoleRequest, createdBy: string): Promise<Role> {
    // Validate permissions exist
    const invalidPermissions = roleData.permissions.filter(
      permId => !dataStore.getPermissionById(permId)
    );

    if (invalidPermissions.length > 0) {
      throw new Error(`Invalid permissions: ${invalidPermissions.join(', ')}`);
    }

    // Check if role name already exists
    const existingRoles = dataStore.getAllRoles();
    const nameExists = existingRoles.some(
      role => role.name.toLowerCase() === roleData.name.toLowerCase()
    );

    if (nameExists) {
      throw new Error(`Role with name '${roleData.name}' already exists`);
    }

    const role = dataStore.createRole({
      ...roleData,
      createdBy
    });

    // Add audit log
    dataStore.addAuditLog({
      userId: createdBy,
      action: 'create_role',
      resource: 'role',
      resourceId: role.id,
      details: { roleName: role.name, permissions: role.permissions }
    });

    return role;
  }

  /**
   * Get role by ID
   */
  async getRoleById(id: string): Promise<Role | null> {
    const role = dataStore.getRoleById(id);
    return role || null;
  }

  /**
   * Get all roles
   */
  async getAllRoles(): Promise<Role[]> {
    return dataStore.getAllRoles();
  }

  /**
   * Update a role
   */
  async updateRole(id: string, updates: Partial<CreateRoleRequest>, updatedBy: string): Promise<Role | null> {
    const existingRole = dataStore.getRoleById(id);
    if (!existingRole) {
      throw new Error(`Role with ID '${id}' not found`);
    }

    // Validate permissions if provided
    if (updates.permissions) {
      const invalidPermissions = updates.permissions.filter(
        permId => !dataStore.getPermissionById(permId)
      );

      if (invalidPermissions.length > 0) {
        throw new Error(`Invalid permissions: ${invalidPermissions.join(', ')}`);
      }
    }

    const updatedRole = dataStore.updateRole(id, updates);

    if (updatedRole) {
      // Add audit log
      dataStore.addAuditLog({
        userId: updatedBy,
        action: 'update_role',
        resource: 'role',
        resourceId: id,
        details: { updates, previousRole: existingRole }
      });
    }

    return updatedRole || null;
  }

  /**
   * Delete a role
   */
  async deleteRole(id: string, deletedBy: string): Promise<boolean> {
    const existingRole = dataStore.getRoleById(id);
    if (!existingRole) {
      throw new Error(`Role with ID '${id}' not found`);
    }

    const success = dataStore.deleteRole(id);

    if (success) {
      // Add audit log
      dataStore.addAuditLog({
        userId: deletedBy,
        action: 'delete_role',
        resource: 'role',
        resourceId: id,
        details: { deletedRole: existingRole }
      });
    }

    return success;
  }

  /**
   * Assign role to user
   */
  async assignRoleToUser(userId: string, assignmentData: AssignRoleRequest): Promise<void> {
    // Validate user exists
    const user = dataStore.getUserById(userId);
    if (!user) {
      throw new Error(`User with ID '${userId}' not found`);
    }

    // Validate role exists
    const role = dataStore.getRoleById(assignmentData.roleId);
    if (!role) {
      throw new Error(`Role with ID '${assignmentData.roleId}' not found`);
    }

    // Validate assignedBy user exists
    const assignedByUser = dataStore.getUserById(assignmentData.assignedBy);
    if (!assignedByUser) {
      throw new Error(`Assigning user with ID '${assignmentData.assignedBy}' not found`);
    }

    const startDate = new Date(assignmentData.startDate);
    const endDate = assignmentData.endDate ? new Date(assignmentData.endDate) : undefined;

    // Validate dates
    if (endDate && endDate <= startDate) {
      throw new Error('End date must be after start date');
    }

    // Create role assignment
    dataStore.assignRole({
      userId,
      roleId: assignmentData.roleId,
      startDate,
      endDate,
      assignedBy: assignmentData.assignedBy
    });

    // Add audit log
    dataStore.addAuditLog({
      userId: assignmentData.assignedBy,
      action: 'assign_role',
      resource: 'user_role',
      resourceId: `${userId}_${assignmentData.roleId}`,
      details: {
        targetUserId: userId,
        roleId: assignmentData.roleId,
        startDate: assignmentData.startDate,
        endDate: assignmentData.endDate
      }
    });
  }

  /**
   * Check if user has permission
   */
  async checkPermission(userId: string, permission: string, resource: string): Promise<boolean> {
    const user = dataStore.getUserById(userId);
    if (!user || !user.roleId) {
      return false;
    }

    const role = dataStore.getRoleById(user.roleId);
    if (!role) {
      return false;
    }

    // Check if role has the permission
    const hasPermission = role.permissions.includes(permission);

    // Add audit log for permission check
    dataStore.addAuditLog({
      userId,
      action: 'check_permission',
      resource: 'permission',
      resourceId: permission,
      details: {
        permission,
        resource,
        hasPermission,
        roleId: role.id
      }
    });

    return hasPermission;
  }

  /**
   * Get all permissions
   */
  async getAllPermissions(): Promise<Permission[]> {
    return dataStore.getAllPermissions();
  }

  /**
   * Get user role information
   */
  async getUserRole(userId: string): Promise<{ user: User; role: Role | null }> {
    const user = dataStore.getUserById(userId);
    if (!user) {
      throw new Error(`User with ID '${userId}' not found`);
    }

    const role = user.roleId ? dataStore.getRoleById(user.roleId) || null : null;

    return { user, role };
  }
}

export const roleService = new RoleService();
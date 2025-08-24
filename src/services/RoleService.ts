import { Role, RoleDocument, RoleAssignment, RoleChangeLog, PermissionLog } from '../models';
import { Role as IRole, RoleAssignment as IRoleAssignment, PaginationOptions } from '../types';
import { hasPermissionConflicts } from '../utils';

export class RoleService {
  async createRole(roleData: Omit<IRole, '_id' | 'createdAt' | 'updatedAt'>): Promise<RoleDocument> {
    // Check for permission conflicts
    const { hasConflicts, conflicts } = hasPermissionConflicts(roleData.permissions);
    if (hasConflicts) {
      throw new Error(`Permission conflicts detected: ${conflicts.join(', ')}`);
    }

    // Check if role name already exists
    const existingRole = await Role.findOne({ name: roleData.name });
    if (existingRole) {
      throw new Error(`Role with name '${roleData.name}' already exists`);
    }

    // Validate hierarchy level
    if (roleData.hierarchyLevel < 1 || roleData.hierarchyLevel > 100) {
      throw new Error('Hierarchy level must be between 1 and 100');
    }

    const role = new Role(roleData);
    await role.save();

    // Log permission additions
    if (roleData.createdBy) {
      await this.logPermissionChanges(role._id.toString(), roleData.permissions, 'added', roleData.createdBy);
    }

    return role;
  }

  async getRoleById(roleId: string): Promise<RoleDocument | null> {
    return await Role.findById(roleId);
  }

  async getRoleByName(name: string): Promise<RoleDocument | null> {
    return await Role.findOne({ name });
  }

  async getAllRoles(options?: PaginationOptions): Promise<RoleDocument[]> {
    const query = Role.find({ isActive: true });
    
    if (options) {
      const { page = 1, limit = 10, sortBy = 'hierarchyLevel', sortOrder = 'desc' } = options;
      const skip = (page - 1) * limit;
      
      query
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit);
    }
    
    return await query.exec();
  }

  async updateRole(roleId: string, updateData: Partial<IRole>, updatedBy?: string): Promise<RoleDocument | null> {
    const role = await Role.findById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    // Check for permission conflicts if permissions are being updated
    if (updateData.permissions) {
      const { hasConflicts, conflicts } = hasPermissionConflicts(updateData.permissions);
      if (hasConflicts) {
        throw new Error(`Permission conflicts detected: ${conflicts.join(', ')}`);
      }

      // Log permission changes
      if (updatedBy) {
        await this.logPermissionChanges(roleId, updateData.permissions, 'added', updatedBy);
      }
    }

    Object.assign(role, updateData);
    await role.save();

    return role;
  }

  async deleteRole(roleId: string): Promise<boolean> {
    const role = await Role.findById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    // Check if role is assigned to any users
    const assignments = await RoleAssignment.countDocuments({ roleId, isActive: true });
    if (assignments > 0) {
      throw new Error('Cannot delete role that is assigned to users');
    }

    role.isActive = false;
    await role.save();

    return true;
  }

  async getRolePermissions(roleId: string): Promise<string[]> {
    const role = await Role.findById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    return role.permissions;
  }

  async assignRoleToUser(assignment: Omit<IRoleAssignment, '_id' | 'createdAt'>): Promise<void> {
    // Check if role exists
    const role = await Role.findById(assignment.roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    // Deactivate previous assignments for this user
    await RoleAssignment.updateMany(
      { userId: assignment.userId, isActive: true },
      { isActive: false, endDate: new Date() }
    );

    // Create new assignment
    const roleAssignment = new RoleAssignment(assignment);
    await roleAssignment.save();

    // Log the role change
    await this.logRoleChange(
      assignment.userId,
      'none', // TODO: Get previous role name
      role.name,
      assignment.assignedBy,
      assignment.reason || 'Role assigned'
    );
  }

  async updateUserRole(userId: string, newRoleId: string, assignedBy: string, reason?: string): Promise<void> {
    // Get current role assignment
    const currentAssignment = await RoleAssignment.findOne({ userId, isActive: true }).populate('roleId');
    const oldRoleName = currentAssignment ? (currentAssignment.roleId as any).name : 'none';

    // Get new role
    const newRole = await Role.findById(newRoleId);
    if (!newRole) {
      throw new Error('New role not found');
    }

    // Create new assignment
    await this.assignRoleToUser({
      userId,
      roleId: newRoleId,
      startDate: new Date(),
      assignedBy,
      reason,
      isActive: true,
    });

    // Log the role change
    await this.logRoleChange(userId, oldRoleName, newRole.name, assignedBy, reason || 'Role updated');
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const assignment = await RoleAssignment.findOne({ userId, isActive: true }).populate('roleId');
    if (!assignment) {
      return [];
    }

    const role = assignment.roleId as any as RoleDocument;
    return role.permissions;
  }

  async validateRoleHierarchy(assignerRoleId: string, targetRoleId: string): Promise<boolean> {
    const assignerRole = await Role.findById(assignerRoleId);
    const targetRole = await Role.findById(targetRoleId);

    if (!assignerRole || !targetRole) {
      return false;
    }

    // Assigner must have higher or equal hierarchy level
    return assignerRole.hierarchyLevel >= targetRole.hierarchyLevel;
  }

  private async logRoleChange(
    userId: string,
    oldRole: string,
    newRole: string,
    changedBy: string,
    reason: string
  ): Promise<void> {
    const log = new RoleChangeLog({
      userId,
      oldRole,
      newRole,
      changedBy,
      reason,
      timestamp: new Date(),
    });
    await log.save();
  }

  private async logPermissionChanges(
    roleId: string,
    permissions: string[],
    action: 'added' | 'removed',
    updatedBy: string
  ): Promise<void> {
    const logs = permissions.map(permission => new PermissionLog({
      roleId,
      permission,
      action,
      updatedBy,
      timestamp: new Date(),
    }));

    await PermissionLog.insertMany(logs);
  }

  async getRoleChangeHistory(userId: string): Promise<any[]> {
    return await RoleChangeLog.find({ userId })
      .sort({ timestamp: -1 })
      .populate('changedBy', 'username email')
      .lean();
  }

  async getPermissionHistory(roleId: string): Promise<any[]> {
    return await PermissionLog.find({ roleId })
      .sort({ timestamp: -1 })
      .populate('updatedBy', 'username email')
      .lean();
  }
}
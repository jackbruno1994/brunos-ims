import { Permission, Role, UserRole } from '../../types/rbac.types';
import { PermissionModel, RoleModel, UserRoleModel, RoleDocument, PermissionDocument } from '../schemas/rbac.schema';
import { generateUUID } from '../../utils/uuid';
import { Types } from 'mongoose';

export class RBACRepository {
  private static instance: RBACRepository;

  private constructor() {}

  public static getInstance(): RBACRepository {
    if (!RBACRepository.instance) {
      RBACRepository.instance = new RBACRepository();
    }
    return RBACRepository.instance;
  }

  // Helper method to convert RoleDocument to Role
  private async roleDocumentToRole(roleDoc: RoleDocument): Promise<Role> {
    const populatedRole = await roleDoc.populate('permissions');
    return {
      id: populatedRole.id,
      name: populatedRole.name,
      description: populatedRole.description,
      permissions: populatedRole.permissions as any as Permission[], // Type assertion for populated permissions
      createdAt: populatedRole.createdAt,
      updatedAt: populatedRole.updatedAt
    };
  }

  // Permission Methods
  async createPermission(permission: Omit<Permission, 'id' | 'createdAt' | 'updatedAt'>): Promise<Permission> {
    const newPermission = new PermissionModel({
      ...permission,
      id: generateUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const saved = await newPermission.save();
    return saved.toObject() as Permission;
  }

  async getPermissionById(id: string): Promise<Permission | null> {
    const permission = await PermissionModel.findOne({ id });
    return permission ? permission.toObject() as Permission : null;
  }

  async updatePermission(id: string, updates: Partial<Permission>): Promise<Permission | null> {
    const permission = await PermissionModel.findOne({ id });
    if (!permission) return null;

    Object.assign(permission, { ...updates, updatedAt: new Date() });
    const saved = await permission.save();
    return saved.toObject() as Permission;
  }

  async deletePermission(id: string): Promise<boolean> {
    const result = await PermissionModel.deleteOne({ id });
    return result.deletedCount === 1;
  }

  // Role Methods
  async createRole(role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
    const newRole = new RoleModel({
      ...role,
      id: generateUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const saved = await newRole.save();
    return this.roleDocumentToRole(saved);
  }

  async getRoleById(id: string): Promise<Role | null> {
    const role = await RoleModel.findOne({ id });
    return role ? this.roleDocumentToRole(role) : null;
  }

  async getRoleByName(name: string): Promise<Role | null> {
    const role = await RoleModel.findOne({ name });
    return role ? this.roleDocumentToRole(role) : null;
  }

  async updateRole(id: string, updates: Partial<Role>): Promise<Role | null> {
    const role = await RoleModel.findOne({ id });
    if (!role) return null;

    Object.assign(role, { ...updates, updatedAt: new Date() });
    const saved = await role.save();
    return this.roleDocumentToRole(saved);
  }

  async deleteRole(id: string): Promise<boolean> {
    const result = await RoleModel.deleteOne({ id });
    return result.deletedCount === 1;
  }

  async addPermissionToRole(roleId: string, permissionId: string): Promise<Role | null> {
    const role = await RoleModel.findOne({ id: roleId });
    const permission = await PermissionModel.findOne({ id: permissionId });
    
    if (!role || !permission) return null;
    
    const permObjectId = permission._id as Types.ObjectId;
    if (!role.permissions.some(p => p.equals(permObjectId))) {
      role.permissions.push(permObjectId);
      role.updatedAt = new Date();
      await role.save();
    }
    
    return this.roleDocumentToRole(role);
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<Role | null> {
    const role = await RoleModel.findOne({ id: roleId });
    const permission = await PermissionModel.findOne({ id: permissionId });
    
    if (!role || !permission) return null;
    
    const permObjectId = permission._id as Types.ObjectId;
    role.permissions = role.permissions.filter(p => !p.equals(permObjectId));
    role.updatedAt = new Date();
    await role.save();
    
    return this.roleDocumentToRole(role);
  }

  // User Role Methods
  async assignRoleToUser(userId: string, roleId: string, assignedBy: string): Promise<UserRole> {
    const role = await RoleModel.findOne({ id: roleId });
    if (!role) throw new Error('Role not found');

    const newUserRole = new UserRoleModel({
      userId,
      roleId,
      assignedBy,
      assignedAt: new Date()
    });
    const saved = await newUserRole.save();
    return saved.toObject() as UserRole;
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<boolean> {
    const result = await UserRoleModel.deleteOne({ userId, roleId });
    return result.deletedCount === 1;
  }

  async getUserRoles(userId: string): Promise<Role[]> {
    const userRoles = await UserRoleModel.find({ userId });
    const roleIds = userRoles.map(ur => ur.roleId);
    const roles = await RoleModel.find({ id: { $in: roleIds } });
    return Promise.all(roles.map(role => this.roleDocumentToRole(role)));
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    const roles = await this.getUserRoles(userId);
    const permissions = new Set<Permission>();
    
    roles.forEach(role => {
      role.permissions.forEach(permission => {
        permissions.add(permission);
      });
    });
    
    return Array.from(permissions);
  }

  // Query Methods
  async hasPermission(userId: string, permissionQuery: Partial<Permission>): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return userPermissions.some(permission => 
      Object.entries(permissionQuery).every(([key, value]) => 
        permission[key as keyof Permission] === value
      )
    );
  }
}

export default RBACRepository;
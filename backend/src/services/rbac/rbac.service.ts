import { Permission, Role, UserRole } from '../../types/rbac.types';
import RBACRepository from '../../database/repositories/rbac.repository';

export class RBACService {
  private static instance: RBACService;
  private repository: RBACRepository;

  private constructor() {
    this.repository = RBACRepository.getInstance();
  }

  public static getInstance(): RBACService {
    if (!RBACService.instance) {
      RBACService.instance = new RBACService();
    }
    return RBACService.instance;
  }

  // Permission Management
  async createPermission(permission: Omit<Permission, 'id' | 'createdAt' | 'updatedAt'>): Promise<Permission> {
    return await this.repository.createPermission(permission);
  }

  async getPermissionById(id: string): Promise<Permission | null> {
    return await this.repository.getPermissionById(id);
  }

  async updatePermission(id: string, updates: Partial<Permission>): Promise<Permission> {
    const updatedPermission = await this.repository.updatePermission(id, updates);
    if (!updatedPermission) {
      throw new Error('Permission not found');
    }
    return updatedPermission;
  }

  async deletePermission(id: string): Promise<void> {
    const success = await this.repository.deletePermission(id);
    if (!success) {
      throw new Error('Permission not found');
    }
  }

  // Role Management
  async createRole(role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
    return await this.repository.createRole(role);
  }

  async getRoleById(id: string): Promise<Role> {
    const role = await this.repository.getRoleById(id);
    if (!role) {
      throw new Error('Role not found');
    }
    return role;
  }

  async getRoleByName(name: string): Promise<Role> {
    const role = await this.repository.getRoleByName(name);
    if (!role) {
      throw new Error('Role not found');
    }
    return role;
  }

  async updateRole(id: string, updates: Partial<Role>): Promise<Role> {
    const updatedRole = await this.repository.updateRole(id, updates);
    if (!updatedRole) {
      throw new Error('Role not found');
    }
    return updatedRole;
  }

  async deleteRole(id: string): Promise<void> {
    const success = await this.repository.deleteRole(id);
    if (!success) {
      throw new Error('Role not found');
    }
  }

  async addPermissionToRole(roleId: string, permissionId: string): Promise<Role> {
    const updatedRole = await this.repository.addPermissionToRole(roleId, permissionId);
    if (!updatedRole) {
      throw new Error('Role or Permission not found');
    }
    return updatedRole;
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<Role> {
    const updatedRole = await this.repository.removePermissionFromRole(roleId, permissionId);
    if (!updatedRole) {
      throw new Error('Role or Permission not found');
    }
    return updatedRole;
  }

  // User Role Management
  async assignRoleToUser(userId: string, roleId: string, assignedBy: string): Promise<UserRole> {
    return await this.repository.assignRoleToUser(userId, roleId, assignedBy);
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    const success = await this.repository.removeRoleFromUser(userId, roleId);
    if (!success) {
      throw new Error('User role assignment not found');
    }
  }

  async getUserRoles(userId: string): Promise<Role[]> {
    return await this.repository.getUserRoles(userId);
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    return await this.repository.getUserPermissions(userId);
  }

  // Permission Checking
  async hasPermission(userId: string, permissionQuery: Partial<Permission>): Promise<boolean> {
    return await this.repository.hasPermission(userId, permissionQuery);
  }

  async validatePermission(userId: string, permissionQuery: Partial<Permission>): Promise<void> {
    const hasPermission = await this.hasPermission(userId, permissionQuery);
    if (!hasPermission) {
      throw new Error('Permission denied');
    }
  }
}

export default RBACService;
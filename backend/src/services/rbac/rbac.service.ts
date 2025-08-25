import RBACRepository from '../../database/repositories/rbac.repository';
import { Permission, Role, UserRole, CreatePermissionRequest, UpdatePermissionRequest, CreateRoleRequest, UpdateRoleRequest, PermissionCheck } from '../../types/rbac.types';

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

  // Permission management
  async createPermission(data: CreatePermissionRequest): Promise<Permission> {
    return this.repository.createPermission(data);
  }

  async getPermissionById(id: string): Promise<Permission | null> {
    return this.repository.getPermissionById(id);
  }

  async updatePermission(id: string, data: UpdatePermissionRequest): Promise<Permission | null> {
    return this.repository.updatePermission(id, data);
  }

  async deletePermission(id: string): Promise<void> {
    await this.repository.deletePermission(id);
  }

  // Role management
  async createRole(data: CreateRoleRequest): Promise<Role> {
    return this.repository.createRole(data);
  }

  async getRoleById(id: string): Promise<Role | null> {
    return this.repository.getRoleById(id);
  }

  async getRoleByName(name: string): Promise<Role | null> {
    return this.repository.getRoleByName(name);
  }

  async updateRole(id: string, data: UpdateRoleRequest): Promise<Role | null> {
    return this.repository.updateRole(id, data);
  }

  async deleteRole(id: string): Promise<void> {
    await this.repository.deleteRole(id);
  }

  // Role-Permission management
  async addPermissionToRole(roleId: string, permissionId: string): Promise<Role | null> {
    return this.repository.addPermissionToRole(roleId, permissionId);
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<Role | null> {
    return this.repository.removePermissionFromRole(roleId, permissionId);
  }

  // User-Role management
  async assignRoleToUser(userId: string, roleId: string, assignedBy: string): Promise<UserRole> {
    return this.repository.assignRoleToUser(userId, roleId, assignedBy);
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    await this.repository.removeRoleFromUser(userId, roleId);
  }

  async getUserRoles(userId: string): Promise<Role[]> {
    return this.repository.getUserRoles(userId);
  }

  // Permission checking
  async hasPermission(userId: string, permission: PermissionCheck): Promise<boolean> {
    return this.repository.hasPermission(userId, permission);
  }

  async validatePermission(userId: string, permission: PermissionCheck): Promise<void> {
    const hasPermission = await this.hasPermission(userId, permission);
    if (!hasPermission) {
      throw new Error('Permission denied');
    }
  }
}
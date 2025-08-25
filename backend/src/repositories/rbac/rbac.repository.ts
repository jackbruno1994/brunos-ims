import { Permission, Role, UserRole } from '../../types/rbac.types';

export class RBACRepository {
  private static instance: RBACRepository;
  
  // In-memory storage for demonstration purposes
  // In a real application, this would interface with a database
  private permissions: Permission[] = [];
  private roles: Role[] = [];
  private userRoles: UserRole[] = [];

  private constructor() {}

  public static getInstance(): RBACRepository {
    if (!RBACRepository.instance) {
      RBACRepository.instance = new RBACRepository();
    }
    return RBACRepository.instance;
  }

  // Permission methods
  public async createPermission(permission: Permission): Promise<Permission> {
    this.permissions.push(permission);
    return permission;
  }

  public async getPermissionById(id: string): Promise<Permission | null> {
    return this.permissions.find(p => p.id === id) || null;
  }

  public async updatePermission(id: string, updates: Partial<Permission>): Promise<Permission> {
    const index = this.permissions.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Permission not found');
    }
    this.permissions[index] = { ...this.permissions[index], ...updates };
    return this.permissions[index];
  }

  public async deletePermission(id: string): Promise<boolean> {
    const index = this.permissions.findIndex(p => p.id === id);
    if (index === -1) {
      return false;
    }
    this.permissions.splice(index, 1);
    return true;
  }

  public async getAllPermissions(): Promise<Permission[]> {
    return [...this.permissions];
  }

  // Role methods
  public async createRole(role: Role): Promise<Role> {
    this.roles.push(role);
    return role;
  }

  public async getRoleById(id: string): Promise<Role | null> {
    return this.roles.find(r => r.id === id) || null;
  }

  public async updateRole(id: string, updates: Partial<Role>): Promise<Role> {
    const index = this.roles.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('Role not found');
    }
    this.roles[index] = { ...this.roles[index], ...updates };
    return this.roles[index];
  }

  public async deleteRole(id: string): Promise<boolean> {
    const index = this.roles.findIndex(r => r.id === id);
    if (index === -1) {
      return false;
    }
    this.roles.splice(index, 1);
    return true;
  }

  public async getAllRoles(): Promise<Role[]> {
    return [...this.roles];
  }

  // UserRole methods
  public async assignRoleToUser(userId: string, roleId: string, assignedBy: string): Promise<UserRole> {
    // Check if role exists
    const role = await this.getRoleById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    // Check if user already has this role
    const existingUserRole = this.userRoles.find(ur => ur.userId === userId && ur.roleId === roleId);
    if (existingUserRole) {
      throw new Error('User already has this role');
    }

    const userRole: UserRole = {
      userId,
      roleId,
      assignedBy,
      assignedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: assignedBy,
      updatedBy: assignedBy
    };

    this.userRoles.push(userRole);
    return userRole;
  }

  public async removeRoleFromUser(userId: string, roleId: string): Promise<boolean> {
    const index = this.userRoles.findIndex(ur => ur.userId === userId && ur.roleId === roleId);
    if (index === -1) {
      return false;
    }
    this.userRoles.splice(index, 1);
    return true;
  }

  public async getUserRoles(userId: string): Promise<UserRole[]> {
    return this.userRoles.filter(ur => ur.userId === userId);
  }

  public async getRoleUsers(roleId: string): Promise<UserRole[]> {
    return this.userRoles.filter(ur => ur.roleId === roleId);
  }
}

export default RBACRepository;
import { Permission, Role, UserRole, RBACConfig } from '../../types/rbac.types';

export class RBACService {
  private static instance: RBACService;
  private roles: Map<string, Role>;
  private userRoles: Map<string, Set<string>>;
  private config: RBACConfig;

  private constructor() {
    this.roles = new Map();
    this.userRoles = new Map();
    this.config = {
      defaultRole: 'user',
      superAdminRole: 'superadmin',
      cacheEnabled: true,
      cacheTTL: 3600
    };
  }

  public static getInstance(): RBACService {
    if (!RBACService.instance) {
      RBACService.instance = new RBACService();
    }
    return RBACService.instance;
  }

  public async createRole(role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
    const id = crypto.randomUUID();
    const now = new Date();
    
    const newRole: Role = {
      ...role,
      id,
      createdAt: now,
      updatedAt: now,
      permissions: role.permissions || []
    };

    this.roles.set(id, newRole);
    return newRole;
  }

  public async assignRoleToUser(userId: string, roleId: string, assignedBy: string): Promise<UserRole> {
    if (!this.roles.has(roleId)) {
      throw new Error('Role not found');
    }

    const userRoles = this.userRoles.get(userId) || new Set();
    userRoles.add(roleId);
    this.userRoles.set(userId, userRoles);

    return {
      userId,
      roleId,
      assignedAt: new Date(),
      assignedBy
    };
  }

  public async hasPermission(userId: string, permission: Permission): Promise<boolean> {
    const userRoles = this.userRoles.get(userId);
    if (!userRoles) return false;

    for (const roleId of userRoles) {
      const role = this.roles.get(roleId);
      if (role?.permissions.some(p => 
        p.resource === permission.resource && 
        p.action === permission.action
      )) {
        return true;
      }
    }

    return false;
  }

  public async getUserRoles(userId: string): Promise<Role[]> {
    const userRoles = this.userRoles.get(userId);
    if (!userRoles) return [];

    return Array.from(userRoles)
      .map(roleId => this.roles.get(roleId))
      .filter((role): role is Role => role !== undefined);
  }

  public async updateRole(roleId: string, updates: Partial<Role>): Promise<Role> {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    const updatedRole: Role = {
      ...role,
      ...updates,
      id: roleId,
      updatedAt: new Date()
    };

    this.roles.set(roleId, updatedRole);
    return updatedRole;
  }
}
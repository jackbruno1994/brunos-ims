import { Permission, Role, UserRoleAssignment } from '../../types/rbac.types';

export class RBACService {
  private static instance: RBACService;
  private roles: Map<string, Role> = new Map();
  private userRoleAssignments: Map<string, UserRoleAssignment[]> = new Map();
  private idCounter = 0;

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): RBACService {
    if (!RBACService.instance) {
      RBACService.instance = new RBACService();
    }
    // Reset state for each test
    RBACService.instance.roles.clear();
    RBACService.instance.userRoleAssignments.clear();
    RBACService.instance.idCounter = 0;
    return RBACService.instance;
  }

  private generateId(): string {
    return (++this.idCounter).toString();
  }

  public async createRole(roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
    const now = new Date();
    const role: Role = {
      ...roleData,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    };

    this.roles.set(role.id, role);
    return role;
  }

  public async updateRole(
    roleId: string,
    updates: Partial<Omit<Role, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Role> {
    const existingRole = this.roles.get(roleId);
    if (!existingRole) {
      throw new Error('Role not found');
    }

    const updatedRole: Role = {
      ...existingRole,
      ...updates,
      updatedAt: new Date(),
    };

    this.roles.set(roleId, updatedRole);
    return updatedRole;
  }

  public async assignRoleToUser(
    userId: string,
    roleId: string,
    assignedBy: string
  ): Promise<UserRoleAssignment> {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    const assignment: UserRoleAssignment = {
      id: this.generateId(),
      userId,
      roleId,
      assignedBy,
      assignedAt: new Date(),
    };

    if (!this.userRoleAssignments.has(userId)) {
      this.userRoleAssignments.set(userId, []);
    }

    this.userRoleAssignments.get(userId)!.push(assignment);
    return assignment;
  }

  public async getUserRoles(userId: string): Promise<Role[]> {
    const assignments = this.userRoleAssignments.get(userId) || [];
    const roles: Role[] = [];

    for (const assignment of assignments) {
      const role = this.roles.get(assignment.roleId);
      if (role) {
        roles.push(role);
      }
    }

    return roles;
  }

  public async hasPermission(userId: string, permission: Permission): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);

    for (const role of userRoles) {
      for (const rolePermission of role.permissions) {
        if (
          rolePermission.resource === permission.resource &&
          rolePermission.action === permission.action
        ) {
          return true;
        }
      }
    }

    return false;
  }
}
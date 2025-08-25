import { Permission, Role, UserRole } from '../../types/rbac.types';
import { RBACRepository } from '../../repositories/rbac/rbac.repository';
import { AuditService } from '../audit/audit.service';
import DateTimeUtil from '../../utils/datetime';
import { v4 as uuidv4 } from 'uuid';

export class RBACService {
  private static instance: RBACService;
  private repository: RBACRepository;
  private auditService: AuditService;
  private dateTimeUtil: DateTimeUtil;

  private constructor() {
    this.repository = RBACRepository.getInstance();
    this.auditService = AuditService.getInstance();
    this.dateTimeUtil = DateTimeUtil.getInstance();
  }

  public static getInstance(): RBACService {
    if (!RBACService.instance) {
      RBACService.instance = new RBACService();
    }
    return RBACService.instance;
  }

  // Permission methods
  public async createPermission(data: Partial<Permission>, userId: string): Promise<Permission> {
    const now = this.dateTimeUtil.getCurrentUtcDate();
    const permission: Permission = {
      id: uuidv4(),
      resource: data.resource || '',
      action: data.action || '',
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      updatedBy: userId
    };

    const createdPermission = await this.repository.createPermission(permission);

    await this.auditService.logAudit(
      'CREATE',
      'permission',
      permission.id,
      userId,
      permission
    );

    return createdPermission;
  }

  public async updatePermission(id: string, data: Partial<Permission>, userId: string): Promise<Permission> {
    const now = this.dateTimeUtil.getCurrentUtcDate();
    const oldPermission = await this.repository.getPermissionById(id);
    
    if (!oldPermission) {
      throw new Error('Permission not found');
    }

    const permission = await this.repository.updatePermission(id, {
      ...data,
      updatedAt: now,
      updatedBy: userId
    });

    await this.auditService.logAudit(
      'UPDATE',
      'permission',
      id,
      userId,
      {
        old: oldPermission,
        new: permission
      }
    );

    return permission;
  }

  public async deletePermission(id: string, userId: string): Promise<boolean> {
    const permission = await this.repository.getPermissionById(id);
    
    if (!permission) {
      throw new Error('Permission not found');
    }

    const deleted = await this.repository.deletePermission(id);

    if (deleted) {
      await this.auditService.logAudit(
        'DELETE',
        'permission',
        id,
        userId,
        permission
      );
    }

    return deleted;
  }

  public async getPermissionById(id: string): Promise<Permission | null> {
    return await this.repository.getPermissionById(id);
  }

  public async getAllPermissions(): Promise<Permission[]> {
    return await this.repository.getAllPermissions();
  }

  // Role methods
  public async createRole(data: Partial<Role>, userId: string): Promise<Role> {
    const now = this.dateTimeUtil.getCurrentUtcDate();
    const role: Role = {
      id: uuidv4(),
      name: data.name || '',
      description: data.description || '',
      permissions: data.permissions || [],
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      updatedBy: userId
    };

    const createdRole = await this.repository.createRole(role);

    await this.auditService.logAudit(
      'CREATE',
      'role',
      role.id,
      userId,
      role
    );

    return createdRole;
  }

  public async updateRole(id: string, data: Partial<Role>, userId: string): Promise<Role> {
    const now = this.dateTimeUtil.getCurrentUtcDate();
    const oldRole = await this.repository.getRoleById(id);
    
    if (!oldRole) {
      throw new Error('Role not found');
    }

    const role = await this.repository.updateRole(id, {
      ...data,
      updatedAt: now,
      updatedBy: userId
    });

    await this.auditService.logAudit(
      'UPDATE',
      'role',
      id,
      userId,
      {
        old: oldRole,
        new: role
      }
    );

    return role;
  }

  public async deleteRole(id: string, userId: string): Promise<boolean> {
    const role = await this.repository.getRoleById(id);
    
    if (!role) {
      throw new Error('Role not found');
    }

    const deleted = await this.repository.deleteRole(id);

    if (deleted) {
      await this.auditService.logAudit(
        'DELETE',
        'role',
        id,
        userId,
        role
      );
    }

    return deleted;
  }

  public async getRoleById(id: string): Promise<Role | null> {
    return await this.repository.getRoleById(id);
  }

  public async getAllRoles(): Promise<Role[]> {
    return await this.repository.getAllRoles();
  }

  // UserRole methods
  public async assignRoleToUser(userId: string, roleId: string, assignedBy: string): Promise<UserRole> {
    const userRole = await this.repository.assignRoleToUser(userId, roleId, assignedBy);

    await this.auditService.logAudit(
      'ASSIGN_ROLE',
      'user_role',
      `${userId}:${roleId}`,
      assignedBy,
      userRole
    );

    return userRole;
  }

  public async removeRoleFromUser(userId: string, roleId: string, removedBy: string): Promise<boolean> {
    const userRoles = await this.repository.getUserRoles(userId);
    const userRole = userRoles.find(ur => ur.roleId === roleId);

    const removed = await this.repository.removeRoleFromUser(userId, roleId);

    if (removed && userRole) {
      await this.auditService.logAudit(
        'REMOVE_ROLE',
        'user_role',
        `${userId}:${roleId}`,
        removedBy,
        userRole
      );
    }

    return removed;
  }

  public async getUserRoles(userId: string): Promise<UserRole[]> {
    return await this.repository.getUserRoles(userId);
  }

  public async getRoleUsers(roleId: string): Promise<UserRole[]> {
    return await this.repository.getRoleUsers(roleId);
  }
}

export default RBACService;
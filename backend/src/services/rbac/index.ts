/**
 * RBAC Service Implementation
 * Provides role and permission management functionality
 * with enterprise-grade security features
 */

import {
  Role,
  Permission,
  UserRole,
  RolePermission,
  RBACUser,
  RBACResult,
  CreateRoleInput,
  UpdateRoleInput,
  CreatePermissionInput,
  UpdatePermissionInput,
  AssignUserRoleInput,
  AssignRolePermissionInput,
  PermissionContext,
  PermissionCheckResult,
  UserSession,
  RBACAuditLog,
  RoleType,
  PermissionString,
  ResourceType,
  ActionType,
} from '../../types/rbac';

/**
 * Mock database interface - to be replaced with actual database implementation
 * This provides the interface that the actual database service should implement
 */
interface DatabaseService {
  // Role operations
  createRole(role: CreateRoleInput): Promise<Role>;
  getRoleById(id: string): Promise<Role | null>;
  getRoleByName(name: RoleType): Promise<Role | null>;
  getAllRoles(): Promise<Role[]>;
  updateRole(id: string, updates: Partial<UpdateRoleInput>): Promise<Role>;
  deleteRole(id: string): Promise<boolean>;

  // Permission operations
  createPermission(permission: CreatePermissionInput): Promise<Permission>;
  getPermissionById(id: string): Promise<Permission | null>;
  getPermissionByName(name: PermissionString): Promise<Permission | null>;
  getAllPermissions(): Promise<Permission[]>;
  getPermissionsByResource(resource: ResourceType): Promise<Permission[]>;
  updatePermission(id: string, updates: Partial<UpdatePermissionInput>): Promise<Permission>;
  deletePermission(id: string): Promise<boolean>;

  // User-Role operations
  assignUserRole(assignment: AssignUserRoleInput): Promise<UserRole>;
  removeUserRole(userId: string, roleId: string, restaurantId?: string): Promise<boolean>;
  getUserRoles(userId: string): Promise<UserRole[]>;
  getUsersByRole(roleId: string): Promise<string[]>;

  // Role-Permission operations
  assignRolePermission(assignment: AssignRolePermissionInput): Promise<RolePermission>;
  removeRolePermission(roleId: string, permissionId: string): Promise<boolean>;
  getRolePermissions(roleId: string): Promise<Permission[]>;
  getPermissionRoles(permissionId: string): Promise<Role[]>;

  // User operations
  getUserById(userId: string): Promise<RBACUser | null>;
  getUserPermissions(userId: string): Promise<Permission[]>;

  // Session operations
  createSession(session: Omit<UserSession, 'id' | 'createdAt' | 'lastAccessedAt'>): Promise<UserSession>;
  getSession(token: string): Promise<UserSession | null>;
  updateSessionAccess(sessionId: string): Promise<void>;
  deactivateSession(sessionId: string): Promise<void>;
  getUserActiveSessions(userId: string): Promise<UserSession[]>;

  // Audit operations
  logAuditEvent(log: Omit<RBACAuditLog, 'id' | 'timestamp'>): Promise<RBACAuditLog>;
}

/**
 * Mock database implementation for development/testing
 * Replace this with actual database service in production
 */
class MockDatabaseService implements DatabaseService {
  private roles: Role[] = [];
  private permissions: Permission[] = [];
  private userRoles: UserRole[] = [];
  private rolePermissions: RolePermission[] = [];
  private users: RBACUser[] = [];
  private sessions: UserSession[] = [];
  private auditLogs: RBACAuditLog[] = [];

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  // Role operations
  async createRole(role: CreateRoleInput): Promise<Role> {
    const newRole: Role = {
      id: this.generateId(),
      ...role,
      isActive: role.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.roles.push(newRole);
    return newRole;
  }

  async getRoleById(id: string): Promise<Role | null> {
    return this.roles.find(r => r.id === id) || null;
  }

  async getRoleByName(name: RoleType): Promise<Role | null> {
    return this.roles.find(r => r.name === name) || null;
  }

  async getAllRoles(): Promise<Role[]> {
    return this.roles.filter(r => r.isActive);
  }

  async updateRole(id: string, updates: Partial<UpdateRoleInput>): Promise<Role> {
    const roleIndex = this.roles.findIndex(r => r.id === id);
    if (roleIndex === -1) throw new Error('Role not found');
    
    this.roles[roleIndex] = {
      ...this.roles[roleIndex],
      ...updates,
      updatedAt: new Date(),
    };
    return this.roles[roleIndex];
  }

  async deleteRole(id: string): Promise<boolean> {
    const roleIndex = this.roles.findIndex(r => r.id === id);
    if (roleIndex === -1) return false;
    
    this.roles[roleIndex].isActive = false;
    this.roles[roleIndex].updatedAt = new Date();
    return true;
  }

  // Permission operations
  async createPermission(permission: CreatePermissionInput): Promise<Permission> {
    const newPermission: Permission = {
      id: this.generateId(),
      ...permission,
      isActive: permission.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.permissions.push(newPermission);
    return newPermission;
  }

  async getPermissionById(id: string): Promise<Permission | null> {
    return this.permissions.find(p => p.id === id) || null;
  }

  async getPermissionByName(name: PermissionString): Promise<Permission | null> {
    return this.permissions.find(p => p.name === name) || null;
  }

  async getAllPermissions(): Promise<Permission[]> {
    return this.permissions.filter(p => p.isActive);
  }

  async getPermissionsByResource(resource: ResourceType): Promise<Permission[]> {
    return this.permissions.filter(p => p.resource === resource && p.isActive);
  }

  async updatePermission(id: string, updates: Partial<UpdatePermissionInput>): Promise<Permission> {
    const permIndex = this.permissions.findIndex(p => p.id === id);
    if (permIndex === -1) throw new Error('Permission not found');
    
    this.permissions[permIndex] = {
      ...this.permissions[permIndex],
      ...updates,
      updatedAt: new Date(),
    };
    return this.permissions[permIndex];
  }

  async deletePermission(id: string): Promise<boolean> {
    const permIndex = this.permissions.findIndex(p => p.id === id);
    if (permIndex === -1) return false;
    
    this.permissions[permIndex].isActive = false;
    this.permissions[permIndex].updatedAt = new Date();
    return true;
  }

  // User-Role operations
  async assignUserRole(assignment: AssignUserRoleInput): Promise<UserRole> {
    const userRole: UserRole = {
      id: this.generateId(),
      ...assignment,
      assignedAt: new Date(),
      isActive: true,
    };
    this.userRoles.push(userRole);
    return userRole;
  }

  async removeUserRole(userId: string, roleId: string, restaurantId?: string): Promise<boolean> {
    const userRoleIndex = this.userRoles.findIndex(ur => 
      ur.userId === userId && 
      ur.roleId === roleId && 
      ur.restaurantId === restaurantId &&
      ur.isActive
    );
    
    if (userRoleIndex === -1) return false;
    
    this.userRoles[userRoleIndex].isActive = false;
    return true;
  }

  async getUserRoles(userId: string): Promise<UserRole[]> {
    return this.userRoles.filter(ur => ur.userId === userId && ur.isActive);
  }

  async getUsersByRole(roleId: string): Promise<string[]> {
    return this.userRoles
      .filter(ur => ur.roleId === roleId && ur.isActive)
      .map(ur => ur.userId);
  }

  // Role-Permission operations
  async assignRolePermission(assignment: AssignRolePermissionInput): Promise<RolePermission> {
    const rolePermission: RolePermission = {
      id: this.generateId(),
      ...assignment,
      grantedAt: new Date(),
      isActive: true,
    };
    this.rolePermissions.push(rolePermission);
    return rolePermission;
  }

  async removeRolePermission(roleId: string, permissionId: string): Promise<boolean> {
    const rpIndex = this.rolePermissions.findIndex(rp => 
      rp.roleId === roleId && 
      rp.permissionId === permissionId &&
      rp.isActive
    );
    
    if (rpIndex === -1) return false;
    
    this.rolePermissions[rpIndex].isActive = false;
    return true;
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const rolePermissionIds = this.rolePermissions
      .filter(rp => rp.roleId === roleId && rp.isActive)
      .map(rp => rp.permissionId);
    
    return this.permissions.filter(p => rolePermissionIds.includes(p.id) && p.isActive);
  }

  async getPermissionRoles(permissionId: string): Promise<Role[]> {
    const permissionRoleIds = this.rolePermissions
      .filter(rp => rp.permissionId === permissionId && rp.isActive)
      .map(rp => rp.roleId);
    
    return this.roles.filter(r => permissionRoleIds.includes(r.id) && r.isActive);
  }

  // User operations
  async getUserById(userId: string): Promise<RBACUser | null> {
    return this.users.find(u => u.id === userId) || null;
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    const userRoles = await this.getUserRoles(userId);
    const allPermissions: Permission[] = [];
    
    for (const userRole of userRoles) {
      const rolePermissions = await this.getRolePermissions(userRole.roleId);
      allPermissions.push(...rolePermissions);
    }
    
    // Remove duplicates
    const uniquePermissions = allPermissions.filter((permission, index, self) =>
      index === self.findIndex(p => p.id === permission.id)
    );
    
    return uniquePermissions;
  }

  // Session operations (simplified implementation)
  async createSession(session: Omit<UserSession, 'id' | 'createdAt' | 'lastAccessedAt'>): Promise<UserSession> {
    const newSession: UserSession = {
      id: this.generateId(),
      ...session,
      createdAt: new Date(),
      lastAccessedAt: new Date(),
    };
    this.sessions.push(newSession);
    return newSession;
  }

  async getSession(token: string): Promise<UserSession | null> {
    return this.sessions.find(s => s.token === token && s.isActive) || null;
  }

  async updateSessionAccess(sessionId: string): Promise<void> {
    const session = this.sessions.find(s => s.id === sessionId);
    if (session) {
      session.lastAccessedAt = new Date();
    }
  }

  async deactivateSession(sessionId: string): Promise<void> {
    const session = this.sessions.find(s => s.id === sessionId);
    if (session) {
      session.isActive = false;
    }
  }

  async getUserActiveSessions(userId: string): Promise<UserSession[]> {
    return this.sessions.filter(s => s.userId === userId && s.isActive);
  }

  // Audit operations
  async logAuditEvent(log: Omit<RBACAuditLog, 'id' | 'timestamp'>): Promise<RBACAuditLog> {
    const auditLog: RBACAuditLog = {
      id: this.generateId(),
      ...log,
      timestamp: new Date(),
    };
    this.auditLogs.push(auditLog);
    return auditLog;
  }
}

/**
 * Main RBAC Service class
 */
export class RBACService {
  private db: DatabaseService;

  constructor(databaseService?: DatabaseService) {
    this.db = databaseService || new MockDatabaseService();
  }

  // Role Management
  async createRole(roleData: CreateRoleInput): Promise<RBACResult<Role>> {
    try {
      const existingRole = await this.db.getRoleByName(roleData.name);
      if (existingRole) {
        return {
          success: false,
          error: 'Role with this name already exists',
          code: 'ROLE_EXISTS'
        };
      }

      const role = await this.db.createRole(roleData);
      return { success: true, data: role };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'CREATE_ROLE_ERROR'
      };
    }
  }

  async getRoleById(id: string): Promise<RBACResult<Role>> {
    try {
      const role = await this.db.getRoleById(id);
      if (!role) {
        return {
          success: false,
          error: 'Role not found',
          code: 'ROLE_NOT_FOUND'
        };
      }
      return { success: true, data: role };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'GET_ROLE_ERROR'
      };
    }
  }

  async getAllRoles(): Promise<RBACResult<Role[]>> {
    try {
      const roles = await this.db.getAllRoles();
      return { success: true, data: roles };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'GET_ROLES_ERROR'
      };
    }
  }

  async updateRole(id: string, updates: Partial<UpdateRoleInput>): Promise<RBACResult<Role>> {
    try {
      const role = await this.db.updateRole(id, updates);
      return { success: true, data: role };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'UPDATE_ROLE_ERROR'
      };
    }
  }

  async deleteRole(id: string): Promise<RBACResult<boolean>> {
    try {
      const result = await this.db.deleteRole(id);
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'DELETE_ROLE_ERROR'
      };
    }
  }

  // Permission Management
  async createPermission(permissionData: CreatePermissionInput): Promise<RBACResult<Permission>> {
    try {
      const existingPermission = await this.db.getPermissionByName(permissionData.name);
      if (existingPermission) {
        return {
          success: false,
          error: 'Permission with this name already exists',
          code: 'PERMISSION_EXISTS'
        };
      }

      const permission = await this.db.createPermission(permissionData);
      return { success: true, data: permission };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'CREATE_PERMISSION_ERROR'
      };
    }
  }

  async getAllPermissions(): Promise<RBACResult<Permission[]>> {
    try {
      const permissions = await this.db.getAllPermissions();
      return { success: true, data: permissions };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'GET_PERMISSIONS_ERROR'
      };
    }
  }

  // User-Role Assignment
  async assignUserRole(assignment: AssignUserRoleInput): Promise<RBACResult<UserRole>> {
    try {
      const userRole = await this.db.assignUserRole(assignment);
      
      // Log audit event
      await this.db.logAuditEvent({
        userId: assignment.assignedBy,
        action: 'user_role_assigned',
        resource: 'user_role',
        resourceId: userRole.id,
        newValue: assignment,
      });

      return { success: true, data: userRole };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'ASSIGN_USER_ROLE_ERROR'
      };
    }
  }

  async removeUserRole(userId: string, roleId: string, restaurantId?: string): Promise<RBACResult<boolean>> {
    try {
      const result = await this.db.removeUserRole(userId, roleId, restaurantId);
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'REMOVE_USER_ROLE_ERROR'
      };
    }
  }

  // Role-Permission Assignment
  async assignRolePermission(assignment: AssignRolePermissionInput): Promise<RBACResult<RolePermission>> {
    try {
      const rolePermission = await this.db.assignRolePermission(assignment);
      
      // Log audit event
      await this.db.logAuditEvent({
        userId: assignment.grantedBy,
        action: 'role_permission_assigned',
        resource: 'role_permission',
        resourceId: rolePermission.id,
        newValue: assignment,
      });

      return { success: true, data: rolePermission };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'ASSIGN_ROLE_PERMISSION_ERROR'
      };
    }
  }

  // Permission Verification
  async checkPermission(context: PermissionContext): Promise<PermissionCheckResult> {
    try {
      const userPermissions = await this.db.getUserPermissions(context.userId);
      
      const hasPermission = userPermissions.some(permission => 
        permission.resource === context.resource && 
        permission.action === context.action &&
        permission.isActive
      );

      return {
        granted: hasPermission,
        reason: hasPermission ? 'Permission granted' : 'Permission denied',
        context
      };
    } catch (error) {
      return {
        granted: false,
        reason: error instanceof Error ? error.message : 'Permission check failed',
        context
      };
    }
  }

  async hasPermission(userId: string, permissionString: PermissionString): Promise<boolean> {
    const [resource, action] = permissionString.split(':') as [ResourceType, ActionType];
    const result = await this.checkPermission({
      userId,
      resource,
      action
    });
    return result.granted;
  }

  // User Permissions
  async getUserPermissions(userId: string): Promise<RBACResult<Permission[]>> {
    try {
      const permissions = await this.db.getUserPermissions(userId);
      return { success: true, data: permissions };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'GET_USER_PERMISSIONS_ERROR'
      };
    }
  }

  async getUserRoles(userId: string): Promise<RBACResult<UserRole[]>> {
    try {
      const userRoles = await this.db.getUserRoles(userId);
      return { success: true, data: userRoles };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'GET_USER_ROLES_ERROR'
      };
    }
  }
}

// Export singleton instance
export const rbacService = new RBACService();
export default rbacService;
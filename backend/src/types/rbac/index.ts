/**
 * Core Role-Based Access Control (RBAC) Type Definitions
 * Implements enterprise-grade RBAC with resource:action permission format
 */

// Core role types as defined in the COPILOT_IMPLEMENTATION.md
export type RoleType = 'super_admin' | 'admin' | 'manager' | 'staff' | 'readonly';

// Resource types for permission system
export type ResourceType = 
  | 'user' 
  | 'restaurant' 
  | 'menu' 
  | 'inventory' 
  | 'order' 
  | 'report' 
  | 'system'
  | 'role'
  | 'permission';

// Action types for permission system
export type ActionType = 'create' | 'read' | 'update' | 'delete' | 'manage' | 'execute';

// Permission format: resource:action (e.g., "user:create", "restaurant:read")
export type PermissionString = `${ResourceType}:${ActionType}`;

/**
 * Core Role interface
 */
export interface Role {
  id: string;
  name: RoleType;
  displayName: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Permission interface with resource:action format
 */
export interface Permission {
  id: string;
  name: PermissionString;
  resource: ResourceType;
  action: ActionType;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User-Role relationship interface
 */
export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  restaurantId?: string; // Optional restaurant-specific role assignment
  assignedBy: string;
  assignedAt: Date;
  expiresAt?: Date; // Optional expiration for temporary roles
  isActive: boolean;
}

/**
 * Role-Permission relationship interface
 */
export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  grantedBy: string;
  grantedAt: Date;
  isActive: boolean;
}

/**
 * Extended User interface with RBAC integration
 */
export interface RBACUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: 'active' | 'inactive';
  country: string;
  restaurantId?: string;
  createdAt: Date;
  updatedAt: Date;
  // RBAC-specific fields
  roles: UserRole[];
  permissions: Permission[];
  lastLoginAt?: Date;
  sessionId?: string;
  sessionExpiresAt?: Date;
}

/**
 * Permission context for checking permissions
 */
export interface PermissionContext {
  userId: string;
  resource: ResourceType;
  action: ActionType;
  resourceId?: string;
  restaurantId?: string;
}

/**
 * Session management interface
 */
export interface UserSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  isActive: boolean;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  lastAccessedAt: Date;
}

/**
 * RBAC Service result types
 */
export interface RBACResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

/**
 * Role creation/update input
 */
export interface CreateRoleInput {
  name: RoleType;
  displayName: string;
  description: string;
  isActive?: boolean;
}

export interface UpdateRoleInput extends Partial<CreateRoleInput> {
  id: string;
}

/**
 * Permission creation/update input
 */
export interface CreatePermissionInput {
  name: PermissionString;
  resource: ResourceType;
  action: ActionType;
  description: string;
  isActive?: boolean;
}

export interface UpdatePermissionInput extends Partial<CreatePermissionInput> {
  id: string;
}

/**
 * User role assignment input
 */
export interface AssignUserRoleInput {
  userId: string;
  roleId: string;
  restaurantId?: string;
  assignedBy: string;
  expiresAt?: Date;
}

/**
 * Role permission assignment input
 */
export interface AssignRolePermissionInput {
  roleId: string;
  permissionId: string;
  grantedBy: string;
}

/**
 * Permission check result
 */
export interface PermissionCheckResult {
  granted: boolean;
  reason?: string;
  context?: PermissionContext;
}

/**
 * Audit log interface for RBAC operations
 */
export interface RBACAuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}
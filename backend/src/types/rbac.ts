// RBAC System Type Definitions

export enum PermissionType {
  READ = 'READ',
  WRITE = 'WRITE',
  HIDDEN = 'HIDDEN'
}

export enum ActionType {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  ASSIGN_ROLE = 'ASSIGN_ROLE',
  REMOVE_ROLE = 'REMOVE_ROLE'
}

// Core RBAC Interfaces
export interface User {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
  createdAt: Date;
  createdBy: string | null;
  updatedAt: Date | null;
  updatedBy: string | null;
}

export interface Role {
  id: number;
  roleName: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  createdBy: string | null;
  updatedAt: Date | null;
  updatedBy: string | null;
}

export interface UserRole {
  userId: number;
  roleId: number;
  assignedAt: Date;
  assignedBy: string | null;
}

export interface FeatureGroup {
  id: number;
  groupName: string;
  description: string | null;
  parentId: number | null;
  createdAt: Date;
  createdBy: string | null;
  updatedAt: Date | null;
  updatedBy: string | null;
}

export interface Feature {
  id: number;
  featureName: string;
  description: string | null;
  groupId: number | null;
  createdAt: Date;
  createdBy: string | null;
  updatedAt: Date | null;
  updatedBy: string | null;
}

export interface Permission {
  id: number;
  roleId: number;
  featureId: number;
  canRead: boolean;
  canWrite: boolean;
  isHidden: boolean;
  createdAt: Date;
  createdBy: string | null;
  updatedAt: Date | null;
  updatedBy: string | null;
}

export interface AuditLog {
  id: number;
  userId: number | null;
  actionType: string;
  tableName: string;
  recordId: number;
  oldValue: any | null;
  newValue: any | null;
  timestamp: Date;
  ipAddress: string | null;
}

// API Request/Response Types
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  createdBy?: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
  updatedBy?: string;
}

export interface CreateRoleRequest {
  roleName: string;
  description?: string;
  createdBy?: string;
}

export interface UpdateRoleRequest {
  roleName?: string;
  description?: string;
  isActive?: boolean;
  updatedBy?: string;
}

export interface CreateFeatureGroupRequest {
  groupName: string;
  description?: string;
  parentId?: number;
  createdBy?: string;
}

export interface UpdateFeatureGroupRequest {
  groupName?: string;
  description?: string;
  parentId?: number;
  updatedBy?: string;
}

export interface CreateFeatureRequest {
  featureName: string;
  description?: string;
  groupId?: number;
  createdBy?: string;
}

export interface UpdateFeatureRequest {
  featureName?: string;
  description?: string;
  groupId?: number;
  updatedBy?: string;
}

export interface CreatePermissionRequest {
  roleId: number;
  featureId: number;
  canRead?: boolean;
  canWrite?: boolean;
  isHidden?: boolean;
  createdBy?: string;
}

export interface UpdatePermissionRequest {
  canRead?: boolean;
  canWrite?: boolean;
  isHidden?: boolean;
  updatedBy?: string;
}

export interface AssignRoleRequest {
  roleId: number;
  assignedBy?: string;
}

// Extended interfaces with relations
export interface UserWithRoles extends User {
  roles: Role[];
}

export interface RoleWithPermissions extends Role {
  permissions: (Permission & { feature: Feature })[];
}

export interface FeatureWithGroup extends Feature {
  group: FeatureGroup | null;
}

export interface FeatureGroupWithFeatures extends FeatureGroup {
  features: Feature[];
  children: FeatureGroup[];
}

export interface PermissionWithDetails extends Permission {
  role: Role;
  feature: Feature;
}

// Query filters and pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface UserFilters extends PaginationParams {
  isActive?: boolean;
  roleId?: number;
  search?: string; // Search in username or email
}

export interface RoleFilters extends PaginationParams {
  isActive?: boolean;
  search?: string; // Search in role name or description
}

export interface FeatureFilters extends PaginationParams {
  groupId?: number;
  search?: string; // Search in feature name or description
}

export interface PermissionFilters extends PaginationParams {
  roleId?: number;
  featureId?: number;
  canRead?: boolean;
  canWrite?: boolean;
  isHidden?: boolean;
}

export interface AuditLogFilters extends PaginationParams {
  userId?: number;
  actionType?: string;
  tableName?: string;
  startDate?: Date;
  endDate?: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Permission checking types
export interface UserPermissions {
  [featureName: string]: {
    canRead: boolean;
    canWrite: boolean;
    isHidden: boolean;
  };
}

export interface PermissionCheck {
  userId: number;
  featureName: string;
  action: 'read' | 'write';
}

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}
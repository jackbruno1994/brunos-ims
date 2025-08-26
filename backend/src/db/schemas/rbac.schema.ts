/**
 * RBAC (Role-Based Access Control) Schema Definitions
 * 
 * This file contains TypeScript interfaces that match the RBAC database schema.
 * These interfaces should be kept in sync with the database migrations.
 */

export interface Role {
  id: string;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  created_at: Date;
  updated_at: Date;
}

export interface UserRole {
  user_id: string;
  role_id: string;
  assigned_at: Date;
}

export interface RolePermission {
  role_id: string;
  permission_id: string;
  assigned_at: Date;
}

// DTOs for API operations
export interface CreateRoleDto {
  name: string;
  description?: string;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
}

export interface CreatePermissionDto {
  name: string;
  description?: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
}

export interface UpdatePermissionDto {
  name?: string;
  description?: string;
  resource?: string;
  action?: 'create' | 'read' | 'update' | 'delete' | 'manage';
}

export interface AssignRoleDto {
  user_id: string;
  role_id: string;
}

export interface AssignPermissionDto {
  role_id: string;
  permission_id: string;
}

// Response DTOs
export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

export interface UserWithRoles {
  user_id: string;
  roles: Role[];
}

export interface PermissionCheck {
  resource: string;
  action: string;
  allowed: boolean;
}
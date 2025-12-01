// Basic interfaces
export interface Role {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  createdAt: Date;
  updatedAt: Date;
}

// Relationship interfaces
export interface UserRole {
  userId: string;
  roleId: string;
  assignedAt: Date;
}

export interface RolePermission {
  roleId: string;
  permissionId: string;
  assignedAt: Date;
}

// Extended user interface with RBAC
export interface RBACUser {
  id: string;
  roles: Role[];
  permissions: Permission[];
  hasRole(role: string): boolean;
  hasPermission(permission: string): boolean;
}
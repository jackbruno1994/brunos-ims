export interface Permission {
  id: string;
  resource: string;
  action: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRole {
  userId: string;
  roleId: string;
  assignedBy: string;
  assignedAt: Date;
}

export interface CreatePermissionRequest {
  resource: string;
  action: string;
}

export interface UpdatePermissionRequest {
  resource?: string;
  action?: string;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  permissions: Permission[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: Permission[];
}

export interface PermissionCheck {
  resource: string;
  action: string;
}
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'EXECUTE';
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
  assignedAt: Date;
  assignedBy: string;
}

export interface RBACConfig {
  defaultRole: string;
  superAdminRole: string;
  cacheEnabled: boolean;
  cacheTTL: number;
}
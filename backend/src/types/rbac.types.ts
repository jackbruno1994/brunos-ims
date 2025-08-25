export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
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

export interface UserRoleAssignment {
  id: string;
  userId: string;
  roleId: string;
  assignedBy: string;
  assignedAt: Date;
}
import { AuditableEntity } from './audit.types';

export interface Permission extends AuditableEntity {
  id: string;
  resource: string;
  action: string;
}

export interface Role extends AuditableEntity {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

export interface UserRole extends AuditableEntity {
  userId: string;
  roleId: string;
  assignedBy: string;
  assignedAt: Date;
}
export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  changes: object;
  timestamp: Date;
}

export interface AuditableEntity {
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
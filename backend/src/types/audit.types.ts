export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  changes: Record<string, any>;
  timestamp: Date;
}

export interface AuditLogFilters {
  startDate?: Date;
  endDate?: Date;
  entityType?: string;
  userId?: string;
  limit?: number;
  offset?: number;
}

export interface AuditLogResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
}
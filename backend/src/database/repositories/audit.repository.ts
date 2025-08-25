import { AuditLog, AuditLogFilters, AuditLogResponse } from '../../types/audit.types';

export class AuditRepository {
  private static instance: AuditRepository;
  private auditLogs: AuditLog[] = []; // In-memory storage for now

  private constructor() {}

  public static getInstance(): AuditRepository {
    if (!AuditRepository.instance) {
      AuditRepository.instance = new AuditRepository();
    }
    return AuditRepository.instance;
  }

  /**
   * Create a new audit log entry
   */
  public async create(auditLog: AuditLog): Promise<AuditLog> {
    this.auditLogs.push(auditLog);
    return auditLog;
  }

  /**
   * Get audit logs with filtering and pagination
   */
  public async find(filters: AuditLogFilters): Promise<AuditLogResponse> {
    let filteredLogs = [...this.auditLogs];

    // Apply filters
    if (filters.startDate) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) >= filters.startDate!
      );
    }

    if (filters.endDate) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) <= filters.endDate!
      );
    }

    if (filters.entityType) {
      filteredLogs = filteredLogs.filter(log => 
        log.entityType === filters.entityType
      );
    }

    if (filters.userId) {
      filteredLogs = filteredLogs.filter(log => 
        log.userId === filters.userId
      );
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const total = filteredLogs.length;
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    const pageSize = limit;
    const page = Math.floor(offset / limit) + 1;

    // Apply pagination
    const logs = filteredLogs.slice(offset, offset + limit);

    return {
      logs,
      total,
      page,
      pageSize
    };
  }

  /**
   * Get audit log by ID
   */
  public async findById(id: string): Promise<AuditLog | null> {
    return this.auditLogs.find(log => log.id === id) || null;
  }
}

export default AuditRepository;
import { AuditLog } from '../../types/audit.types';
import DateTimeUtil from '../../utils/datetime';
import { v4 as uuidv4 } from 'uuid';

export class AuditService {
  private static instance: AuditService;
  private dateTimeUtil: DateTimeUtil;

  private constructor() {
    this.dateTimeUtil = DateTimeUtil.getInstance();
  }

  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  /**
   * Log an audit event
   * @param action Action performed
   * @param entityType Type of entity
   * @param entityId Entity identifier
   * @param userId User who performed the action
   * @param changes Changes made
   * @returns Created audit log
   */
  public async logAudit(
    action: string,
    entityType: string,
    entityId: string,
    userId: string,
    changes: object
  ): Promise<AuditLog> {
    const auditLog: AuditLog = {
      id: uuidv4(),
      action,
      entityType,
      entityId,
      userId,
      changes,
      timestamp: this.dateTimeUtil.getCurrentUtcDate()
    };

    // TODO: Implement persistence layer for audit logs
    // For now, we'll just console.log for demonstration
    console.log('Audit Log:', JSON.stringify(auditLog, null, 2));

    return auditLog;
  }
}

export default AuditService;
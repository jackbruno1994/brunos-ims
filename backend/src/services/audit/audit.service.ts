import { AuditLog } from '../../types/audit.types';
import DateTimeUtil from '../../utils/datetime';
import { v4 as uuidv4 } from 'uuid';
import AuditRepository from '../../database/repositories/audit.repository';

export class AuditService {
  private static instance: AuditService;
  private dateTimeUtil: DateTimeUtil;
  private repository: AuditRepository;

  private constructor() {
    this.dateTimeUtil = DateTimeUtil.getInstance();
    this.repository = AuditRepository.getInstance();
  }

  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

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

    return await this.repository.createAuditLog(auditLog);
  }

  public async getAuditLogs(filters: {
    entityType?: string;
    entityId?: string;
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ logs: AuditLog[]; total: number }> {
    return await this.repository.getAuditLogs(filters);
  }

  public async getEntityAuditTrail(
    entityType: string,
    entityId: string
  ): Promise<AuditLog[]> {
    return await this.repository.getEntityAuditTrail(entityType, entityId);
  }

  public async generateAuditReport(filters: {
    startDate: Date;
    endDate: Date;
    entityType?: string;
    userId?: string;
  }): Promise<{
    totalActions: number;
    actionsByType: Record<string, number>;
    actionsByUser: Record<string, number>;
    mostAffectedEntities: Array<{ entityId: string; count: number }>;
  }> {
    const { logs } = await this.getAuditLogs({
      ...filters,
      limit: 1000 // Get a larger sample for analysis
    });

    const actionsByType: Record<string, number> = {};
    const actionsByUser: Record<string, number> = {};
    const entitiesCount: Record<string, number> = {};

    logs.forEach(log => {
      actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;
      actionsByUser[log.userId] = (actionsByUser[log.userId] || 0) + 1;
      entitiesCount[log.entityId] = (entitiesCount[log.entityId] || 0) + 1;
    });

    const mostAffectedEntities = Object.entries(entitiesCount)
      .map(([entityId, count]) => ({ entityId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalActions: logs.length,
      actionsByType,
      actionsByUser,
      mostAffectedEntities
    };
  }
}

export default AuditService;
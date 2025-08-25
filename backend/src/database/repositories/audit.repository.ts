import { Knex } from 'knex';
import { AuditLog } from '../../types/audit.types';
import database from '../connection';

export class AuditRepository {
  private static instance: AuditRepository;
  private db: Knex;

  private constructor() {
    this.db = database;
  }

  public static getInstance(): AuditRepository {
    if (!AuditRepository.instance) {
      AuditRepository.instance = new AuditRepository();
    }
    return AuditRepository.instance;
  }

  /**
   * Create a new audit log entry
   */
  public async createAuditLog(log: AuditLog): Promise<AuditLog> {
    const [created] = await this.db('audit_logs').insert({
      id: log.id,
      action: log.action,
      entity_type: log.entityType,
      entity_id: log.entityId,
      user_id: log.userId,
      changes: log.changes,
      timestamp: log.timestamp
    }).returning('*');

    return this.mapToAuditLog(created);
  }

  /**
   * Get audit logs with filtering and pagination
   */
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
    const {
      entityType,
      entityId,
      userId,
      action,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = filters;

    const query = this.db('audit_logs')
      .orderBy('timestamp', 'desc');

    if (entityType) {
      query.where('entity_type', entityType);
    }
    if (entityId) {
      query.where('entity_id', entityId);
    }
    if (userId) {
      query.where('user_id', userId);
    }
    if (action) {
      query.where('action', action);
    }
    if (startDate) {
      query.where('timestamp', '>=', startDate);
    }
    if (endDate) {
      query.where('timestamp', '<=', endDate);
    }

    const offset = (page - 1) * limit;
    const [total] = await query.clone().count('* as count');
    const results = await query.limit(limit).offset(offset);

    return {
      logs: results.map(this.mapToAuditLog),
      total: parseInt(total.count as string)
    };
  }

  /**
   * Get audit trail for a specific entity
   */
  public async getEntityAuditTrail(
    entityType: string,
    entityId: string
  ): Promise<AuditLog[]> {
    const logs = await this.db('audit_logs')
      .where({ entity_type: entityType, entity_id: entityId })
      .orderBy('timestamp', 'desc');

    return logs.map(this.mapToAuditLog);
  }

  private mapToAuditLog(data: any): AuditLog {
    return {
      id: data.id,
      action: data.action,
      entityType: data.entity_type,
      entityId: data.entity_id,
      userId: data.user_id,
      changes: data.changes,
      timestamp: new Date(data.timestamp)
    };
  }
}

export default AuditRepository;
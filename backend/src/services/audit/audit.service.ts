import { AuditLog, AuditLogFilters, AuditLogResponse } from '../../types/audit.types';
import DateTimeUtil from '../../utils/datetime';
import ExportUtil from '../../utils/export';
import VisualizationUtil from '../../utils/visualization';
import { v4 as uuidv4 } from 'uuid';
import AuditRepository from '../../database/repositories/audit.repository';

export class AuditService {
  private static instance: AuditService;
  private dateTimeUtil: DateTimeUtil;
  private exportUtil: ExportUtil;
  private visualizationUtil: VisualizationUtil;
  private repository: AuditRepository;

  private constructor() {
    this.dateTimeUtil = DateTimeUtil.getInstance();
    this.exportUtil = ExportUtil.getInstance();
    this.visualizationUtil = VisualizationUtil.getInstance();
    this.repository = AuditRepository.getInstance();
  }

  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  /**
   * Create a new audit log entry
   */
  public async createAuditLog(logData: {
    action: string;
    entityType: string;
    entityId: string;
    userId: string;
    changes: Record<string, any>;
  }): Promise<AuditLog> {
    const auditLog: AuditLog = {
      id: uuidv4(),
      action: logData.action,
      entityType: logData.entityType,
      entityId: logData.entityId,
      userId: logData.userId,
      changes: logData.changes,
      timestamp: this.dateTimeUtil.getCurrentUtc()
    };

    return await this.repository.create(auditLog);
  }

  /**
   * Get audit logs with filtering and pagination
   */
  public async getAuditLogs(filters: AuditLogFilters): Promise<AuditLogResponse> {
    return await this.repository.find(filters);
  }

  /**
   * Get audit log by ID
   */
  public async getAuditLogById(id: string): Promise<AuditLog | null> {
    return await this.repository.findById(id);
  }

  /**
   * Export audit logs to CSV format
   */
  public async exportToCsv(filters: {
    startDate?: Date;
    endDate?: Date;
    entityType?: string;
    userId?: string;
  }): Promise<string> {
    const { logs } = await this.getAuditLogs({ ...filters, limit: 1000 });
    return this.exportUtil.exportToCsv(logs);
  }

  /**
   * Export audit logs to PDF format
   */
  public async exportToPdf(filters: {
    startDate?: Date;
    endDate?: Date;
    entityType?: string;
    userId?: string;
  }): Promise<Buffer> {
    const { logs } = await this.getAuditLogs({ ...filters, limit: 1000 });
    return await this.exportUtil.exportToPdf(logs);
  }

  /**
   * Generate visualization data for audit activity
   */
  public async generateVisualizationData(filters: {
    startDate: Date;
    endDate: Date;
    entityType?: string;
    userId?: string;
  }): Promise<{
    actionDistribution: { labels: string[]; data: number[] };
    userActivity: { labels: string[]; data: number[] };
    timeline: { labels: string[]; data: number[] };
  }> {
    const { logs } = await this.getAuditLogs({ ...filters, limit: 1000 });

    // Calculate action distribution
    const actionsByType: Record<string, number> = {};
    logs.forEach(log => {
      actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;
    });

    // Calculate user activity
    const actionsByUser: Record<string, number> = {};
    logs.forEach(log => {
      actionsByUser[log.userId] = (actionsByUser[log.userId] || 0) + 1;
    });

    // Calculate timeline data
    const timelineData = this.calculateTimelineData(logs);

    return {
      actionDistribution: this.visualizationUtil.generateActionChart(actionsByType),
      userActivity: this.visualizationUtil.generateUserActivityChart(actionsByUser),
      timeline: this.visualizationUtil.generateTimelineChart(timelineData)
    };
  }

  private calculateTimelineData(logs: AuditLog[]): Array<{ timestamp: Date; count: number }> {
    const timelineMap = new Map<string, number>();

    logs.forEach(log => {
      const date = new Date(log.timestamp);
      const dateKey = date.toISOString().split('T')[0];
      timelineMap.set(dateKey, (timelineMap.get(dateKey) || 0) + 1);
    });

    return Array.from(timelineMap.entries())
      .map(([date, count]) => ({
        timestamp: new Date(date),
        count
      }))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
}

export default AuditService;
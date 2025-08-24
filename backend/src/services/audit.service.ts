import DatabaseService from '../database/connection';
import { 
  AuditLog, 
  AuditLogFilters,
  PaginatedResponse,
  ApiResponse,
  ActionType
} from '../types/rbac';

interface LogActionParams {
  userId?: number;
  actionType: ActionType;
  tableName: string;
  recordId: number;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
}

export class AuditService {
  private db: DatabaseService;

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  /**
   * Log an action to the audit trail
   */
  async logAction(params: LogActionParams): Promise<void> {
    try {
      const query = `
        INSERT INTO audit_log (user_id, action_type, table_name, record_id, old_value, new_value, ip_address)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;

      await this.db.query(query, [
        params.userId || null,
        params.actionType,
        params.tableName,
        params.recordId,
        params.oldValue ? JSON.stringify(params.oldValue) : null,
        params.newValue ? JSON.stringify(params.newValue) : null,
        params.ipAddress || null
      ]);
    } catch (error) {
      // Log to console but don't throw - audit failures shouldn't break main operations
      console.error('Failed to log audit action:', error);
    }
  }

  /**
   * Get audit logs with filtering and pagination
   */
  async getAuditLogs(filters: AuditLogFilters = {}): Promise<PaginatedResponse<AuditLog>> {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'timestamp',
        sortOrder = 'DESC',
        userId,
        actionType,
        tableName,
        startDate,
        endDate
      } = filters;

      let whereClause = 'WHERE 1=1';
      const params: any[] = [];
      let paramCount = 0;

      if (userId !== undefined) {
        whereClause += ` AND user_id = $${++paramCount}`;
        params.push(userId);
      }

      if (actionType) {
        whereClause += ` AND action_type = $${++paramCount}`;
        params.push(actionType);
      }

      if (tableName) {
        whereClause += ` AND table_name = $${++paramCount}`;
        params.push(tableName);
      }

      if (startDate) {
        whereClause += ` AND timestamp >= $${++paramCount}`;
        params.push(startDate);
      }

      if (endDate) {
        whereClause += ` AND timestamp <= $${++paramCount}`;
        params.push(endDate);
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) FROM audit_log ${whereClause}`;
      const countResult = await this.db.query(countQuery, params);
      const total = parseInt(countResult.rows[0].count);

      // Get paginated results
      const offset = (page - 1) * limit;
      const dataQuery = `
        SELECT al.*, u.username 
        FROM audit_log al
        LEFT JOIN users u ON al.user_id = u.id
        ${whereClause}
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT $${++paramCount} OFFSET $${++paramCount}
      `;
      params.push(limit, offset);

      const result = await this.db.query(dataQuery, params);
      const auditLogs = result.rows.map((row: any) => this.mapDbRowToAuditLog(row));

      return {
        success: true,
        data: auditLogs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error: any) {
      console.error('Error fetching audit logs:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch audit logs'
      };
    }
  }

  /**
   * Get audit log by ID
   */
  async getAuditLogById(id: number): Promise<ApiResponse<AuditLog>> {
    try {
      const query = `
        SELECT al.*, u.username 
        FROM audit_log al
        LEFT JOIN users u ON al.user_id = u.id
        WHERE al.id = $1
      `;
      const result = await this.db.query(query, [id]);

      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'Audit log entry not found'
        };
      }

      const auditLog = this.mapDbRowToAuditLog(result.rows[0]);
      return {
        success: true,
        data: auditLog
      };
    } catch (error: any) {
      console.error('Error fetching audit log:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch audit log'
      };
    }
  }

  /**
   * Get audit logs for a specific record
   */
  async getRecordHistory(tableName: string, recordId: number): Promise<ApiResponse<AuditLog[]>> {
    try {
      const query = `
        SELECT al.*, u.username 
        FROM audit_log al
        LEFT JOIN users u ON al.user_id = u.id
        WHERE al.table_name = $1 AND al.record_id = $2
        ORDER BY al.timestamp DESC
      `;
      
      const result = await this.db.query(query, [tableName, recordId]);
      const auditLogs = result.rows.map((row: any) => this.mapDbRowToAuditLog(row));

      return {
        success: true,
        data: auditLogs
      };
    } catch (error: any) {
      console.error('Error fetching record history:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch record history'
      };
    }
  }

  /**
   * Get user activity summary
   */
  async getUserActivity(userId: number, days: number = 30): Promise<ApiResponse<any>> {
    try {
      const query = `
        SELECT 
          action_type,
          table_name,
          COUNT(*) as action_count,
          MAX(timestamp) as last_action
        FROM audit_log 
        WHERE user_id = $1 
          AND timestamp >= NOW() - INTERVAL '${days} days'
        GROUP BY action_type, table_name
        ORDER BY action_count DESC
      `;
      
      const result = await this.db.query(query, [userId]);

      return {
        success: true,
        data: {
          userId,
          period: `${days} days`,
          activities: result.rows
        }
      };
    } catch (error: any) {
      console.error('Error fetching user activity:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch user activity'
      };
    }
  }

  /**
   * Get system activity statistics
   */
  async getSystemActivityStats(days: number = 7): Promise<ApiResponse<any>> {
    try {
      const query = `
        SELECT 
          DATE(timestamp) as date,
          action_type,
          COUNT(*) as count
        FROM audit_log 
        WHERE timestamp >= NOW() - INTERVAL '${days} days'
        GROUP BY DATE(timestamp), action_type
        ORDER BY date DESC, action_type
      `;
      
      const result = await this.db.query(query);

      // Get total counts by action type
      const totalQuery = `
        SELECT 
          action_type,
          COUNT(*) as total_count
        FROM audit_log 
        WHERE timestamp >= NOW() - INTERVAL '${days} days'
        GROUP BY action_type
        ORDER BY total_count DESC
      `;
      
      const totalResult = await this.db.query(totalQuery);

      return {
        success: true,
        data: {
          period: `${days} days`,
          dailyStats: result.rows,
          totalsByAction: totalResult.rows
        }
      };
    } catch (error: any) {
      console.error('Error fetching system activity stats:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch system activity stats'
      };
    }
  }

  /**
   * Clean up old audit logs (for maintenance)
   */
  async cleanupOldLogs(retentionDays: number = 365): Promise<ApiResponse<{ deletedCount: number }>> {
    try {
      const query = `
        DELETE FROM audit_log 
        WHERE timestamp < NOW() - INTERVAL '${retentionDays} days'
      `;
      
      const result = await this.db.query(query);

      return {
        success: true,
        data: { deletedCount: result.rowCount || 0 },
        message: `Cleaned up ${result.rowCount || 0} old audit log entries`
      };
    } catch (error: any) {
      console.error('Error cleaning up audit logs:', error);
      return {
        success: false,
        error: error.message || 'Failed to clean up audit logs'
      };
    }
  }

  /**
   * Map database row to AuditLog interface
   */
  private mapDbRowToAuditLog(row: any): AuditLog {
    return {
      id: row.id,
      userId: row.user_id,
      actionType: row.action_type,
      tableName: row.table_name,
      recordId: row.record_id,
      oldValue: row.old_value,
      newValue: row.new_value,
      timestamp: row.timestamp,
      ipAddress: row.ip_address
    };
  }
}
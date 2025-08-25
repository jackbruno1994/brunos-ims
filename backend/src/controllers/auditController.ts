import { Request, Response } from 'express';
import { AuditLog, AuditFilter, AuditExportOptions } from '../models';

// In-memory storage for demo purposes - in production this would be a database
let auditLogs: AuditLog[] = [];
let auditIdCounter = 1;

export class AuditController {
  // Get all audit logs with filtering and pagination
  static async getAuditLogs(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 50,
        startDate,
        endDate,
        userId,
        action,
        resource,
        severity,
        category,
        restaurantId,
        search
      } = req.query;

      let filteredLogs = [...auditLogs];

      // Apply filters
      if (startDate) {
        filteredLogs = filteredLogs.filter(log => 
          log.timestamp >= new Date(startDate as string)
        );
      }
      if (endDate) {
        filteredLogs = filteredLogs.filter(log => 
          log.timestamp <= new Date(endDate as string)
        );
      }
      if (userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === userId);
      }
      if (action) {
        filteredLogs = filteredLogs.filter(log => 
          log.action.toLowerCase().includes((action as string).toLowerCase())
        );
      }
      if (resource) {
        filteredLogs = filteredLogs.filter(log => 
          log.resource.toLowerCase().includes((resource as string).toLowerCase())
        );
      }
      if (severity) {
        const severityArray = Array.isArray(severity) ? severity : [severity];
        filteredLogs = filteredLogs.filter(log => 
          severityArray.includes(log.severity)
        );
      }
      if (category) {
        const categoryArray = Array.isArray(category) ? category : [category];
        filteredLogs = filteredLogs.filter(log => 
          categoryArray.includes(log.category)
        );
      }
      if (restaurantId) {
        filteredLogs = filteredLogs.filter(log => log.restaurantId === restaurantId);
      }
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        filteredLogs = filteredLogs.filter(log => 
          log.action.toLowerCase().includes(searchTerm) ||
          log.resource.toLowerCase().includes(searchTerm) ||
          log.userName.toLowerCase().includes(searchTerm) ||
          JSON.stringify(log.details).toLowerCase().includes(searchTerm)
        );
      }

      // Sort by timestamp (newest first)
      filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      // Pagination
      const pageNum = parseInt(page as string);
      const pageSize = parseInt(limit as string);
      const startIndex = (pageNum - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

      res.status(200).json({
        data: paginatedLogs,
        pagination: {
          page: pageNum,
          limit: pageSize,
          total: filteredLogs.length,
          totalPages: Math.ceil(filteredLogs.length / pageSize)
        }
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch audit logs',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Create a new audit log entry
  static async createAuditLog(req: Request, res: Response) {
    try {
      const auditData = req.body;
      
      const newAuditLog: AuditLog = {
        id: auditIdCounter.toString(),
        timestamp: new Date(),
        ...auditData,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };

      auditLogs.push(newAuditLog);
      auditIdCounter++;

      // Emit real-time update via WebSocket
      this.emitAuditUpdate(newAuditLog);

      res.status(201).json({
        message: 'Audit log created successfully',
        data: newAuditLog
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to create audit log',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get audit log by ID
  static async getAuditLogById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const auditLog = auditLogs.find(log => log.id === id);

      if (!auditLog) {
        res.status(404).json({
          error: 'Audit log not found',
          message: `No audit log found with id: ${id}`
        });
        return;
      }

      res.status(200).json({
        data: auditLog
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch audit log',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Export audit logs
  static async exportAuditLogs(req: Request, res: Response) {
    try {
      const exportOptions: AuditExportOptions = req.body;
      const { format, filters, includeDetails = true, fileName } = exportOptions;

      // Apply filters to get the data to export
      let filteredLogs = [...auditLogs];

      if (filters.startDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate!);
      }
      if (filters.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
      }
      if (filters.action) {
        filteredLogs = filteredLogs.filter(log => 
          log.action.toLowerCase().includes(filters.action!.toLowerCase())
        );
      }
      if (filters.resource) {
        filteredLogs = filteredLogs.filter(log => 
          log.resource.toLowerCase().includes(filters.resource!.toLowerCase())
        );
      }
      if (filters.severity && filters.severity.length > 0) {
        filteredLogs = filteredLogs.filter(log => 
          filters.severity!.includes(log.severity)
        );
      }
      if (filters.category && filters.category.length > 0) {
        filteredLogs = filteredLogs.filter(log => 
          filters.category!.includes(log.category)
        );
      }

      // Sort by timestamp
      filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      // Format data for export
      const exportData = filteredLogs.map(log => ({
        ID: log.id,
        Timestamp: log.timestamp.toISOString(),
        User: log.userName,
        'User ID': log.userId,
        Action: log.action,
        Resource: log.resource,
        'Resource ID': log.resourceId,
        Severity: log.severity,
        Category: log.category,
        'Restaurant ID': log.restaurantId || '',
        'IP Address': log.ipAddress || '',
        'User Agent': includeDetails ? log.userAgent || '' : '',
        Details: includeDetails ? JSON.stringify(log.details) : ''
      }));

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const defaultFileName = `audit-logs-${timestamp}`;

      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 
          `attachment; filename="${fileName || defaultFileName}.json"`);
        res.send(JSON.stringify(exportData, null, 2));
      } else if (format === 'csv') {
        // Simple CSV export
        const csvHeaders = Object.keys(exportData[0] || {}).join(',');
        const csvRows = exportData.map(row => 
          Object.values(row).map(value => 
            typeof value === 'string' && value.includes(',') 
              ? `"${value.replace(/"/g, '""')}"` 
              : value
          ).join(',')
        );
        const csvContent = [csvHeaders, ...csvRows].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 
          `attachment; filename="${fileName || defaultFileName}.csv"`);
        res.send(csvContent);
      } else {
        // Excel export will be implemented when we add the xlsx library
        res.status(501).json({
          error: 'Excel export not yet implemented',
          message: 'Excel export functionality will be added in the next phase'
        });
      }
    } catch (error) {
      res.status(500).json({
        error: 'Failed to export audit logs',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get audit statistics for dashboard
  static async getAuditStats(req: Request, res: Response) {
    try {
      const { period = '7d' } = req.query;
      
      let startDate: Date;
      const now = new Date();
      
      switch (period) {
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      const recentLogs = auditLogs.filter(log => log.timestamp >= startDate);
      
      const stats = {
        totalLogs: recentLogs.length,
        criticalAlerts: recentLogs.filter(log => log.severity === 'critical').length,
        highSeverity: recentLogs.filter(log => log.severity === 'high').length,
        topActions: AuditController.getTopActions(recentLogs),
        topUsers: AuditController.getTopUsers(recentLogs),
        severityBreakdown: AuditController.getSeverityBreakdown(recentLogs),
        categoryBreakdown: AuditController.getCategoryBreakdown(recentLogs),
        timelineData: AuditController.getTimelineData(recentLogs, period as string)
      };

      res.status(200).json({
        data: stats,
        period,
        dateRange: {
          start: startDate.toISOString(),
          end: now.toISOString()
        }
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch audit statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private static getTopActions(logs: AuditLog[], limit = 5) {
    const actionCounts = logs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(actionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([action, count]) => ({ action, count }));
  }

  private static getTopUsers(logs: AuditLog[], limit = 5) {
    const userCounts = logs.reduce((acc, log) => {
      acc[log.userName] = (acc[log.userName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(userCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([user, count]) => ({ user, count }));
  }

  private static getSeverityBreakdown(logs: AuditLog[]) {
    const severityCounts = logs.reduce((acc, log) => {
      acc[log.severity] = (acc[log.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { severity: 'critical', count: severityCounts.critical || 0 },
      { severity: 'high', count: severityCounts.high || 0 },
      { severity: 'medium', count: severityCounts.medium || 0 },
      { severity: 'low', count: severityCounts.low || 0 }
    ];
  }

  private static getCategoryBreakdown(logs: AuditLog[]) {
    const categoryCounts = logs.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }

  private static getTimelineData(logs: AuditLog[], period: string) {
    const buckets: Record<string, number> = {};
    const now = new Date();
    
    // Create time buckets based on period
    if (period === '24h') {
      // Hourly buckets for 24h
      for (let i = 23; i >= 0; i--) {
        const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
        const key = `${hour.getHours()}:00`;
        buckets[key] = 0;
      }
    } else if (period === '7d') {
      // Daily buckets for 7 days
      for (let i = 6; i >= 0; i--) {
        const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const key = day.toISOString().split('T')[0];
        buckets[key] = 0;
      }
    } else {
      // Daily buckets for 30 days
      for (let i = 29; i >= 0; i--) {
        const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const key = day.toISOString().split('T')[0];
        buckets[key] = 0;
      }
    }

    // Fill buckets with actual data
    logs.forEach(log => {
      let key: string;
      if (period === '24h') {
        key = `${log.timestamp.getHours()}:00`;
      } else {
        key = log.timestamp.toISOString().split('T')[0];
      }
      
      if (buckets.hasOwnProperty(key)) {
        buckets[key]++;
      }
    });

    return Object.entries(buckets).map(([time, count]) => ({ time, count }));
  }

  // Helper method to seed some sample data for testing
  static seedSampleData() {
    const sampleActions = ['login', 'logout', 'create_order', 'update_menu', 'delete_item', 'view_report'];
    const sampleResources = ['user', 'order', 'menu_item', 'restaurant', 'report'];
    const sampleUsers = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson'];
    const severities: ('low' | 'medium' | 'high' | 'critical')[] = ['low', 'medium', 'high', 'critical'];
    const categories: ('authentication' | 'authorization' | 'data_change' | 'system' | 'user_action')[] = 
      ['authentication', 'authorization', 'data_change', 'system', 'user_action'];

    // Generate sample data for the last 30 days
    for (let i = 0; i < 500; i++) {
      const randomDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      const action = sampleActions[Math.floor(Math.random() * sampleActions.length)];
      const resource = sampleResources[Math.floor(Math.random() * sampleResources.length)];
      const userName = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
      
      const auditLog: AuditLog = {
        id: auditIdCounter.toString(),
        timestamp: randomDate,
        userId: `user_${Math.floor(Math.random() * 100)}`,
        userName,
        action,
        resource,
        resourceId: `${resource}_${Math.floor(Math.random() * 1000)}`,
        details: {
          description: `${action} performed on ${resource}`,
          previousValue: i % 3 === 0 ? 'old_value' : null,
          newValue: i % 3 === 0 ? 'new_value' : null
        },
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Sample User Agent)',
        restaurantId: `restaurant_${Math.floor(Math.random() * 10)}`,
        severity: severities[Math.floor(Math.random() * severities.length)],
        category: categories[Math.floor(Math.random() * categories.length)]
      };

      auditLogs.push(auditLog);
      auditIdCounter++;
    }

    console.log(`Seeded ${auditLogs.length} sample audit logs`);
  }

  // WebSocket helper methods
  private static emitAuditUpdate(auditLog: AuditLog) {
    if (global.io) {
      // Emit to all clients in the audit-logs room
      global.io.to('audit-logs').emit('audit-log-created', {
        type: 'audit-log-created',
        data: auditLog,
        timestamp: new Date().toISOString()
      });

      // Emit statistics update
      global.io.to('audit-logs').emit('audit-stats-update', {
        type: 'audit-stats-update',
        message: 'Audit statistics updated',
        timestamp: new Date().toISOString()
      });

      console.log(`Real-time audit update emitted: ${auditLog.action} by ${auditLog.userName}`);
    }
  }

  // Simulate real-time audit events for demo purposes
  static startRealtimeSimulation() {
    const sampleActions = ['login', 'logout', 'create_order', 'update_menu', 'delete_item', 'view_report'];
    const sampleResources = ['user', 'order', 'menu_item', 'restaurant', 'report'];
    const sampleUsers = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson'];
    const severities: ('low' | 'medium' | 'high' | 'critical')[] = ['low', 'medium', 'high', 'critical'];
    const categories: ('authentication' | 'authorization' | 'data_change' | 'system' | 'user_action')[] = 
      ['authentication', 'authorization', 'data_change', 'system', 'user_action'];

    // Generate a new audit log every 10-30 seconds
    const generateRandomLog = () => {
      const action = sampleActions[Math.floor(Math.random() * sampleActions.length)];
      const resource = sampleResources[Math.floor(Math.random() * sampleResources.length)];
      const userName = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
      
      const auditLog: AuditLog = {
        id: auditIdCounter.toString(),
        timestamp: new Date(),
        userId: `user_${Math.floor(Math.random() * 100)}`,
        userName,
        action,
        resource,
        resourceId: `${resource}_${Math.floor(Math.random() * 1000)}`,
        details: {
          description: `${action} performed on ${resource}`,
          previousValue: Math.random() > 0.7 ? 'old_value' : null,
          newValue: Math.random() > 0.7 ? 'new_value' : null,
          realtime: true
        },
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Real-time User Agent)',
        restaurantId: `restaurant_${Math.floor(Math.random() * 10)}`,
        severity: severities[Math.floor(Math.random() * severities.length)],
        category: categories[Math.floor(Math.random() * categories.length)]
      };

      auditLogs.push(auditLog);
      auditIdCounter++;

      // Emit real-time update
      this.emitAuditUpdate(auditLog);

      console.log(`🔴 Real-time audit log generated: ${action} by ${userName}`);
    };

    // Start simulation with random intervals
    const scheduleNext = () => {
      const delay = Math.random() * 20000 + 10000; // 10-30 seconds
      setTimeout(() => {
        generateRandomLog();
        scheduleNext();
      }, delay);
    };

    scheduleNext();
    console.log('🔴 Real-time audit simulation started');
  }
}
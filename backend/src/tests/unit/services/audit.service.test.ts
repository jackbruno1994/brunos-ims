import { AuditService } from '../../../services/audit/audit.service';

describe('AuditService', () => {
  const service = AuditService.getInstance();

  beforeEach(() => {
    // Reset repository state for each test
    // In a real implementation, we would use a test database
  });

  describe('createAuditLog', () => {
    test('should create audit log with generated ID and timestamp', async () => {
      const logData = {
        action: 'CREATE',
        entityType: 'user',
        entityId: 'user123',
        userId: 'admin',
        changes: { name: 'John Doe' }
      };

      const auditLog = await service.createAuditLog(logData);

      expect(auditLog.id).toBeDefined();
      expect(auditLog.action).toBe('CREATE');
      expect(auditLog.entityType).toBe('user');
      expect(auditLog.entityId).toBe('user123');
      expect(auditLog.userId).toBe('admin');
      expect(auditLog.changes).toEqual({ name: 'John Doe' });
      expect(auditLog.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('getAuditLogs', () => {
    test('should return paginated audit logs', async () => {
      // Create some test data
      await service.createAuditLog({
        action: 'CREATE',
        entityType: 'user',
        entityId: 'user1',
        userId: 'admin',
        changes: {}
      });

      const result = await service.getAuditLogs({ limit: 10, offset: 0 });

      expect(result.logs).toBeInstanceOf(Array);
      expect(result.total).toBeGreaterThanOrEqual(1);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
    });
  });

  describe('exportToCsv', () => {
    test('should export audit logs to CSV format', async () => {
      await service.createAuditLog({
        action: 'CREATE',
        entityType: 'user',
        entityId: 'user1',
        userId: 'admin',
        changes: {}
      });

      const csv = await service.exportToCsv({});

      expect(csv).toContain('"id","action","entityType","entityId","userId","timestamp"');
      expect(csv).toContain('CREATE');
      expect(csv).toContain('user');
    });
  });

  describe('generateVisualizationData', () => {
    test('should generate visualization data', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-12-31');

      await service.createAuditLog({
        action: 'CREATE',
        entityType: 'user',
        entityId: 'user1',
        userId: 'admin',
        changes: {}
      });

      const data = await service.generateVisualizationData({
        startDate,
        endDate
      });

      expect(data.actionDistribution).toHaveProperty('labels');
      expect(data.actionDistribution).toHaveProperty('data');
      expect(data.userActivity).toHaveProperty('labels');
      expect(data.userActivity).toHaveProperty('data');
      expect(data.timeline).toHaveProperty('labels');
      expect(data.timeline).toHaveProperty('data');
    });
  });
});
import { AuditService } from '../../../services/audit/audit.service';

describe('AuditService', () => {
  const service = AuditService.getInstance();

  // Mock console.log to avoid cluttering test output
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getInstance', () => {
    test('should return same instance (singleton)', () => {
      const instance1 = AuditService.getInstance();
      const instance2 = AuditService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('logAudit', () => {
    test('should create audit log with correct properties', async () => {
      const log = await service.logAudit(
        'CREATE',
        'permission',
        '123',
        'user1',
        { name: 'test' }
      );

      expect(log).toHaveProperty('id');
      expect(log.action).toBe('CREATE');
      expect(log.entityType).toBe('permission');
      expect(log.entityId).toBe('123');
      expect(log.userId).toBe('user1');
      expect(log.changes).toEqual({ name: 'test' });
      expect(log.timestamp).toBeInstanceOf(Date);
    });

    test('should generate unique IDs for different audit logs', async () => {
      const log1 = await service.logAudit(
        'CREATE',
        'permission',
        '123',
        'user1',
        { name: 'test1' }
      );

      const log2 = await service.logAudit(
        'UPDATE',
        'role',
        '456',
        'user2',
        { name: 'test2' }
      );

      expect(log1.id).not.toBe(log2.id);
    });

    test('should log to console', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      await service.logAudit(
        'CREATE',
        'permission',
        '123',
        'user1',
        { name: 'test' }
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        'Audit Log:',
        expect.stringContaining('"action": "CREATE"')
      );
    });
  });
});
import { AuditService } from '../../../services/audit/audit.service';
import { AuditRepository } from '../../../database/repositories/audit.repository';
import { AuditLog } from '../../../types/audit.types';

jest.mock('../../../database/repositories/audit.repository');

describe('AuditService', () => {
  let service: AuditService;
  let mockRepository: jest.Mocked<AuditRepository>;

  beforeEach(() => {
    mockRepository = {
      createAuditLog: jest.fn(),
      getAuditLogs: jest.fn(),
      getEntityAuditTrail: jest.fn()
    } as unknown as jest.Mocked<AuditRepository>;

    (AuditRepository.getInstance as jest.Mock).mockReturnValue(mockRepository);
    service = AuditService.getInstance();
  });

  describe('generateAuditReport', () => {
    const mockLogs: AuditLog[] = [
      {
        id: '1',
        action: 'CREATE',
        entityType: 'permission',
        entityId: 'perm1',
        userId: 'user1',
        changes: {},
        timestamp: new Date()
      },
      {
        id: '2',
        action: 'UPDATE',
        entityType: 'permission',
        entityId: 'perm1',
        userId: 'user2',
        changes: {},
        timestamp: new Date()
      },
      {
        id: '3',
        action: 'DELETE',
        entityType: 'role',
        entityId: 'role1',
        userId: 'user1',
        changes: {},
        timestamp: new Date()
      }
    ];

    test('should generate correct report statistics', async () => {
      mockRepository.getAuditLogs.mockResolvedValue({
        logs: mockLogs,
        total: mockLogs.length
      });

      const report = await service.generateAuditReport({
        startDate: new Date(),
        endDate: new Date()
      });

      expect(report.totalActions).toBe(3);
      expect(report.actionsByType).toEqual({
        CREATE: 1,
        UPDATE: 1,
        DELETE: 1
      });
      expect(report.actionsByUser).toEqual({
        user1: 2,
        user2: 1
      });
      expect(report.mostAffectedEntities).toContainEqual({
        entityId: 'perm1',
        count: 2
      });
    });
  });
});
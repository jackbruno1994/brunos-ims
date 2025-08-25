import ExportUtil from '../../../utils/export';
import { AuditLog } from '../../../types/audit.types';

describe('ExportUtil', () => {
  const util = ExportUtil.getInstance();
  const mockLogs: AuditLog[] = [
    {
      id: '1',
      action: 'CREATE',
      entityType: 'permission',
      entityId: 'perm1',
      userId: 'user1',
      changes: {},
      timestamp: new Date('2025-08-25T09:30:16Z')
    }
  ];

  describe('exportToCsv', () => {
    test('should generate valid CSV', () => {
      const csv = util.exportToCsv(mockLogs);
      expect(csv).toContain('"id","action","entityType","entityId","userId","timestamp"');
      expect(csv).toContain('"1","CREATE","permission","perm1","user1"');
    });
  });

  describe('exportToPdf', () => {
    test('should generate valid PDF buffer', async () => {
      const pdf = await util.exportToPdf(mockLogs);
      expect(pdf).toBeInstanceOf(Buffer);
      expect(pdf.length).toBeGreaterThan(0);
    });
  });
});
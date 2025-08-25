import { Router } from 'express';
import { AuditController } from '../controllers/audit/audit.controller';
import { authMiddleware } from '../middleware/auth';
import { validatePermission } from '../middleware/rbac';

const router = Router();
const controller = new AuditController();

router.use(authMiddleware);

// Export to CSV
router.get(
  '/export/csv',
  validatePermission({ resource: 'audit_logs', action: 'READ' }),
  controller.exportToCsv
);

// Export to PDF
router.get(
  '/export/pdf',
  validatePermission({ resource: 'audit_logs', action: 'READ' }),
  controller.exportToPdf
);

// Get visualization data
router.get(
  '/visualization',
  validatePermission({ resource: 'audit_logs', action: 'READ' }),
  controller.getVisualizationData
);

// Get audit logs with filters
router.get(
  '/',
  validatePermission({ resource: 'audit_logs', action: 'READ' }),
  controller.getAuditLogs
);

// Get specific audit log by ID
router.get(
  '/:id',
  validatePermission({ resource: 'audit_logs', action: 'READ' }),
  controller.getAuditLogById
);

// Create new audit log
router.post(
  '/',
  validatePermission({ resource: 'audit_logs', action: 'CREATE' }),
  controller.createAuditLog
);

export default router;
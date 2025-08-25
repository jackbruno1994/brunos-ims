import { Router } from 'express';
import { AuditController } from '../controllers/audit/audit.controller';
import { authMiddleware } from '../middleware/auth';
import { validatePermission } from '../middleware/rbac';

const router = Router();
const controller = new AuditController();

router.use(authMiddleware);

router.get(
  '/logs',
  validatePermission({ resource: 'audit_logs', action: 'READ' }),
  controller.getAuditLogs
);

router.get(
  '/trail/:entityType/:entityId',
  validatePermission({ resource: 'audit_logs', action: 'READ' }),
  controller.getEntityAuditTrail
);

router.get(
  '/report',
  validatePermission({ resource: 'audit_logs', action: 'READ' }),
  controller.generateReport
);

export default router;
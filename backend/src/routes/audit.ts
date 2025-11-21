import { Router } from 'express';
import { auditController } from '../controllers/auditController';
import { requireManager } from '../middleware/auth';

const router = Router();

// Audit log routes - require manager level access or higher
router.get('/logs', requireManager, auditController.getAuditLogs);
router.get('/summary', requireManager, auditController.getAuditSummary);

// User activity tracking - managers can view any user, staff can view their own
router.get('/users/:userId/activity', requireManager, auditController.getUserActivity);

// Entity history tracking - managers can view entity history
router.get('/entities/:entityType/:entityId/history', requireManager, auditController.getEntityHistory);

export default router;
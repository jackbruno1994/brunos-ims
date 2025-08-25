import { Router } from 'express';
import { RestaurantController, AuditController } from '../controllers';

const router = Router();

// Restaurant routes
router.get('/restaurants', RestaurantController.getAllRestaurants);
router.post('/restaurants', RestaurantController.createRestaurant);

// Audit System Routes

// Audit Logs
router.get('/audit/logs', AuditController.getAuditLogs);
router.post('/audit/logs', AuditController.createAuditLog);

// Analytics and Intelligence
router.get('/audit/analytics', AuditController.getAnalytics);
router.get('/audit/analytics/predictive', AuditController.getPredictiveAnalytics);

// Security Events
router.get('/audit/security/events', AuditController.getSecurityEvents);
router.post('/audit/security/events', AuditController.createSecurityEvent);

// Compliance and Governance
router.get('/audit/compliance/reports', AuditController.getComplianceReports);
router.post('/audit/compliance/reports/generate', AuditController.generateComplianceReport);

// Investigations
router.get('/audit/investigations', AuditController.getInvestigations);
router.post('/audit/investigations', AuditController.createInvestigation);

// Advanced Search
router.post('/audit/search', AuditController.searchAuditData);

// Integrations
router.get('/audit/integrations', AuditController.getIntegrations);

// Performance and Metrics
router.get('/audit/metrics', AuditController.getPerformanceMetrics);

// Dashboard
router.get('/audit/dashboard', AuditController.getDashboardSummary);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Bruno\'s IMS API',
    timestamp: new Date().toISOString()
  });
});

export default router;
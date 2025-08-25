import request from 'supertest';

// Mock the AuditService first before any imports that use it
const mockAuditService = {
  getAuditLogs: jest.fn(),
  generateAuditReport: jest.fn(),
  getEntityAuditTrail: jest.fn(),
  logAudit: jest.fn()
};

jest.mock('../../services/audit/audit.service', () => ({
  AuditService: {
    getInstance: () => mockAuditService
  }
}));

// Mock the database connection
jest.mock('../../database/connection', () => ({
  default: {
    raw: jest.fn(),
    schema: {
      createTable: jest.fn()
    }
  }
}));

import app from '../../app';

describe('Audit API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/audit/logs', () => {
    it('should return 200 for authenticated request', async () => {
      mockAuditService.getAuditLogs.mockResolvedValue({
        logs: [],
        total: 0
      });

      const response = await request(app)
        .get('/api/audit/logs');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('logs');
      expect(response.body).toHaveProperty('total');
    });
  });

  describe('GET /api/audit/report', () => {
    it('should return 400 when missing required dates', async () => {
      const response = await request(app)
        .get('/api/audit/report');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Start date and end date are required');
    });

    it('should return 200 with valid date range', async () => {
      mockAuditService.generateAuditReport.mockResolvedValue({
        totalActions: 0,
        actionsByType: {},
        actionsByUser: {},
        mostAffectedEntities: []
      });

      const startDate = new Date().toISOString();
      const endDate = new Date().toISOString();
      
      const response = await request(app)
        .get(`/api/audit/report?startDate=${startDate}&endDate=${endDate}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalActions');
      expect(response.body).toHaveProperty('actionsByType');
      expect(response.body).toHaveProperty('actionsByUser');
      expect(response.body).toHaveProperty('mostAffectedEntities');
    });
  });
});
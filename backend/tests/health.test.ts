import { HealthCheckService } from '../src/services/healthCheck';
import { DatabaseMonitor } from '../src/utils/monitoring';
import prisma from '../src/lib/db';

describe('Health Check System', () => {
  let healthCheckService: HealthCheckService;
  let monitor: DatabaseMonitor;

  beforeEach(() => {
    healthCheckService = new HealthCheckService(prisma);
    monitor = new DatabaseMonitor();
  });

  afterEach(() => {
    monitor.stopMonitoring();
  });

  describe('HealthCheckService', () => {
    it('should return healthy status when database is available', async () => {
      const result = await healthCheckService.checkDatabaseHealth();
      
      expect(result.status).toBe('healthy');
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.details.database.status).toBe('up');
      expect(result.details.database.responseTime).toBeGreaterThan(0);
      expect(result.details.database.connectionPool.total).toBe(5);
      expect(result.details.database.connectionPool.active).toBeGreaterThan(0);
      expect(result.details.database.connectionPool.idle).toBeGreaterThanOrEqual(0);
    });

    it('should return proper health check result structure', async () => {
      const result = await healthCheckService.checkDatabaseHealth();
      
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('details');
      expect(result.details).toHaveProperty('database');
      expect(result.details.database).toHaveProperty('status');
      expect(result.details.database).toHaveProperty('responseTime');
      expect(result.details.database).toHaveProperty('connectionPool');
      expect(result.details.database.connectionPool).toHaveProperty('total');
      expect(result.details.database.connectionPool).toHaveProperty('active');
      expect(result.details.database.connectionPool).toHaveProperty('idle');
    });
  });

  describe('DatabaseMonitor', () => {
    it('should start and stop monitoring correctly', () => {
      expect(() => monitor.startMonitoring(1000)).not.toThrow();
      expect(() => monitor.stopMonitoring()).not.toThrow();
    });

    it('should perform single health check', async () => {
      const result = await monitor.performSingleCheck();
      
      expect(result.status).toBe('healthy');
      expect(result.details.database.status).toBe('up');
    });
  });
});
import { HealthCheckService } from '../src/services/healthCheck';

// Mock database client that always throws errors
class FailingDatabaseClient {
  async $queryRaw(_query: any): Promise<any> {
    throw new Error('Database connection failed');
  }

  async $disconnect(): Promise<void> {
    return Promise.resolve();
  }
}

describe('Health Check Error Handling', () => {
  it('should return unhealthy status when database is unavailable', async () => {
    const failingDb = new FailingDatabaseClient();
    const healthCheckService = new HealthCheckService(failingDb as any);
    
    const result = await healthCheckService.checkDatabaseHealth();
    
    expect(result.status).toBe('unhealthy');
    expect(result.timestamp).toBeInstanceOf(Date);
    expect(result.details.database.status).toBe('down');
    expect(result.details.database.responseTime).toBeGreaterThanOrEqual(0);
    expect(result.details.database.connectionPool.total).toBe(0);
    expect(result.details.database.connectionPool.active).toBe(0);
    expect(result.details.database.connectionPool.idle).toBe(0);
  });
});
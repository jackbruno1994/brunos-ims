import { db } from '../src/database';

describe('Database Connection', () => {
  beforeAll(async () => {
    // You can add database setup here if needed
  });

  afterAll(async () => {
    await db.disconnect();
  });

  it('should connect to database successfully', async () => {
    const isConnected = await db.testConnection();
    expect(isConnected).toBe(true);
  });

  it('should perform health check', async () => {
    const health = await db.healthCheck();
    expect(health).toHaveProperty('database');
    expect(health).toHaveProperty('prisma');
    expect(health).toHaveProperty('pool');
  });

  it('should handle database operations safely', async () => {
    const { safeDatabaseOperation } = await import('../src/database');
    
    const result = await safeDatabaseOperation(async () => {
      return { test: 'data' };
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ test: 'data' });
  });
});
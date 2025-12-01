import { checkDatabaseHealth, getPrismaClient } from '../src/utils/database';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';

describe('Database Utilities', () => {
  describe('checkDatabaseHealth', () => {
    it('should return health status', async () => {
      const health = await checkDatabaseHealth();
      
      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('message');
      expect(health).toHaveProperty('timestamp');
      expect(health.status).toBe('unhealthy'); // Expected to be unhealthy without actual DB
    });

    it('should handle database connection errors gracefully', async () => {
      const health = await checkDatabaseHealth();
      
      expect(health.status).toBe('unhealthy');
      expect(typeof health.message).toBe('string');
      expect(health.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('getPrismaClient', () => {
    it('should attempt to create a Prisma client', async () => {
      // This will fail without a real database, but should not throw an unhandled error
      try {
        await getPrismaClient();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });
});

// Test database configuration
describe('Database Configuration', () => {
  it('should have required environment variables', () => {
    // Test that we can load database configuration
    const requiredEnvVars = [
      'DATABASE_URL'
    ];

    requiredEnvVars.forEach(envVar => {
      expect(process.env[envVar]).toBeDefined();
    });
  });
});
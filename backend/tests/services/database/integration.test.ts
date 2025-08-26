/**
 * Integration tests to validate specific scenarios
 */

import { createDatabaseConfig, DatabaseConnection } from '../../../src/services/database';

describe('Database Integration Tests', () => {
  describe('Configuration Security', () => {
    it('should require all environment variables', () => {
      const incompleteEnv = {
        DB_HOST: 'localhost',
        DB_PORT: '5432',
        // Missing DB_NAME, DB_USER, DB_PASSWORD
      };

      expect(() => createDatabaseConfig(incompleteEnv)).toThrow(
        'Missing required environment variables: DB_NAME, DB_USER, DB_PASSWORD'
      );
    });

    it('should validate port ranges', () => {
      const invalidPorts = ['0', '-1', '65536', '70000'];
      
      invalidPorts.forEach(port => {
        const env = {
          DB_HOST: 'localhost',
          DB_PORT: port,
          DB_NAME: 'test',
          DB_USER: 'user',
          DB_PASSWORD: 'pass',
        };

        expect(() => createDatabaseConfig(env)).toThrow(/Invalid DB_PORT/);
      });
    });

    it('should reject invalid SSL configurations', () => {
      const env = {
        DB_HOST: 'localhost',
        DB_PORT: '5432',
        DB_NAME: 'test',
        DB_USER: 'user',
        DB_PASSWORD: 'pass',
        DB_SSL: 'maybe', // Invalid SSL value
      };

      expect(() => createDatabaseConfig(env)).toThrow(
        "Invalid DB_SSL value: maybe. Use 'true', 'false', or 'require'."
      );
    });
  });

  describe('Connection Pool Management', () => {
    it('should prevent double initialization', async () => {
      const connection = new DatabaseConnection();
      
      // Mock successful initialization
      const mockPool = {
        on: jest.fn(),
        connect: jest.fn().mockResolvedValue({
          query: jest.fn().mockResolvedValue({ rows: [{ '?column?': 1 }] }),
          release: jest.fn(),
        }),
        end: jest.fn(),
      };

      jest.doMock('pg', () => ({
        Pool: jest.fn(() => mockPool),
      }));

      jest.doMock('../../../src/services/database/config', () => ({
        getDatabaseConfig: () => ({
          host: 'localhost',
          port: 5432,
          database: 'test',
          user: 'user',
          password: 'pass',
          ssl: false,
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 10000,
        }),
        toPgPoolConfig: (config: any) => config,
      }));

      await connection.initialize();
      
      // Should throw on second initialization
      await expect(connection.initialize()).rejects.toThrow(
        'Database connection pool is already initialized'
      );
      
      await connection.close();
    });
  });

  describe('Error Classification', () => {
    it('should identify non-retryable errors correctly', () => {
      const connection = new DatabaseConnection();
      
      // Access private method for testing
      const isNonRetryable = (connection as any).isNonRetryableError.bind(connection);
      
      // Non-retryable errors
      expect(isNonRetryable(new Error('syntax error at or near "SELECT"'))).toBe(true);
      expect(isNonRetryable(new Error('permission denied for table users'))).toBe(true);
      expect(isNonRetryable(new Error('authentication failed for user "test"'))).toBe(true);
      expect(isNonRetryable(new Error('database "nonexistent" does not exist'))).toBe(true);
      expect(isNonRetryable(new Error('relation "missing_table" does not exist'))).toBe(true);
      expect(isNonRetryable(new Error('column "bad_column" does not exist'))).toBe(true);
      
      // Retryable errors
      expect(isNonRetryable(new Error('connection terminated unexpectedly'))).toBe(false);
      expect(isNonRetryable(new Error('could not connect to server'))).toBe(false);
      expect(isNonRetryable(new Error('timeout expired'))).toBe(false);
    });
  });

  describe('Transaction Management', () => {
    it('should handle transaction rollback scenarios', async () => {
      const connection = new DatabaseConnection();
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };

      // Mock pool
      const mockPool = {
        on: jest.fn(),
        connect: jest.fn().mockResolvedValue(mockClient),
        end: jest.fn(),
      };

      jest.doMock('pg', () => ({
        Pool: jest.fn(() => mockPool),
      }));

      jest.doMock('../../../src/services/database/config', () => ({
        getDatabaseConfig: () => ({
          host: 'localhost',
          port: 5432,
          database: 'test',
          user: 'user',
          password: 'pass',
          ssl: false,
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 10000,
        }),
        toPgPoolConfig: (config: any) => config,
      }));

      // Setup mock responses
      mockClient.query
        .mockResolvedValueOnce({ rows: [{ '?column?': 1 }] }) // Connection test
        .mockResolvedValueOnce({}) // BEGIN
        .mockRejectedValueOnce(new Error('Query failed')) // Failed query
        .mockResolvedValueOnce({}); // ROLLBACK

      await connection.initialize();

      const transactionCallback = jest.fn().mockImplementation(async (query) => {
        await query('INVALID SQL');
      });

      await expect(connection.transaction(transactionCallback)).rejects.toThrow('Query failed');
      
      // Verify proper transaction cleanup
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
      
      await connection.close();
    });
  });
});
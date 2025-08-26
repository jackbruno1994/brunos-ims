/**
 * Tests for database connection module
 */

import { Pool } from 'pg';
import { DatabaseConnection } from '../../../src/services/database/connection';

// Mock the pg module
jest.mock('pg', () => ({
  Pool: jest.fn(),
}));

// Mock the config module
jest.mock('../../../src/services/database/config', () => ({
  getDatabaseConfig: jest.fn().mockReturnValue({
    host: 'localhost',
    port: 5432,
    database: 'test_db',
    user: 'test_user',
    password: 'test_password',
    ssl: false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  }),
  toPgPoolConfig: jest.fn().mockReturnValue({
    host: 'localhost',
    port: 5432,
    database: 'test_db',
    user: 'test_user',
    password: 'test_password',
    ssl: false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 0,
  }),
}));

const MockedPool = Pool as jest.MockedClass<typeof Pool>;

describe('DatabaseConnection', () => {
  let connection: DatabaseConnection;
  let mockPool: any;
  let mockClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    connection = new DatabaseConnection();
    
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };

    mockPool = {
      query: jest.fn(),
      connect: jest.fn().mockResolvedValue(mockClient),
      end: jest.fn(),
      on: jest.fn(),
      totalCount: 10,
      idleCount: 5,
      waitingCount: 2,
    };

    MockedPool.mockImplementation(() => mockPool);
  });

  describe('initialize', () => {
    it('should initialize pool successfully', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] });

      await connection.initialize();

      expect(Pool).toHaveBeenCalledWith({
        host: 'localhost',
        port: 5432,
        database: 'test_db',
        user: 'test_user',
        password: 'test_password',
        ssl: false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        keepAlive: true,
        keepAliveInitialDelayMillis: 0,
      });

      expect(mockPool.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith('SELECT 1');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should throw error if already initialized', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] });
      await connection.initialize();

      await expect(connection.initialize()).rejects.toThrow(
        'Database connection pool is already initialized'
      );
    });

    it('should throw error if connection test fails', async () => {
      mockClient.query.mockRejectedValueOnce(new Error('Connection failed'));

      await expect(connection.initialize()).rejects.toThrow(
        'Database connection test failed: Error: Connection failed'
      );
    });
  });

  describe('query', () => {
    beforeEach(async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] });
      await connection.initialize();
    });

    it('should execute query successfully', async () => {
      const mockResult = { rows: [{ id: 1, name: 'test' }] };
      mockPool.query.mockResolvedValueOnce(mockResult);

      const result = await connection.query('SELECT * FROM test', [1]);

      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM test', [1]);
      expect(result).toBe(mockResult);
    });

    it('should throw error if pool not initialized', async () => {
      const uninitializedConnection = new DatabaseConnection();

      await expect(
        uninitializedConnection.query('SELECT 1')
      ).rejects.toThrow('Database pool not initialized. Call initialize() first.');
    });

    it('should retry on connection errors', async () => {
      const connectionError = new Error('connection terminated');
      const successResult = { rows: [{ id: 1 }] };

      mockPool.query
        .mockRejectedValueOnce(connectionError)
        .mockRejectedValueOnce(connectionError)
        .mockResolvedValueOnce(successResult);

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await connection.query('SELECT 1');

      expect(result).toBe(successResult);
      expect(mockPool.query).toHaveBeenCalledTimes(3);
      expect(consoleSpy).toHaveBeenCalledTimes(2);

      consoleSpy.mockRestore();
    });

    it('should not retry syntax errors', async () => {
      const syntaxError = new Error('syntax error at or near "INVALID"');
      mockPool.query.mockRejectedValueOnce(syntaxError);

      await expect(connection.query('INVALID QUERY')).rejects.toThrow(syntaxError);
      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });

    it('should fail after max retries', async () => {
      const connectionError = new Error('connection terminated');
      mockPool.query.mockRejectedValue(connectionError);

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      await expect(connection.query('SELECT 1')).rejects.toThrow(connectionError);
      expect(mockPool.query).toHaveBeenCalledTimes(4); // 1 initial + 3 retries

      consoleSpy.mockRestore();
    });
  });

  describe('getClient', () => {
    beforeEach(async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] });
      await connection.initialize();
    });

    it('should return client from pool', async () => {
      const client = await connection.getClient();

      expect(mockPool.connect).toHaveBeenCalled();
      expect(client).toBe(mockClient);
    });

    it('should throw error if pool not initialized', async () => {
      const uninitializedConnection = new DatabaseConnection();

      await expect(uninitializedConnection.getClient()).rejects.toThrow(
        'Database pool not initialized. Call initialize() first.'
      );
    });
  });

  describe('transaction', () => {
    beforeEach(async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] });
      await connection.initialize();
    });

    it('should execute transaction successfully', async () => {
      const mockResult = { rows: [{ id: 1 }] };
      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce(mockResult) // User query
        .mockResolvedValueOnce({}); // COMMIT

      const callback = jest.fn().mockResolvedValue('success');

      const result = await connection.transaction(callback);

      expect(result).toBe('success');
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should rollback on error', async () => {
      const error = new Error('Transaction error');
      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockRejectedValueOnce(error) // User query fails
        .mockResolvedValueOnce({}); // ROLLBACK

      const callback = jest.fn().mockImplementation(async (query) => {
        await query('SELECT * FROM test');
      });

      await expect(connection.transaction(callback)).rejects.toThrow(error);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('getPoolStatus', () => {
    it('should return null if pool not initialized', () => {
      const status = connection.getPoolStatus();
      expect(status).toBeNull();
    });

    it('should return pool status if initialized', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] });
      await connection.initialize();

      const status = connection.getPoolStatus();

      expect(status).toEqual({
        totalCount: 10,
        idleCount: 5,
        waitingCount: 2,
      });
    });
  });

  describe('close', () => {
    it('should close pool if initialized', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] });
      await connection.initialize();

      await connection.close();

      expect(mockPool.end).toHaveBeenCalled();
    });

    it('should not error if pool not initialized', async () => {
      await expect(connection.close()).resolves.not.toThrow();
    });
  });
});
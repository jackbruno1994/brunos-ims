/**
 * Tests for database configuration module
 */

import { createDatabaseConfig, toPgPoolConfig, DatabaseConfig } from '../../../src/services/database/config';

describe('Database Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('createDatabaseConfig', () => {
    const validEnv = {
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_NAME: 'test_db',
      DB_USER: 'test_user',
      DB_PASSWORD: 'test_password',
    };

    it('should create config with valid environment variables', () => {
      const config = createDatabaseConfig(validEnv);

      expect(config).toEqual({
        host: 'localhost',
        port: 5432,
        database: 'test_db',
        user: 'test_user',
        password: 'test_password',
        ssl: false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });
    });

    it('should throw error for missing required variables', () => {
      const invalidEnv: Partial<typeof validEnv> = { ...validEnv };
      delete (invalidEnv as any).DB_HOST;

      expect(() => createDatabaseConfig(invalidEnv as any)).toThrow(
        'Missing required environment variables: DB_HOST'
      );
    });

    it('should throw error for multiple missing variables', () => {
      const invalidEnv: Partial<typeof validEnv> = { ...validEnv };
      delete (invalidEnv as any).DB_HOST;
      delete (invalidEnv as any).DB_PORT;

      expect(() => createDatabaseConfig(invalidEnv as any)).toThrow(
        'Missing required environment variables: DB_HOST, DB_PORT'
      );
    });

    it('should throw error for invalid port', () => {
      const invalidEnv = { ...validEnv, DB_PORT: 'invalid' };

      expect(() => createDatabaseConfig(invalidEnv)).toThrow(
        'Invalid DB_PORT: invalid. Must be a valid port number.'
      );
    });

    it('should throw error for port out of range', () => {
      const invalidEnv = { ...validEnv, DB_PORT: '70000' };

      expect(() => createDatabaseConfig(invalidEnv)).toThrow(
        'Invalid DB_PORT: 70000. Must be a valid port number.'
      );
    });

    it('should handle SSL configuration', () => {
      const envWithSslTrue = { ...validEnv, DB_SSL: 'true' };
      const configTrue = createDatabaseConfig(envWithSslTrue);
      expect(configTrue.ssl).toBe(true);

      const envWithSslRequire = { ...validEnv, DB_SSL: 'require' };
      const configRequire = createDatabaseConfig(envWithSslRequire);
      expect(configRequire.ssl).toEqual({ rejectUnauthorized: false });

      const envWithSslFalse = { ...validEnv, DB_SSL: 'false' };
      const configFalse = createDatabaseConfig(envWithSslFalse);
      expect(configFalse.ssl).toBe(false);
    });

    it('should throw error for invalid SSL value', () => {
      const invalidEnv = { ...validEnv, DB_SSL: 'invalid' };

      expect(() => createDatabaseConfig(invalidEnv)).toThrow(
        "Invalid DB_SSL value: invalid. Use 'true', 'false', or 'require'."
      );
    });

    it('should parse optional configuration values', () => {
      const envWithOptional = {
        ...validEnv,
        DB_MAX_CONNECTIONS: '10',
        DB_IDLE_TIMEOUT: '20000',
        DB_CONNECTION_TIMEOUT: '5000',
      };

      const config = createDatabaseConfig(envWithOptional);

      expect(config.max).toBe(10);
      expect(config.idleTimeoutMillis).toBe(20000);
      expect(config.connectionTimeoutMillis).toBe(5000);
    });

    it('should throw error for invalid max connections', () => {
      const invalidEnv = { ...validEnv, DB_MAX_CONNECTIONS: '0' };

      expect(() => createDatabaseConfig(invalidEnv)).toThrow(
        'Invalid DB_MAX_CONNECTIONS: 0. Must be > 0.'
      );
    });
  });

  describe('toPgPoolConfig', () => {
    it('should convert DatabaseConfig to PoolConfig', () => {
      const config: DatabaseConfig = {
        host: 'localhost',
        port: 5432,
        database: 'test_db',
        user: 'test_user',
        password: 'test_password',
        ssl: false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      };

      const poolConfig = toPgPoolConfig(config);

      expect(poolConfig).toEqual({
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
    });

    it('should handle SSL object configuration', () => {
      const config: DatabaseConfig = {
        host: 'localhost',
        port: 5432,
        database: 'test_db',
        user: 'test_user',
        password: 'test_password',
        ssl: { rejectUnauthorized: false },
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      };

      const poolConfig = toPgPoolConfig(config);

      expect(poolConfig.ssl).toEqual({ rejectUnauthorized: false });
    });
  });
});
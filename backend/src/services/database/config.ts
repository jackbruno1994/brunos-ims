import { PoolConfig } from 'pg';

/**
 * Database configuration interface
 */
export interface DatabaseConfig extends PoolConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  // Connection pool settings
  min?: number;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
  // Additional settings
  ssl?: boolean | object;
  application_name?: string;
}

/**
 * Retry configuration for database operations
 */
export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

/**
 * Health check configuration
 */
export interface HealthCheckConfig {
  timeoutMs: number;
  queryTimeoutMs: number;
}

/**
 * Complete database service configuration
 */
export interface DatabaseServiceConfig {
  database: DatabaseConfig;
  retry: RetryConfig;
  healthCheck: HealthCheckConfig;
  enableLogging: boolean;
}

/**
 * Create database configuration from environment variables
 */
export function createDatabaseConfig(): DatabaseConfig {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'brunos_ims',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    // Connection pool settings
    min: parseInt(process.env.DB_POOL_MIN || '2', 10),
    max: parseInt(process.env.DB_POOL_MAX || '10', 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000', 10),
    // SSL configuration
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    // Application name for connection tracking
    application_name: process.env.DB_APP_NAME || 'brunos-ims-backend',
  };
}

/**
 * Create retry configuration from environment variables
 */
export function createRetryConfig(): RetryConfig {
  return {
    maxRetries: parseInt(process.env.DB_MAX_RETRIES || '3', 10),
    initialDelayMs: parseInt(process.env.DB_RETRY_INITIAL_DELAY || '1000', 10),
    maxDelayMs: parseInt(process.env.DB_RETRY_MAX_DELAY || '10000', 10),
    backoffMultiplier: parseFloat(process.env.DB_RETRY_BACKOFF_MULTIPLIER || '2'),
  };
}

/**
 * Create health check configuration from environment variables
 */
export function createHealthCheckConfig(): HealthCheckConfig {
  return {
    timeoutMs: parseInt(process.env.DB_HEALTH_CHECK_TIMEOUT || '5000', 10),
    queryTimeoutMs: parseInt(process.env.DB_HEALTH_CHECK_QUERY_TIMEOUT || '3000', 10),
  };
}

/**
 * Create complete database service configuration
 */
export function createDatabaseServiceConfig(): DatabaseServiceConfig {
  return {
    database: createDatabaseConfig(),
    retry: createRetryConfig(),
    healthCheck: createHealthCheckConfig(),
    enableLogging: process.env.DB_ENABLE_LOGGING !== 'false',
  };
}

/**
 * Default database service configuration
 */
export const defaultDatabaseServiceConfig: DatabaseServiceConfig = createDatabaseServiceConfig();
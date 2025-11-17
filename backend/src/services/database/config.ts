/**
 * Database configuration with environment variable support
 * Provides configuration for PostgreSQL connection and validation
 */

import { PoolConfig } from 'pg';

/**
 * Database configuration interface
 */
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean | { rejectUnauthorized: boolean };
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

/**
 * Required environment variables for database configuration
 */
interface RequiredEnvVars {
  DB_HOST: string;
  DB_PORT: string;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
}

/**
 * Optional environment variables with defaults
 */
export interface OptionalEnvVars {
  DB_SSL?: string;
  DB_MAX_CONNECTIONS?: string;
  DB_IDLE_TIMEOUT?: string;
  DB_CONNECTION_TIMEOUT?: string;
}

/**
 * Validates that all required environment variables are present
 * @param env Environment variables object
 * @throws Error if required variables are missing
 */
const validateRequiredEnvVars = (env: NodeJS.ProcessEnv): RequiredEnvVars => {
  const required: (keyof RequiredEnvVars)[] = [
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
  ];

  const missing = required.filter((key) => !env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    DB_HOST: env.DB_HOST!,
    DB_PORT: env.DB_PORT!,
    DB_NAME: env.DB_NAME!,
    DB_USER: env.DB_USER!,
    DB_PASSWORD: env.DB_PASSWORD!,
  };
};

/**
 * Parses environment variables and creates database configuration
 * @param env Environment variables object (defaults to process.env)
 * @returns Database configuration object
 */
export const createDatabaseConfig = (env: NodeJS.ProcessEnv = process.env): DatabaseConfig => {
  const requiredVars = validateRequiredEnvVars(env);
  
  const port = parseInt(requiredVars.DB_PORT, 10);
  if (isNaN(port) || port <= 0 || port > 65535) {
    throw new Error(`Invalid DB_PORT: ${requiredVars.DB_PORT}. Must be a valid port number.`);
  }

  // Parse SSL configuration
  let ssl: boolean | { rejectUnauthorized: boolean } = false;
  if (env.DB_SSL) {
    const sslValue = env.DB_SSL.toLowerCase();
    if (sslValue === 'true') {
      ssl = true;
    } else if (sslValue === 'require') {
      ssl = { rejectUnauthorized: false };
    } else if (sslValue === 'false') {
      ssl = false;
    } else {
      throw new Error(`Invalid DB_SSL value: ${env.DB_SSL}. Use 'true', 'false', or 'require'.`);
    }
  }

  // Parse optional configuration with defaults
  const maxConnections = env.DB_MAX_CONNECTIONS ? parseInt(env.DB_MAX_CONNECTIONS, 10) : 20;
  const idleTimeout = env.DB_IDLE_TIMEOUT ? parseInt(env.DB_IDLE_TIMEOUT, 10) : 30000;
  const connectionTimeout = env.DB_CONNECTION_TIMEOUT ? parseInt(env.DB_CONNECTION_TIMEOUT, 10) : 10000;

  if (maxConnections <= 0) {
    throw new Error(`Invalid DB_MAX_CONNECTIONS: ${env.DB_MAX_CONNECTIONS}. Must be > 0.`);
  }

  return {
    host: requiredVars.DB_HOST,
    port,
    database: requiredVars.DB_NAME,
    user: requiredVars.DB_USER,
    password: requiredVars.DB_PASSWORD,
    ssl,
    max: maxConnections,
    idleTimeoutMillis: idleTimeout,
    connectionTimeoutMillis: connectionTimeout,
  };
};

/**
 * Converts DatabaseConfig to pg.PoolConfig
 * @param config Database configuration
 * @returns PostgreSQL pool configuration
 */
export const toPgPoolConfig = (config: DatabaseConfig): PoolConfig => ({
  host: config.host,
  port: config.port,
  database: config.database,
  user: config.user,
  password: config.password,
  ssl: config.ssl,
  max: config.max,
  idleTimeoutMillis: config.idleTimeoutMillis,
  connectionTimeoutMillis: config.connectionTimeoutMillis,
  keepAlive: true,
  keepAliveInitialDelayMillis: 0,
});

/**
 * Default database configuration instance
 * Only created if all required environment variables are present
 */
let _databaseConfig: DatabaseConfig | null = null;

export const getDatabaseConfig = (): DatabaseConfig => {
  if (!_databaseConfig) {
    _databaseConfig = createDatabaseConfig();
  }
  return _databaseConfig;
};
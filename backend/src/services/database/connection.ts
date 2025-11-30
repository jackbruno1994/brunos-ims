/**
 * Database connection service with pool management
 * Provides connection pooling, error handling, and retry logic for PostgreSQL
 */

import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { getDatabaseConfig, toPgPoolConfig } from './config';

/**
 * Query parameters type
 */
export type QueryParams = unknown[];

/**
 * Database query function type
 */
export type QueryFunction<T extends QueryResultRow = QueryResultRow> = (
  text: string,
  params?: QueryParams
) => Promise<QueryResult<T>>;

/**
 * Transaction function type
 */
export type TransactionFunction<T> = (query: QueryFunction) => Promise<T>;

/**
 * Connection retry configuration
 */
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

/**
 * Database connection service class
 */
export class DatabaseConnection {
  private pool: Pool | null = null;
  private retryConfig: RetryConfig;

  constructor(retryConfig?: Partial<RetryConfig>) {
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      ...retryConfig,
    };
  }

  /**
   * Initialize the connection pool
   * @throws Error if pool initialization fails
   */
  async initialize(): Promise<void> {
    if (this.pool) {
      throw new Error('Database connection pool is already initialized');
    }

    const poolConfig = toPgPoolConfig(getDatabaseConfig());
    this.pool = new Pool(poolConfig);

    // Set up error handling
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });

    // Test the connection
    await this.testConnection();
  }

  /**
   * Test database connection
   * @private
   */
  private async testConnection(): Promise<void> {
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }

    try {
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();
    } catch (error) {
      throw new Error(`Database connection test failed: ${error}`);
    }
  }

  /**
   * Execute a query with retry logic
   * @param text SQL query text
   * @param params Query parameters
   * @returns Query result
   */
  async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: QueryParams
  ): Promise<QueryResult<T>> {
    return this.executeWithRetry(async () => {
      if (!this.pool) {
        throw new Error('Database pool not initialized. Call initialize() first.');
      }

      return this.pool.query<T>(text, params);
    });
  }

  /**
   * Get a client from the pool for manual management
   * @returns Database client
   */
  async getClient(): Promise<PoolClient> {
    if (!this.pool) {
      throw new Error('Database pool not initialized. Call initialize() first.');
    }

    return this.pool.connect();
  }

  /**
   * Execute a transaction
   * @param callback Transaction callback function
   * @returns Transaction result
   */
  async transaction<T>(callback: TransactionFunction<T>): Promise<T> {
    const client = await this.getClient();

    try {
      await client.query('BEGIN');

      const queryFn: QueryFunction = async (text: string, params?: QueryParams) => {
        return client.query(text, params);
      };

      const result = await callback(queryFn);
      
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Execute function with retry logic
   * @private
   * @param fn Function to execute
   * @returns Function result
   */
  private async executeWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        // Don't retry on the last attempt
        if (attempt === this.retryConfig.maxRetries) {
          break;
        }

        // Don't retry for certain error types
        if (this.isNonRetryableError(error as Error)) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          this.retryConfig.baseDelay * Math.pow(2, attempt),
          this.retryConfig.maxDelay
        );

        console.warn(`Database operation failed (attempt ${attempt + 1}), retrying in ${delay}ms:`, error);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Check if error should not be retried
   * @private
   * @param error Error to check
   * @returns True if error should not be retried
   */
  private isNonRetryableError(error: Error): boolean {
    const nonRetryablePatterns = [
      /syntax error/i,
      /permission denied/i,
      /authentication failed/i,
      /database.*does not exist/i,
      /relation.*does not exist/i,
      /column.*does not exist/i,
    ];

    return nonRetryablePatterns.some(pattern => pattern.test(error.message));
  }

  /**
   * Sleep for specified milliseconds
   * @private
   * @param ms Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Close the connection pool
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }

  /**
   * Get pool status information
   * @returns Pool status
   */
  getPoolStatus(): {
    totalCount: number;
    idleCount: number;
    waitingCount: number;
  } | null {
    if (!this.pool) {
      return null;
    }

    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }
}

/**
 * Default database connection instance
 */
export const db = new DatabaseConnection();

/**
 * Initialize database connection
 * @returns Promise that resolves when connection is established
 */
export const initializeDatabase = async (): Promise<void> => {
  await db.initialize();
};

/**
 * Close database connection
 * @returns Promise that resolves when connection is closed
 */
export const closeDatabase = async (): Promise<void> => {
  await db.close();
};
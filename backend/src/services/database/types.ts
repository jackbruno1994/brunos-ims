import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

/**
 * Database connection status
 */
export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error',
  RECONNECTING = 'reconnecting',
}

/**
 * Database operation types
 */
export enum DatabaseOperation {
  SELECT = 'select',
  INSERT = 'insert',
  UPDATE = 'update',
  DELETE = 'delete',
  TRANSACTION = 'transaction',
  HEALTH_CHECK = 'health_check',
}

/**
 * Query parameters type
 */
export type QueryParams = any[];

/**
 * Query options for database operations
 */
export interface QueryOptions {
  timeout?: number;
  retries?: number;
  operation?: DatabaseOperation;
  logQuery?: boolean;
}

/**
 * Database query result with metadata
 */
export interface DatabaseQueryResult<T = any> extends QueryResult<T> {
  executionTime: number;
  operation: DatabaseOperation;
  query: string;
}

/**
 * Transaction callback function type
 */
export type TransactionCallback<T = any> = (client: PoolClient) => Promise<T>;

/**
 * Database connection health status
 */
export interface HealthStatus {
  isHealthy: boolean;
  status: ConnectionStatus;
  timestamp: Date;
  latency?: number;
  error?: string;
  poolStats?: PoolStats;
}

/**
 * Connection pool statistics
 */
export interface PoolStats {
  totalConnections: number;
  idleConnections: number;
  waitingClients: number;
}

/**
 * Database event types
 */
export enum DatabaseEvent {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  ERROR = 'error',
  RECONNECT = 'reconnect',
  QUERY_START = 'query_start',
  QUERY_END = 'query_end',
  QUERY_ERROR = 'query_error',
  TRANSACTION_START = 'transaction_start',
  TRANSACTION_COMMIT = 'transaction_commit',
  TRANSACTION_ROLLBACK = 'transaction_rollback',
}

/**
 * Database event listener callback
 */
export type DatabaseEventListener = (event: DatabaseEventData) => void;

/**
 * Database event data
 */
export interface DatabaseEventData {
  type: DatabaseEvent;
  timestamp: Date;
  data?: any;
  error?: Error;
}

/**
 * Database service interface
 */
export interface IDatabaseService {
  // Connection management
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getConnectionStatus(): ConnectionStatus;

  // Health checks
  healthCheck(): Promise<HealthStatus>;
  getPoolStats(): PoolStats;

  // Query operations
  query<T = QueryResultRow>(
    text: string,
    params?: QueryParams,
    options?: QueryOptions
  ): Promise<DatabaseQueryResult<T>>;

  // Transaction operations
  transaction<T = any>(callback: TransactionCallback<T>): Promise<T>;

  // Event handling
  on(event: DatabaseEvent, listener: DatabaseEventListener): void;
  off(event: DatabaseEvent, listener: DatabaseEventListener): void;
  emit(event: DatabaseEvent, data?: any, error?: Error): void;

  // Utility methods
  getPool(): Pool | null;
  executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries?: number
  ): Promise<T>;
}

/**
 * Database migration interface
 */
export interface DatabaseMigration {
  version: string;
  name: string;
  up: (client: PoolClient) => Promise<void>;
  down: (client: PoolClient) => Promise<void>;
}

/**
 * Query builder interface for type-safe queries
 */
export interface QueryBuilder {
  select(columns: string | string[]): QueryBuilder;
  from(table: string): QueryBuilder;
  where(condition: string, params?: any[]): QueryBuilder;
  join(table: string, condition: string): QueryBuilder;
  orderBy(column: string, direction?: 'ASC' | 'DESC'): QueryBuilder;
  limit(count: number): QueryBuilder;
  offset(count: number): QueryBuilder;
  build(): { query: string; params: any[] };
}

/**
 * Database model base interface
 */
export interface BaseModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Repository pattern interface
 */
export interface IRepository<T extends BaseModel> {
  findById(id: string): Promise<T | null>;
  findAll(options?: QueryOptions): Promise<T[]>;
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  count(conditions?: Record<string, any>): Promise<number>;
}
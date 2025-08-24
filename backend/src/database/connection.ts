import { Pool, PoolClient, PoolConfig } from 'pg';
import { dbConfig } from '../config';

class DatabaseService {
  private pool: Pool;
  private static instance: DatabaseService;

  private constructor() {
    const config: PoolConfig = {
      host: dbConfig.host,
      port: Number(dbConfig.port),
      database: dbConfig.database,
      user: dbConfig.username,
      password: dbConfig.password,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // How long a client is allowed to remain idle
      connectionTimeoutMillis: 2000, // How long to wait for a connection
    };

    this.pool = new Pool(config);

    // Handle pool errors
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Execute a query with parameters
   */
  public async query(text: string, params?: any[]): Promise<any> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Execute multiple queries in a transaction
   */
  public async transaction(queries: Array<{ text: string; params?: any[] }>): Promise<any[]> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const results = [];
      
      for (const query of queries) {
        const result = await client.query(query.text, query.params);
        results.push(result);
      }
      
      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Transaction error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get a client for manual transaction management
   */
  public async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  /**
   * Close all database connections
   */
  public async close(): Promise<void> {
    await this.pool.end();
  }

  /**
   * Test database connection
   */
  public async testConnection(): Promise<boolean> {
    try {
      const result = await this.query('SELECT NOW()');
      console.log('Database connection successful:', result.rows[0]);
      return true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return false;
    }
  }

  /**
   * Initialize database schema (for development/testing)
   */
  public async initializeSchema(): Promise<void> {
    try {
      const fs = require('fs');
      const path = require('path');
      const schemaPath = path.join(__dirname, 'schema.sql');
      
      if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await this.query(schema);
        console.log('Database schema initialized successfully');
      } else {
        console.warn('Schema file not found, skipping initialization');
      }
    } catch (error) {
      console.error('Failed to initialize schema:', error);
      throw error;
    }
  }
}

export default DatabaseService;
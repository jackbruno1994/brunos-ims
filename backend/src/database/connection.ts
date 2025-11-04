import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

// Prisma client with custom configuration
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
});

// PostgreSQL connection pool for direct queries when needed
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: parseInt(process.env.DB_POOL_SIZE || '10'),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),
});

// Database connection utilities
export class DatabaseConnection {
  private static instance: DatabaseConnection;
  
  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  // Get Prisma client instance
  public getPrismaClient(): PrismaClient {
    return prisma;
  }

  // Get raw PostgreSQL pool
  public getPool(): Pool {
    return pool;
  }

  // Test database connection
  public async testConnection(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }

  // Graceful shutdown
  public async disconnect(): Promise<void> {
    await prisma.$disconnect();
    await pool.end();
  }

  // Transaction wrapper
  public async transaction<T>(
    fn: (prisma: PrismaClient) => Promise<T>
  ): Promise<T> {
    return await prisma.$transaction(fn);
  }

  // Health check for monitoring
  public async healthCheck(): Promise<{
    database: boolean;
    prisma: boolean;
    pool: boolean;
  }> {
    const health = {
      database: false,
      prisma: false,
      pool: false,
    };

    try {
      // Test Prisma connection
      await prisma.$queryRaw`SELECT 1`;
      health.prisma = true;
      health.database = true;
    } catch (error) {
      console.error('Prisma health check failed:', error);
    }

    try {
      // Test pool connection
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      health.pool = true;
    } catch (error) {
      console.error('Pool health check failed:', error);
    }

    return health;
  }
}

// Export singleton instance
export const db = DatabaseConnection.getInstance();

// Export types
export type { PrismaClient } from '@prisma/client';
export { Prisma } from '@prisma/client';

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down database connections...');
  await db.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down database connections...');
  await db.disconnect();
  process.exit(0);
});
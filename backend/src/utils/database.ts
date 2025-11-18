import { pgPool, prisma, dbConfig } from '../config/index';

export interface DatabaseHealthCheck {
  status: 'healthy' | 'unhealthy';
  details: {
    prisma: {
      connected: boolean;
      latency?: number;
      error?: string;
    };
    postgres: {
      connected: boolean;
      latency?: number;
      poolStats?: {
        total: number;
        idle: number;
        waiting: number;
      };
      error?: string;
    };
  };
  timestamp: string;
}

/**
 * Test Prisma ORM connection
 */
export async function testPrismaConnection(): Promise<{ connected: boolean; latency?: number; error?: string }> {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1 as test`;
    const latency = Date.now() - start;
    
    return {
      connected: true,
      latency,
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test raw PostgreSQL connection
 */
export async function testPostgresConnection(): Promise<{ 
  connected: boolean; 
  latency?: number; 
  poolStats?: { total: number; idle: number; waiting: number };
  error?: string; 
}> {
  try {
    const start = Date.now();
    const client = await pgPool.connect();
    await client.query('SELECT 1 as test');
    client.release();
    const latency = Date.now() - start;
    
    return {
      connected: true,
      latency,
      poolStats: {
        total: pgPool.totalCount,
        idle: pgPool.idleCount,
        waiting: pgPool.waitingCount,
      },
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Comprehensive database health check
 */
export async function performHealthCheck(): Promise<DatabaseHealthCheck> {
  const [prismaResult, postgresResult] = await Promise.all([
    testPrismaConnection(),
    testPostgresConnection(),
  ]);

  const isHealthy = prismaResult.connected && postgresResult.connected;

  return {
    status: isHealthy ? 'healthy' : 'unhealthy',
    details: {
      prisma: prismaResult,
      postgres: postgresResult,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Initialize database connections with proper error handling
 */
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('🔌 Initializing database connections...');
    
    // Connect Prisma
    await prisma.$connect();
    console.log('✅ Prisma connected successfully');
    
    // Test raw PostgreSQL connection
    const client = await pgPool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ PostgreSQL pool connected successfully');
    
    // Perform initial health check
    const healthCheck = await performHealthCheck();
    console.log('🏥 Database health check:', healthCheck);
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

/**
 * Database connection validator
 */
export async function validateConnection(): Promise<boolean> {
  try {
    const healthCheck = await performHealthCheck();
    return healthCheck.status === 'healthy';
  } catch (error) {
    console.error('❌ Connection validation failed:', error);
    return false;
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats() {
  try {
    const stats = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes,
        n_live_tup as live_rows,
        n_dead_tup as dead_rows
      FROM pg_stat_user_tables
      ORDER BY schemaname, tablename;
    `;
    
    return {
      tables: stats,
      poolStats: {
        total: pgPool.totalCount,
        idle: pgPool.idleCount,
        waiting: pgPool.waitingCount,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Failed to get database stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Setup graceful shutdown handlers
 */
export function setupGracefulShutdown(): void {
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
    
    try {
      await prisma.$disconnect();
      await pgPool.end();
      console.log('✅ Database connections closed gracefully');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during graceful shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

/**
 * Database backup configuration helper
 */
export function getBackupConfig() {
  return {
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    username: dbConfig.username,
    // Note: Password should come from environment or secure storage
    backupCommand: `pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.username} -d ${dbConfig.database}`,
    restoreCommand: `psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.username} -d ${dbConfig.database}`,
  };
}
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

// Prisma Client with connection pooling configuration
let prisma: PrismaClient;

declare global {
  var __prisma: PrismaClient | undefined;
}

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }
  prisma = global.__prisma;
}

// PostgreSQL connection pool for direct queries when needed
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  maxUses: 7500, // Close (and replace) a connection after it has been used 7500 times
});

// Connection retry configuration
const RETRY_ATTEMPTS = 5;
const RETRY_DELAY_MS = 1000;

// Database health check function
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  message: string;
  timestamp: string;
  details?: any;
}> {
  try {
    // Test Prisma connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Test connection pool
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();

    return {
      status: 'healthy',
      message: 'Database connection is healthy',
      timestamp: new Date().toISOString(),
      details: {
        prisma: 'connected',
        pool: {
          total: pool.totalCount,
          idle: pool.idleCount,
          waiting: pool.waitingCount,
        },
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: 'Database connection failed',
      timestamp: new Date().toISOString(),
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

// Connection with retry logic
export async function connectWithRetry(): Promise<void> {
  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      await prisma.$connect();
      console.log('✅ Database connected successfully');
      return;
    } catch (error) {
      console.error(`❌ Database connection attempt ${attempt}/${RETRY_ATTEMPTS} failed:`, 
        error instanceof Error ? error.message : 'Unknown error');
      
      if (attempt === RETRY_ATTEMPTS) {
        throw new Error(`Failed to connect to database after ${RETRY_ATTEMPTS} attempts`);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempt));
    }
  }
}

// Graceful shutdown
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    await pool.end();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Error disconnecting from database:', 
      error instanceof Error ? error.message : 'Unknown error');
  }
}

// Query timeout wrapper
export async function executeWithTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number = 5000
): Promise<T> {
  return Promise.race([
    operation(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Query timeout after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

export { prisma, pool };
export default prisma;
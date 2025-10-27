import { PrismaClient } from '@prisma/client';
import { dbConfig, getDatabaseUrl } from '../config';
import logger from '../utils/logger';

// Global Prisma client instance
let prisma: PrismaClient | null = null;

// Connection retry mechanism
async function connectWithRetry(): Promise<PrismaClient> {
  const { retryAttempts, retryDelay } = dbConfig;
  
  for (let attempt = 1; attempt <= retryAttempts; attempt++) {
    try {
      const client = new PrismaClient({
        datasources: {
          db: {
            url: getDatabaseUrl(),
          },
        },
        log: [
          { level: 'query', emit: 'event' },
          { level: 'error', emit: 'event' },
          { level: 'info', emit: 'event' },
          { level: 'warn', emit: 'event' },
        ],
      });

      // Test the connection
      await client.$connect();
      logger.info('Database connected successfully');
      
      // Log database queries in development
      if (process.env.NODE_ENV === 'development') {
        client.$on('query', (e: any) => {
          logger.debug(`Query: ${e.query} - Duration: ${e.duration}ms`);
        });
      }

      // Log database errors
      client.$on('error', (e: any) => {
        logger.error('Database error:', e);
      });

      return client;
    } catch (error) {
      logger.error(`Database connection attempt ${attempt} failed:`, error);
      
      if (attempt === retryAttempts) {
        throw new Error(`Failed to connect to database after ${retryAttempts} attempts`);
      }
      
      logger.info(`Retrying database connection in ${retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  throw new Error('Should not reach here');
}

// Get or create Prisma client instance
export async function getPrismaClient(): Promise<PrismaClient> {
  if (!prisma) {
    prisma = await connectWithRetry();
  }
  return prisma;
}

// Health check function
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  message: string;
  timestamp: Date;
}> {
  try {
    const client = await getPrismaClient();
    
    // Simple query to test database connectivity
    await client.$queryRaw`SELECT 1`;
    
    return {
      status: 'healthy',
      message: 'Database connection is healthy',
      timestamp: new Date(),
    };
  } catch (error) {
    logger.error('Database health check failed:', error);
    return {
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Unknown database error',
      timestamp: new Date(),
    };
  }
}

// Graceful shutdown
export async function disconnectDatabase(): Promise<void> {
  if (prisma) {
    try {
      await prisma.$disconnect();
      prisma = null;
      logger.info('Database disconnected gracefully');
    } catch (error) {
      logger.error('Error during database disconnection:', error);
    }
  }
}

// Database migration utilities
export async function runMigrations(): Promise<void> {
  try {
    await getPrismaClient();
    // Note: In production, migrations should be run via CLI or CI/CD
    // This is for development/testing purposes
    logger.info('Database migrations would be executed here');
    logger.info('Use "npx prisma migrate deploy" to run migrations in production');
  } catch (error) {
    logger.error('Migration error:', error);
    throw error;
  }
}

// Export the Prisma client for use in other modules
export { prisma };
export default getPrismaClient;
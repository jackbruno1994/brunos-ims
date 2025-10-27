// Database configuration will be added here
// Example: MongoDB, PostgreSQL, etc.

import { Pool, PoolConfig } from 'pg';
import { PrismaClient } from '@prisma/client';

export const dbConfig = {
  // Database connection settings
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'brunos_ims',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  
  // Connection pool settings
  pool: {
    min: parseInt(process.env.DB_POOL_MIN || '2'),
    max: parseInt(process.env.DB_POOL_MAX || '20'),
    idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000'),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000'),
  },
  
  // Retry settings
  retries: {
    max: parseInt(process.env.DB_MAX_RETRIES || '3'),
    delay: 1000, // 1 second base delay
  }
};

export const appConfig = {
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  apiVersion: process.env.API_VERSION || 'v1',
  logLevel: process.env.LOG_LEVEL || 'info',
  logToFile: process.env.LOG_TO_FILE === 'true',
};

// PostgreSQL connection pool configuration
const poolConfig: PoolConfig = {
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: dbConfig.username,
  password: dbConfig.password,
  ssl: dbConfig.ssl,
  min: dbConfig.pool.min,
  max: dbConfig.pool.max,
  idleTimeoutMillis: dbConfig.pool.idleTimeoutMillis,
  connectionTimeoutMillis: dbConfig.pool.connectionTimeoutMillis,
};

// Create PostgreSQL connection pool
export const pgPool = new Pool(poolConfig);

// Prisma client configuration
export const prisma = new PrismaClient({
  log: appConfig.nodeEnv === 'development' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL || `postgresql://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}?schema=public`,
    },
  },
});

// Database connection with retry logic
export async function connectWithRetry(): Promise<void> {
  let retries = 0;
  const maxRetries = dbConfig.retries.max;
  
  while (retries < maxRetries) {
    try {
      // Test Prisma connection
      await prisma.$connect();
      console.log('✅ Database connected successfully');
      return;
    } catch (error) {
      retries++;
      console.error(`❌ Database connection attempt ${retries} failed:`, error);
      
      if (retries >= maxRetries) {
        console.error('💥 Maximum database connection retries reached');
        throw error;
      }
      
      const delay = dbConfig.retries.delay * Math.pow(2, retries - 1); // Exponential backoff
      console.log(`⏳ Retrying database connection in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Graceful database disconnection
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    await pgPool.end();
    console.log('🔌 Database connections closed gracefully');
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error);
  }
}

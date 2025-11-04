// Database configuration for PostgreSQL with Prisma
export const dbConfig = {
  // Main database URL for Prisma
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/brunos_ims?schema=public',
  
  // Connection pool settings
  poolSize: parseInt(process.env.DB_POOL_SIZE || '10'),
  connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),
  
  // Individual connection parameters (for direct connections)
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'brunos_ims',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  
  // SSL configuration for production
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

export const appConfig = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};

// PostgreSQL Database configuration with Prisma

export const dbConfig = {
  // Database connection settings
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'brunos_ims',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.DB_SSL === 'true',
  
  // Connection pool settings
  connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '60000', 10), // 60 seconds
  maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
  minConnections: parseInt(process.env.DB_MIN_CONNECTIONS || '2', 10),
  
  // Retry settings
  retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '3', 10),
  retryDelay: parseInt(process.env.DB_RETRY_DELAY || '5000', 10), // 5 seconds
};

// Construct DATABASE_URL for Prisma
export const getDatabaseUrl = (): string => {
  const { host, port, database, username, password, ssl } = dbConfig;
  const sslParam = ssl ? '?sslmode=require' : '';
  return `postgresql://${username}:${password}@${host}:${port}/${database}${sslParam}`;
};

export const appConfig = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};

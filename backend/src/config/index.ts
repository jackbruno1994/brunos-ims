// Database configuration will be added here
// Example: MongoDB, PostgreSQL, etc.

export const dbConfig = {
  // Database connection settings
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'brunos_ims',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  url: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'password'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'brunos_ims'}?schema=public`,
  
  // Connection pool settings
  pool: {
    max: 20,
    min: 5,
    acquire: 30000,
    idle: 10000,
  },
  
  // Retry settings
  retry: {
    max: 5,
    delay: 1000,
  },
};

export const appConfig = {
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};

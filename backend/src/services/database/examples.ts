/**
 * Example usage of database services
 * This file demonstrates how to use the database configuration and connection services
 */

import { initializeDatabase, db, closeDatabase } from './index';

/**
 * Example: User service using database
 */
export class UserService {
  /**
   * Get user by ID
   */
  async getUserById(id: string) {
    const result = await db.query(
      'SELECT id, email, first_name, last_name, role, created_at FROM users WHERE id = $1',
      [id]
    );
    
    return result.rows[0] || null;
  }

  /**
   * Create a new user with transaction
   */
  async createUser(userData: {
    email: string;
    firstName: string;
    lastName: string;
    passwordHash: string;
    role: string;
  }) {
    return db.transaction(async (query) => {
      // Insert user
      const userResult = await query(
        `INSERT INTO users (email, first_name, last_name, password_hash, role) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, email, first_name, last_name, role, created_at`,
        [userData.email, userData.firstName, userData.lastName, userData.passwordHash, userData.role]
      );

      const user = userResult.rows[0];

      // Log user creation
      await query(
        'INSERT INTO audit_log (action, entity_type, entity_id, user_id) VALUES ($1, $2, $3, $4)',
        ['CREATE', 'user', user.id, user.id]
      );

      return user;
    });
  }

  /**
   * Get all users with pagination
   */
  async getUsers(offset = 0, limit = 10) {
    const result = await db.query(
      `SELECT id, email, first_name, last_name, role, created_at 
       FROM users 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return result.rows;
  }
}

/**
 * Example: Application startup with database initialization
 */
export async function startApplication() {
  try {
    // Initialize database connection
    await initializeDatabase();
    console.log('Database connection established');

    // Example usage
    const userService = new UserService();
    
    // Check if we can query (this would fail if database isn't set up)
    try {
      await db.query('SELECT 1');
      console.log('Database health check passed');
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    // Return services for use in application
    return {
      userService,
      db,
    };
  } catch (error) {
    console.error('Failed to start application:', error);
    throw error;
  }
}

/**
 * Example: Application shutdown
 */
export async function shutdownApplication() {
  try {
    await closeDatabase();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error during shutdown:', error);
  }
}

/**
 * Example: Environment variable setup for different environments
 */
export function getEnvironmentConfig() {
  const env = process.env.NODE_ENV || 'development';
  
  const configs = {
    development: {
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_NAME: 'brunos_ims_dev',
      DB_USER: 'postgres',
      DB_PASSWORD: 'password',
      DB_SSL: 'false',
    },
    test: {
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_NAME: 'brunos_ims_test',
      DB_USER: 'postgres',
      DB_PASSWORD: 'password',
      DB_SSL: 'false',
    },
    production: {
      DB_SSL: 'require',
      DB_MAX_CONNECTIONS: '50',
      DB_IDLE_TIMEOUT: '60000',
      DB_CONNECTION_TIMEOUT: '30000',
    },
  };

  return configs[env as keyof typeof configs] || {};
}
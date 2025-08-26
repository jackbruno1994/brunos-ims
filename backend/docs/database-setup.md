# Database Setup Documentation

## PostgreSQL Configuration

This document describes the PostgreSQL database configuration and setup for Bruno's IMS backend.

### Environment Variables

The following environment variables are required for database configuration:

#### Required Variables
- `DB_HOST`: Database host (e.g., `localhost`)
- `DB_PORT`: Database port (e.g., `5432`)
- `DB_NAME`: Database name (e.g., `brunos_ims`)
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password

#### Optional Variables
- `DB_SSL`: SSL configuration (`true`, `false`, or `require`) - Default: `false`
- `DB_MAX_CONNECTIONS`: Maximum number of connections in pool - Default: `20`
- `DB_IDLE_TIMEOUT`: Idle timeout in milliseconds - Default: `30000`
- `DB_CONNECTION_TIMEOUT`: Connection timeout in milliseconds - Default: `10000`

### SSL Configuration

The `DB_SSL` variable supports three values:
- `false`: No SSL connection
- `true`: SSL connection with certificate validation
- `require`: SSL connection without certificate validation (useful for development)

### Usage

#### Basic Usage

```typescript
import { db, initializeDatabase } from './services/database';

// Initialize the database connection
await initializeDatabase();

// Execute a query
const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

// Execute a transaction
const result = await db.transaction(async (query) => {
  await query('UPDATE users SET name = $1 WHERE id = $2', [name, userId]);
  await query('INSERT INTO audit_log (action, user_id) VALUES ($1, $2)', ['update', userId]);
  return { success: true };
});

// Close the connection when shutting down
await db.close();
```

#### Advanced Usage

```typescript
// Get a client for manual management
const client = await db.getClient();
try {
  await client.query('BEGIN');
  // ... perform operations
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}

// Check pool status
const status = db.getPoolStatus();
console.log(`Pool: ${status?.totalCount} total, ${status?.idleCount} idle`);
```

### Error Handling

The database service includes automatic retry logic for connection errors with exponential backoff. The following errors are not retried:
- Syntax errors
- Permission denied errors
- Authentication failures
- Database/table/column not found errors

### Configuration Validation

The configuration module validates all environment variables and provides helpful error messages for:
- Missing required variables
- Invalid port numbers
- Invalid SSL configuration values
- Invalid connection pool settings

### Testing

Unit tests are provided for all database functionality:
- Configuration validation
- Connection pool management
- Query execution with retry logic
- Transaction handling
- Error handling scenarios

Run tests with:
```bash
npm test
```

### Dependencies

The following packages are required:
- `pg`: PostgreSQL client for Node.js
- `@types/pg`: TypeScript definitions for pg
- `bcrypt`: Password hashing (for authentication)
- `@types/bcrypt`: TypeScript definitions for bcrypt
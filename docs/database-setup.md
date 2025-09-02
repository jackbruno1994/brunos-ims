# Bruno's IMS Database Setup Documentation

This documentation explains the PostgreSQL database setup and configuration for Bruno's Inventory Management System.

## Overview

The database system uses PostgreSQL with Prisma ORM and includes:
- Connection pooling and retry mechanisms
- SSL/TLS support for secure connections
- Comprehensive schema for inventory management
- Health monitoring and logging
- Data validation and type safety
- Migration and seed scripts

## Database Schema

### Core Entities

The system includes the following main entities based on the inventory management requirements:

#### 1. UOM (Units of Measure)
- `uom` - Base units and their conversions
- `conversions` - Conversion factors between units

#### 2. Suppliers & Purchasing
- `suppliers` - Vendor information
- `purchase_orders` - Purchase order management
- `receipts` - Delivery receipts

#### 3. Inventory
- `items` - Product catalog with UOM relationships
- `locations` - Storage locations (kitchen, cooler, freezer, etc.)
- `stock_moves` - All inventory movements with full traceability

#### 4. Production
- `recipes` - Recipe definitions with yield information
- `recipe_items` - Ingredients for recipes with quantities and loss percentages
- `batches` - Production records

#### 5. Tracking & Control
- `counts` - Physical inventory counts with variance tracking
- `wastage_logs` - Waste tracking with categorized reasons

## Environment Configuration

### Required Environment Variables

```bash
# Database Connection
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
DB_HOST=localhost
DB_PORT=5432
DB_NAME=brunos_ims
DB_USER=postgres
DB_PASSWORD=password

# Connection Pool Settings
DB_POOL_MIN=2
DB_POOL_MAX=20
DB_POOL_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=5000
DB_MAX_RETRIES=3

# SSL Configuration
DB_SSL=false  # Set to true for production

# Logging
LOG_LEVEL=info
LOG_TO_FILE=false
```

### Development Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Run Database Migrations**
   ```bash
   # From project root
   npm run db:migrate
   ```

4. **Seed Initial Data**
   ```bash
   npm run db:seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev:backend
   ```

## Database Commands

### Available Scripts

```bash
# Generate Prisma client
npm run db:generate

# Run migrations (development)
npm run db:migrate

# Deploy migrations (production)
npm run db:migrate:prod

# Seed database with sample data
npm run db:seed

# Open Prisma Studio (GUI)
npm run db:studio

# Reset database (WARNING: destroys all data)
npm run db:reset
```

## API Health Checks

The system provides comprehensive health monitoring:

### Endpoints

- `GET /health` - Overall system health including database
- `GET /health/database` - Detailed database health information

### Health Check Response

```json
{
  "status": "healthy",
  "details": {
    "prisma": {
      "connected": true,
      "latency": 25
    },
    "postgres": {
      "connected": true,
      "latency": 18,
      "poolStats": {
        "total": 5,
        "idle": 3,
        "waiting": 0
      }
    }
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Connection Features

### Connection Pooling

The system uses PostgreSQL connection pooling with configurable parameters:
- Minimum connections: 2 (configurable)
- Maximum connections: 20 (configurable)  
- Idle timeout: 30 seconds (configurable)
- Connection timeout: 5 seconds (configurable)

### Retry Mechanism

Automatic retry logic with exponential backoff:
- Maximum retries: 3 (configurable)
- Base delay: 1 second
- Exponential backoff multiplier: 2

### SSL/TLS Support

SSL connections are supported for production environments:
```bash
DB_SSL=true  # Enables SSL with rejectUnauthorized=false
```

## Data Validation

### Joi Validation Schemas

The system includes comprehensive validation for all entities:

```typescript
// Example: Creating a new item
const itemData = {
  name: "Chicken Breast",
  uomId: "uom_kg",
  minStock: 10.0,
  maxStock: 50.0,
  costPerBase: 8.50
};

const { isValid, value, errors } = validateData(itemData, createItemSchema);
```

### Validation Features

- Type checking for all numeric fields
- Email and phone validation
- Enum validation for status fields
- Cross-field validation (e.g., maxStock >= minStock)
- Automatic data transformation

## Database Logging

### Logging Levels

- `error` - Critical database errors
- `warn` - Performance warnings and issues
- `info` - Connection events, CRUD operations
- `debug` - Query details and performance metrics

### Logged Operations

- Connection events (connect, disconnect, errors)
- CRUD operations with timing
- Health checks and status changes
- Pool statistics and performance metrics
- Migration and backup operations

### Example Log Output

```
2024-01-01 12:00:00:123 info: DB CONNECTION CONNECT - Successfully connected to database
2024-01-01 12:00:01:456 debug: DB QUERY: SELECT * FROM items WHERE active = $1 {"params":["true"],"duration":"15ms"}
2024-01-01 12:00:02:789 info: DB CREATE on items - {"id":"item_123","name":"New Item"}
```

## Performance Considerations

### Indexes

The schema includes optimized indexes for:
- Foreign key relationships
- Frequently queried fields (active, status, dates)
- Search operations (name, category)
- Reporting queries (date ranges, aggregations)

### Query Optimization

- Use of prepared statements via Prisma
- Connection pooling to reduce overhead
- Automatic query optimization via Prisma query engine
- Structured logging for performance monitoring

## Security Features

### Connection Security

- SSL/TLS encryption support
- Connection string validation
- Environment-based configuration (no hardcoded credentials)
- Connection timeout protection

### Data Validation

- Input sanitization via Joi schemas
- SQL injection prevention via Prisma
- Type-safe database operations
- Constraint enforcement at database level

## Backup Configuration

### Database Backup Commands

```bash
# Backup command template
pg_dump -h localhost -p 5432 -U postgres -d brunos_ims > backup.sql

# Restore command template  
psql -h localhost -p 5432 -U postgres -d brunos_ims < backup.sql
```

### Backup Strategy Recommendations

1. **Daily automated backups** for production
2. **Pre-migration backups** before schema changes
3. **Point-in-time recovery** setup for critical systems
4. **Backup verification** through restore testing

## Testing

### Unit Tests

Comprehensive test coverage for:
- Database connection utilities
- Health check functions
- Data validation schemas
- Error handling scenarios

### Test Environment

Tests use mocked database connections to ensure:
- Fast test execution
- Isolated test environments
- Predictable test results
- No external dependencies

### Running Tests

```bash
cd backend
npm test
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check PostgreSQL service is running
   - Verify connection parameters in .env
   - Check firewall/network configuration

2. **Authentication Failed**
   - Verify database credentials
   - Check user permissions
   - Ensure database exists

3. **Migration Errors**
   - Check existing schema state
   - Review migration scripts
   - Backup before attempting fixes

4. **Performance Issues**
   - Monitor connection pool usage
   - Check query performance logs
   - Review index usage

### Debug Mode

Enable debug logging for detailed troubleshooting:
```bash
LOG_LEVEL=debug
```

## Production Deployment

### Pre-deployment Checklist

- [ ] Database credentials secured
- [ ] SSL enabled and configured
- [ ] Connection pooling optimized
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting setup
- [ ] Migration scripts tested
- [ ] Performance baseline established

### Production Environment Variables

```bash
NODE_ENV=production
DB_SSL=true
LOG_LEVEL=warn
LOG_TO_FILE=true
DB_POOL_MAX=50  # Adjust based on load
```

This completes the database setup documentation for Bruno's IMS. The system is now ready for development and production use with comprehensive PostgreSQL integration.
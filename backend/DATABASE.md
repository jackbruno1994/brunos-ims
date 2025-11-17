# Database Foundation - Bruno's IMS

This directory contains the complete database foundation implementation for Bruno's Integrated Management System using PostgreSQL and Prisma.

## 🏗️ Architecture Overview

### Database Stack
- **Database**: PostgreSQL 14+
- **ORM**: Prisma 5.x
- **Connection Pooling**: pg (PostgreSQL client) with configurable pool settings
- **Migration System**: Prisma Migrate
- **Type Safety**: Full TypeScript integration with Prisma Client

### Key Features Implemented
- ✅ PostgreSQL connection with retry logic
- ✅ Connection pooling with configurable limits
- ✅ Database health checks and monitoring
- ✅ Comprehensive schema design with all core entities
- ✅ Migration system with version control
- ✅ Database seeding with demo data
- ✅ Query timeout handling
- ✅ Graceful shutdown procedures
- ✅ Error handling and logging

## 📊 Database Schema

### Core Entities
The database includes all entities from the domain requirements:

**Inventory Management**
- `items` - Inventory items with SKU, base UOM, status tracking
- `categories` - Item categorization
- `suppliers` - Supplier information and contact details
- `uom_conversions` - Unit of measure conversion factors
- `locations` - Storage locations (warehouse, kitchen, cooler, freezer)

**Stock Management**
- `stock_moves` - All inventory movements with full audit trail
- `counts` - Stock count records for reconciliation
- `wastage_logs` - Waste tracking with reason codes

**Purchasing**
- `purchase_orders` - Purchase order management
- `purchase_order_items` - Line items for purchase orders
- `receipts` - Goods receipt tracking

**Production**
- `recipes` - Recipe definitions with yield calculations
- `recipe_items` - Recipe ingredients with loss percentages
- `batches` - Production batch tracking

**User Management**
- `users` - System users with role-based access

### Key Design Principles
- **Multi-UOM Support**: All quantities stored in base units with conversion table
- **Audit Trail**: Complete traceability of all inventory movements
- **Flexible Status Management**: Configurable status fields for all entities
- **Performance Optimized**: Strategic indexing and relationship design

## 🚀 Quick Start

### Prerequisites
- PostgreSQL 14+ running and accessible
- Node.js 18+ with npm
- Environment variables configured (see `.env.example`)

### Database Setup
```bash
# 1. Install dependencies (if not already done)
npm install

# 2. Copy and configure environment variables
cp .env.example .env
# Edit .env with your PostgreSQL connection details

# 3. Validate configuration
npm run db:validate

# 4. Initialize database (complete setup)
npm run db:init
```

### Manual Setup (Alternative)
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed with demo data
npm run db:seed
```

## 🔧 Configuration

### Environment Variables
```bash
# Database connection
DATABASE_URL="postgresql://user:password@localhost:5432/brunos_ims?schema=public"
DB_HOST=localhost
DB_PORT=5432
DB_NAME=brunos_ims
DB_USER=postgres
DB_PASSWORD=password
```

### Connection Pool Settings
The connection pool is configured in `src/config/database.ts`:
```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,                    // Maximum connections
  idleTimeoutMillis: 30000,   // Close idle clients after 30s
  connectionTimeoutMillis: 2000, // Connection timeout
  maxUses: 7500,              // Cycle connections after 7500 uses
});
```

### Retry Configuration
```typescript
const RETRY_ATTEMPTS = 5;
const RETRY_DELAY_MS = 1000;
```

## 📚 Available Scripts

### Database Management
- `npm run db:validate` - Validate database configuration
- `npm run db:init` - Complete database initialization
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with demo data
- `npm run db:studio` - Open Prisma Studio (GUI)
- `npm run db:reset` - Reset database (development only)
- `npm run db:push` - Push schema changes (development only)

### Development
- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build TypeScript
- `npm start` - Start production server

## 🏥 Health Monitoring

### Health Check Endpoints
- `GET /health` - Overall system health including database
- `GET /health/database` - Detailed database health information

### Health Check Response
```json
{
  "status": "healthy",
  "message": "Database connection is healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "details": {
    "prisma": "connected",
    "pool": {
      "total": 5,
      "idle": 3,
      "waiting": 0
    }
  }
}
```

## 🔄 Migration Management

### Creating Migrations
```bash
# Create a new migration
npx prisma migrate dev --name descriptive_migration_name

# Preview migration changes
npx prisma migrate diff --preview-feature
```

### Migration Best Practices
- Always backup production data before migrations
- Test migrations on staging environment first
- Use descriptive migration names
- Review generated SQL before applying

### Rollback Procedures
```bash
# Reset to last migration (development only)
npx prisma migrate reset

# Manual rollback (production)
# 1. Backup current state
# 2. Apply reverse SQL manually
# 3. Update _prisma_migrations table
```

## 🌱 Seeding

The seed script creates:
- Demo categories (Kitchen Equipment, Ingredients)
- Sample suppliers with contact information
- Storage locations (Warehouse, Kitchen, Cooler)
- Sample items with UOM conversions
- Admin user account
- Sample recipe with ingredients
- Initial stock movements

### Custom Seeding
Modify `prisma/seed.ts` to add your own demo data.

## 🔍 Testing

### Database Tests
```bash
# Validate configuration without database connection
npm run db:validate

# Test with actual database (requires PostgreSQL)
npm test
```

### Integration Testing
The inventory controller includes comprehensive tests for:
- CRUD operations on all entities
- Stock level calculations
- Movement tracking
- Error handling

## 🔐 Security Considerations

### Connection Security
- Use environment variables for credentials
- Enable SSL connections in production
- Implement connection pooling limits
- Regular credential rotation

### Query Security
- All queries use Prisma's built-in SQL injection protection
- Input validation with Joi schemas
- Query timeout enforcement
- Audit logging for sensitive operations

## 📈 Performance Optimization

### Indexing Strategy
- Primary keys on all tables
- Foreign key indexes for relationships
- Composite indexes for common query patterns
- Full-text search indexes where applicable

### Connection Management
- Connection pooling with configurable limits
- Connection recycling to prevent memory leaks
- Idle connection cleanup
- Query timeout enforcement

### Monitoring
- Connection pool metrics exposed via health endpoints
- Query performance logging in development
- Error rate monitoring
- Resource usage tracking

## 🚨 Troubleshooting

### Common Issues

**Connection Failed**
```
Error: getaddrinfo ENOTFOUND localhost
```
- Check PostgreSQL is running
- Verify DATABASE_URL format
- Ensure database exists

**Migration Failed**
```
Error: P3009: Migrate found failed migration
```
- Check migration file syntax
- Verify database permissions
- Review conflicting schema changes

**Prisma Client Not Generated**
```
Error: @prisma/client did not initialize yet
```
- Run `npm run db:generate`
- Check schema.prisma syntax
- Verify Prisma version compatibility

### Getting Help
1. Check this documentation
2. Review Prisma documentation: https://www.prisma.io/docs
3. Check PostgreSQL logs
4. Run `npm run db:validate` for configuration issues

## 🔄 Maintenance

### Regular Tasks
- Monitor connection pool metrics
- Review slow query logs
- Update database statistics
- Backup validation
- Security updates

### Database Maintenance
```sql
-- Analyze table statistics
ANALYZE;

-- Vacuum tables (automatic in modern PostgreSQL)
VACUUM ANALYZE;

-- Check index usage
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public';
```

## 📝 Development Notes

### Adding New Models
1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name add_new_model`
3. Update seed data if needed
4. Create corresponding TypeScript types
5. Implement API endpoints
6. Add tests

### Performance Monitoring
Monitor these metrics in production:
- Connection pool utilization
- Average query time
- Error rates
- Memory usage
- Disk I/O patterns

This database foundation provides a robust, scalable base for Bruno's IMS with enterprise-grade features including connection pooling, health monitoring, comprehensive schema design, and production-ready configuration management.
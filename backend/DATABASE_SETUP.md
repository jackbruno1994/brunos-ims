# Database Setup and Migration Guide

This guide explains how to set up and manage the PostgreSQL database for Bruno's IMS using Prisma ORM.

## Prerequisites

- PostgreSQL 12+ installed and running
- Node.js 18+ and npm
- Access to the database with appropriate permissions

## Environment Configuration

1. Copy the environment example file:
```bash
cp backend/.env.example backend/.env
```

2. Update the database configuration in `backend/.env`:
```env
# PostgreSQL Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/brunos_ims?schema=public"
DB_HOST=localhost
DB_PORT=5432
DB_NAME=brunos_ims
DB_USER=your_username
DB_PASSWORD=your_password
DB_SSL=false

# For production, enable SSL:
DB_SSL=true
```

## Database Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Generate Prisma Client
```bash
npm run db:generate
```

### 3. Create Database (if it doesn't exist)
```sql
-- Connect to PostgreSQL as superuser and create database
CREATE DATABASE brunos_ims;
CREATE USER brunos_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE brunos_ims TO brunos_user;
```

### 4. Run Migrations
```bash
# For development
npm run db:migrate

# For production
npm run db:migrate:deploy
```

### 5. (Optional) Seed Initial Data
```bash
npm run db:seed
```

## Database Schema

The database includes the following core entities:

### Core Tables

- **restaurants** - Restaurant locations and information
- **users** - System users with role-based access
- **menu_items** - Menu items for each restaurant
- **suppliers** - Vendor/supplier information
- **inventory_items** - Inventory management
- **stock_movements** - Stock tracking and adjustments
- **purchase_orders** - Purchase order management
- **purchase_order_items** - Line items for purchase orders

### Key Features

- **Multi-tenancy**: Data is segmented by restaurant
- **Role-based Access**: Admin, Manager, Staff roles
- **Audit Trail**: Created/updated timestamps on all entities
- **Stock Tracking**: Comprehensive inventory movement tracking
- **Order Management**: Full purchase order lifecycle

## Prisma Commands

```bash
# Generate TypeScript client
npm run db:generate

# Create and apply migration
npm run db:migrate

# Deploy migrations (production)
npm run db:migrate:deploy

# Reset database (development only)
npm run db:migrate:reset

# Open Prisma Studio (database browser)
npm run db:studio

# Push schema changes without migration
npm run db:push

# Pull schema from existing database
npm run db:pull
```

## Connection Management

The application includes:

- **Connection Pooling**: Configurable pool size and timeout
- **Retry Mechanism**: Automatic retry on connection failures
- **Health Checks**: Database health monitoring endpoint
- **Graceful Shutdown**: Proper connection cleanup on shutdown

### Health Check Endpoints

- `GET /api/health` - Overall application health
- `GET /api/health/database` - Database-specific health check

## Migration Workflow

### Development
1. Modify `prisma/schema.prisma`
2. Run `npm run db:migrate` to create and apply migration
3. Commit both schema and migration files

### Production
1. Deploy code with new migration files
2. Run `npm run db:migrate:deploy` to apply migrations
3. Restart application

## Security Considerations

- Use strong passwords for database users
- Enable SSL for production connections
- Limit database user permissions
- Regular backups and monitoring
- Use environment variables for sensitive configuration

## Troubleshooting

### Common Issues

1. **Connection Failed**: Check database is running and credentials are correct
2. **Migration Failed**: Ensure database user has appropriate permissions
3. **Client Not Generated**: Run `npm run db:generate` after schema changes

### Logs
Application logs include database connection status and query information in development mode.

## Performance Optimization

- Indexes are included in the schema for common queries
- Connection pooling is configured with appropriate limits
- Query logging available in development for optimization

## Backup Strategy

Recommended backup approach:
1. Regular database dumps using `pg_dump`
2. Point-in-time recovery configuration
3. Test restore procedures regularly

```bash
# Example backup command
pg_dump -h localhost -U brunos_user -d brunos_ims > backup_$(date +%Y%m%d_%H%M%S).sql
```
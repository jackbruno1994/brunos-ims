# Database Setup and Migration Guide

## Overview

This document outlines the database schema and migration system for Bruno's IMS.

## Database Schema

The system uses PostgreSQL with Prisma ORM. The core schema includes:

### User Management
- **User**: Core user accounts with role-based access
- **Role**: User roles (e.g., ADMIN, MANAGER, STAFF)
- **Permission**: Granular permissions assigned to roles

### Inventory Management
- **Product**: Items in inventory with stock tracking
- **Category**: Product categorization for organization

### Audit System
- **AuditLog**: Complete audit trail of all system changes

## Setup Instructions

1. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Update DATABASE_URL in .env
   DATABASE_URL="postgresql://username:password@localhost:5432/brunos_ims"
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Database Migration**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run migrations (creates database tables)
   npm run db:migrate
   
   # Seed initial data
   npm run db:seed
   ```

## Available Commands

- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:deploy` - Deploy migrations to production
- `npm run db:seed` - Seed initial data
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:reset` - Reset database and re-run migrations

## Migration Testing

The system includes a migration testing utility:

```typescript
import { MigrationTester } from '../utils/migrationTest';

const tester = new MigrationTester();
const success = await tester.testMigration();
```

## Schema Changes

When making schema changes:

1. Update `prisma/schema.prisma`
2. Run `npm run db:migrate` to create migration
3. Test migrations with the provided utility
4. Update seed data if needed

## Initial Data

The migration script seeds the following initial data:

- Admin role with basic permissions (MANAGE_USERS, MANAGE_INVENTORY, VIEW_REPORTS)
- Default admin user (admin@example.com)

## Security Considerations

- All sensitive operations are logged in the AuditLog
- User passwords should be hashed using bcrypt
- Database connection uses environment variables
- Foreign key constraints enforce data integrity

## Troubleshooting

If migrations fail:
1. Check database connection
2. Verify DATABASE_URL format
3. Ensure database exists and user has permissions
4. Check migration logs for specific errors
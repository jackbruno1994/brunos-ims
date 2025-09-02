# Database Documentation

## Overview

Bruno's IMS uses PostgreSQL with Prisma ORM for robust, type-safe database operations. The database schema is designed for a comprehensive inventory management system supporting multi-UOM tracking, purchasing, production, and audit trails.

## Architecture

### Core Components

1. **Connection Management** (`/src/database/connection.ts`)
   - Singleton pattern for database connections
   - Connection pooling for performance
   - Health checks and graceful shutdown

2. **Error Handling** (`/src/database/errors.ts`)
   - Custom error classes for different error types
   - Prisma error mapping to application errors
   - Safe database operation wrappers

3. **Type Definitions** (`/src/database/types.ts`)
   - TypeScript interfaces for API requests/responses
   - Enums for status values
   - Pagination and query parameter types

## Database Schema

### Core Tables

#### Items and Categories
- `items`: Core inventory items with SKU, base UOM, and categorization
- `categories`: Item categorization for organization
- `uom_conversions`: Unit of measure conversion factors

#### Locations and Movement
- `locations`: Storage locations (kitchen, freezer, dry storage, etc.)
- `stock_moves`: Complete audit trail of all inventory movements
- `counts`: Stock take/physical count records
- `wastage_logs`: Waste tracking with reasons

#### Purchasing
- `suppliers`: Vendor information with contact details
- `purchase_orders`: Purchase orders with line items
- `purchase_order_items`: Individual items on purchase orders
- `receipts`: Goods received records
- `receipt_items`: Line items for receipts

#### Production
- `recipes`: Production recipes with yield information
- `recipe_items`: Recipe ingredients with quantities and loss percentages
- `batches`: Production batch tracking

## Key Design Principles

### 1. Base Unit Storage
All quantities are stored in base units (kg, liters, pieces) to ensure consistency and enable accurate calculations.

### 2. Audit Trail
Every inventory movement is recorded in `stock_moves` with:
- Source and destination
- Reason for movement
- Reference to originating document
- Timestamp and user tracking

### 3. UOM Flexibility
The `uom_conversions` table allows flexible unit conversions:
- Purchase in cases, store in pieces
- Recipe uses grams, stock in kilograms
- Real-time conversion calculations

### 4. Cost Tracking
Cost information is maintained at the movement level for accurate FIFO/LIFO/Average costing.

## API Integration

### Safe Operations
All database operations use the `safeDatabaseOperation` wrapper:

```typescript
const result = await safeDatabaseOperation(async () => {
  return await db.getPrismaClient().item.findMany();
});

if (!result.success) {
  // Handle error
  console.error(result.error);
}
```

### Error Handling
Custom error types provide better error messaging:
- `NotFoundError`: Resource not found
- `ValidationError`: Data validation failed
- `ConflictError`: Unique constraint violations
- `DatabaseError`: General database errors

## Setup and Migration

### Environment Variables
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/brunos_ims?schema=public"
DB_POOL_SIZE=10
DB_CONNECTION_TIMEOUT=30000
```

### Database Commands
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Deploy migrations (production)
npm run db:migrate:deploy

# Reset database (development)
npm run db:reset

# Seed with demo data
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

## Production Considerations

### Performance
- Connection pooling configured for optimal performance
- Indexed columns for common queries
- Pagination support for large datasets

### Security
- Prepared statements prevent SQL injection
- Connection string encryption in production
- Role-based access control at application level

### Monitoring
- Health check endpoints for monitoring
- Connection status tracking
- Error logging and alerting

## Demo Data

The seed script (`/src/database/seed.ts`) creates:
- Sample categories, items, and locations
- Demo suppliers and purchase orders
- Example recipes and production batches
- Stock movements and audit trail
- UOM conversions for different units

This provides a complete working environment for development and testing.

## Future Enhancements

- Multi-tenant support for restaurant chains
- Real-time inventory tracking with WebSockets
- Advanced cost accounting (FIFO/LIFO/Average)
- Integration with external ERP systems
- Mobile app support for stock takes
# Database Architecture

## Overview

Bruno's IMS uses PostgreSQL as the primary database with Prisma as the ORM. The database is designed to support multi-country restaurant operations with comprehensive inventory, menu, and order management.

## Schema Structure

### Core Entities

#### User Management & RBAC
- **User**: Core user entity with authentication data
- **Role**: Defines permissions and access levels
- **UserRole**: Many-to-many relationship between users and roles
- **Country**: Supports multi-country operations
- **Restaurant**: Individual restaurant locations
- **RestaurantUser**: Links users to specific restaurants

#### Inventory Management
- **Category**: Organizational categories for items
- **Location**: Storage locations within restaurants
- **Supplier**: External suppliers for inventory
- **Item**: Core inventory items with stock tracking
- **StockMovement**: Tracks all inventory movements
- **InventoryAdjustment**: Manual adjustments for waste, damage, etc.

#### Menu Management
- **MenuCategory**: Organizational categories for menu items
- **MenuItem**: Menu items with pricing and availability
- **MenuItemIngredient**: Links menu items to inventory items

#### Order Management
- **Order**: Customer orders with metadata
- **OrderItem**: Individual items within orders

## Key Features

### Multi-Country Support
The system supports restaurants across different countries with:
- Country-specific currencies
- Timezone management
- Localized settings per restaurant

### Role-Based Access Control (RBAC)
Flexible permission system with:
- JSON-based permissions for extensibility
- Role inheritance support
- Restaurant-specific access control

### Comprehensive Inventory Tracking
- Real-time stock levels
- Movement history and audit trails
- Reorder point management
- Waste and damage tracking
- Multi-location support

### Cost Management
- Item cost tracking
- Recipe costing through ingredients
- Profit margin calculations
- Waste cost analysis

## Database Health Monitoring

The system includes comprehensive health monitoring:

### Health Endpoints
- `/api/health` - Basic health check
- `/api/health/metrics` - Detailed metrics
- `/api/health/ready` - Kubernetes readiness probe
- `/api/health/live` - Kubernetes liveness probe

### Monitored Metrics
- Database connectivity
- Active connections
- Query performance
- Server resource usage
- Uptime tracking

## Performance Considerations

### Indexing Strategy
- Primary keys on all entities
- Unique constraints on business keys (email, username, SKU)
- Foreign key indexes for relationship queries
- Composite indexes for common query patterns

### Connection Pooling
- Prisma's built-in connection pooling
- Configurable pool size based on environment
- Connection health monitoring

### Query Optimization
- Selective field inclusion with Prisma
- Relationship loading optimization
- Pagination for large datasets
- Aggregate queries for reporting

## Backup and Recovery

### Automated Backups
- Daily database backups
- Point-in-time recovery capability
- Cross-region backup replication

### Disaster Recovery
- Hot standby configuration
- Automated failover procedures
- Data integrity verification

## Security

### Data Protection
- Encrypted connections (SSL/TLS)
- Password hashing with bcrypt
- Sensitive data field encryption
- Audit logging for data changes

### Access Control
- Database user with minimal privileges
- Network-level access restrictions
- IP whitelisting for production access

## Migration Strategy

### Development Workflow
1. Schema changes via Prisma migrations
2. Automated migration testing
3. Rollback procedures for failed migrations
4. Data migration scripts for complex changes

### Production Deployment
- Blue-green deployment strategy
- Migration validation in staging
- Rollback capabilities
- Zero-downtime migration procedures

## Monitoring and Alerting

### Key Metrics
- Connection pool utilization
- Query response times
- Error rates
- Database size growth
- Lock contention

### Alerting Rules
- High connection usage (>80%)
- Slow queries (>1s)
- Failed connections
- Disk space utilization (>85%)
- Replication lag

## Maintenance

### Regular Tasks
- Index rebuilding
- Statistics updates
- Log file rotation
- Performance analysis
- Capacity planning

### Optimization
- Query plan analysis
- Index usage monitoring
- Table partitioning for large datasets
- Archive old data procedures
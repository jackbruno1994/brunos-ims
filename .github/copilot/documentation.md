# Documentation Requirements

## API Documentation Format

### OpenAPI Specification Standards

#### Schema Definition Structure
```yaml
# openapi.yml
openapi: 3.0.3
info:
  title: Bruno's IMS API
  description: |
    Comprehensive API for Bruno's Inventory Management System
    
    ## Core Modules
    - **Purchasing**: Purchase order management and supplier relations
    - **Receiving**: Goods receiving and inventory updates
    - **Inventory**: Stock tracking with multi-UOM support
    - **Recipes**: Recipe management and BOM calculations
    - **Production**: Production planning and batch tracking
    - **Reporting**: Financial and operational analytics
    
    ## Authentication
    All endpoints require Bearer token authentication except `/health` and `/docs`.
    
    ## Rate Limiting
    - Authentication endpoints: 5 requests/minute
    - Read operations: 1000 requests/hour
    - Write operations: 100 requests/hour
    
    ## Error Handling
    The API uses standard HTTP status codes and returns detailed error messages in JSON format.
    
  version: 1.0.0
  contact:
    name: Bruno's IMS Team
    email: api-support@brunos-ims.com
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://api.brunos-ims.com/v1
    description: Production server
  - url: https://staging-api.brunos-ims.com/v1
    description: Staging server
  - url: http://localhost:8000/v1
    description: Development server

tags:
  - name: Authentication
    description: User authentication and authorization
  - name: Purchasing
    description: Purchase order management
  - name: Receiving
    description: Goods receiving workflows
  - name: Inventory
    description: Stock management and tracking
  - name: Recipes
    description: Recipe and BOM management
  - name: Production
    description: Production planning and execution
  - name: Reporting
    description: Financial and operational reports
```

#### Endpoint Documentation Standards
```yaml
paths:
  /purchase-orders:
    post:
      tags: [Purchasing]
      summary: Create a new purchase order
      description: |
        Creates a new purchase order with specified items and delivery requirements.
        
        ## Business Rules
        - Supplier must be active and approved
        - All items must exist in the system
        - Delivery date must be in the future
        - Total amount requires manager approval if > $10,000
        
        ## UOM Handling
        Quantities are accepted in any valid UOM for each item.
        The system automatically converts to base units for storage.
        
        ## Audit Trail
        Creation events are logged with user ID and timestamp.
        
      operationId: createPurchaseOrder
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreatePurchaseOrderRequest'
            examples:
              standard_order:
                summary: Standard purchase order
                value:
                  supplier_id: "550e8400-e29b-41d4-a716-446655440000"
                  delivery_date: "2024-02-15T10:00:00Z"
                  items:
                    - item_id: "123e4567-e89b-12d3-a456-426614174000"
                      quantity: 100
                      unit_price: 2.50
                      uom: "kg"
                  notes: "Urgent delivery required"
      responses:
        '201':
          description: Purchase order created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PurchaseOrderResponse'
        '400':
          description: Invalid request data
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '403':
          description: Insufficient permissions
        '422':
          description: Business rule validation failed
```

#### Schema Documentation
```yaml
components:
  schemas:
    CreatePurchaseOrderRequest:
      type: object
      required: [supplier_id, delivery_date, items]
      properties:
        supplier_id:
          type: string
          format: uuid
          description: Unique identifier of the supplier
          example: "550e8400-e29b-41d4-a716-446655440000"
        delivery_date:
          type: string
          format: date-time
          description: Expected delivery date and time
          example: "2024-02-15T10:00:00Z"
        items:
          type: array
          description: List of items to purchase
          minItems: 1
          maxItems: 100
          items:
            $ref: '#/components/schemas/PurchaseOrderItem'
        notes:
          type: string
          maxLength: 1000
          description: Additional notes for the order
          example: "Handle with care - fragile items"
        priority:
          type: string
          enum: [low, normal, high, urgent]
          default: normal
          description: Order priority level
          
    PurchaseOrderItem:
      type: object
      required: [item_id, quantity, unit_price]
      properties:
        item_id:
          type: string
          format: uuid
          description: Unique identifier of the item
        quantity:
          type: number
          format: decimal
          minimum: 0.01
          description: Quantity to purchase
          example: 100.5
        unit_price:
          type: number
          format: decimal
          minimum: 0
          description: Price per unit in supplier's currency
          example: 2.50
        uom:
          type: string
          description: Unit of measure (defaults to item's base UOM)
          example: "kg"
        discount_percent:
          type: number
          format: decimal
          minimum: 0
          maximum: 100
          description: Percentage discount applied
          example: 5.0
```

### Interactive Documentation

#### FastAPI Integration
```python
from fastapi import FastAPI
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi

app = FastAPI(
    title="Bruno's IMS API",
    description="Inventory Management System API",
    version="1.0.0",
    docs_url=None,  # Disable default docs
    redoc_url=None,  # Disable default redoc
)

@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url="/openapi.json",
        title="Bruno's IMS API Documentation",
        swagger_favicon_url="/static/favicon.ico",
        swagger_css_url="/static/swagger-ui.css",
        swagger_js_url="/static/swagger-ui-bundle.js",
    )

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="Bruno's IMS API",
        version="1.0.0",
        description="""
        ## Overview
        Bruno's IMS provides comprehensive inventory management capabilities
        for food & beverage operations with multi-location support.
        
        ## Quick Start
        1. Obtain an API key from your administrator
        2. Include the key in the Authorization header: `Bearer <your-api-key>`
        3. Start with the `/health` endpoint to verify connectivity
        
        ## Key Features
        - Multi-UOM inventory tracking
        - Recipe and BOM management
        - Production planning and execution
        - Real-time financial reporting
        """,
        routes=app.routes,
    )
    
    # Add custom extensions
    openapi_schema["x-logo"] = {
        "url": "/static/logo.png",
        "altText": "Bruno's IMS"
    }
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi
```

## Code Documentation Standards

### Python Docstring Standards (Google Style)

```python
from typing import List, Optional
from datetime import datetime
from decimal import Decimal

class PurchaseOrderService:
    """Service class for managing purchase orders.
    
    This service handles the creation, modification, and retrieval of purchase orders
    within the Bruno's IMS system. It enforces business rules and maintains audit trails.
    
    Attributes:
        db_session: Database session for data persistence
        audit_logger: Logger for audit trail events
        
    Example:
        >>> service = PurchaseOrderService(db_session)
        >>> order = await service.create_purchase_order(request, current_user)
        >>> print(f"Created order {order.order_number}")
    """
    
    def __init__(self, db_session: AsyncSession, audit_logger: AuditLogger):
        """Initialize the purchase order service.
        
        Args:
            db_session: Async database session
            audit_logger: Audit logging service instance
        """
        self.db_session = db_session
        self.audit_logger = audit_logger
    
    async def create_purchase_order(
        self,
        request: CreatePurchaseOrderRequest,
        current_user: User
    ) -> PurchaseOrderResponse:
        """Create a new purchase order.
        
        Creates a purchase order with the specified items and validates all
        business rules including supplier status, item availability, and
        approval requirements.
        
        Args:
            request: Purchase order creation request containing supplier,
                items, and delivery information
            current_user: User creating the purchase order
            
        Returns:
            Created purchase order with generated order number and calculated totals
            
        Raises:
            SupplierNotActiveError: If the specified supplier is not active
            ItemNotFoundError: If any requested item doesn't exist
            InsufficientPermissionsError: If user lacks required permissions
            ValidationError: If business rules are violated
            
        Example:
            >>> request = CreatePurchaseOrderRequest(
            ...     supplier_id="12345",
            ...     items=[{"item_id": "67890", "quantity": 100}]
            ... )
            >>> order = await service.create_purchase_order(request, user)
            >>> assert order.status == "pending"
        """
        # Validate supplier
        supplier = await self._validate_supplier(request.supplier_id)
        
        # Validate items and calculate totals
        validated_items = await self._validate_items(request.items)
        total_amount = self._calculate_total(validated_items)
        
        # Check approval requirements
        requires_approval = self._check_approval_required(total_amount, current_user)
        
        # Create purchase order
        order = PurchaseOrder(
            supplier_id=supplier.id,
            created_by=current_user.id,
            delivery_date=request.delivery_date,
            status="pending_approval" if requires_approval else "approved",
            total_amount=total_amount
        )
        
        # Add items
        for item_data in validated_items:
            order_item = PurchaseOrderItem(
                item_id=item_data.item_id,
                quantity=item_data.quantity_base,
                unit_price=item_data.unit_price
            )
            order.items.append(order_item)
        
        # Save to database
        self.db_session.add(order)
        await self.db_session.commit()
        
        # Log audit event
        await self.audit_logger.log_event(
            event_type=AuditEventType.PURCHASE_ORDER_CREATED,
            user_id=current_user.id,
            resource_type="purchase_order",
            resource_id=str(order.id),
            new_values=order.to_dict()
        )
        
        return PurchaseOrderResponse.from_orm(order)
    
    def _calculate_total(self, items: List[ValidatedItem]) -> Decimal:
        """Calculate the total amount for purchase order items.
        
        Args:
            items: List of validated items with quantities and prices
            
        Returns:
            Total amount including any applicable discounts
            
        Note:
            This method applies item-level discounts but not order-level discounts.
            Order-level discounts are handled during approval workflow.
        """
        total = Decimal('0.00')
        for item in items:
            line_total = item.quantity * item.unit_price
            if item.discount_percent:
                discount = line_total * (item.discount_percent / 100)
                line_total -= discount
            total += line_total
        return total
```

### TypeScript Documentation Standards (TSDoc)

```typescript
/**
 * Service for managing inventory operations with multi-UOM support.
 * 
 * This service provides comprehensive inventory management capabilities including
 * stock tracking, UOM conversions, and real-time availability calculations.
 * 
 * @example
 * ```typescript
 * const service = new InventoryService(apiClient);
 * const items = await service.getInventoryItems({
 *   location: 'warehouse-1',
 *   category: 'produce'
 * });
 * ```
 * 
 * @public
 */
export class InventoryService {
  private readonly apiClient: ApiClient;
  private readonly uomConverter: UomConverter;
  
  /**
   * Creates a new inventory service instance.
   * 
   * @param apiClient - HTTP client for API communication
   * @param uomConverter - Service for unit of measure conversions
   */
  constructor(apiClient: ApiClient, uomConverter: UomConverter) {
    this.apiClient = apiClient;
    this.uomConverter = uomConverter;
  }
  
  /**
   * Retrieve inventory items with optional filtering and pagination.
   * 
   * @param params - Query parameters for filtering and pagination
   * @param params.location - Filter by location ID
   * @param params.category - Filter by item category
   * @param params.search - Search term for item name or SKU
   * @param params.page - Page number (1-based)
   * @param params.limit - Items per page (max 100)
   * @param params.includeZeroStock - Include items with zero stock
   * 
   * @returns Promise resolving to paginated inventory items
   * 
   * @throws {@link ValidationError}
   * When query parameters are invalid
   * 
   * @throws {@link PermissionError}
   * When user lacks read permissions for specified location
   * 
   * @example
   * ```typescript
   * // Get produce items with stock
   * const items = await service.getInventoryItems({
   *   category: 'produce',
   *   includeZeroStock: false,
   *   limit: 50
   * });
   * 
   * // Search for specific items
   * const searchResults = await service.getInventoryItems({
   *   search: 'tomato',
   *   page: 1
   * });
   * ```
   */
  async getInventoryItems(
    params: GetInventoryItemsParams
  ): Promise<PaginatedResponse<InventoryItem>> {
    const validatedParams = this.validateQueryParams(params);
    
    const response = await this.apiClient.get<PaginatedResponse<InventoryItem>>(
      '/inventory/items',
      { params: validatedParams }
    );
    
    // Convert quantities to requested UOM
    const itemsWithConversions = await Promise.all(
      response.data.map(item => this.enrichWithUomConversions(item))
    );
    
    return {
      ...response,
      data: itemsWithConversions
    };
  }
  
  /**
   * Calculate available quantity in specified unit of measure.
   * 
   * This method performs real-time availability calculation considering:
   * - Current stock levels
   * - Pending purchase orders
   * - Reserved quantities
   * - In-transit inventory
   * 
   * @param itemId - Unique identifier of the inventory item
   * @param targetUom - Target unit of measure for the result
   * @param locationId - Optional location filter
   * 
   * @returns Available quantity in the specified UOM
   * 
   * @remarks
   * The calculation includes safety stock considerations and accounts for
   * lead times in availability projections.
   * 
   * @example
   * ```typescript
   * // Get available tomatoes in kilograms
   * const availableKg = await service.calculateAvailableQuantity(
   *   'tomato-123',
   *   'kg',
   *   'warehouse-1'
   * );
   * 
   * console.log(`Available: ${availableKg.toFixed(2)} kg`);
   * ```
   */
  async calculateAvailableQuantity(
    itemId: string,
    targetUom: string,
    locationId?: string
  ): Promise<number> {
    // Implementation details...
  }
}

/**
 * Parameters for querying inventory items.
 * 
 * @public
 */
export interface GetInventoryItemsParams {
  /** Filter by location ID */
  location?: string;
  
  /** Filter by item category */
  category?: string;
  
  /** Search term for item name or SKU */
  search?: string;
  
  /** Page number (1-based) */
  page?: number;
  
  /** Items per page (max 100) */
  limit?: number;
  
  /** Include items with zero stock */
  includeZeroStock?: boolean;
}

/**
 * Inventory item with stock information and UOM conversions.
 * 
 * @public
 */
export interface InventoryItem {
  /** Unique identifier */
  readonly id: string;
  
  /** Item SKU */
  readonly sku: string;
  
  /** Item name */
  readonly name: string;
  
  /** Current stock level in base UOM */
  readonly stockLevel: number;
  
  /** Base unit of measure */
  readonly baseUom: string;
  
  /** Available UOM conversions */
  readonly conversions: UomConversion[];
  
  /** Last updated timestamp */
  readonly updatedAt: Date;
}
```

## Setup Guides Structure

### Development Environment Setup

```markdown
# Development Environment Setup

## Prerequisites

### System Requirements
- **Node.js**: v20.0.0 or later
- **Python**: v3.11 or later  
- **PostgreSQL**: v15.0 or later
- **Redis**: v7.0 or later
- **Docker**: v24.0 or later (optional)
- **Git**: v2.40 or later

### Development Tools
- **pnpm**: Package manager for Node.js workspaces
- **uv**: Fast Python package installer
- **VSCode**: Recommended IDE with extensions
- **TablePlus/pgAdmin**: Database administration tool

## Quick Start

### 1. Repository Setup
```bash
# Clone the repository
git clone https://github.com/jackbruno1994/brunos-ims.git
cd brunos-ims

# Install dependencies
corepack enable
pnpm install

# Setup Python environment
cd services/api
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# or .venv\Scripts\activate  # Windows
pip install -U pip uv
uv pip install -r requirements.txt
```

### 2. Database Setup
```bash
# Start PostgreSQL (if using Docker)
docker run --name brunos-postgres \
  -e POSTGRES_DB=brunos_ims \
  -e POSTGRES_USER=brunos \
  -e POSTGRES_PASSWORD=development \
  -p 5432:5432 \
  -d postgres:15

# Run migrations
cd db
pnpm prisma migrate deploy
pnpm prisma db seed
```

### 3. Environment Configuration
```bash
# Copy environment templates
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local
cp services/api/.env.example services/api/.env

# Edit .env files with your local settings
```

### 4. Start Development Servers
```bash
# Option 1: Start all services with Docker Compose
docker-compose up

# Option 2: Start services individually
# Terminal 1: Database and Redis
docker-compose up postgres redis

# Terminal 2: API Server
cd services/api
source .venv/bin/activate
uvicorn main:app --reload --port 8000

# Terminal 3: Web Application
cd apps/web
pnpm dev

# Terminal 4: UI Library (optional)
cd packages/ui
pnpm dev
```

## Detailed Configuration

### VSCode Extensions
```json
{
  "recommendations": [
    "ms-python.python",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "charliermarsh.ruff",
    "ms-python.mypy-type-checker",
    "Prisma.prisma",
    "ms-vscode.vscode-json"
  ]
}
```

### Database Seeding
The development database includes sample data for testing:
- 3 supplier records
- 50+ inventory items with UOM conversions
- Sample recipes with sub-recipes
- Demo production batches
- User accounts for each role

### Testing Setup
```bash
# Run all tests
pnpm test

# Run specific test suites
pnpm test:unit          # Unit tests only
pnpm test:integration   # Integration tests
pnpm test:e2e          # End-to-end tests

# API testing
cd services/api
pytest tests/ -v
pytest tests/unit/ -v --cov=./

# Watch mode for development
pnpm test:watch
```

## Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check ports in use
lsof -i :3000  # Web app
lsof -i :8000  # API server
lsof -i :5432  # PostgreSQL

# Kill process using port
kill -9 <PID>
```

#### Database Connection Issues
```bash
# Verify PostgreSQL is running
pg_isready -h localhost -p 5432

# Reset database
cd db
pnpm prisma migrate reset --force
pnpm prisma db seed
```

#### Python Dependencies
```bash
# Clear Python cache and reinstall
cd services/api
rm -rf .venv
python -m venv .venv
source .venv/bin/activate
uv pip install -r requirements.txt
```

#### Node.js Dependencies
```bash
# Clear node_modules and reinstall
rm -rf node_modules packages/*/node_modules apps/*/node_modules
pnpm install --frozen-lockfile
```

### Performance Optimization

#### Database Performance
```sql
-- Monitor slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, attname, n_distinct, correlation 
FROM pg_stats 
WHERE schemaname = 'public';
```

#### API Performance
```bash
# Profile API endpoints
cd services/api
python -m cProfile -o profile.stats main.py
python -c "import pstats; pstats.Stats('profile.stats').sort_stats('time').print_stats(20)"
```

## Development Workflow

### Feature Development
1. Create feature branch: `git checkout -b feature/module-name`
2. Implement feature with tests
3. Run full test suite: `pnpm test && cd services/api && pytest`
4. Lint and format: `pnpm lint && pnpm format`
5. Create pull request with description and tests

### Database Changes
1. Create migration: `cd db && pnpm prisma migrate dev --name descriptive-name`
2. Update seed data if needed
3. Test migration rollback: `pnpm prisma migrate reset`
4. Document breaking changes in ADR

### Testing Strategy
- Write unit tests for business logic
- Add integration tests for API endpoints
- Include E2E tests for critical user journeys
- Maintain >70% code coverage
- Use fixtures for consistent test data
```

### Production Deployment Guide

```markdown
# Production Deployment Guide

## Infrastructure Requirements

### Minimum Specifications
- **Application Servers**: 2x instances (4 vCPU, 8GB RAM each)
- **Database**: PostgreSQL 15+ (8 vCPU, 16GB RAM, 100GB SSD)
- **Cache**: Redis 7+ (2 vCPU, 4GB RAM)
- **Load Balancer**: ALB with SSL termination
- **Storage**: S3-compatible object storage
- **CDN**: CloudFront or equivalent

### Scaling Recommendations
- **Auto Scaling**: Min 2, Max 10 instances
- **Database**: Read replicas for reporting workloads  
- **Cache**: Redis Cluster for high availability
- **Monitoring**: CloudWatch, DataDog, or Prometheus

## Security Configuration

### SSL/TLS Setup
```bash
# Generate SSL certificate (Let's Encrypt)
certbot certonly --dns-route53 \
  -d api.brunos-ims.com \
  -d app.brunos-ims.com
```

### Environment Variables
```bash
# Production environment variables
export DATABASE_URL="postgresql://user:pass@prod-db:5432/brunos_ims"
export REDIS_URL="redis://prod-redis:6379"
export JWT_SECRET_KEY="<generated-secret>"
export ENCRYPTION_KEY="<generated-key>"
export AWS_ACCESS_KEY_ID="<access-key>"
export AWS_SECRET_ACCESS_KEY="<secret-key>"
export CORS_ORIGINS="https://app.brunos-ims.com"
```

### Firewall Rules
```bash
# Application servers
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP (redirect to HTTPS)
ufw allow 443/tcp   # HTTPS
ufw deny incoming
ufw enable

# Database server
ufw allow from <app-server-subnet> to any port 5432
ufw allow 22/tcp
ufw deny incoming
ufw enable
```

## Deployment Process

### Initial Deployment
```bash
# 1. Provision infrastructure
cd terraform/production
terraform init
terraform plan
terraform apply

# 2. Deploy application
docker build -t brunos-ims-web:v1.0.0 .
docker build -t brunos-ims-api:v1.0.0 -f services/api/Dockerfile .

# 3. Push to registry
docker tag brunos-ims-web:v1.0.0 registry.com/brunos-ims-web:v1.0.0
docker push registry.com/brunos-ims-web:v1.0.0

# 4. Deploy to ECS/Kubernetes
kubectl apply -f k8s/production/
```

### Database Migration
```bash
# Backup before migration
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Run migrations
cd db
DATABASE_URL=$PROD_DATABASE_URL pnpm prisma migrate deploy

# Verify migration
python scripts/verify-migration.py --env production
```

### Blue-Green Deployment
```bash
# Deploy to green environment
terraform apply -var="environment=green" -var="image_tag=v1.1.0"

# Health check
curl -f https://green.brunos-ims.com/health

# Switch traffic
aws elbv2 modify-listener \
  --listener-arn $LISTENER_ARN \
  --default-actions file://green-targets.json

# Monitor for 5 minutes
sleep 300

# Verify success
python scripts/monitor-metrics.py --duration=5m
```

## Monitoring & Alerting

### Health Checks
```yaml
# k8s/healthcheck.yml
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: healthcheck
    image: busybox
    command:
    - /bin/sh
    - -c
    - |
      # API health check
      wget -q --spider http://api:8000/health || exit 1
      
      # Database connectivity
      nc -z postgres 5432 || exit 1
      
      # Redis connectivity  
      nc -z redis 6379 || exit 1
```

### Performance Monitoring
```python
# scripts/monitor-metrics.py
import psutil
import requests
import time
from datetime import datetime

def monitor_system_metrics():
    """Monitor system performance metrics."""
    
    # CPU usage
    cpu_percent = psutil.cpu_percent(interval=1)
    
    # Memory usage
    memory = psutil.virtual_memory()
    
    # Disk usage
    disk = psutil.disk_usage('/')
    
    # API response times
    start_time = time.time()
    response = requests.get('https://api.brunos-ims.com/health')
    api_response_time = time.time() - start_time
    
    metrics = {
        'timestamp': datetime.utcnow().isoformat(),
        'cpu_percent': cpu_percent,
        'memory_percent': memory.percent,
        'disk_percent': disk.percent,
        'api_response_time': api_response_time,
        'api_status_code': response.status_code
    }
    
    # Send to monitoring service
    send_metrics_to_cloudwatch(metrics)
    
    return metrics
```

## Backup & Recovery

### Database Backup Strategy
```bash
#!/bin/bash
# scripts/backup-database.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"
S3_BUCKET="brunos-ims-backups"

# Create backup
pg_dump $DATABASE_URL > $BACKUP_DIR/brunos_ims_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/brunos_ims_$DATE.sql

# Upload to S3
aws s3 cp $BACKUP_DIR/brunos_ims_$DATE.sql.gz s3://$S3_BUCKET/daily/

# Cleanup local backups (keep 7 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

# Cleanup S3 backups (keep 30 days)
aws s3 ls s3://$S3_BUCKET/daily/ --recursive | \
  awk '$1 < "'$(date -d '30 days ago' '+%Y-%m-%d')'" {print $4}' | \
  xargs -I {} aws s3 rm s3://$S3_BUCKET/{}
```

### Disaster Recovery Plan
```markdown
## Recovery Time Objectives (RTO)
- **Database**: 15 minutes
- **Application**: 30 minutes  
- **Full System**: 1 hour

## Recovery Point Objectives (RPO)
- **Database**: 1 hour (continuous backup)
- **File Storage**: 4 hours (S3 cross-region replication)

## Recovery Procedures

### Database Recovery
1. Provision new database instance
2. Restore from latest backup
3. Apply any missing transactions from WAL
4. Update application connection strings
5. Verify data integrity

### Application Recovery  
1. Deploy latest stable version
2. Update DNS records
3. Verify health checks
4. Run smoke tests
5. Monitor error rates

### Complete Disaster Recovery
1. Activate secondary region
2. Restore database from backup
3. Deploy application stack
4. Update DNS to point to new region
5. Communicate with users
6. Monitor and validate functionality
```

## Maintenance Procedures

### Regular Maintenance Tasks

#### Daily
- Monitor system health dashboards
- Review error logs and alerts
- Check backup completion status
- Verify SSL certificate validity

#### Weekly  
- Review performance metrics
- Update security patches
- Analyze slow query reports
- Check disk space usage

#### Monthly
- Security vulnerability scans
- Dependency updates
- Database maintenance (VACUUM, REINDEX)
- Review and update monitoring thresholds

#### Quarterly
- Disaster recovery testing
- Security audit
- Performance capacity planning
- Update documentation

### Database Maintenance
```sql
-- Monthly database maintenance
-- Run during low-traffic periods

-- Update table statistics
ANALYZE;

-- Rebuild fragmented indexes
REINDEX DATABASE brunos_ims;

-- Clean up old audit logs (older than retention period)
DELETE FROM audit_logs 
WHERE created_at < NOW() - INTERVAL '2 years';

-- Vacuum to reclaim space
VACUUM (ANALYZE, VERBOSE);

-- Check for bloated tables
SELECT 
    schemaname, 
    tablename, 
    pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size,
    pg_size_pretty(pg_relation_size(tablename::regclass)) as table_size,
    pg_size_pretty(pg_indexes_size(tablename::regclass)) as index_size
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY pg_total_relation_size(tablename::regclass) DESC;
```

### Security Updates
```bash
#!/bin/bash
# scripts/security-updates.sh

# Update system packages
apt update && apt upgrade -y

# Update Docker images
docker pull postgres:15
docker pull redis:7
docker pull node:20-alpine
docker pull python:3.11-slim

# Restart services with new images
kubectl rollout restart deployment/brunos-ims-web
kubectl rollout restart deployment/brunos-ims-api

# Verify deployments
kubectl rollout status deployment/brunos-ims-web
kubectl rollout status deployment/brunos-ims-api

# Run security scans
trivy image registry.com/brunos-ims-web:latest
trivy image registry.com/brunos-ims-api:latest
```

### Performance Tuning
```bash
#!/bin/bash
# scripts/performance-tuning.sh

# PostgreSQL tuning
psql $DATABASE_URL << EOF
-- Adjust based on available memory
ALTER SYSTEM SET shared_buffers = '2GB';
ALTER SYSTEM SET effective_cache_size = '6GB';
ALTER SYSTEM SET work_mem = '32MB';
ALTER SYSTEM SET maintenance_work_mem = '512MB';

-- Connection settings
ALTER SYSTEM SET max_connections = '200';
ALTER SYSTEM SET max_wal_size = '2GB';

-- Query optimization
ALTER SYSTEM SET random_page_cost = '1.1';
ALTER SYSTEM SET effective_io_concurrency = '200';

-- Reload configuration
SELECT pg_reload_conf();
EOF

# Redis tuning
redis-cli CONFIG SET maxmemory 2gb
redis-cli CONFIG SET maxmemory-policy allkeys-lru
redis-cli CONFIG REWRITE
```
```

## Code Documentation Standards

### Inline Code Comments
```python
# Python comment standards
def calculate_recipe_cost(recipe_id: str, batch_size: Decimal) -> Decimal:
    """Calculate total cost for a recipe batch."""
    
    # Get recipe with ingredients - this includes sub-recipes
    recipe = await self.recipe_repository.get_with_ingredients(recipe_id)
    
    total_cost = Decimal('0.00')
    
    for ingredient in recipe.ingredients:
        # Convert ingredient quantity to base UOM for costing
        base_quantity = await self.uom_service.convert_to_base(
            ingredient.quantity, 
            ingredient.uom,
            ingredient.item_id
        )
        
        # Scale quantity based on batch size vs recipe yield
        scaled_quantity = base_quantity * (batch_size / recipe.yield_quantity_base)
        
        # Use latest weighted average cost from stock movements
        # This ensures we use actual purchase costs, not just PO prices
        unit_cost = await self.cost_service.get_weighted_average_cost(
            ingredient.item_id
        )
        
        ingredient_cost = scaled_quantity * unit_cost
        total_cost += ingredient_cost
        
        # IMPORTANT: Don't forget prep loss percentage
        # This accounts for waste during preparation
        if ingredient.prep_loss_percent:
            loss_cost = ingredient_cost * (ingredient.prep_loss_percent / 100)
            total_cost += loss_cost
    
    return total_cost
```

```typescript
// TypeScript comment standards
export function useInventoryQuery(filters: InventoryFilters) {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['inventory', filters],
    queryFn: async () => {
      // Transform filters to API format
      // The API expects snake_case but our UI uses camelCase
      const apiFilters = {
        location_id: filters.locationId,
        category_id: filters.categoryId,
        include_zero_stock: filters.includeZeroStock ?? false,
      };
      
      const response = await apiClient.get<InventoryItem[]>('/inventory', {
        params: apiFilters
      });
      
      // Enrich items with UOM conversion data
      // This allows the UI to display quantities in user-preferred units
      return Promise.all(
        response.data.map(async (item) => ({
          ...item,
          // Add common UOM conversions for quick access
          conversions: await getCommonConversions(item.id),
          // Calculate total value using weighted average cost
          totalValue: item.stockLevel * item.weightedAverageCost,
        }))
      );
    },
    // Refresh every 30 seconds for real-time inventory
    refetchInterval: 30 * 1000,
    // Keep previous data while fetching new data
    keepPreviousData: true,
  });
}
```

### README Documentation
Each module/package should include comprehensive README documentation following this template:

```markdown
# Module Name

Brief description of what this module does and its purpose within Bruno's IMS.

## Overview

Detailed explanation of the module's functionality, key features, and how it fits into the overall system architecture.

## Installation

```bash
# Installation commands
pnpm install
```

## Usage

### Basic Example
```typescript
// Simple usage example
import { ModuleService } from './module-service';

const service = new ModuleService();
const result = await service.performAction();
```

### Advanced Usage
```typescript
// More complex examples with configuration
const service = new ModuleService({
  apiUrl: 'https://api.example.com',
  timeout: 5000,
});
```

## API Reference

### Classes

#### ModuleService
Main service class for module operations.

##### Methods

###### `performAction(params: ActionParams): Promise<ActionResult>`
Performs the main action of the module.

**Parameters:**
- `params.id` (string) - Unique identifier
- `params.options` (ActionOptions) - Configuration options

**Returns:**
Promise<ActionResult> - Result of the action

**Example:**
```typescript
const result = await service.performAction({
  id: '123',
  options: { validate: true }
});
```

## Configuration

### Environment Variables
- `MODULE_API_URL` - API endpoint URL
- `MODULE_TIMEOUT` - Request timeout in milliseconds
- `MODULE_DEBUG` - Enable debug logging

### Config File
```json
{
  "timeout": 5000,
  "retries": 3,
  "debug": false
}
```

## Testing

```bash
# Run tests
pnpm test

# Run with coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
```
---
applies_to:
  - services/api/**
---

# API Service — Copilot Instructions

FastAPI service for Bruno's IMS backend with clean architecture, async patterns, and comprehensive validation.

## Architecture Guidelines

### Clean Architecture Layers
```
services/api/
├── routers/          # HTTP endpoints (controllers)
├── services/         # Business logic layer
├── repositories/     # Data access layer  
├── models/          # Pydantic models
│   ├── requests/    # Request DTOs
│   ├── responses/   # Response DTOs
│   └── entities/    # Database entities
├── core/            # Core utilities and config
├── dependencies/    # FastAPI dependencies
└── tests/           # Test suites
```

### Dependency Flow
- **Routers** → **Services** → **Repositories** → **Database**
- Never call repositories directly from routers
- Services contain all business logic and validation
- Repositories handle only data access operations

### Service Layer Pattern
```python
# ✅ Good: Service with clear separation of concerns
class PurchaseOrderService:
    def __init__(
        self, 
        po_repository: PurchaseOrderRepository,
        supplier_service: SupplierService,
        audit_logger: AuditLogger
    ):
        self.po_repository = po_repository
        self.supplier_service = supplier_service
        self.audit_logger = audit_logger
    
    async def create_purchase_order(
        self,
        request: CreatePurchaseOrderRequest,
        current_user: User
    ) -> PurchaseOrderResponse:
        # Business logic validation
        await self._validate_business_rules(request, current_user)
        
        # Create entity
        po = PurchaseOrder(
            supplier_id=request.supplier_id,
            created_by=current_user.id,
            status=POStatus.PENDING
        )
        
        # Persist
        saved_po = await self.po_repository.create(po)
        
        # Audit logging
        await self.audit_logger.log_creation(saved_po, current_user.id)
        
        return PurchaseOrderResponse.from_orm(saved_po)
```

## Development Guidelines

### Request/Response Models
```python
# ✅ Good: Comprehensive request model with validation
class CreatePurchaseOrderRequest(BaseModel):
    supplier_id: UUID = Field(..., description="Supplier identifier")
    delivery_date: datetime = Field(..., description="Expected delivery date")
    items: List[PurchaseOrderItemRequest] = Field(
        ..., 
        min_items=1, 
        max_items=100,
        description="Purchase order items"
    )
    notes: Optional[str] = Field(None, max_length=1000)
    priority: POPriority = Field(default=POPriority.NORMAL)
    
    @validator('delivery_date')
    def delivery_date_must_be_future(cls, v):
        if v <= datetime.utcnow():
            raise ValueError('Delivery date must be in the future')
        return v
    
    @validator('items')
    def validate_items(cls, v):
        if not v:
            raise ValueError('At least one item is required')
        return v
    
    class Config:
        schema_extra = {
            "example": {
                "supplier_id": "550e8400-e29b-41d4-a716-446655440000",
                "delivery_date": "2024-02-15T10:00:00Z",
                "items": [
                    {
                        "item_id": "123e4567-e89b-12d3-a456-426614174000",
                        "quantity": 100,
                        "unit_price": 2.50
                    }
                ],
                "notes": "Urgent delivery required"
            }
        }
```

### Error Handling
```python
# ✅ Good: Custom exceptions with proper error codes
class BusinessRuleError(HTTPException):
    def __init__(self, message: str, error_code: str = None):
        super().__init__(
            status_code=422,
            detail={
                "message": message,
                "error_code": error_code,
                "type": "business_rule_violation"
            }
        )

class SupplierNotActiveError(BusinessRuleError):
    def __init__(self, supplier_id: str):
        super().__init__(
            message=f"Supplier {supplier_id} is not active",
            error_code="SUPPLIER_NOT_ACTIVE"
        )

# Usage in service
async def _validate_supplier(self, supplier_id: UUID) -> Supplier:
    supplier = await self.supplier_repository.get_by_id(supplier_id)
    if not supplier:
        raise HTTPException(404, "Supplier not found")
    if not supplier.is_active:
        raise SupplierNotActiveError(str(supplier_id))
    return supplier
```

### Database Integration
```python
# ✅ Good: Repository pattern with proper async handling
class PurchaseOrderRepository:
    def __init__(self, db_session: AsyncSession):
        self.db_session = db_session
    
    async def create(self, po: PurchaseOrder) -> PurchaseOrder:
        self.db_session.add(po)
        await self.db_session.commit()
        await self.db_session.refresh(po)
        return po
    
    async def get_by_id(self, po_id: UUID) -> Optional[PurchaseOrder]:
        query = select(PurchaseOrder).where(PurchaseOrder.id == po_id)
        result = await self.db_session.execute(query)
        return result.scalar_one_or_none()
    
    async def list_by_supplier(
        self, 
        supplier_id: UUID, 
        limit: int = 100,
        offset: int = 0
    ) -> List[PurchaseOrder]:
        query = (
            select(PurchaseOrder)
            .where(PurchaseOrder.supplier_id == supplier_id)
            .limit(limit)
            .offset(offset)
            .order_by(PurchaseOrder.created_at.desc())
        )
        result = await self.db_session.execute(query)
        return result.scalars().all()
```

### Router Implementation
```python
# ✅ Good: Router with proper dependency injection and documentation
@router.post(
    "/",
    response_model=PurchaseOrderResponse,
    status_code=201,
    summary="Create purchase order",
    description="Creates a new purchase order with validation and business rules"
)
async def create_purchase_order(
    request: CreatePurchaseOrderRequest,
    current_user: User = Depends(get_current_user),
    po_service: PurchaseOrderService = Depends(get_purchase_order_service),
    _: None = Depends(PermissionChecker(["purchase_orders:create"]))
) -> PurchaseOrderResponse:
    """
    Create a purchase order with the following business rules:
    - Supplier must be active
    - Delivery date must be in the future
    - User must have create permissions
    - Items must exist in the system
    """
    return await po_service.create_purchase_order(request, current_user)
```

## Testing Requirements

### Unit Testing
```python
# ✅ Good: Service unit test with proper mocking
import pytest
from unittest.mock import AsyncMock, Mock
from services.purchase_order_service import PurchaseOrderService

@pytest.fixture
def mock_po_repository():
    return AsyncMock(spec=PurchaseOrderRepository)

@pytest.fixture
def mock_supplier_service():
    return AsyncMock(spec=SupplierService)

@pytest.fixture
def po_service(mock_po_repository, mock_supplier_service):
    return PurchaseOrderService(
        po_repository=mock_po_repository,
        supplier_service=mock_supplier_service,
        audit_logger=AsyncMock()
    )

@pytest.mark.asyncio
async def test_create_purchase_order_success(po_service, mock_po_repository):
    # Arrange
    request = CreatePurchaseOrderRequest(
        supplier_id=UUID("550e8400-e29b-41d4-a716-446655440000"),
        delivery_date=datetime.utcnow() + timedelta(days=7),
        items=[{"item_id": "123", "quantity": 100, "unit_price": 2.50}]
    )
    user = User(id=UUID("user-123"), role=Role.MANAGER)
    
    expected_po = PurchaseOrder(id=UUID("po-123"), supplier_id=request.supplier_id)
    mock_po_repository.create.return_value = expected_po
    
    # Act
    result = await po_service.create_purchase_order(request, user)
    
    # Assert
    assert result.id == expected_po.id
    assert result.supplier_id == request.supplier_id
    mock_po_repository.create.assert_called_once()
```

### Integration Testing
```python
# ✅ Good: Router integration test with TestClient
import pytest
from httpx import AsyncClient
from fastapi.testclient import TestClient

@pytest.mark.asyncio
async def test_create_purchase_order_endpoint(
    async_client: AsyncClient,
    test_user_token: str,
    test_supplier: Supplier
):
    headers = {"Authorization": f"Bearer {test_user_token}"}
    payload = {
        "supplier_id": str(test_supplier.id),
        "delivery_date": "2024-12-31T10:00:00Z",
        "items": [
            {
                "item_id": str(test_item.id),
                "quantity": 100,
                "unit_price": 2.50
            }
        ]
    }
    
    response = await async_client.post(
        "/api/v1/purchase-orders/",
        json=payload,
        headers=headers
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["supplier_id"] == payload["supplier_id"]
    assert len(data["items"]) == 1
```

## Security Implementation

### Authentication & Authorization
```python
# ✅ Good: JWT authentication with proper validation
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db_session)
) -> User:
    try:
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET_KEY, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(401, "Invalid authentication credentials")
        
        user = await get_user_by_id(db, UUID(user_id))
        if user is None:
            raise HTTPException(401, "User not found")
        
        return user
    except JWTError:
        raise HTTPException(401, "Invalid authentication credentials")

# ✅ Good: Permission-based access control
class PermissionChecker:
    def __init__(self, required_permissions: List[str]):
        self.required_permissions = required_permissions
    
    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        user_permissions = set(current_user.role.permissions)
        required_permissions = set(self.required_permissions)
        
        if not required_permissions.issubset(user_permissions):
            raise HTTPException(403, "Insufficient permissions")
        
        return current_user
```

### Input Validation & Sanitization
```python
# ✅ Good: Comprehensive input validation
class CreateItemRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    sku: str = Field(..., regex=r'^[A-Z0-9-]{3,20}$')
    base_uom: str = Field(..., min_length=1, max_length=10)
    category_id: UUID
    
    @validator('name')
    def sanitize_name(cls, v):
        # Remove potentially dangerous characters
        return re.sub(r'[<>"\']', '', v.strip())
    
    @validator('sku')
    def validate_sku_format(cls, v):
        # Ensure SKU follows business rules
        if not re.match(r'^[A-Z0-9-]{3,20}$', v):
            raise ValueError('SKU must be 3-20 characters, alphanumeric with hyphens')
        return v.upper()
```

## Performance Guidelines

### Database Query Optimization
```python
# ✅ Good: Optimized queries with proper indexing considerations
async def get_inventory_with_details(
    self,
    location_id: Optional[UUID] = None,
    category_id: Optional[UUID] = None,
    limit: int = 100,
    offset: int = 0
) -> List[InventoryItemDetail]:
    query = (
        select(Item)
        .options(
            selectinload(Item.stock_levels),
            selectinload(Item.conversions),
            selectinload(Item.category)
        )
        .limit(limit)
        .offset(offset)
    )
    
    if location_id:
        query = query.join(StockLevel).where(StockLevel.location_id == location_id)
    
    if category_id:
        query = query.where(Item.category_id == category_id)
    
    result = await self.db_session.execute(query)
    return result.scalars().all()

# ✅ Good: Pagination with cursor-based approach for large datasets
async def get_purchase_orders_paginated(
    self,
    cursor: Optional[datetime] = None,
    limit: int = 50
) -> Tuple[List[PurchaseOrder], Optional[datetime]]:
    query = (
        select(PurchaseOrder)
        .order_by(PurchaseOrder.created_at.desc())
        .limit(limit + 1)  # Get one extra to determine if there's a next page
    )
    
    if cursor:
        query = query.where(PurchaseOrder.created_at < cursor)
    
    result = await self.db_session.execute(query)
    items = result.scalars().all()
    
    # Determine next cursor
    next_cursor = None
    if len(items) > limit:
        items = items[:-1]  # Remove the extra item
        next_cursor = items[-1].created_at
    
    return items, next_cursor
```

### Caching Strategy
```python
# ✅ Good: Redis caching for frequently accessed data
from redis import asyncio as aioredis
import json

class CacheService:
    def __init__(self, redis_client: aioredis.Redis):
        self.redis = redis_client
    
    async def get_cached_data(self, key: str, data_class: Type[BaseModel]):
        cached_data = await self.redis.get(key)
        if cached_data:
            return data_class.parse_raw(cached_data)
        return None
    
    async def cache_data(
        self, 
        key: str, 
        data: BaseModel, 
        ttl: int = 3600
    ):
        await self.redis.setex(key, ttl, data.json())

# Usage in service
async def get_item_with_conversions(self, item_id: UUID) -> ItemWithConversions:
    cache_key = f"item:conversions:{item_id}"
    
    # Try cache first
    cached_item = await self.cache_service.get_cached_data(
        cache_key, 
        ItemWithConversions
    )
    if cached_item:
        return cached_item
    
    # Fetch from database
    item = await self.item_repository.get_with_conversions(item_id)
    
    # Cache for 1 hour
    await self.cache_service.cache_data(cache_key, item, 3600)
    
    return item
```

## Commands

### Development
```bash
cd services/api
uvicorn main:app --reload                    # Start development server
uvicorn main:app --reload --port 8000       # Specify port
python -m pytest                            # Run tests
python -m pytest -v                         # Verbose test output
python -m pytest --cov=./                   # Run with coverage
python -m pytest tests/unit/                # Run unit tests only
python -m pytest tests/integration/         # Run integration tests only
```

### Code Quality
```bash
ruff check .                                 # Lint code
ruff check . --fix                          # Fix linting issues automatically
black .                                     # Format code
mypy .                                      # Type checking
safety check                               # Security vulnerability check
```

### Database
```bash
alembic revision --autogenerate -m "description"  # Create migration
alembic upgrade head                              # Apply migrations
alembic downgrade -1                              # Rollback one migration
```

## Constraints

### Multi-UOM Requirements
- All quantity calculations must use the shared UOM service (`services/api/services/uom.py`)
- Store quantities in base units only in the database
- Convert for display/input using the conversion service
- Never hardcode conversion factors

### Financial Calculations
- Use Decimal type for all monetary values to avoid floating-point errors
- Recipe costs must be calculated from weighted average of stock movements
- Never use purchase order prices directly for costing
- Include wastage/prep loss in all cost calculations

### Audit Requirements
- All critical operations must be logged with audit trails
- Include user ID, timestamp, old values, and new values
- Use the audit logging service for consistent formatting
- Retain audit logs according to compliance requirements

### Performance Requirements
- API response times should be < 200ms for simple queries
- Complex reports should complete within 5 seconds
- Database queries should use proper indexing
- Implement pagination for all list endpoints
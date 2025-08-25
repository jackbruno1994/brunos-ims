# Security Configuration

## Role-Based Access Control (RBAC)

### User Roles & Permissions

#### Role Hierarchy
```
Admin
├── Manager
│   ├── Supervisor
│   │   ├── Chef
│   │   └── Staff
│   └── Accountant
└── Auditor (read-only across all)
```

#### Permission Matrix

| Resource | Admin | Manager | Supervisor | Chef | Staff | Accountant | Auditor |
|----------|-------|---------|------------|------|-------|------------|---------|
| Users Management | CRUD | R | - | - | - | - | R |
| Suppliers | CRUD | CRUD | R | R | R | R | R |
| Purchase Orders | CRUD | CRUD | R | R | - | CRUD | R |
| Receiving | CRUD | CRUD | CRUD | CRUD | R | R | R |
| Inventory | CRUD | CRUD | CRUD | CRUD | R | R | R |
| Recipes | CRUD | CRUD | CRUD | CRUD | R | R | R |
| Production | CRUD | CRUD | CRUD | CRUD | - | R | R |
| Financial Reports | CRUD | CRUD | R | - | - | CRUD | R |
| Audit Logs | R | R | - | - | - | - | CRUD |

### Permission Implementation

#### FastAPI Dependency Pattern
```python
from functools import wraps
from typing import List
from fastapi import Depends, HTTPException, status

class PermissionChecker:
    def __init__(self, required_permissions: List[str]):
        self.required_permissions = required_permissions
    
    def __call__(
        self, 
        current_user: User = Depends(get_current_user)
    ) -> User:
        if not self._has_permissions(current_user, self.required_permissions):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user
    
    def _has_permissions(self, user: User, permissions: List[str]) -> bool:
        user_permissions = set(user.role.permissions)
        required_permissions = set(permissions)
        return required_permissions.issubset(user_permissions)

# Usage in routers
@router.post("/purchase-orders/")
async def create_purchase_order(
    request: CreatePurchaseOrderRequest,
    current_user: User = Depends(PermissionChecker(["purchase_orders:create"]))
) -> PurchaseOrderResponse:
    # Implementation
    pass
```

#### Frontend Route Protection
```typescript
// Higher-order component for route protection
export const withPermission = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermissions: string[]
) => {
  return function ProtectedComponent(props: P) {
    const { user } = useAuth();
    
    if (!hasPermissions(user, requiredPermissions)) {
      return <UnauthorizedPage />;
    }
    
    return <Component {...props} />;
  };
};

// Usage
const ProtectedPurchaseOrders = withPermission(
  PurchaseOrdersPage, 
  ['purchase_orders:read']
);
```

### Multi-Location Access Control
```python
class LocationAccessMixin:
    """Mixin to enforce location-based access control"""
    
    def filter_by_user_locations(
        self, 
        query: Query, 
        user: User
    ) -> Query:
        if user.role.name == 'admin':
            return query  # Admin sees all locations
        
        return query.filter(
            Location.id.in_(user.accessible_location_ids)
        )
```

## Encryption Standards

### Data Encryption at Rest

#### Database Encryption
```python
# Sensitive field encryption using cryptography
from cryptography.fernet import Fernet
from sqlalchemy_utils import EncryptedType
from sqlalchemy_utils.types.encrypted.encrypted_type import AesEngine

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    
    # Encrypted sensitive data
    phone = Column(EncryptedType(String, secret_key, AesEngine, 'pkcs5'))
    salary = Column(EncryptedType(Numeric, secret_key, AesEngine, 'pkcs5'))
    
    # Hashed passwords
    password_hash = Column(String, nullable=False)
```

#### File Storage Encryption
```python
import boto3
from cryptography.fernet import Fernet

class EncryptedFileStorage:
    def __init__(self, encryption_key: str):
        self.cipher = Fernet(encryption_key.encode())
        self.s3_client = boto3.client('s3')
    
    async def store_file(self, file_content: bytes, key: str) -> str:
        # Encrypt file content
        encrypted_content = self.cipher.encrypt(file_content)
        
        # Store in S3 with server-side encryption
        self.s3_client.put_object(
            Bucket='brunos-ims-files',
            Key=key,
            Body=encrypted_content,
            ServerSideEncryption='AES256'
        )
        
        return key
```

### Data Encryption in Transit

#### API Communication
```python
# Force HTTPS in production
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

app = FastAPI()

if settings.environment == "production":
    app.add_middleware(HTTPSRedirectMiddleware)
```

#### Database Connections
```python
# PostgreSQL connection with SSL
DATABASE_URL = (
    "postgresql+asyncpg://user:pass@host:5432/db"
    "?ssl=require&sslmode=require"
)
```

### Key Management

#### Environment-based Key Rotation
```bash
# .env.production
ENCRYPTION_KEY_V1=<current_key>
ENCRYPTION_KEY_V2=<new_key>
DATABASE_ENCRYPTION_KEY=<db_key>
JWT_SECRET_KEY=<jwt_key>
API_KEY_ENCRYPTION=<api_key_encryption>
```

#### Key Derivation
```python
import secrets
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

def derive_key(password: str, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    return kdf.derive(password.encode())
```

## Audit Logging

### Audit Event Types
```python
from enum import Enum

class AuditEventType(Enum):
    USER_LOGIN = "user_login"
    USER_LOGOUT = "user_logout"
    USER_CREATED = "user_created"
    USER_UPDATED = "user_updated"
    USER_DELETED = "user_deleted"
    
    # Financial events
    PURCHASE_ORDER_CREATED = "purchase_order_created"
    PURCHASE_ORDER_APPROVED = "purchase_order_approved"
    RECEIPT_RECORDED = "receipt_recorded"
    STOCK_MOVEMENT = "stock_movement"
    RECIPE_COST_CALCULATED = "recipe_cost_calculated"
    
    # Production events
    PRODUCTION_STARTED = "production_started"
    PRODUCTION_COMPLETED = "production_completed"
    WASTAGE_RECORDED = "wastage_recorded"
    
    # Security events
    LOGIN_FAILED = "login_failed"
    PERMISSION_DENIED = "permission_denied"
    DATA_EXPORT = "data_export"
    SENSITIVE_DATA_ACCESS = "sensitive_data_access"
```

### Audit Log Implementation
```python
from datetime import datetime
from typing import Any, Dict, Optional
import json

class AuditLogger:
    def __init__(self, db_session: AsyncSession):
        self.db_session = db_session
    
    async def log_event(
        self,
        event_type: AuditEventType,
        user_id: Optional[UUID],
        resource_type: str,
        resource_id: Optional[str],
        old_values: Optional[Dict[str, Any]] = None,
        new_values: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> None:
        audit_log = AuditLog(
            event_type=event_type.value,
            user_id=user_id,
            resource_type=resource_type,
            resource_id=resource_id,
            old_values=json.dumps(old_values) if old_values else None,
            new_values=json.dumps(new_values) if new_values else None,
            metadata=json.dumps(metadata) if metadata else None,
            timestamp=datetime.utcnow(),
            ip_address=self._get_client_ip(),
            user_agent=self._get_user_agent()
        )
        
        self.db_session.add(audit_log)
        await self.db_session.commit()
```

### Audit Decorator
```python
def audit_action(
    event_type: AuditEventType,
    resource_type: str,
    track_changes: bool = True
):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract user and resource info
            user = kwargs.get('current_user')
            
            # Get old values if tracking changes
            old_values = None
            if track_changes and hasattr(args[0], 'id'):
                old_values = await get_resource_snapshot(
                    resource_type, 
                    args[0].id
                )
            
            # Execute function
            result = await func(*args, **kwargs)
            
            # Log the audit event
            await AuditLogger(kwargs.get('db')).log_event(
                event_type=event_type,
                user_id=user.id if user else None,
                resource_type=resource_type,
                resource_id=getattr(result, 'id', None),
                old_values=old_values,
                new_values=result.dict() if hasattr(result, 'dict') else None
            )
            
            return result
        return wrapper
    return decorator

# Usage
@audit_action(AuditEventType.PURCHASE_ORDER_CREATED, "purchase_order")
async def create_purchase_order(
    request: CreatePurchaseOrderRequest,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
) -> PurchaseOrderResponse:
    # Implementation
    pass
```

### Compliance & Retention
```python
# Audit log retention policy
class AuditRetentionPolicy:
    FINANCIAL_RECORDS = 7 * 365  # 7 years
    USER_ACTIONS = 2 * 365       # 2 years
    SECURITY_EVENTS = 5 * 365    # 5 years
    SYSTEM_EVENTS = 1 * 365      # 1 year
    
    @classmethod
    def get_retention_days(cls, event_type: AuditEventType) -> int:
        financial_events = {
            AuditEventType.PURCHASE_ORDER_CREATED,
            AuditEventType.RECEIPT_RECORDED,
            AuditEventType.STOCK_MOVEMENT,
            AuditEventType.RECIPE_COST_CALCULATED
        }
        
        security_events = {
            AuditEventType.LOGIN_FAILED,
            AuditEventType.PERMISSION_DENIED,
            AuditEventType.SENSITIVE_DATA_ACCESS
        }
        
        if event_type in financial_events:
            return cls.FINANCIAL_RECORDS
        elif event_type in security_events:
            return cls.SECURITY_EVENTS
        else:
            return cls.USER_ACTIONS
```

## Rate Limiting

### API Rate Limiting
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Different rate limits by endpoint type
@router.get("/health")
@limiter.limit("100/minute")  # High rate for health checks
async def health_check(request: Request):
    return {"status": "healthy"}

@router.post("/auth/login")
@limiter.limit("5/minute")  # Strict rate for authentication
async def login(request: Request, credentials: LoginRequest):
    # Implementation
    pass

@router.get("/api/inventory")
@limiter.limit("1000/hour")  # Moderate rate for data access
async def get_inventory(request: Request):
    # Implementation
    pass
```

### User-based Rate Limiting
```python
def get_user_id(request: Request) -> str:
    """Extract user ID from request for rate limiting"""
    try:
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
        return payload.get("sub", get_remote_address(request))
    except:
        return get_remote_address(request)

user_limiter = Limiter(key_func=get_user_id)

@router.post("/api/purchase-orders")
@user_limiter.limit("100/hour")  # Per-user rate limit
async def create_purchase_order(request: Request):
    # Implementation
    pass
```

### Rate Limiting by Role
```python
from functools import wraps

def role_based_rate_limit(limits: Dict[str, str]):
    def decorator(func):
        @wraps(func)
        async def wrapper(request: Request, *args, **kwargs):
            user = await get_current_user_from_request(request)
            user_role = user.role.name if user else 'anonymous'
            
            rate_limit = limits.get(user_role, limits.get('default', '10/minute'))
            
            # Apply rate limit dynamically
            await limiter.check_request(request, rate_limit)
            
            return await func(request, *args, **kwargs)
        return wrapper
    return decorator

@router.post("/api/reports/export")
@role_based_rate_limit({
    'admin': '100/hour',
    'manager': '50/hour',
    'staff': '10/hour',
    'default': '5/hour'
})
async def export_report(request: Request):
    # Implementation
    pass
```

### Frontend Rate Limiting Protection
```typescript
// Request interceptor with rate limiting awareness
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.VITE_API_URL,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      
      // Show user-friendly rate limit message
      toast.warning(
        `Rate limit exceeded. Please try again in ${retryAfter} seconds.`
      );
      
      // Optional: Implement exponential backoff retry
      if (retryAfter && parseInt(retryAfter) < 60) {
        await new Promise(resolve => 
          setTimeout(resolve, parseInt(retryAfter) * 1000)
        );
        return api.request(error.config);
      }
    }
    
    return Promise.reject(error);
  }
);
```

## Input Validation & Sanitization

### API Input Validation
```python
from pydantic import BaseModel, validator, Field
from typing import Optional
import re

class CreatePurchaseOrderRequest(BaseModel):
    supplier_id: UUID = Field(..., description="Supplier identifier")
    delivery_date: datetime = Field(..., description="Expected delivery date")
    notes: Optional[str] = Field(None, max_length=1000, description="Order notes")
    
    @validator('supplier_id')
    def validate_supplier_exists(cls, v):
        # Validate supplier exists in database
        return v
    
    @validator('notes')
    def sanitize_notes(cls, v):
        if v:
            # Remove potentially dangerous characters
            return re.sub(r'[<>"\']', '', v)
        return v
    
    @validator('delivery_date')
    def validate_future_date(cls, v):
        if v <= datetime.now():
            raise ValueError('Delivery date must be in the future')
        return v
```

### Frontend Input Validation
```typescript
import { z } from 'zod';

const purchaseOrderSchema = z.object({
  supplierId: z.string().uuid('Invalid supplier ID'),
  deliveryDate: z.date().min(new Date(), 'Delivery date must be in the future'),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  items: z.array(z.object({
    itemId: z.string().uuid(),
    quantity: z.number().positive('Quantity must be positive'),
    unitPrice: z.number().positive('Price must be positive')
  })).min(1, 'At least one item is required')
});

// Usage in forms
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(purchaseOrderSchema)
});
```

## Security Headers & Middleware

### FastAPI Security Headers
```python
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Trusted host middleware
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=settings.ALLOWED_HOSTS
)

# Custom security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    return response
```

## Secrets Management

### Environment Variable Security
```bash
# .env.example - Template file (committed)
DATABASE_URL=postgresql://user:password@localhost:5432/brunos_ims
JWT_SECRET_KEY=your-super-secret-jwt-key-here
ENCRYPTION_KEY=your-encryption-key-here
API_KEY_STRIPE=sk_test_your_stripe_key

# .env - Actual secrets (never committed)
DATABASE_URL=postgresql://prod_user:real_password@prod.db.com:5432/brunos_ims_prod
JWT_SECRET_KEY=actual-super-secret-jwt-key
ENCRYPTION_KEY=actual-encryption-key
API_KEY_STRIPE=sk_live_actual_stripe_key
```

### Production Secrets Management
```python
# Using cloud secret managers
import boto3
from functools import lru_cache

class SecretsManager:
    def __init__(self):
        self.client = boto3.client('secretsmanager')
    
    @lru_cache(maxsize=100)
    def get_secret(self, secret_name: str) -> str:
        try:
            response = self.client.get_secret_value(SecretId=secret_name)
            return response['SecretString']
        except Exception as e:
            logger.error(f"Failed to retrieve secret {secret_name}: {e}")
            raise

# Usage
secrets = SecretsManager()
DATABASE_PASSWORD = secrets.get_secret('bruno-ims/database/password')
```
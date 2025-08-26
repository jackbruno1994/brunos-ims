# RBAC Implementation for Bruno's IMS

This document describes the Role-Based Access Control (RBAC) system implementation for Bruno's Integrated Management System.

## Overview

The RBAC system provides enterprise-grade security with the following features:
- Role-based authorization with predefined roles
- Granular permission system using resource:action format
- JWT-based authentication
- Restaurant-scoped role assignments
- Comprehensive audit logging
- Session management

## System Architecture

### 1. Core Components

#### Types and Interfaces (`src/types/rbac/index.ts`)
- **RoleType**: Predefined system roles (super_admin, admin, manager, staff, readonly)
- **PermissionString**: Resource:action format (e.g., "user:create", "menu:read")
- **Role**: Core role definition with metadata
- **Permission**: Granular permission with resource and action
- **UserRole**: User-role assignment with optional restaurant scoping
- **RolePermission**: Role-permission mapping
- **RBACUser**: Extended user interface with RBAC properties

#### Database Schema (`src/services/database/schema/rbac.sql`)
- **roles**: System role definitions
- **permissions**: Granular permissions with resource:action format
- **user_roles**: User-role assignments with optional restaurant scoping
- **role_permissions**: Role-permission mappings
- **user_sessions**: Session management for security
- **rbac_audit_logs**: Comprehensive audit trail

#### RBAC Service (`src/services/rbac/index.ts`)
- Role management (CRUD operations)
- Permission management
- User-Role assignment
- Role-Permission assignment
- Permission verification
- Mock database implementation for development

#### Authentication Middleware (`src/middleware/auth.ts`)
- JWT authentication
- Permission-based authorization
- Role-based authorization
- Resource-specific authorization
- Session validation

### 2. Predefined Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| `super_admin` | Full system access | All permissions |
| `admin` | Administrative access | Most permissions |
| `manager` | Restaurant management | Restaurant-specific permissions |
| `staff` | Basic operations | Limited operational permissions |
| `readonly` | View-only access | Read permissions only |

### 3. Permission System

Permissions follow the `resource:action` format:

#### Resources
- `user`: User management
- `restaurant`: Restaurant operations
- `menu`: Menu management
- `inventory`: Inventory control
- `order`: Order processing
- `report`: Reporting and analytics
- `system`: System administration
- `role`: Role management
- `permission`: Permission management

#### Actions
- `create`: Create new resources
- `read`: View/read resources
- `update`: Modify existing resources
- `delete`: Remove resources
- `manage`: Full management (all actions)
- `execute`: Execute operations (for reports, etc.)

#### Example Permissions
- `user:create` - Create new users
- `menu:read` - View menu items
- `restaurant:manage` - Full restaurant management
- `report:execute` - Generate reports

## Usage

### 1. Basic Authentication

```typescript
import { authenticate } from '../middleware/auth';

// Protect route with authentication
router.get('/protected', authenticate, (req, res) => {
  // req.user is now available
  res.json({ user: req.user });
});
```

### 2. Permission-Based Authorization

```typescript
import { authorize } from '../middleware/auth';

// Require specific permission
router.get('/users', authenticate, authorize('user:read'), (req, res) => {
  // User has user:read permission
});

router.post('/users', authenticate, authorize('user:create'), (req, res) => {
  // User has user:create permission
});
```

### 3. Role-Based Authorization

```typescript
import { requireRole } from '../middleware/auth';

// Require specific role(s)
router.post('/admin', authenticate, requireRole(['super_admin', 'admin']), (req, res) => {
  // User has admin privileges
});
```

### 4. Resource-Specific Authorization

```typescript
import { authorizeResource } from '../middleware/auth';

// Check permission for specific resource and action
router.put('/users/:id', authenticate, authorizeResource('user', 'update'), (req, res) => {
  // User can update users
});
```

### 5. Using RBAC Service

```typescript
import { rbacService } from '../services/rbac';

// Create a role
const roleResult = await rbacService.createRole({
  name: 'manager',
  displayName: 'Restaurant Manager',
  description: 'Manages restaurant operations'
});

// Assign role to user
const assignResult = await rbacService.assignUserRole({
  userId: 'user-123',
  roleId: roleResult.data.id,
  assignedBy: 'admin-123',
  restaurantId: 'restaurant-123' // Optional restaurant-specific assignment
});

// Check user permission
const hasPermission = await rbacService.hasPermission('user-123', 'menu:update');
```

## Testing

The implementation includes comprehensive tests:

### Test Coverage
- **Type definitions**: Validates TypeScript interfaces and types
- **RBAC Service**: Tests all CRUD operations and permission checks
- **Authentication Middleware**: Tests JWT authentication and authorization flows

### Running Tests

```bash
npm test
```

### Test Structure
- `src/tests/rbac/types.test.ts` - Type definition tests
- `src/tests/rbac/service.test.ts` - RBAC service integration tests
- `src/tests/rbac/middleware.test.ts` - Authentication middleware tests

## Database Setup

1. Execute the SQL schema to create RBAC tables:
```sql
\i src/services/database/schema/rbac.sql
```

2. The schema will create:
   - All required tables with proper indexing
   - Default roles (super_admin, admin, manager, staff, readonly)
   - Default permissions for all resources and actions
   - Audit triggers for compliance

## Security Features

### 1. JWT Authentication
- Secure token-based authentication
- Configurable expiration times
- Token validation with proper error handling

### 2. Session Management
- Session tracking for security monitoring
- Session invalidation capabilities
- IP address and user agent logging

### 3. Audit Logging
- Comprehensive audit trail for all RBAC operations
- Tracks who, what, when, and where
- Immutable audit records for compliance

### 4. Restaurant Scoping
- Role assignments can be restaurant-specific
- Prevents cross-restaurant access
- Supports multi-tenant architecture

## Integration with Existing Models

The implementation updates existing models to be RBAC-compatible:

```typescript
// Updated User interface extends RBACUser
export interface User extends RBACUser {
  // Additional user-specific properties
}

// Helper function for legacy compatibility
export function convertLegacyUserToRBACUser(legacyUser: LegacyUser): User {
  // Converts legacy user format to RBAC-enabled user
}
```

## Example Routes

See `src/routes/rbac-example.ts` for comprehensive examples of:
- Protected routes with different authorization levels
- Role management endpoints
- Permission checking in business logic
- Restaurant-scoped operations

## Configuration

### Environment Variables
- `JWT_SECRET`: Secret key for JWT token signing
- `NODE_ENV`: Environment (development/production)

### Customization
- Modify roles in the database schema
- Add new permissions as needed
- Extend user interface for additional properties
- Implement actual database service to replace mock

## Future Enhancements

1. **Database Integration**: Replace mock database service with actual database implementation
2. **Advanced Session Management**: Redis-based session storage
3. **Permission Inheritance**: Hierarchical permission structure
4. **Dynamic Permissions**: Runtime permission creation
5. **Multi-Factor Authentication**: Enhanced security options
6. **Permission Caching**: Performance optimization for permission checks

## Security Considerations

1. **Token Security**: Use strong JWT secrets and appropriate expiration times
2. **Permission Granularity**: Follow principle of least privilege
3. **Audit Compliance**: Maintain comprehensive audit logs
4. **Session Security**: Implement session timeout and validation
5. **Error Handling**: Avoid information disclosure in error messages

## Maintenance

1. **Regular Audits**: Review role assignments and permissions
2. **Token Rotation**: Periodic JWT secret rotation
3. **Performance Monitoring**: Monitor permission check performance
4. **Database Maintenance**: Regular cleanup of expired sessions and old audit logs
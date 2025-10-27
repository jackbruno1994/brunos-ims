# RBAC Type Definitions

This directory contains the core Role-Based Access Control (RBAC) type definitions for Bruno's IMS.

## Interfaces

### Core Interfaces

- **Role**: Defines a role with id, name, optional description, and timestamps
- **Permission**: Defines a permission with id, name, resource, action type, and timestamps
- **UserRole**: Relationship interface linking users to roles
- **RolePermission**: Relationship interface linking roles to permissions
- **RBACUser**: Extended user interface with roles, permissions, and authorization methods

### Action Types

Permissions support the following action types:
- `create` - Create new resources
- `read` - Read/view resources
- `update` - Modify existing resources
- `delete` - Remove resources
- `manage` - Full control over resources

## Usage Example

```typescript
import { Role, Permission, RBACUser } from '@/types/rbac';

const adminRole: Role = {
  id: 'role-admin',
  name: 'admin',
  description: 'System administrator',
  createdAt: new Date(),
  updatedAt: new Date()
};

const readUsersPermission: Permission = {
  id: 'perm-read-users',
  name: 'read-users',
  resource: 'users',
  action: 'read',
  createdAt: new Date(),
  updatedAt: new Date()
};

const rbacUser: RBACUser = {
  id: 'user-123',
  roles: [adminRole],
  permissions: [readUsersPermission],
  hasRole: (roleName: string) => rbacUser.roles.some(role => role.name === roleName),
  hasPermission: (permName: string) => rbacUser.permissions.some(perm => perm.name === permName)
};
```

## Testing

Run the test suite:

```bash
npm test src/types/rbac/__tests__/index.test.ts
```
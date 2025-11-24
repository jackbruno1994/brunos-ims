# RBAC Database Module

This module contains the database schema, migrations, and repositories for the Role-Based Access Control (RBAC) system.

## Structure

```
src/db/
├── index.ts                              # Main exports
├── schemas/
│   └── rbac.schema.ts                   # TypeScript interfaces and DTOs
├── migrations/
│   └── 20250826153836_create_rbac_tables.ts  # Database migration
└── repositories/
    └── rbac.repository.ts               # Data access layer
```

## Database Schema

The RBAC system consists of four main tables:

- **roles**: Store role definitions (id, name, description, timestamps)
- **permissions**: Store permission definitions (id, name, description, resource, action, timestamps)
- **user_roles**: Junction table linking users to roles
- **role_permissions**: Junction table linking roles to permissions

### Permission Actions

The system supports five types of actions:
- `create`: Create new resources
- `read`: View/read resources
- `update`: Modify existing resources
- `delete`: Remove resources
- `manage`: Full control (includes all other actions)

## Usage

### Import the module
```typescript
import { RbacRepository, Role, Permission } from '@/db';
```

### Create a repository instance
```typescript
const rbacRepo = new RbacRepository(databaseConnection);
```

### Basic operations
```typescript
// Create a role
const adminRole = await rbacRepo.createRole({
  name: 'admin',
  description: 'Administrator role'
});

// Create a permission
const createUserPermission = await rbacRepo.createPermission({
  name: 'create_user',
  description: 'Create new users',
  resource: 'users',
  action: 'create'
});

// Assign permission to role
await rbacRepo.assignPermissionToRole(adminRole.id, createUserPermission.id);

// Assign role to user
await rbacRepo.assignRoleToUser(userId, adminRole.id);

// Check permissions
const canCreateUsers = await rbacRepo.userHasPermission(userId, 'users', 'create');
```

## Migration

To apply the RBAC migration, run the SQL statements in `RBAC_MIGRATION_SQL.up`.

The migration includes:
- Table creation with proper constraints
- Foreign key relationships
- Indexes for performance
- Triggers for automatic timestamp updates

## Testing

Run tests with:
```bash
npm test tests/db
```

The test suite includes:
- Schema interface validation
- Repository method testing with mocked database
- Migration SQL validation
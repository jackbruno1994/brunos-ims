# Bruno's IMS - Role Management System

## Overview

This is the Role Management System for Bruno's Integrated Management System (IMS), designed for multi-country restaurant groups. The system provides comprehensive role-based access control (RBAC) with the following features:

## Features

- **Role Creation**: Create custom roles with specific permissions
- **Role Assignment**: Assign roles to users with start/end dates
- **Permission Checking**: Verify user permissions for specific actions
- **Audit Logging**: Track all role management activities
- **Validation**: Comprehensive input validation and error handling

## API Endpoints

### Role Management

#### Create Role
```http
POST /api/roles
```

**Request Body:**
```json
{
  "name": "Kitchen Manager",
  "description": "Manages kitchen inventory and staff",
  "permissions": [
    "view_inventory",
    "manage_inventory",
    "view_staff",
    "manage_orders"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Kitchen Manager",
    "description": "Manages kitchen inventory and staff",
    "permissions": ["view_inventory", "manage_inventory", "view_staff", "manage_orders"],
    "createdAt": "2025-08-24T09:42:19.000Z",
    "updatedAt": "2025-08-24T09:42:19.000Z",
    "createdBy": "user_id"
  },
  "message": "Role created successfully"
}
```

#### Get All Roles
```http
GET /api/roles
```

#### Get Role by ID
```http
GET /api/roles/{roleId}
```

#### Update Role
```http
PUT /api/roles/{roleId}
```

#### Delete Role
```http
DELETE /api/roles/{roleId}
```

### User Role Assignment

#### Assign Role to User
```http
PUT /api/users/{userId}/role
```

**Request Body:**
```json
{
  "roleId": "kitchen_manager_id",
  "startDate": "2025-08-24",
  "assignedBy": "jackbruno1994"
}
```

#### Get User Role
```http
GET /api/users/{userId}/role
```

### Permission Management

#### Check Permission
```http
POST /api/permissions/check
```

**Request Body:**
```json
{
  "permission": "view_inventory",
  "resource": "inventory"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_id",
    "permission": "view_inventory",
    "resource": "inventory",
    "expected": true
  },
  "message": "Permission check completed"
}
```

#### Get All Permissions
```http
GET /api/permissions
```

## Available Permissions

- `view_inventory` - Can view inventory items
- `manage_inventory` - Can create, update, and delete inventory items
- `view_staff` - Can view staff information
- `manage_staff` - Can create, update, and delete staff records
- `view_orders` - Can view orders
- `manage_orders` - Can create, update, and delete orders
- `view_reports` - Can view reports and analytics
- `view_roles` - Can view roles and permissions
- `manage_roles` - Can create, update, and delete roles

## Authentication

The API uses a simple header-based authentication for demonstration purposes. In production, this would be replaced with JWT tokens.

**Header:**
```
x-user-id: your_user_id
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

### Production

```bash
npm start
```

## Environment

The application runs on port 3000 by default. You can change this by setting the `PORT` environment variable.

## Health Check

```http
GET /health
```

Returns the health status of the application.

## Error Handling

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error Type",
  "message": "Detailed error message"
}
```

## Test Coverage

The system includes comprehensive test coverage for:

- ✅ Role creation and validation
- ✅ Role assignment and user management
- ✅ Permission verification
- ✅ Error handling and edge cases
- ✅ API endpoint integration
- ✅ Audit logging

## Architecture

The system follows a layered architecture:

- **Controllers** - Handle HTTP requests and responses
- **Services** - Business logic and data processing
- **Models** - Data structures and storage
- **Middleware** - Authentication, validation, and error handling
- **Routes** - API endpoint definitions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for your changes
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.
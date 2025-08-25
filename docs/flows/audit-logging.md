# Audit Logging and Reporting

This document outlines the audit logging system implemented for Bruno's IMS.

## Overview

The audit logging system tracks all system activities, providing complete visibility into user actions and system changes. This is essential for compliance, debugging, and security monitoring.

## Features

### Database Schema
- **audit_logs table**: Stores all audit events with proper indexing for performance
- **Fields**: id, action, entity_type, entity_id, user_id, changes, timestamp
- **Indexes**: Optimized for common query patterns (entity lookup, user lookup, time-based queries)

### API Endpoints

#### GET /api/audit/logs
Get audit logs with filtering and pagination
- **Query Parameters**:
  - `entityType`: Filter by entity type
  - `entityId`: Filter by specific entity ID
  - `userId`: Filter by user ID
  - `action`: Filter by action type
  - `startDate`: Filter by start date (ISO 8601)
  - `endDate`: Filter by end date (ISO 8601)
  - `page`: Page number for pagination (default: 1)
  - `limit`: Results per page (default: 10)

#### GET /api/audit/trail/:entityType/:entityId
Get complete audit trail for a specific entity
- **Path Parameters**:
  - `entityType`: Type of entity (e.g., 'user', 'permission')
  - `entityId`: Unique identifier of the entity

#### GET /api/audit/report
Generate audit reports with statistics
- **Query Parameters**:
  - `startDate`: Start date for report (required)
  - `endDate`: End date for report (required)
  - `entityType`: Optional filter by entity type
  - `userId`: Optional filter by user ID
- **Returns**:
  - Total actions count
  - Actions grouped by type
  - Actions grouped by user
  - Most affected entities

### Usage Examples

#### Log an Audit Event
```typescript
import { AuditService } from './services/audit/audit.service';

const auditService = AuditService.getInstance();

await auditService.logAudit(
  'UPDATE',           // action
  'user',             // entityType
  'user-123',         // entityId
  'admin-456',        // userId
  {                   // changes
    oldValue: { name: 'John' },
    newValue: { name: 'John Doe' }
  }
);
```

#### Get Audit Logs
```typescript
const { logs, total } = await auditService.getAuditLogs({
  entityType: 'user',
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-12-31'),
  page: 1,
  limit: 20
});
```

#### Generate Report
```typescript
const report = await auditService.generateAuditReport({
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-01-31')
});

console.log('Total actions:', report.totalActions);
console.log('Actions by type:', report.actionsByType);
```

## Security & Permissions

- All audit endpoints require authentication
- RBAC middleware validates permissions for 'audit_logs' resource
- Only users with 'admin' or 'manager' roles can access audit data

## Database Migration

Run the migration to create the audit_logs table:

```bash
npm run migrate
```

The migration file is located at:
`src/database/migrations/20250825092714_create_audit_logs.ts`

## Testing

The system includes comprehensive test coverage:

- **Unit Tests**: Service layer logic and report generation
- **Integration Tests**: API endpoint functionality
- **Mocking**: Database and service dependencies for testing

Run tests:
```bash
npm test
```

## Implementation Details

### Architecture
- **Repository Pattern**: Data access layer (`AuditRepository`)
- **Service Layer**: Business logic (`AuditService`)
- **Controller Layer**: HTTP request handling (`AuditController`)
- **Singleton Pattern**: Single instances for services and repositories

### Database Connection
- Uses Knex.js for database operations
- PostgreSQL as the primary database
- Connection pooling and transaction support

### Error Handling
- Comprehensive error handling in all layers
- Structured error responses for API endpoints
- Logging of errors for debugging

## Future Enhancements

1. **Real-time Notifications**: WebSocket integration for live audit events
2. **Advanced Filtering**: Full-text search capabilities
3. **Data Retention**: Automatic archival of old audit logs
4. **Export Features**: CSV/Excel export for compliance reporting
5. **Dashboard Integration**: Visual analytics and charts
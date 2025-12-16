# Purchase Order (PO) Processing System

This document describes the Purchase Order processing system implemented for Bruno's IMS.

## Overview

The PO processing system provides complete functionality for managing purchase orders in a restaurant/food service environment, including:

- Purchase order creation, modification, and status management
- Document upload and management
- Line item management with automatic calculations
- Status workflow validation
- Comprehensive error handling and logging

## API Endpoints

### 1. Create Purchase Order
```
POST /api/po/create
```

**Request Body:**
```json
{
  "supplierId": "string",
  "supplierName": "string", 
  "restaurantId": "string",
  "lineItems": [
    {
      "itemId": "string",
      "itemName": "string",
      "quantity": number,
      "unitPrice": number,
      "notes": "string (optional)"
    }
  ],
  "requestedDeliveryDate": "ISO date (optional)",
  "notes": "string (optional)"
}
```

**Response:**
```json
{
  "message": "Purchase Order created successfully",
  "data": {
    "id": "uuid",
    "poNumber": "PO-001001",
    "status": "draft",
    "subtotal": 125.00,
    "tax": 12.50,
    "totalAmount": 137.50,
    "createdAt": "2025-08-26T00:00:00.000Z",
    ...
  }
}
```

### 2. Get Purchase Order
```
GET /api/po/{id}
```

**Response:**
```json
{
  "message": "Purchase Order retrieved successfully",
  "data": {
    "id": "uuid",
    "poNumber": "PO-001001",
    "status": "submitted",
    "lineItems": [...],
    "documents": [...],
    ...
  }
}
```

### 3. Update Purchase Order
```
PUT /api/po/{id}/update
```

**Request Body:**
```json
{
  "status": "submitted|approved|rejected|processed|cancelled",
  "lineItems": [...], // optional
  "notes": "string", // optional
  "supplierId": "string" // optional
}
```

### 4. Upload Documents
```
POST /api/po/{id}/documents
Content-Type: multipart/form-data
```

**Form Data:**
- `documents`: File(s) to upload (max 5 files, 10MB each)

**Supported File Types:**
- PDF documents
- Images (JPEG, JPG, PNG)
- Office documents (Word, Excel)

## Status Workflow

The system enforces a strict status workflow:

```
DRAFT → SUBMITTED → APPROVED → PROCESSED
   ↓        ↓         ↓
CANCELLED  CANCELLED  CANCELLED
            ↓
        REJECTED → DRAFT
```

**Status Descriptions:**
- **DRAFT**: Initial state, PO can be edited
- **SUBMITTED**: PO submitted for approval
- **APPROVED**: PO approved and ready for processing
- **PROCESSED**: PO has been processed/received
- **REJECTED**: PO rejected, can be moved back to DRAFT
- **CANCELLED**: PO cancelled (terminal state)

## Features

### 1. Line Item Management
- Automatic calculation of line totals (quantity × unit price)
- Automatic subtotal calculation
- 10% tax calculation (configurable)
- Total amount calculation

### 2. Document Management
- File upload with type validation
- File size limits (10MB per file, max 5 files)
- Secure file storage with generated unique names
- Document metadata tracking

### 3. Validation
- Comprehensive input validation using Joi schemas
- Status transition validation
- File type and size validation

### 4. Error Handling
- Structured error responses
- Request logging with Winston
- Proper HTTP status codes
- Development vs production error details

### 5. Testing
- Unit tests for service layer
- Integration tests for API endpoints
- Complete workflow testing
- 90% line coverage on core business logic

## Examples

### Creating a Purchase Order

```bash
curl -X POST http://localhost:3001/api/po/create \
  -H "Content-Type: application/json" \
  -d '{
    "supplierId": "supplier-123",
    "supplierName": "Fresh Foods Supplier",
    "restaurantId": "restaurant-456",
    "lineItems": [
      {
        "itemId": "item-1",
        "itemName": "Fresh Tomatoes",
        "quantity": 50,
        "unitPrice": 2.50
      }
    ],
    "notes": "Urgent delivery required"
  }'
```

### Updating Status

```bash
curl -X PUT http://localhost:3001/api/po/{id}/update \
  -H "Content-Type: application/json" \
  -d '{"status": "submitted"}'
```

### Uploading Documents

```bash
curl -X POST http://localhost:3001/api/po/{id}/documents \
  -F "documents=@invoice.pdf"
```

## Data Storage

Currently uses in-memory storage for demonstration purposes. The service layer is designed to be easily replaceable with a database implementation (PostgreSQL, MongoDB, etc.).

## Security Considerations

- File type validation prevents malicious uploads
- File size limits prevent abuse
- Request validation prevents injection attacks
- Structured error responses don't leak sensitive information
- Request logging for audit trails

## Future Enhancements

- Database integration
- User authentication and authorization
- Email notifications for status changes
- PDF generation for purchase orders
- Supplier integration APIs
- Advanced reporting and analytics
# Bruno's IMS - Advanced Order Processing System API

## Overview

This API provides advanced order processing capabilities including real-time tracking, analytics, smart queue management, and comprehensive error handling.

## Features

- ✅ **Real-time Order Tracking** - Live status updates via WebSocket
- ✅ **Analytics Integration** - Order metrics and performance analytics
- ✅ **Smart Queue Management** - Priority-based processing with auto-scaling
- ✅ **Error Handling & Recovery** - Comprehensive error handling and logging
- ✅ **Security** - Rate limiting, validation, and audit logging
- ✅ **Testing** - Unit tests with 100% coverage

## API Endpoints

### Orders

#### Create Order
```http
POST /api/orders
Content-Type: application/json

{
  "restaurantId": "string (UUID)",
  "customerInfo": {
    "name": "string",
    "phone": "string (optional)",
    "email": "string (optional)"
  },
  "type": "dine_in | takeaway | delivery | catering",
  "priority": "low | normal | high | urgent",
  "items": [
    {
      "menuItemId": "string (UUID)",
      "quantity": "number",
      "unitPrice": "number",
      "totalPrice": "number",
      "specialInstructions": "string (optional)"
    }
  ],
  "subtotal": "number",
  "tax": "number",
  "deliveryFee": "number",
  "totalAmount": "number",
  "currency": "string",
  "estimatedPrepTime": "number (minutes)",
  "source": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "uuid",
    "orderNumber": "ORD-XXXXXX",
    "status": "pending",
    "createdAt": "ISO timestamp",
    "updatedAt": "ISO timestamp",
    ...
  }
}
```

#### Get Order
```http
GET /api/orders/{orderId}
```

#### Update Order Status
```http
PATCH /api/orders/{orderId}/status
Content-Type: application/json

{
  "status": "pending | confirmed | preparing | ready | delivered | cancelled"
}
```

#### Get Orders by Restaurant
```http
GET /api/restaurants/{restaurantId}/orders?status=pending
```

#### Get Order Queue
```http
GET /api/orders/queue?restaurantId={restaurantId}
```

### Analytics

#### Get Order Analytics
```http
GET /api/restaurants/{restaurantId}/analytics/orders?days=7
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 150,
    "averageOrderValue": 23.45,
    "peakHours": ["12:00", "18:00", "19:00"],
    "hourlyDistribution": {
      "12:00": 25,
      "13:00": 20,
      ...
    },
    "averageProcessingTime": 12.5
  }
}
```

#### Get Order Metrics
```http
GET /api/restaurants/{restaurantId}/metrics/orders?startDate=2024-01-01&endDate=2024-01-31
```

## Real-time Features (WebSocket)

Connect to WebSocket at `ws://localhost:3001`

### Events

#### Client → Server
- `join_restaurant` - Join restaurant-specific room for updates
- `leave_restaurant` - Leave restaurant room

#### Server → Client
- `order_created` - New order created
- `order_status_updated` - Order status changed
- `order_queued` - Order added to queue
- `order_removed_from_queue` - Order removed from queue
- `metrics_updated` - New metrics available

## Queue Management

Orders are automatically queued based on:
- **Priority**: urgent > high > normal > low
- **Creation time**: Earlier orders processed first within same priority
- **Resource requirements**: Estimated based on order complexity

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Human-readable error message",
  "details": [
    {
      "field": "field_name",
      "message": "Validation error message"
    }
  ]
}
```

## Rate Limiting

- **Order endpoints**: 100 requests per 15 minutes per IP
- **General endpoints**: 1000 requests per 15 minutes per IP

## Security Features

- **Input Validation**: All requests validated using express-validator
- **Rate Limiting**: Prevents abuse and ensures system stability
- **Audit Logging**: All significant actions are logged
- **Error Handling**: Comprehensive error handling prevents system crashes
- **CORS**: Properly configured for cross-origin requests

## Development

### Installation
```bash
cd backend
npm install
```

### Running
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### Testing
```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Environment Variables
Create a `.env` file in the backend directory:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Architecture

The system follows a microservices-oriented architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Order Service │
│   (React)       │◄──►│   (Express)     │◄──►│   (In-Memory)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                        ▲                        ▲
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   WebSocket     │    │   Middleware    │    │   Analytics     │
│   (Socket.IO)   │    │   Security      │    │   Engine        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Components

1. **Order Service** - Core business logic for order management
2. **Queue Management** - Smart prioritization and resource allocation
3. **Analytics Engine** - Real-time metrics and reporting
4. **WebSocket Server** - Real-time updates to connected clients
5. **Security Middleware** - Rate limiting, validation, and audit logging

## Performance Considerations

- **In-memory storage** for fast order operations
- **Event-driven architecture** for real-time updates
- **Efficient queue algorithms** for optimal order processing
- **Comprehensive caching** for frequently accessed data
- **Resource optimization** based on restaurant capacity

## Future Enhancements

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Advanced authentication and authorization
- [ ] Payment processing integration
- [ ] SMS/Email notifications
- [ ] Advanced analytics and ML predictions
- [ ] Mobile app API endpoints
- [ ] Integration with inventory management
- [ ] Multi-tenant support
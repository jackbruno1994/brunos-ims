# Bruno's IMS - Integrated Management System

A comprehensive inventory management system for multi-country restaurant groups, built with React, Node.js, TypeScript, and MongoDB.

## Features

- **Multi-tenant Architecture**: Support for multiple restaurants across different countries
- **Role-based Access Control**: Admin, Manager, and Staff roles with appropriate permissions
- **Inventory Management**: Complete product and category management with stock tracking
- **Order Management**: Purchase, sale, and transfer order processing
- **Real-time Alerts**: Low stock notifications and alerts
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **RESTful API**: Complete backend API with validation and error handling
- **Modern Frontend**: React with TypeScript, TailwindCSS, and React Query

## Architecture

This is a monorepo containing:

- **`/backend`**: Express.js API server with MongoDB
- **`/frontend`**: React application with TypeScript
- **`/shared`**: Shared TypeScript types and utilities

## Prerequisites

- Node.js 18+ and npm 9+
- MongoDB (local or cloud instance)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/jackbruno1994/brunos-ims.git
cd brunos-ims
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB URI and other settings
```

4. Build shared types:
```bash
npm run build --workspace=shared
```

## Development

### Start both frontend and backend:
```bash
npm run dev
```

### Start individual services:
```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

### Build for production:
```bash
npm run build
```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login

### Users
- `GET /api/users` - List users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Restaurants
- `POST /api/restaurants` - Create restaurant (Admin only)
- `GET /api/restaurants` - List restaurants
- `GET /api/restaurants/:id` - Get restaurant by ID
- `PUT /api/restaurants/:id` - Update restaurant (Admin only)
- `DELETE /api/restaurants/:id` - Delete restaurant (Admin only)

### Products
- `POST /api/products` - Create product (Manager/Admin)
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product by ID
- `PUT /api/products/:id` - Update product (Manager/Admin)
- `DELETE /api/products/:id` - Delete product (Manager/Admin)
- `GET /api/products/low-stock` - Get low stock products

### Categories
- `POST /api/categories` - Create category (Manager/Admin)
- `GET /api/categories` - List categories
- `GET /api/categories/:id` - Get category by ID
- `PUT /api/categories/:id` - Update category (Manager/Admin)
- `DELETE /api/categories/:id` - Delete category (Manager/Admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - List orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id` - Update order status (Manager/Admin)
- `GET /api/orders/reports` - Get order reports (Manager/Admin)

## Database Schema

### User
- Username, email, password (hashed)
- Role: admin | manager | staff
- Restaurant assignment
- Country information

### Restaurant
- Name, location, country
- Operating hours
- Contact information
- Manager assignments

### Product
- Name, description, category
- Current stock, price, unit
- Minimum stock level
- Restaurant assignment

### Category
- Name, description
- Restaurant assignment

### Order
- Type: purchase | sale | transfer
- Product items with quantities and prices
- Status: pending | completed | cancelled
- User and restaurant assignment

## Security Features

- JWT authentication with 7-day expiration
- Password hashing with bcrypt (12 salt rounds)
- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- Role-based access control
- CORS protection
- Helmet security headers

## Technology Stack

### Backend
- Node.js with Express.js
- TypeScript
- MongoDB with Mongoose ODM
- JWT for authentication
- bcrypt for password hashing
- express-validator for input validation
- Rate limiting and security middleware

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- React Router for navigation
- React Query for data fetching
- React Hook Form for forms
- Lucide React for icons
- React Hot Toast for notifications

## Development Status

### ✅ Completed
- Project structure and monorepo setup
- MongoDB schemas and models
- Complete backend API with authentication
- Security middleware and validation
- Frontend application structure
- Authentication flow and protected routes
- Dashboard and product listing pages
- Low stock alerts and basic inventory views

### 🚧 In Progress
- Product form implementation
- Order management interface
- User management interface
- Restaurant management interface

### 📝 Planned
- Reports and analytics
- Advanced filtering and search
- Bulk operations
- Export functionality
- Real-time notifications
- Mobile responsiveness improvements
- Comprehensive testing suite

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

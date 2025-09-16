# Bruno's IMS

Integrated Management System for multi-country restaurant groups

## Overview

Bruno's IMS is a comprehensive management system designed to handle operations across multiple restaurants in different countries. The system provides centralized management for restaurants, users, menus, and business operations while maintaining country-specific customizations.

## Features

- **Multi-Country Support**: Manage restaurants across different countries with localized settings
- **Role-Based Access Control (RBAC)**: Comprehensive user management with flexible permissions
- **Inventory Management**: Real-time stock tracking, supplier management, and cost analysis
- **Menu Management**: Digital menu creation with ingredient tracking and cost calculation
- **Order Processing**: Complete order lifecycle management with kitchen integration
- **Health Monitoring**: Comprehensive system health checks and metrics
- **Scalable Architecture**: Modern full-stack architecture built for growth

## Technology Stack

### Backend

- **Node.js** with **Express.js** framework
- **TypeScript** for type safety
- **Prisma** ORM with **PostgreSQL** database
- **JWT** authentication
- RESTful API design
- Security middleware (Helmet, CORS)
- Environment-based configuration

### Frontend

- **React 18+** with **TypeScript**
- **Vite** for fast development and building
- **React Router** for client-side routing
- **Axios** for API communication
- Responsive design

### Database

- **PostgreSQL** 15+ for data persistence
- **Prisma** for database modeling and migrations
- **Redis** for caching (optional)
- Comprehensive RBAC schema
- Multi-tenant architecture support

### DevOps

- **Docker** containerization
- **GitHub Actions** CI/CD pipeline
- **Jest** for testing
- **ESLint** and **Prettier** for code quality

## Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Docker** and **Docker Compose**
- **Git**

### Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/jackbruno1994/brunos-ims.git
   cd brunos-ims
   ```

2. **Run the setup script**

   ```bash
   ./setup-dev.sh
   ```

   This script will:
   - Install all dependencies
   - Start development database with Docker
   - Generate Prisma client
   - Run database migrations
   - Seed sample data

3. **Start the development servers**

   ```bash
   # Backend (Terminal 1)
   cd backend && npm run dev

   # Frontend (Terminal 2)  
   cd frontend && npm run dev
   ```

### Manual Setup

If you prefer manual setup:

1. **Install dependencies**

   ```bash
   npm install --legacy-peer-deps
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Start development database**

   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **Configure environment**

   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your settings
   ```

4. **Setup database**

   ```bash
   cd backend
   npm run db:generate  # Generate Prisma client
   npm run db:push      # Push schema to database
   npm run db:seed      # Seed sample data
   ```

5. **Start development servers**

   ```bash
   # Backend
   cd backend && npm run dev

   # Frontend
   cd frontend && npm run dev
   ```

## Project Structure

```
brunos-ims/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Business logic
│   │   ├── models/         # Data models and types
│   │   ├── routes/         # API routes
│   │   └── server.ts       # Main server
│   ├── prisma/             # Database schema and migrations
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Sample data
│   ├── tests/              # Test files
│   └── Dockerfile          # Container configuration
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   └── services/       # API services
│   └── package.json
├── docs/                   # Documentation
├── .github/workflows/      # CI/CD pipelines
├── docker-compose.yml      # Production containers
├── docker-compose.dev.yml  # Development containers
└── setup-dev.sh           # Development setup script
```

## API Endpoints

### Health & Monitoring
- `GET /api/health` - Basic health check
- `GET /api/health/metrics` - Detailed system metrics
- `GET /api/health/ready` - Kubernetes readiness probe
- `GET /api/health/live` - Kubernetes liveness probe

### Restaurant Management
- `GET /api/restaurants` - List restaurants
- `POST /api/restaurants` - Create restaurant
- `GET /api/restaurants/:id` - Get restaurant details
- `PUT /api/restaurants/:id` - Update restaurant
- `DELETE /api/restaurants/:id` - Delete restaurant

### User Management
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Inventory Management
- `GET /api/inventory/items` - List inventory items
- `POST /api/inventory/items` - Create item
- `GET /api/inventory/items/:id` - Get item details
- `PUT /api/inventory/items/:id` - Update item
- `DELETE /api/inventory/items/:id` - Delete item
- `GET /api/inventory/stock-levels` - Get stock levels
- `GET /api/inventory/stock-history` - Get stock movement history
- `POST /api/inventory/stock-movement` - Record stock movement

## Environment Variables

### Backend (.env)

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5433/brunos_ims_dev?schema=public"

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Frontend

```env
VITE_API_URL=http://localhost:3001/api
```

## Default Credentials

After running the setup, you can log in with:

- **Email**: admin@brunos-restaurant.com
- **Password**: password123

## Documentation

- [Database Architecture](./docs/database.md)
- [API Documentation](./docs/api.md)
- [Development Guide](./docs/development.md)
- [Deployment Guide](./docs/deployment.md)

## Testing

```bash
# Run all tests
npm run test

# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# Test coverage
npm run test:coverage
```

## Deployment

### Production with Docker

```bash
# Build and start production containers
docker-compose up -d

# View logs
docker-compose logs -f backend
```

### Environment-specific Deployments

```bash
# Development
docker-compose -f docker-compose.dev.yml up -d

# Production
docker-compose -f docker-compose.yml up -d
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions or support, please contact [jackbruno1994](https://github.com/jackbruno1994) or open an issue on GitHub.

# Bruno's IMS

Integrated Management System for multi-country restaurant groups

## Overview

Bruno's IMS is a comprehensive management system designed to handle operations across multiple restaurants in different countries. The system provides centralized management for restaurants, users, menus, and business operations while maintaining country-specific customizations.

## Features

- **Multi-Country Support**: Manage restaurants across different countries with localized settings
- **User Management**: Role-based access control (Admin, Manager, Staff)
- **Restaurant Management**: Centralized restaurant information and status tracking
- **Scalable Architecture**: Modern full-stack architecture built for growth
- **Real-time Dashboard**: Overview of key metrics and quick access to important features

## Technology Stack

### Backend

- **Node.js** with **Express.js** framework
- **TypeScript** for type safety
- **PostgreSQL** database with **Prisma ORM**
- RESTful API design
- Database connection pooling and retry mechanisms
- Security middleware (Helmet, CORS)
- Environment-based configuration

### Frontend

- **React 18+** with **TypeScript**
- **Vite** for fast development and building
- **React Router** for client-side routing
- **Axios** for API communication
- Responsive design

## Project Structure

```
brunos-ims/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── config/      # Configuration files
│   │   ├── controllers/ # Business logic
│   │   ├── models/      # Data models
│   │   ├── routes/      # API routes
│   │   └── server.ts    # Main server
│   └── package.json
├── frontend/            # React application
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/      # Page components
│   │   └── services/   # API services
│   └── package.json
├── docs/               # Documentation
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v12 or higher)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/jackbruno1994/brunos-ims.git
   cd brunos-ims
   ```

2. **Set up PostgreSQL Database**

   ```bash
   # Create database (adjust credentials as needed)
   createdb brunos_ims
   ```

3. **Set up the Backend**

   ```bash
   cd backend
   npm install

   # Copy environment file and configure
   cp .env.example .env
   # Edit .env with your database configuration

   # Generate Prisma client
   npm run db:generate

   # Run database migrations
   npm run db:migrate

   # Build the project
   npm run build

   # Start development server
   npm run dev
   ```

4. **Set up the Frontend**

   ```bash
   cd ../frontend
   npm install

   # Start development server
   npm run dev
   ```

### Database Setup

The application uses PostgreSQL with Prisma ORM. For detailed database setup instructions, see [backend/DATABASE_SETUP.md](backend/DATABASE_SETUP.md).

**Quick start:**
```bash
cd backend
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Create and apply migrations
npm run db:seed      # (Optional) Seed initial data
```

### Development

#### Backend Development

```bash
cd backend

# Start development server with hot reload
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start
```

The backend API will be available at `http://localhost:3001`

#### Frontend Development

```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The frontend will be available at `http://localhost:3000`

### API Endpoints

- `GET /health` - Health check
- `GET /api` - API information
- `GET /api/restaurants` - List restaurants
- `POST /api/restaurants` - Create restaurant
- `GET /api/users` - List users
- `POST /api/users` - Create user

### Environment Variables

#### Backend (.env)

```
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=brunos_ims
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
```

#### Frontend

```
VITE_API_URL=http://localhost:3001/api
```

## Documentation

- [Architecture Overview](./docs/architecture/README.md)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For questions or support, please contact [jackbruno1994](https://github.com/jackbruno1994).

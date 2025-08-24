# brunos-ims
Integrated Management System for multi-country restaurant groups

## Overview
Bruno's IMS is a full-stack web application designed to manage multiple restaurant locations across different countries. It provides centralized management for restaurants, inventory, and user access.

## Architecture
- **Backend**: Node.js with Express and TypeScript
- **Frontend**: React with TypeScript and Material-UI
- **Database**: Ready for integration with PostgreSQL/MySQL (placeholder configuration included)

## Features
- Restaurant management across multiple locations
- Inventory tracking and management
- User management with role-based access
- Responsive web interface
- RESTful API for all operations

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/jackbruno1994/brunos-ims.git
cd brunos-ims
```

2. Install all dependencies:
```bash
npm run install:all
```

3. Set up environment variables:
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

## Development

### Run both frontend and backend concurrently:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:3001
- Frontend application on http://localhost:3000

### Run services individually:

**Backend only:**
```bash
npm run dev:backend
```

**Frontend only:**
```bash
npm run dev:frontend
```

## API Endpoints

### Restaurants
- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/:id` - Get restaurant by ID
- `POST /api/restaurants` - Create new restaurant

### Inventory
- `GET /api/inventory` - Get inventory items

### Users
- `GET /api/users` - Get all users

## Build for Production

```bash
npm run build
```

This will build both frontend and backend for production deployment.

## Project Structure

```
brunos-ims/
├── backend/              # Node.js/Express API server
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── models/       # Data models
│   │   ├── middleware/   # Express middleware
│   │   ├── config/       # Configuration files
│   │   └── index.ts      # Entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/             # React application
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── utils/        # Utility functions
│   │   └── App.tsx       # Main app component
│   └── package.json
└── package.json          # Root package.json for development scripts
```

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License
MIT License - see LICENSE file for details

# Architecture Overview

## System Architecture

Bruno's IMS (Integrated Management System) is designed as a full-stack web application for managing multi-country restaurant groups.

### Technology Stack

#### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Key Dependencies**:
  - `express` - Web framework
  - `cors` - Cross-origin resource sharing
  - `helmet` - Security middleware
  - `morgan` - HTTP request logger
  - `dotenv` - Environment variable management

#### Frontend

- **Framework**: React 18+
- **Language**: TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Key Features**:
  - Single Page Application (SPA)
  - Component-based architecture
  - Responsive design
  - API integration

### Directory Structure

```
brunos-ims/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Business logic controllers
│   │   ├── models/         # Data models and interfaces
│   │   ├── routes/         # API route definitions
│   │   └── server.ts       # Main server entry point
│   ├── dist/              # Compiled TypeScript output
│   ├── package.json       # Backend dependencies
│   └── tsconfig.json      # TypeScript configuration
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services and utilities
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Application entry point
│   ├── dist/              # Built frontend assets
│   ├── package.json       # Frontend dependencies
│   └── vite.config.ts     # Vite configuration
├── docs/                  # Documentation
│   └── architecture/      # Architecture documentation
├── README.md              # Project overview
└── .gitignore            # Git ignore patterns
```

### API Design

The backend exposes a RESTful API with the following base structure:

- `GET /health` - Health check endpoint
- `GET /api` - API information
- `GET /api/restaurants` - List all restaurants
- `POST /api/restaurants` - Create new restaurant
- `GET /api/users` - List all users
- `POST /api/users` - Create new user

### Frontend Architecture

The frontend follows a component-based architecture with:

- **Layout Component**: Provides consistent navigation and layout
- **Page Components**: Dashboard, Restaurants, Users
- **Service Layer**: API communication and data management
- **Routing**: Client-side routing with React Router

### Development Workflow

1. **Backend Development**:
   - `npm run dev` - Start development server with hot reload
   - `npm run build` - Build TypeScript to JavaScript
   - `npm start` - Run production build

2. **Frontend Development**:
   - `npm run dev` - Start Vite development server
   - `npm run build` - Build for production
   - `npm run preview` - Preview production build

### Future Considerations

- Database integration (PostgreSQL/MongoDB)
- Authentication and authorization
- Multi-language support
- Real-time features (WebSocket)
- Mobile application
- Microservices architecture
- Cloud deployment strategy

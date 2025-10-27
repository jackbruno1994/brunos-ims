# Bruno's IMS - Integrated Management System

Bruno's IMS is a full-stack TypeScript web application for managing multi-country restaurant groups. The system consists of a Node.js/Express backend API and a React/Vite frontend application.

**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the information here.**

## Working Effectively

### Initial Setup and Build Process

**NEVER CANCEL any build or long-running commands. Set timeouts to 60+ minutes for builds.**

1. **Prerequisites Check**:
   ```bash
   node --version  # Requires Node.js v18+ (tested with v20.19.4)
   npm --version   # Requires npm (tested with v10.8.2)
   ```

2. **Install and Build Backend** (takes ~4 seconds total):
   ```bash
   cd backend
   npm install     # Takes ~2 seconds
   cp .env.example .env
   npm run build   # Takes ~2 seconds - NEVER CANCEL, set timeout to 5+ minutes
   ```

3. **Install and Build Frontend** (takes ~6 seconds total):
   ```bash
   cd ../frontend
   npm install     # Takes ~2 seconds  
   npm run build   # Takes ~4 seconds - NEVER CANCEL, set timeout to 5+ minutes
   ```

### Development Workflow

**Start both services for full functionality:**

1. **Backend Development Server**:
   ```bash
   cd backend
   npm run dev     # Starts on http://localhost:3001 with hot reload
   ```

2. **Frontend Development Server** (in separate terminal):
   ```bash
   cd frontend  
   npm run dev     # Starts on http://localhost:3000 with proxy to backend
   ```

### Production Build and Deployment

1. **Backend Production**:
   ```bash
   cd backend
   npm run build   # Build TypeScript to dist/
   npm start       # Run production server from dist/
   ```

2. **Frontend Production**:
   ```bash
   cd frontend
   npm run build   # Build to dist/
   npm run preview # Preview production build on http://localhost:4173
   ```

## Critical Known Issues and Workarounds

### API Routes Not Connected (IMPORTANT)

**Issue**: The backend has API route definitions in `src/routes/index.ts` but they are NOT connected to the main server in `src/server.ts`. 

**Symptoms**: 
- Frontend shows "Error: Failed to fetch restaurants" when navigating to /restaurants or /users pages
- API calls to `/api/restaurants` and `/api/users` return 404 errors
- Only `/health` and base `/api` endpoints work

**Fix Required**: Import and connect routes in `src/server.ts`:
```typescript
import routes from './routes';
// Add this line before the 404 handler:
app.use('/api', routes);
```

**Validation**: After fixing, these should work:
- `curl http://localhost:3001/api/restaurants` (returns empty array)
- `curl http://localhost:3001/api/users` (returns empty array)

### Environment Configuration

**Backend**: Uses `.env` file (copy from `.env.example`):
```
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=brunos_ims
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CORS_ORIGIN=http://localhost:3000
```

**Frontend**: No `.env` file needed for basic development. Uses default API URL `http://localhost:3001/api` via Vite proxy configuration.

## Validation and Testing

### Manual End-to-End Testing Workflow

**ALWAYS test these scenarios after making changes:**

1. **Backend API Health Check**:
   ```bash
   curl http://localhost:3001/health    # Should return status: "OK"
   curl http://localhost:3001/api       # Should return welcome message
   ```

2. **Frontend Application Test**:
   - Navigate to http://localhost:3000
   - Verify "Bruno's IMS" dashboard loads with navigation
   - Click "Restaurants" link - should show page (may show "Failed to fetch" until API routes are connected)
   - Click "Users" link - should show page (may show "Failed to fetch" until API routes are connected)
   - Click "Dashboard" link - should return to dashboard

3. **Integration Test**:
   ```bash
   curl http://localhost:3000/api       # Should proxy to backend successfully
   ```

### No Testing Framework Currently

- **Backend**: `npm run test` outputs "Error: no test specified"
- **Frontend**: `npm run test` outputs "Error: no test specified"
- **No linting tools configured** (no ESLint, Prettier, etc.)

## Development Tips

### Project Structure
```
brunos-ims/
├── backend/                # Node.js + Express API
│   ├── src/
│   │   ├── config/        # Configuration and environment settings
│   │   ├── controllers/   # Business logic controllers (RestaurantController)
│   │   ├── models/        # TypeScript interfaces (Restaurant, User, MenuItem)
│   │   ├── routes/        # API route definitions (NOT connected to server)
│   │   └── server.ts      # Main server entry point
│   ├── dist/             # Compiled TypeScript output
│   └── package.json      # Backend dependencies
├── frontend/             # React + Vite application  
│   ├── src/
│   │   ├── components/   # Layout.tsx
│   │   ├── pages/       # Dashboard.tsx, Restaurants.tsx, Users.tsx
│   │   ├── services/    # api.ts - Axios API service layer
│   │   └── main.tsx     # Application entry point
│   ├── dist/           # Built frontend assets
│   └── package.json    # Frontend dependencies
└── docs/               # Architecture documentation
```

### Key Code Locations

- **API Service**: `frontend/src/services/api.ts` - Handles all backend API calls
- **Route Definitions**: `backend/src/routes/index.ts` - Contains restaurant and user endpoints (not connected)
- **Controllers**: `backend/src/controllers/index.ts` - RestaurantController with TODO stubs
- **Models**: `backend/src/models/index.ts` - TypeScript interfaces for data models

### Port Configuration

- **Backend Dev**: http://localhost:3001 (configurable via PORT env var)
- **Frontend Dev**: http://localhost:3000 (Vite default)  
- **Frontend Preview**: http://localhost:4173 (Vite preview default)
- **Frontend Proxy**: `/api` requests automatically proxy to backend during development

### Common Commands Reference

**Backend**:
- `npm install` - Install dependencies
- `npm run build` - Compile TypeScript 
- `npm run dev` - Development server with hot reload
- `npm start` - Production server

**Frontend**:
- `npm install` - Install dependencies
- `npm run build` - Build for production (includes TypeScript compilation)
- `npm run dev` - Development server
- `npm run preview` - Preview production build

**Timing Expectations**:
- Backend npm install: ~2 seconds
- Backend build: ~2 seconds  
- Frontend npm install: ~2 seconds
- Frontend build: ~4 seconds
- All builds are fast - complete in under 10 seconds total

### Database Status

**No database currently connected**. The application uses:
- Mock controllers that return empty arrays
- Environment variables configured for PostgreSQL
- TypeScript interfaces defined for data models
- No actual database integration implemented

Always test the API route connection fix first when working on backend functionality.
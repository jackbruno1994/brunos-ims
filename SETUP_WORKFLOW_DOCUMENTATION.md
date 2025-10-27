# GitHub Actions Setup Workflow Documentation

## Overview

The `.github/workflows/setup.yml` workflow has been created to handle environment setup before the main CI/CD pipeline runs. This workflow addresses the requirements specified in the problem statement.

## Features Implemented

### 1. Install and Configure Prisma Dependencies ✅

- **Prisma Schema**: Created `/prisma/schema.prisma` with complete inventory management models
- **Client Generation**: Automatic Prisma client generation in the workflow
- **Dependencies**: Added `@prisma/client` and `prisma` to backend dependencies
- **Scripts**: Added database management scripts to package.json
- **Offline Handling**: Graceful fallback for environments with restricted network access

### 2. Set Up PostgreSQL for Testing ✅

- **Service Configuration**: PostgreSQL 15 service with health checks
- **Database Setup**: Creates `brunos_ims_test` database with proper credentials
- **Connection Validation**: Verifies PostgreSQL connectivity before proceeding
- **Port Mapping**: Exposes PostgreSQL on standard port 5432

### 3. Configure Necessary Environment Variables ✅

- **Database URL**: Automatically generated PostgreSQL connection string
- **Node Environment**: Set to 'test' for CI runs
- **Security**: JWT secret for authentication
- **CORS**: Configured for frontend-backend communication
- **Environment Files**: Creates .env files for both backend and frontend

### 4. Handle Required External Dependencies ✅

- **Node.js Setup**: Configures Node.js 18.x with npm caching
- **Dependency Caching**: Caches node_modules for faster subsequent runs
- **Package Installation**: Installs root, backend, and frontend dependencies
- **Dependency Validation**: Validates successful installation

## Workflow Structure

```yaml
name: Environment Setup
on:
  workflow_call:    # Can be called by other workflows
  workflow_dispatch: # Can be triggered manually

inputs:
  setup-prisma: true/false    # Toggle Prisma setup
  setup-postgres: true/false  # Toggle PostgreSQL setup

outputs:
  database-url: # PostgreSQL connection URL
  node-version: # Node.js version being used
```

## Integration with Main CI

The main CI workflow (`ci.yml`) has been updated to:

1. **Call Setup First**: Uses the setup workflow as the first job
2. **Dependency Management**: Leverages cached dependencies from setup
3. **Environment Reuse**: Uses environment variables set by setup
4. **Database Ready**: PostgreSQL is ready for testing phases

## Usage Examples

### Manual Trigger
```bash
# Trigger setup workflow manually via GitHub Actions UI
# Inputs:
# - setup-prisma: true
# - setup-postgres: true
```

### Called by Other Workflows
```yaml
jobs:
  setup:
    uses: ./.github/workflows/setup.yml
    with:
      setup-prisma: true
      setup-postgres: true

  test:
    needs: setup
    # ... test steps using setup outputs
```

## Database Models

The Prisma schema includes complete inventory management models:

- **Users**: Authentication and role management
- **Restaurants**: Multi-location support
- **Items**: Product catalog with SKU tracking
- **Locations**: Storage locations (kitchen, storage, etc.)
- **Stock Levels**: Current inventory quantities
- **Stock Movements**: Transaction history

## Environment Variables Set

| Variable | Value | Purpose |
|----------|-------|---------|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/brunos_ims_test` | Database connection |
| `NODE_ENV` | `test` | Environment mode |
| `PORT` | `3001` | Backend server port |
| `JWT_SECRET` | `test-jwt-secret-key` | Authentication secret |
| `CORS_ORIGIN` | `http://localhost:3000` | Frontend URL |

## Database Seeding

The workflow includes a seed script (`prisma/seed.ts`) that creates:

- Demo restaurant
- Storage and kitchen locations
- Sample inventory items (tomatoes, ground beef, mozzarella)
- Initial stock levels
- Admin user account

## Error Handling

The workflow includes comprehensive error handling:

- **Network Issues**: Graceful fallback for Prisma binary downloads
- **Database Connectivity**: Timeout and retry logic for PostgreSQL
- **Dependency Conflicts**: Uses legacy peer deps resolution
- **Missing Files**: Creates necessary directories and files

## Performance Optimizations

- **Caching**: Dependencies cached between runs
- **Parallel Execution**: Independent steps run in parallel where possible
- **Timeouts**: Reasonable timeouts to prevent hanging
- **Health Checks**: PostgreSQL readiness validation

## Security Considerations

- **Secrets**: Uses secure environment variable handling
- **Permissions**: Minimal required permissions
- **Database**: Isolated test database
- **Network**: Restricted to necessary connections only

## Next Steps

The setup workflow is now ready to:

1. **Run Before CI**: Prepares environment for main CI pipeline
2. **Support Development**: Can be used for local development setup
3. **Enable Testing**: Database and dependencies ready for tests
4. **Scale**: Can be extended for additional services (Redis, etc.)

## Files Created/Modified

- ✅ `.github/workflows/setup.yml` - Main setup workflow
- ✅ `prisma/schema.prisma` - Database schema
- ✅ `prisma/seed.ts` - Database seeding script
- ✅ `package.json` - Added Prisma scripts and dependencies
- ✅ `backend/package.json` - Added Prisma client dependencies
- ✅ `.github/workflows/ci.yml` - Updated to use setup workflow
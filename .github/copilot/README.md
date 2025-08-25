# Bruno's IMS - Copilot Configuration Summary

## Overview
This repository has been configured with comprehensive GitHub Copilot coding agent settings optimized for an inventory management system for F&B operations. The configuration supports a monorepo structure with Next.js frontend, FastAPI backend, and PostgreSQL database.

## Configuration Structure

### Core Configuration Files
- **`.github/copilot-instructions.md`** - Main repository-wide instructions
- **`.github/copilot/project-structure.md`** - Project organization guidelines
- **`.github/copilot/development-standards.md`** - Code quality and testing standards
- **`.github/copilot/security.md`** - Security configuration and requirements
- **`.github/copilot/ci-cd.md`** - Build, test, and deployment automation
- **`.github/copilot/documentation.md`** - Documentation standards and requirements

### Path-Scoped Instructions
- **`.github/copilot/path-instructions/apps-web.md`** - Next.js frontend guidelines
- **`.github/copilot/path-instructions/services-api.md`** - FastAPI backend guidelines

### Automation Configuration
- **`.github/workflows/ci.yml`** - Continuous integration pipeline
- **`.github/workflows/auto-merge.yml`** - Automated PR merging
- **`.github/workflows/module-progression.yml`** - Automated module development progression

### Issue Templates
- **`.github/ISSUE_TEMPLATE/copilot-task.md`** - Copilot task template
- **`.github/ISSUE_TEMPLATE/bug-report.md`** - Bug reporting template
- **`.github/ISSUE_TEMPLATE/feature-request.md`** - Feature request template

## Key Features

### 1. Project Structure Configuration ✅
- **Source Code Organization**: Feature-based architecture with clean separation
- **Test Directory Structure**: Co-located tests with comprehensive coverage requirements
- **Documentation Paths**: Structured documentation with business flows and ADRs
- **Resource Management**: Environment configuration and asset organization

### 2. Development Standards ✅
- **Code Style Guidelines**: ESLint + Prettier (frontend), Ruff + Black (backend)
- **Linting Rules**: Comprehensive linting with pre-commit hooks
- **Testing Framework**: Vitest (frontend), pytest (backend) with ≥70% coverage
- **Code Review Requirements**: Automated checks with branch protection

### 3. Security Configuration ✅
- **RBAC Settings**: Role-based access control with permission matrices
- **Encryption Standards**: Data-at-rest and in-transit encryption
- **Audit Logging**: Comprehensive audit trails for all critical operations
- **Rate Limiting**: API rate limiting with user-based and endpoint-based limits

### 4. CI/CD Configuration ✅
- **Build Process**: Optimized monorepo builds with change detection
- **Test Automation**: Comprehensive test pipeline with unit, integration, and E2E tests
- **Deployment Settings**: Blue-green deployment with health checks
- **Environment Management**: Multi-environment configuration with proper secret handling

### 5. Documentation Requirements ✅
- **API Documentation Format**: OpenAPI 3.0 specification with interactive docs
- **Code Documentation Standards**: TSDoc (frontend) and Google-style docstrings (backend)
- **Setup Guides Structure**: Comprehensive development and production setup guides
- **Maintenance Procedures**: Database maintenance, security updates, and monitoring

## Auto-merge & Module Progression

### Auto-merge Configuration
- PRs labeled with `automerge` automatically merge when CI passes
- Comprehensive CI pipeline validates code quality, security, and functionality
- Branch protection ensures all checks pass before merge

### Automated Module Development
The system includes automated progression through these modules:
1. **Foundation & UOM System** - Base conversion utilities
2. **Purchasing** - Purchase order management
3. **Receiving** - Goods receiving workflows
4. **Inventory** - Stock tracking and management
5. **Recipes** - Recipe and BOM management
6. **Production** - Production planning and execution
7. **Wastage & Prep Loss** - Waste tracking and cost allocation
8. **Forecasting** - Demand planning
9. **Reporting** - Financial and operational analytics
10. **SOP & Audit** - Standard procedures and audit trails

## Domain-Specific Rules

### Multi-UOM System
- All quantity calculations use shared conversion utilities
- Store quantities in base units only
- Never hardcode conversion factors
- Frontend: `packages/shared/uom.ts`
- Backend: `services/api/services/uom.py`

### Financial Calculations
- Recipe/production costs derived from weighted average of stock movements
- Never use purchase order prices directly for costing
- Include wastage/prep loss in all cost calculations
- Use Decimal type for monetary values to avoid floating-point errors

### Security Requirements
- Input validation with Zod (frontend) and Pydantic (backend)
- Role-based access control enforced at API level
- Comprehensive audit logging for all critical operations
- Rate limiting and security headers implemented

## Development Workflow

### Getting Started
```bash
# Clone repository
git clone https://github.com/jackbruno1994/brunos-ims.git
cd brunos-ims

# Install dependencies
corepack enable
pnpm install

# Start development servers
pnpm -w dev                    # Frontend
uvicorn services.api.main:app --reload  # Backend (in separate terminal)
```

### Available Commands
```bash
# Frontend
pnpm -w dev         # Development server
pnpm -w build       # Production build
pnpm -w test        # Run tests
pnpm -w lint        # Lint code
pnpm -w typecheck   # Type checking

# Backend
cd services/api
uvicorn main:app --reload  # Development server
pytest              # Run tests
ruff check .        # Lint code
mypy .              # Type checking

# Database
pnpm -w db:migrate  # Apply migrations
pnpm -w db:seed     # Seed database
```

### Issue Creation for Copilot
Use the Copilot task template to create issues:
1. Add clear acceptance criteria
2. Label with `copilot:ready` and `automerge`
3. Reference related documentation
4. Specify affected components

## Quality Assurance

### Code Quality Metrics
- **Test Coverage**: Minimum 70% for all codebases
- **Type Safety**: Strict TypeScript and Python type checking
- **Performance**: API responses < 200ms, bundle size < 1MB per route
- **Security**: Comprehensive input validation and RBAC enforcement

### Monitoring & Alerts
- Automated security scanning with Trivy and Safety
- Performance monitoring with built-in health checks
- Error tracking and audit log analysis
- Dependency vulnerability scanning

## Migration Support

The configuration supports gradual migration from the current structure:
- **Current**: `backend/` (Node.js + Express), `frontend/` (React + Vite)
- **Target**: `apps/web/` (Next.js), `services/api/` (FastAPI)
- **Strategy**: Feature-by-feature migration with API compatibility

## Support Resources

- **Documentation**: Comprehensive docs in `docs/` directory
- **Architecture**: Clean architecture patterns with dependency injection
- **Examples**: Code examples in path-scoped instructions
- **Templates**: Issue and configuration templates for consistency

## Next Steps

1. **Repository Settings**: Configure branch protection for `main` branch
2. **Labels**: Create `automerge` label if it doesn't exist
3. **First Issue**: Create initial module issue with Copilot labels
4. **Team Access**: Grant GitHub Copilot access to the repository
5. **Environment Variables**: Set up development and production environments

The configuration is now complete and ready for GitHub Copilot to begin automated development of the Bruno's IMS system according to the comprehensive specifications provided.
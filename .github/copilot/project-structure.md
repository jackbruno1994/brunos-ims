# Project Structure Configuration

## Overview
Bruno's IMS is transitioning to a comprehensive monorepo structure optimized for inventory and recipe management in F&B operations.

## Source Code Organization

### Current Structure (Legacy)
```
brunos-ims/
├── backend/              # Node.js + Express (Legacy)
├── frontend/            # React + Vite (Legacy)
└── docs/               # Documentation
```

### Target Monorepo Structure
```
brunos-ims/
├── apps/
│   └── web/            # Next.js + TypeScript frontend
├── services/
│   └── api/            # FastAPI + Python backend
├── packages/
│   ├── shared/         # Shared TypeScript utilities & types
│   └── ui/             # Reusable UI component library
├── db/                 # Database schema & migrations (Prisma)
├── docs/               # Documentation
│   ├── flows/          # Business process documentation
│   ├── style/          # Style guides
│   └── adrs/           # Architecture Decision Records
└── ops/                # Operations & deployment configs
```

## Domain-Driven Feature Organization

### Frontend Features (`apps/web/src/features/`)
- `purchasing/` - Purchase order management
- `receiving/` - Goods receiving workflows
- `inventory/` - Stock management & tracking
- `recipes/` - Recipe & BOM management
- `production/` - Production planning & execution
- `wastage/` - Waste tracking & prep loss
- `forecasting/` - Demand forecasting
- `reporting/` - COGS, GP%, and analytics
- `audit/` - SOP & audit logging

### API Services (`services/api/`)
```
services/api/
├── routers/            # FastAPI route definitions
│   ├── purchasing.py
│   ├── receiving.py
│   ├── inventory.py
│   └── ...
├── services/           # Business logic layer
│   ├── purchasing_service.py
│   ├── uom_service.py
│   └── ...
├── repositories/       # Data access layer
│   ├── item_repository.py
│   ├── supplier_repository.py
│   └── ...
└── models/            # Pydantic models
    ├── requests/
    ├── responses/
    └── entities/
```

## Test Directory Structure

### Frontend Tests
```
apps/web/
├── src/
│   ├── features/
│   │   └── <domain>/
│   │       ├── __tests__/          # Feature tests
│   │       ├── components/
│   │       │   └── __tests__/      # Component tests
│   │       ├── hooks/
│   │       │   └── __tests__/      # Hook tests
│   │       └── utils/
│   │           └── __tests__/      # Utility tests
│   └── __tests__/                  # App-level tests
├── tests/
│   ├── e2e/                        # End-to-end tests
│   ├── integration/                # Integration tests
│   └── setup/                      # Test configuration
└── stories/                        # Storybook stories
    └── <component>.stories.tsx
```

### API Tests
```
services/api/
├── tests/
│   ├── unit/
│   │   ├── services/               # Service unit tests
│   │   ├── repositories/           # Repository unit tests
│   │   └── utils/                  # Utility unit tests
│   ├── integration/
│   │   ├── routers/                # Router integration tests
│   │   └── database/               # Database integration tests
│   └── fixtures/                   # Test data fixtures
└── conftest.py                     # Pytest configuration
```

## Documentation Paths

### Required Documentation Structure
```
docs/
├── flows/                          # Business process flows
│   ├── purchasing.md
│   ├── receiving.md
│   ├── production.md
│   ├── stock-takes.md
│   ├── forecasting.md
│   ├── reporting.md
│   └── sop-audit.md
├── style/                          # Style & coding standards
│   ├── typescript.md
│   ├── python.md
│   ├── api-design.md
│   └── ui-patterns.md
├── adrs/                           # Architecture Decision Records
│   └── NNNN-decision-title.md
├── api/                            # API documentation
│   ├── openapi.json
│   └── endpoints/
└── setup/                          # Setup & deployment guides
    ├── development.md
    ├── production.md
    └── database.md
```

## Resource Management

### Environment Files
```
# Root level
.env.example                        # Template with all required vars
.env.local                         # Local development overrides

# Service specific
apps/web/.env.example              # Frontend environment template
services/api/.env.example          # API environment template
```

### Package Management
- **Frontend**: `pnpm` workspace for all Node.js packages
- **API**: `uv` for Python dependency management
- **Database**: Prisma for schema management & migrations

### Asset Organization
```
apps/web/
├── public/
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   └── locales/                   # i18n resources
packages/ui/
├── assets/                        # Shared UI assets
└── styles/                        # Global styles & themes
```

## File Naming Conventions

### TypeScript/JavaScript
- **Components**: `PascalCase.tsx` (e.g., `ProductionBatch.tsx`)
- **Hooks**: `camelCase.ts` starting with `use` (e.g., `useInventoryQuery.ts`)
- **Utilities**: `camelCase.ts` (e.g., `formatCurrency.ts`)
- **Types**: `PascalCase.types.ts` (e.g., `Recipe.types.ts`)
- **Constants**: `SCREAMING_SNAKE_CASE.ts` (e.g., `API_ENDPOINTS.ts`)

### Python
- **Modules**: `snake_case.py` (e.g., `purchase_service.py`)
- **Classes**: `PascalCase` (e.g., `PurchaseOrderService`)
- **Functions**: `snake_case` (e.g., `calculate_recipe_cost`)
- **Constants**: `SCREAMING_SNAKE_CASE` (e.g., `DEFAULT_UOM`)

### Database
- **Tables**: `snake_case` (e.g., `purchase_orders`)
- **Columns**: `snake_case` (e.g., `supplier_id`)
- **Migrations**: `YYYYMMDD_HHMMSS_description.sql`

## Import/Export Standards

### TypeScript Exports
```typescript
// packages/shared/index.ts - Barrel exports only
export { type Recipe } from './types/Recipe.types';
export { formatCurrency } from './utils/currency';
export { UOM_CONVERSION } from './constants/uom';

// No default exports in shared packages
// Named exports only for better tree-shaking
```

### Python Imports
```python
# Absolute imports preferred
from services.api.models.entities import Item
from services.api.services import UomService

# Avoid relative imports beyond immediate parent
from ..models import PurchaseOrder  # OK
from ....utils import helper  # Avoid
```

## Migration Strategy

The repository will gradually transition from the current backend/frontend structure to the monorepo structure:

1. **Phase 1**: Create new monorepo structure alongside existing
2. **Phase 2**: Migrate frontend to Next.js in `apps/web/`
3. **Phase 3**: Migrate backend to FastAPI in `services/api/`
4. **Phase 4**: Remove legacy `backend/` and `frontend/` directories
5. **Phase 5**: Full monorepo tooling & CI/CD integration

## Constraints & Guidelines

- **Backward Compatibility**: Maintain API contracts during migration
- **Incremental Migration**: No big-bang rewrites; feature-by-feature migration
- **Shared Dependencies**: Common utilities must live in `packages/shared/`
- **Database First**: Schema changes require migration files
- **Documentation Driven**: New features require flow documentation
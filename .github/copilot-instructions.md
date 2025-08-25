# Copilot Repository Instructions — Bruno's IMS

## What this repo is
Inventory & recipe management system for F&B operations.

**Core modules**: Purchasing, Receiving, Vendors, Inventory & Stock Takes, Multi-UOM, Recipes/BOM, Production (batch & sub-recipes), Wastage/Prep Loss, Forecasting, Reporting (COGS, GP%), SOP & Audit logs.

**Tech (monorepo)**
- Frontend: Next.js + TypeScript (`apps/web`)
- API: FastAPI + Python 3.11 (`services/api`)
- DB: PostgreSQL + Prisma (`db`)
- Shared libs: TS types/utils (`packages/shared`), UI lib (`packages/ui`)

## How to run (dev)
- One command (if you have docker-compose services): `docker compose up --build`
- Web: `corepack enable && pnpm i && pnpm -w dev` → http://localhost:3000
- API: `python -m venv .venv && source .venv/bin/activate && pip install -U pip uv && uv pip install -r services/api/requirements.txt && uvicorn services.api.main:app --reload --port 8000`
- Tests: Web `pnpm -w test`, API `pytest -q`
- Lint/Types: Web `pnpm -w lint && pnpm -w typecheck`, API `ruff check . && mypy services/api`
- DB: `pnpm -w db:migrate` and `pnpm -w db:seed` (if defined)

## Conventions

### Code Style
- **Web**: ESLint + Prettier configuration in `.github/copilot/development-standards.md`
- **API**: Ruff + Black + mypy configuration detailed in standards document
- **Database**: Prisma schema with snake_case naming conventions

### Architecture Patterns
- **Web**: Feature-based organization in `src/features/<domain>`
  - Keep domain logic in pure utils/hooks
  - Use TanStack Query for server state management
  - Prefer server actions for simple mutations
- **API**: Clean architecture with layers
  - `routers/<domain>.py` → `services/` → `repositories/` (clear separation)
  - Validate requests/responses with Pydantic
  - Use dependency injection for services

### Testing Standards
- **Coverage Target**: ≥70% for all codebases
- **Test Types**: Unit tests for business logic, integration tests for endpoints
- **Test Organization**: Co-located with source code in `__tests__/` directories
- **Mocking**: Use dependency injection to facilitate testing

### Security Requirements
- **No Secrets**: Never commit secrets. Use `.env.example` templates
- **Input Validation**: Validate all inputs (zod for frontend, pydantic for API)
- **RBAC**: Role-based access control enforced at API level
- **Audit Logging**: All critical operations must be audited

## Domain Rules (must follow)

### Multi-UOM System
- **Critical**: All quantity math via shared conversion utilities
  - Frontend: `packages/shared/uom.ts`
  - API: `services/api/services/uom.py`
- **Never hardcode conversion factors**
- Store all quantities in base units with conversion metadata

### Financial Calculations
- **Recipe/Production Costs**: Derived from `stock_moves` (weighted average)
- **Never infer costs from PO prices directly**
- **Currency**: Store in smallest denomination (cents) to avoid rounding errors

### Inventory Management
- **Wastage/Prep Loss**: Create compensating `stock_moves` with reason codes
- **Include waste in COGS calculations**
- **Batch/Sub-recipes**: Production consumes ingredients and produces finished goods atomically
- **Stock Takes**: Adjustments via `counts` reconciled to `stock_moves` with audit trail

## Data Model (High Level)

### Core Entities
```
items(id, sku, name, base_uom, category)
uom(id, code, name)
conversions(item_id, from_uom, to_uom, factor)
suppliers(id, name, terms)
purchase_orders(id, supplier_id, status, ...)
receipts(id, po_id, date, ...)
stock_moves(id, item_id, qty_base, cost_per_base, src, dest, reason)
recipes(id, name, yield_uom, yield_qty_base, ...)
recipe_items(recipe_id, item_id, qty_base, loss_pct)
batches(id, recipe_id, produced_qty_base, ...)
counts(id, location_id, item_id, qty_base, ...)
wastage_logs(id, item_id, qty_base, reason, ...)
```

### Constraints
- Store quantities in base units only
- Conversions live in `uom`/`conversions` tables
- Never store denormalized converted quantities
- Breaking schema changes require ADR in `docs/adrs/`

## Configuration References

### Development Standards
See `.github/copilot/development-standards.md` for:
- Code formatting and linting rules
- Testing framework configuration
- Code review requirements
- Definition of done criteria

### Security Configuration  
See `.github/copilot/security.md` for:
- RBAC implementation patterns
- Encryption standards
- Audit logging requirements
- Rate limiting configuration

### CI/CD Configuration
See `.github/copilot/ci-cd.md` for:
- Build pipeline configuration
- Test automation setup
- Deployment procedures
- Environment management

### Documentation Standards
See `.github/copilot/documentation.md` for:
- API documentation format
- Code comment standards
- Setup guide structure
- Maintenance procedures

## PR Policy & Auto-merge

### Branch Protection
- **Required Checks**: CI / lint_test_build must pass
- **Auto-merge**: PRs labeled `automerge` merge automatically when CI passes
- **Review Requirements**: Peer review required for complex changes

### Pull Request Guidelines
- **Keep PRs focused** by module/feature
- **Small, incremental changes** are preferred
- **Include tests** for all new functionality
- **Update documentation** for user-facing changes

### Labels Copilot Uses
- `copilot:ready` — Issue is ready for agent implementation
- `automerge` — PRs will merge automatically when CI passes  
- `scope:ui`, `scope:api`, `scope:db` — Component classification
- `size:XS|S|M` — Complexity classification

## Module Development Order

The system modules should be implemented in this order for optimal dependency management:

1. **Foundation**: UOM conversion system and base data models
2. **Purchasing**: Purchase order management and supplier relations
3. **Receiving**: Goods receiving and initial inventory updates
4. **Inventory**: Stock tracking and multi-location management
5. **Recipes**: Recipe management and BOM calculations
6. **Production**: Production planning and batch execution
7. **Wastage & Prep Loss**: Waste tracking and cost allocation
8. **Forecasting**: Demand planning and procurement suggestions
9. **Reporting**: Financial reporting and analytics
10. **SOP & Audit**: Standard operating procedures and audit trails

## Development Commands

### Frontend (Next.js)
```bash
pnpm -w dev          # Start development server
pnpm -w build        # Build for production
pnpm -w test         # Run tests
pnpm -w lint         # Run ESLint
pnpm -w typecheck    # TypeScript type checking
pnpm -w format       # Format with Prettier
```

### API (FastAPI)
```bash
uvicorn services.api.main:app --reload    # Start development server
pytest -q                                 # Run tests
pytest --cov=./ --cov-report=term        # Run tests with coverage
ruff check .                              # Lint code
ruff check . --fix                        # Fix linting issues
black .                                   # Format code
mypy services/api                         # Type checking
```

### Database (Prisma)
```bash
pnpm -w db:migrate    # Apply migrations
pnpm -w db:seed       # Seed database
pnpm -w db:reset      # Reset and reseed database
pnpm -w db:studio     # Open Prisma Studio
```

## Issue Templates & Workflows

### Creating Issues for Copilot
Use the issue template in `.github/ISSUE_TEMPLATE/copilot-task.md`:
- Include clear acceptance criteria
- Specify affected modules/components
- Reference any related documentation
- Add appropriate labels for auto-processing

### Auto-merge Workflow
1. Issues labeled `copilot:ready` are picked up automatically
2. Implementation PRs are created with `automerge` label
3. CI pipeline validates all requirements
4. PRs merge automatically when all checks pass
5. Next module issues are created automatically

## Migration from Current Structure

The repository is transitioning from `backend/frontend` to the monorepo structure:

### Current State
- `backend/` - Node.js + Express (legacy)
- `frontend/` - React + Vite (legacy)

### Target State  
- `apps/web/` - Next.js application
- `services/api/` - FastAPI service
- `packages/shared/` - Shared utilities
- `packages/ui/` - UI component library

### Migration Strategy
- Gradual feature-by-feature migration
- Maintain API compatibility during transition
- Legacy endpoints will be deprecated once new implementation is complete
- Full transition expected within current development cycle

## Resources & References

- **Architecture Documentation**: `docs/architecture.md`
- **Data Model Details**: `docs/data-model.md`
- **Flow Documentation**: `docs/flows/`
- **Decision Records**: `docs/adrs/`
- **Setup Guides**: See documentation configuration for environment setup

## Support & Contact

For questions about this configuration or implementation guidance:
- Review existing documentation in `docs/` directory
- Check GitHub Discussions for Q&A
- Create issues with appropriate labels for feature requests
- Reference this document for development standards and patterns
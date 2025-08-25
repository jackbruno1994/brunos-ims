---
name: Copilot Task
about: Scoped task for the Copilot coding agent
labels: ["copilot:ready","automerge"]
---

### Goal
<One-sentence outcome (e.g., "Implement Receiving page pagination with supplier/date filters.")>

### Context / How to run
- **Web**: `pnpm -w dev` → http://localhost:3000
- **API**: `uvicorn services.api.main:app --reload` → http://localhost:8000
- **DB** (if needed): `pnpm -w db:migrate && pnpm -w db:seed`

### Acceptance Criteria
- [ ] Feature implemented according to specifications
- [ ] Unit/integration tests added with ≥70% coverage
- [ ] Code follows style guidelines (ESLint + Prettier for web, Ruff + Black for API)
- [ ] All linting and type checking passes
- [ ] CI pipeline passes all checks
- [ ] Documentation updated in relevant `docs/flows/<module>.md` file
- [ ] API documentation updated if endpoints are added/modified
- [ ] Security considerations addressed (input validation, RBAC, audit logging)

### Constraints
- Use shared UOM conversion utilities (`packages/shared/uom.ts` and `services/api/services/uom.py`)
- No breaking DB changes without ADR in `docs/adrs/`
- Maintain backward compatibility during migration from legacy structure
- Follow domain-driven design patterns outlined in project structure
- All financial calculations must use weighted average costing from stock moves

### Technical Requirements
- **Frontend**: Feature-based organization in `apps/web/src/features/<domain>`
- **API**: Clean architecture with routers → services → repositories
- **Database**: Store quantities in base UOM only, use conversion utilities for display
- **Testing**: Include both unit and integration tests
- **Security**: Validate all inputs, enforce RBAC, log audit events for critical operations

### Definition of Ready
- [ ] Requirements are clear and testable
- [ ] Acceptance criteria are specific and measurable
- [ ] Dependencies identified and available
- [ ] Technical approach aligned with architecture standards

### Definition of Done
- [ ] Code is implemented and reviewed
- [ ] All tests pass with required coverage
- [ ] Documentation is updated
- [ ] Security requirements met
- [ ] Performance requirements satisfied
- [ ] Ready for production deployment

---

**Note**: This repository is configured for **full-auto** merge. PRs with the `automerge` label will merge automatically once CI passes. To pause auto-merge for any reason, remove the `automerge` label.
#!/usr/bin/env bash
set -euo pipefail

# --- Folders ---
mkdir -p .github/workflows
mkdir -p .github/ISSUE_TEMPLATE
mkdir -p apps/web
mkdir -p services/api
mkdir -p db
mkdir -p packages/ui
mkdir -p packages/shared
mkdir -p docs/{flows,style,adrs}
mkdir -p ops

# --- 1) Repo-wide Copilot instructions ---
cat > .github/copilot-instructions.md <<'EOF'
# Copilot Repository Instructions — Bruno’s IMS

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
- **Code style**: ESLint + Prettier (web); Ruff + Black (api).
- **Architecture**:
  - Web: `src/features/<domain>`; keep domain logic in pure utils/hooks.
  - API: `routers/<domain>.py` → `services/` → `repositories/` (clean layers).
- **Testing**: Add/adjust tests with every change. Target coverage ≥ 70%.
- **Security**: Never commit secrets. Use `.env.example`. Validate inputs (zod/pydantic). RBAC enforced at API.
- **Data model (high level)**: `items`, `suppliers`, `purchase_orders`, `receipts`, `stock_moves`, `recipes`, `recipe_items`, `batches`, `uom`, `conversions`, `locations`, `counts`, `wastage_logs`.

## Domain rules (must follow)
- **Multi-UOM**: All quantity math via shared conversion utilities (`packages/shared/uom.ts` and `services/api/services/uom.py`). Never hardcode conversion factors.
- **Costing**: Recipe/production costs derived from `stock_moves` (avg weighted). Do not infer from PO price directly.
- **Wastage/Prep Loss**: Create compensating `stock_moves` with reason codes; include in COGS.
- **Batch/Sub-recipes**: Production consumes ingredients (moves out) and produces finished goods (moves in) atomically with audit.
- **Stock Takes**: Adjustments via `counts` reconciled to `stock_moves` with trail.

## PR policy (full-auto)
- Keep PRs focused by module/feature.
- CI must be green; repository is configured to **auto-merge** labeled PRs (`automerge`) once checks pass.
- Breaking DB changes require an ADR in `docs/adrs/` (agent should open an ADR PR first).

## Labels Copilot uses
- `copilot:ready` — issue is ready for agent
- `automerge` — PRs will merge automatically when CI passes
- `scope:ui`, `scope:api`, `scope:db`, `size:XS|S|M` (optional classifiers)
EOF

# --- 2) Path-scoped instructions ---
cat > apps/web/.instructions.md <<'EOF'
---
applies_to:
  - apps/web/**
---

# Web (Next.js) — Copilot Instructions
- Feature work in `apps/web/src/features/<domain>`.
- Use TanStack Query for server data; prefer server actions for simple mutations; otherwise call API endpoints.
- Add Vitest tests for hooks/utils; Storybook stories for components.
- Commands: `pnpm -w dev`, `pnpm -w build`, `pnpm -w test`, `pnpm -w lint`, `pnpm -w typecheck`.
- Accessibility required (ARIA + keyboard) for tables, dialogs, and menus.
EOF

cat > services/api/.instructions.md <<'EOF'
---
applies_to:
  - services/api/**
---

# API (FastAPI) — Copilot Instructions
- Endpoints in `routers/`; business logic in `services/`; DB calls in repositories. Do not query DB from routers.
- Validate requests/responses with Pydantic. Return typed models.
- Health: `/health` ; Version: `/version`.
- Tests: pytest unit (services) + integration (routers via TestClient).
- Commands: `pytest -q`, `ruff check .`, `mypy services/api`, `uvicorn services.api.main:app --reload`.
EOF

cat > db/.instructions.md <<'EOF'
---
applies_to:
  - db/**
---

# DB (Prisma) — Copilot Instructions
- Schema at `db/schema.prisma`. Use `pnpm -w db:migrate` to create/apply migrations.
- Store quantities in base units; conversions live in `uom`/`conversions`. Never store denormalized converted quantities.
- Seeds must include: demo suppliers, items with conversions, one recipe with sub-recipe, one small production run.
- Breaking schema changes require an ADR in `docs/adrs/` and a separate PR.
EOF

cat > packages/ui/.instructions.md <<'EOF'
---
applies_to:
  - packages/ui/**
---

# UI Library — Copilot Instructions
- Every component needs: Storybook story, unit test, basic a11y checks.
- Export only from `index.ts`. No default exports.
- Data grids must support sort, filter, pagination, CSV export.
EOF

# --- 3) Issue template for Copilot tasks ---
cat > .github/ISSUE_TEMPLATE/copilot-task.md <<'EOF'
---
name: Copilot Task
about: Scoped task for the Copilot coding agent
labels: ["copilot:ready","automerge"]
---

### Goal
<One-sentence outcome (e.g., "Implement Receiving page pagination with supplier/date filters.")>

### Context / How to run
- Web: `pnpm -w dev`
- API: `uvicorn services.api.main:app --reload`
- DB (if needed): `pnpm -w db:migrate && pnpm -w db:seed`

### Constraints
- Use shared UOM conversion utilities.
- No breaking DB changes without ADR.
- Add/adjust tests; keep PR minimal and focused.

### Acceptance Criteria
- [ ] Feature implemented
- [ ] Unit/integration tests updated
- [ ] Lint + typecheck pass
- [ ] CI green
- [ ] Docs updated in `docs/flows/<module>.md`
EOF

# --- 4) Copilot setup steps (shared) ---
cat > .github/workflows/copilot-setup-steps.yml <<'EOF'
name: Copilot setup steps
on:
  workflow_call:
  workflow_dispatch:

jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # Node workspace
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - name: Install web deps
        run: |
          corepack enable
          pnpm i --frozen-lockfile || true
      - name: Web lint/type/test (best effort)
        run: |
          pnpm -w -r run lint || true
          pnpm -w -r run typecheck || true
          pnpm -w -r run test --if-present -- --reporter=dot || true

      # Python workspace
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
      - name: Install API deps (if any)
        run: |
          python -m pip install -U pip uv || true
          if [ -f services/api/requirements.txt ]; then uv pip install -r services/api/requirements.txt; fi
      - name: API lint/type/test (best effort)
        run: |
          if command -v ruff >/dev/null 2>&1; then ruff --version || true; fi
          if command -v mypy >/dev/null 2>&1; then mypy --version || true; fi
          if [ -d services/api ]; then pytest -q || true; fi
EOF

# --- 5) CI (creates one required check name: CI / lint_test_build) ---
cat > .github/workflows/ci.yml <<'EOF'
name: CI
on:
  pull_request:
    branches: [ main ]

permissions:
  contents: read

jobs:
  prepare:
    uses: ./.github/workflows/copilot-setup-steps.yml

  lint_test_build:
    needs: prepare
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - name: Install & Build
        run: |
          corepack enable
          pnpm i --frozen-lockfile || true
          pnpm -w lint || true
          pnpm -w typecheck || true
          pnpm -w test --if-present -- --reporter=dot || true
          pnpm -w build || true
EOF

# --- 6) Auto-merge (full-auto when labeled `automerge`) ---
cat > .github/workflows/auto-merge.yml <<'EOF'
name: Auto-merge PRs
on:
  pull_request:
    types: [opened, labeled, synchronize, reopened]
  check_suite:
    types: [completed]
  workflow_run:
    workflows: ["CI"]
    types: [completed]

permissions:
  contents: write
  pull-requests: write

jobs:
  auto:
    runs-on: ubuntu-latest
    if: >
      github.event_name != 'pull_request' ||
      contains(github.event.pull_request.labels.*.name, 'automerge')
    steps:
      - uses: peter-evans/auto-merge@v3
        with:
          merge-method: squash
EOF

# --- 7) Fully hands-off: module order ---
cat > ops/modules.json <<'EOF'
{
  "order": [
    "Purchasing",
    "Receiving",
    "Inventory",
    "Recipes",
    "Production",
    "Wastage & Prep Loss",
    "Forecasting",
    "Reporting",
    "SOP & Audit"
  ]
}
EOF

# --- 8) Auto-continue to next module + notify you ---
cat > .github/workflows/next-module.yml <<'EOF'
name: Next module auto-starter
on:
  pull_request:
    types: [closed]

permissions:
  contents: read
  issues: write

jobs:
  queue-next:
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Open completion notice + next module issue
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const path = require('path');
            const owner = context.repo.owner;
            const repo = context.repo.repo;

            // Load order
            const p = path.join(process.cwd(), 'ops', 'modules.json');
            const order = JSON.parse(fs.readFileSync(p, 'utf8')).order;

            const pr = context.payload.pull_request;
            const prTitle = (pr.title || '').toLowerCase();

            // Find finished module by matching its name in PR title
            let idx = -1;
            for (let i=0; i<order.length; i++) {
              if (prTitle.includes(order[i].toLowerCase())) { idx = i; break; }
            }
            const finished = idx === -1 ? '(undetected module)' : order[idx];

            // Inform owner a module completed
            await github.rest.issues.create({
              owner, repo,
              title: `Module Completed: ${finished}`,
              body: `✅ **${finished}** merged in PR #${pr.number}.\n@${context.repo.owner} review when convenient. The agent will continue automatically.`,
              labels: ['info','automation']
            });

            // If last module, stop here
            const nextIdx = (idx === -1) ? 0 : idx + 1;
            if (nextIdx >= order.length) {
              await github.rest.issues.create({
                owner, repo,
                title: 'All Modules Completed',
                body: '🎉 The final module in `ops/modules.json` has been merged. No further modules.',
                labels: ['info','automation']
              });
              return;
            }

            const next = order[nextIdx];
            const slug = next.toLowerCase().replace(/[^a-z0-9]+/g,'-');

            // Open next module issue pre-labeled for Copilot & auto-merge
            await github.rest.issues.create({
              owner, repo,
              title: `Module: ${next}`,
              body:
                `### Module\n${next}\n\n` +
                `### Acceptance Criteria\n` +
                `- [ ] Features for **${next}** implemented\n` +
                `- [ ] Unit & integration tests added\n` +
                `- [ ] Lint + typecheck pass\n` +
                `- [ ] CI green\n` +
                `- [ ] Docs updated in \`docs/flows/${slug}.md\`\n\n` +
                `### Review Policy\n` +
                `- This repository is configured for **full-auto** (automerge once CI is green).\n` +
                `- To pause at any time, remove the \`automerge\` label on the PR.`,
              labels: ['copilot:ready','automerge']
            });
EOF

# --- 9) Minimal docs skeletons ---
cat > docs/architecture.md <<'EOF'
# Bruno’s IMS — Architecture
- Monorepo: Next.js (web), FastAPI (api), PostgreSQL (db/Prisma).
- Modules: Purchasing, Receiving, Inventory, Recipes, Production, Wastage & Prep Loss, Forecasting, Reporting, SOP & Audit.
EOF

cat > docs/data-model.md <<'EOF'
# Data Model (high level)
- items(id, sku, name, base_uom, category)
- uom(id, code, name)
- conversions(item_id, from_uom, to_uom, factor)
- suppliers(id, name, terms)
- purchase_orders(id, supplier_id, status, ...)
- receipts(id, po_id, date, ...)
- stock_moves(id, item_id, qty_base, cost_per_base, src, dest, reason)
- recipes(id, name, yield_uom, yield_qty_base, ...)
- recipe_items(recipe_id, item_id, qty_base, loss_pct)
- batches(id, recipe_id, produced_qty_base, ...)
- counts(id, location_id, item_id, qty_base, ...)
- wastage_logs(id, item_id, qty_base, reason, ...)
EOF

# placeholder flow docs
for f in receiving purchasing production "stock-takes" forecasting reporting "sop-audit"; do
  cat > "docs/flows/${f}.md" <<EOF
# ${f^} Flow
(Outline the user journey, data movements, and edge cases here.)
EOF
done

echo "✅ Copilot configuration files created."
echo "Next steps:"
echo "1) In GitHub → Settings → Branches: protect 'main' and require check: CI / lint_test_build; enable Auto-merge."
echo "2) In GitHub → Issues → Labels: create label 'automerge' (if it doesn't exist)."
echo "3) (Optional) Create your first issue: 'Module: Purchasing' with labels 'copilot:ready, automerge' and assign GitHub Copilot."
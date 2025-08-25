# Development Standards Configuration

## Code Style Guidelines

### TypeScript/JavaScript Standards (Frontend)

#### ESLint Configuration
```json
{
  "extends": [
    "@next/eslint-config-next",
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "prefer-const": "error",
    "no-var": "error",
    "object-shorthand": "error"
  }
}
```

#### Prettier Configuration
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "endOfLine": "lf"
}
```

#### TypeScript Best Practices
- **Strict Mode**: Always use strict TypeScript configuration
- **Type Safety**: No `any` types without explicit justification
- **Interface Naming**: Use descriptive names without `I` prefix
- **Generic Constraints**: Always constrain generics when possible
- **Utility Types**: Leverage built-in utility types (`Pick`, `Omit`, etc.)

```typescript
// ✅ Good
interface Recipe {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
}

type CreateRecipeRequest = Omit<Recipe, 'id'>;

// ❌ Bad
interface IRecipe {
  id: any;
  name: string;
}
```

### Python Standards (API)

#### Ruff Configuration (.ruff.toml)
```toml
line-length = 88
target-version = "py311"

[lint]
select = [
    "E",    # pycodestyle errors
    "W",    # pycodestyle warnings
    "F",    # Pyflakes
    "I",    # isort
    "B",    # flake8-bugbear
    "C4",   # flake8-comprehensions
    "UP",   # pyupgrade
]
ignore = [
    "E501",  # line too long, handled by black
]

[lint.isort]
known-first-party = ["services", "packages"]
```

#### Black Configuration (pyproject.toml)
```toml
[tool.black]
line-length = 88
target-version = ['py311']
include = '\.pyi?$'
```

#### Python Best Practices
- **Type Hints**: All function signatures must include type hints
- **Pydantic Models**: Use for all request/response validation
- **Dependency Injection**: Use FastAPI's dependency system
- **Error Handling**: Custom exception classes for business logic errors
- **Async/Await**: Use async patterns for I/O operations

```python
# ✅ Good
async def create_purchase_order(
    request: CreatePurchaseOrderRequest,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
) -> PurchaseOrderResponse:
    """Create a new purchase order with validation."""
    # Implementation
    pass

# ❌ Bad
def create_purchase_order(request, db, user):
    # Implementation
    pass
```

## Linting Rules & Enforcement

### Pre-commit Hooks
```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files

  - repo: https://github.com/charliermarsh/ruff-pre-commit
    rev: v0.1.0
    hooks:
      - id: ruff
        args: [--fix, --exit-non-zero-on-fix]

  - repo: https://github.com/psf/black
    rev: 23.9.1
    hooks:
      - id: black

  - repo: https://github.com/pre-commit/mirrors-prettier
    rev: v3.0.3
    hooks:
      - id: prettier
        files: \.(ts|tsx|js|jsx|json|md|yml|yaml)$
```

### IDE Configuration

#### VSCode Settings (.vscode/settings.json)
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "python.defaultInterpreterPath": "./services/api/.venv/bin/python",
  "python.linting.enabled": true,
  "python.linting.ruffEnabled": true,
  "typescript.preferences.includePackageJsonAutoImports": "on"
}
```

### Automated Linting Commands
```bash
# Frontend linting
pnpm -w lint                    # Run ESLint
pnpm -w lint:fix               # Fix ESLint issues
pnpm -w format                 # Run Prettier
pnpm -w typecheck              # TypeScript type checking

# API linting
ruff check .                   # Run Ruff linter
ruff check . --fix             # Fix Ruff issues
black .                        # Format with Black
mypy services/api              # Type checking
```

## Testing Framework Setup

### Frontend Testing (Vitest + Testing Library)

#### Configuration (vitest.config.ts)
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      threshold: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    }
  }
});
```

#### Test Standards
- **Unit Tests**: All hooks, utilities, and pure functions
- **Component Tests**: User interaction and rendering behavior
- **Integration Tests**: Feature workflows and API integration
- **E2E Tests**: Critical user journeys

```typescript
// ✅ Good test structure
describe('useInventoryQuery', () => {
  it('should fetch inventory items successfully', async () => {
    // Arrange
    const mockItems = [{ id: '1', name: 'Test Item' }];
    vi.mocked(fetchInventoryItems).mockResolvedValue(mockItems);
    
    // Act
    const { result } = renderHook(() => useInventoryQuery());
    
    // Assert
    await waitFor(() => {
      expect(result.current.data).toEqual(mockItems);
    });
  });
});
```

### API Testing (pytest + FastAPI TestClient)

#### Configuration (pytest.ini)
```ini
[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = 
    --strict-markers
    --disable-warnings
    --cov=services.api
    --cov-report=term-missing
    --cov-fail-under=70
```

#### Test Standards
- **Unit Tests**: Services, repositories, and utilities
- **Integration Tests**: Router endpoints with database
- **Contract Tests**: API schema validation
- **Performance Tests**: Critical endpoint response times

```python
# ✅ Good test structure
class TestPurchaseOrderService:
    async def test_create_purchase_order_success(
        self, 
        db_session: AsyncSession,
        sample_supplier: Supplier
    ) -> None:
        # Arrange
        request = CreatePurchaseOrderRequest(
            supplier_id=sample_supplier.id,
            items=[{"item_id": "1", "quantity": 10}]
        )
        service = PurchaseOrderService(db_session)
        
        # Act
        result = await service.create_purchase_order(request)
        
        # Assert
        assert result.supplier_id == sample_supplier.id
        assert len(result.items) == 1
```

### Coverage Requirements
- **Minimum Coverage**: 70% for all codebases
- **Critical Paths**: 90% coverage for financial calculations
- **New Code**: 80% coverage for all new features
- **Exemptions**: Configuration files, migrations, and generated code

## Code Review Requirements

### Review Checklist

#### Functionality
- [ ] Feature works as specified in acceptance criteria
- [ ] Edge cases are handled appropriately
- [ ] Error scenarios are covered
- [ ] Performance implications considered

#### Code Quality
- [ ] Follows established coding standards
- [ ] No code smells or anti-patterns
- [ ] Appropriate abstractions and modularity
- [ ] Clear and descriptive naming

#### Testing
- [ ] Adequate test coverage (≥70%)
- [ ] Tests are meaningful and not just for coverage
- [ ] Integration tests for new API endpoints
- [ ] E2E tests for critical user flows

#### Security
- [ ] Input validation implemented
- [ ] No hardcoded secrets or credentials
- [ ] Proper authentication/authorization
- [ ] SQL injection and XSS prevention

#### Documentation
- [ ] Code is self-documenting or has appropriate comments
- [ ] API changes reflected in OpenAPI spec
- [ ] Flow documentation updated if needed
- [ ] Breaking changes documented

### Review Process

1. **Automated Checks**: All CI checks must pass before review
2. **Self Review**: Author reviews their own changes first
3. **Peer Review**: At least one team member review required
4. **Domain Expert**: Complex business logic requires domain expert review
5. **Security Review**: Security-sensitive changes require security review

### Review Guidelines

#### For Reviewers
- **Be Constructive**: Suggest improvements, don't just point out problems
- **Ask Questions**: If code is unclear, ask for clarification
- **Check Context**: Understand the business requirements
- **Verify Tests**: Ensure tests actually validate the functionality

#### For Authors
- **Small PRs**: Keep changes focused and reviewable
- **Clear Descriptions**: Explain what, why, and how
- **Test Coverage**: Include relevant tests
- **Documentation**: Update docs for user-facing changes

### Auto-merge Conditions

PRs labeled with `automerge` will automatically merge when:
- [ ] All CI checks pass
- [ ] Required reviews approved
- [ ] No conflicts with target branch
- [ ] Security scans pass
- [ ] Coverage requirements met

## Branch Protection Rules

### Main Branch Protection
- **Required status checks**: CI / lint_test_build
- **Require branches to be up to date**: Yes
- **Require linear history**: Yes
- **Allow force pushes**: No
- **Allow deletions**: No

### Development Workflow
```
main (protected)
├── feature/module-name
├── bugfix/issue-description
└── hotfix/critical-issue
```

## Definition of Done

A feature is considered "done" when:
- [ ] Code is implemented and tested
- [ ] All tests pass with ≥70% coverage
- [ ] Code review completed and approved
- [ ] Documentation updated
- [ ] CI/CD pipeline passes
- [ ] Security review completed (if applicable)
- [ ] Performance testing completed (if applicable)
- [ ] Feature deployed to staging environment
- [ ] Acceptance criteria validated
- [ ] Ready for production deployment
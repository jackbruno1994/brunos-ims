# GitHub Copilot Instructions - Bruno's IMS

## Project Overview

**Bruno's Integrated Management System (Bruno's IMS)** is a comprehensive full-stack restaurant management platform designed for multi-country restaurant groups. The system provides centralized management for restaurants, users, menus, inventory, and business operations while maintaining country-specific customizations.

### Domain Context
- **Industry**: Restaurant & Hospitality Management
- **Target Users**: Restaurant chains, multi-location operators, administrators, managers, and staff
- **Key Focus**: Multi-country support, inventory management, order processing, user management, and reporting

### Technology Stack

#### Backend
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.x
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma/TypeORM
- **Testing**: Jest + Supertest
- **API Style**: RESTful with OpenAPI 3.0 documentation

#### Frontend
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.x
- **Framework**: React 18+
- **Build Tool**: Vite
- **State Management**: Zustand/Redux Toolkit
- **Styling**: Tailwind CSS + CSS Modules
- **Testing**: Jest + React Testing Library

#### Development Tools
- **Package Manager**: npm (version 9.0.0+)
- **Linting**: ESLint with TypeScript, Airbnb, and Prettier configs
- **Formatting**: Prettier
- **Git Hooks**: Husky with lint-staged
- **Commit Conventions**: Conventional Commits (commitlint)

## Project Structure

```
brunos-ims/
├── .github/              # GitHub configuration
│   ├── copilot/         # Copilot-specific configs
│   ├── workflows/       # CI/CD workflows
│   └── agents/          # Custom agent configs (do not modify)
├── backend/             # Node.js + Express API
│   ├── src/
│   │   ├── config/     # Configuration files
│   │   ├── controllers/ # Business logic
│   │   ├── services/   # Service layer
│   │   ├── repositories/ # Data access layer
│   │   ├── models/     # Data models
│   │   ├── routes/     # API routes
│   │   ├── middleware/ # Express middleware
│   │   ├── utils/      # Utility functions
│   │   └── server.ts   # Main server
│   ├── tests/          # Backend tests
│   ├── dist/           # Build output (generated)
│   └── package.json
├── frontend/           # React application
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── pages/     # Page components
│   │   ├── hooks/     # Custom React hooks
│   │   ├── services/  # API services
│   │   ├── utils/     # Utility functions
│   │   ├── types/     # TypeScript types
│   │   └── assets/    # Static assets
│   ├── tests/         # Frontend tests
│   ├── dist/          # Build output (generated)
│   └── package.json
├── docs/              # Documentation
└── package.json       # Root workspace config
```

## Coding Standards

### File Naming Conventions
- **Files**: `kebab-case.ts`, `kebab-case.tsx`
- **Components**: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- **Test files**: `*.test.ts`, `*.spec.ts`
- **Types/Interfaces**: `PascalCase` with `I` prefix for interfaces (e.g., `IUserData`)
- **Constants**: `SCREAMING_SNAKE_CASE`
- **Functions/Variables**: `camelCase`

### Code Organization
- **Max file lines**: 300
- **Max function lines**: 50
- **Max component lines**: 200
- **Prefer composition** over inheritance
- **Single Responsibility Principle**: Each file/function should have one clear purpose

### Import/Export Standards
```typescript
// Order: node_modules → internal → relative
import { Request, Response } from 'express';

import { UserService } from '@/services/UserService';

import { validateInput } from './validation';

// Prefer named exports over default exports
export { UserController };
export type { IUserController };
```

### TypeScript Standards
- **Strict mode**: Always enabled
- **No `any`**: Use proper types or `unknown`
- **Explicit return types**: For all functions
- **Null safety**: Use optional chaining (`?.`) and nullish coalescing (`??`)
```typescript
// Good
const getUserName = (user: IUser | null): string => {
  return user?.name ?? 'Anonymous';
};

// Bad
const getUserName = (user: any) => {
  return user.name || 'Anonymous';
};
```

### Code Quality Requirements
- **ESLint**: All code must pass ESLint checks
- **Prettier**: All code must be formatted with Prettier
- **Type checking**: `tsc --noEmit` must pass
- **No console.log**: Use proper logging (Winston) - only `console.warn` and `console.error` allowed

## Architecture Patterns

### Backend - Clean Architecture
```
controllers/     → Handle HTTP requests/responses
    ↓
services/       → Business logic
    ↓
repositories/   → Data access
    ↓
models/         → Data entities
```

### Frontend - Feature-based Architecture
```
features/
├── authentication/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── types/
└── inventory/
    ├── components/
    ├── hooks/
    ├── services/
    └── types/
```

## Testing Requirements

### Coverage Requirements
- **Backend**: Minimum 80% coverage (lines, functions, branches, statements)
- **Frontend**: Minimum 75% coverage (lines, functions, branches, statements)
- **Critical paths**: 100% coverage required for authentication, payments, and security features

### Test Structure
```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a user with valid data', async () => {
      // Arrange
      const userData = { name: 'John', email: 'john@example.com' };
      
      // Act
      const result = await userService.createUser(userData);
      
      // Assert
      expect(result).toHaveProperty('id');
      expect(result.name).toBe('John');
    });
    
    it('should throw error with invalid email', async () => {
      // Arrange
      const userData = { name: 'John', email: 'invalid' };
      
      // Act & Assert
      await expect(userService.createUser(userData)).rejects.toThrow();
    });
  });
});
```

### Test Commands
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e
```

## API Design Standards

### RESTful Conventions
- **URL Structure**: `/api/v1/resource` or `/api/v1/resource/:id`
- **HTTP Methods**: GET (read), POST (create), PUT (replace), PATCH (update), DELETE (remove)
- **Status Codes**: 
  - `200 OK` - Success
  - `201 Created` - Resource created
  - `400 Bad Request` - Validation error
  - `401 Unauthorized` - Authentication required
  - `403 Forbidden` - Permission denied
  - `404 Not Found` - Resource not found
  - `500 Internal Server Error` - Server error

### Request/Response Format
```typescript
// Request with validation
interface CreateRestaurantRequest {
  name: string;
  countryCode: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
  };
}

// Success response
interface ApiResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}

// Error response (RFC 7807)
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: string;
}
```

### Authentication
- **Method**: JWT (JSON Web Tokens)
- **Header**: `Authorization: Bearer <token>`
- **Token Expiry**: Access token 15m, Refresh token 7d
- **Security**: All sensitive endpoints require authentication

## Security Guidelines

### CRITICAL Security Requirements
1. **Never commit secrets**: No API keys, passwords, or tokens in code
2. **Input validation**: Always validate and sanitize user input
3. **SQL Injection prevention**: Use parameterized queries only
4. **XSS prevention**: Sanitize all HTML output
5. **CSRF protection**: Use CSRF tokens for state-changing operations
6. **Rate limiting**: Apply rate limits to all public endpoints
7. **Authentication**: Use JWT with secure token storage
8. **Authorization**: Implement RBAC (Role-Based Access Control)

### Security Checklist for All Code Changes
- [ ] No hardcoded credentials or secrets
- [ ] Input validation on all user inputs
- [ ] Parameterized database queries
- [ ] Output encoding/sanitization
- [ ] Proper error handling (no sensitive info in errors)
- [ ] Authentication checks on protected routes
- [ ] Authorization checks for all operations
- [ ] Rate limiting configured
- [ ] Security headers configured (Helmet.js)
- [ ] HTTPS enforced in production
- [ ] Audit logging for sensitive operations

### Encryption Standards
- **Algorithm**: AES-256-GCM
- **Password hashing**: bcrypt with salt rounds ≥ 12
- **Data at rest**: Encrypt PII, passwords, financial data, API keys
- **Data in transit**: TLS 1.3+ for all communication

### Role-Based Access Control (RBAC)
```typescript
enum UserRole {
  SUPER_ADMIN = 'super_admin',  // Full system access
  ADMIN = 'admin',              // Administrative access
  MANAGER = 'manager',          // Management level
  STAFF = 'staff',              // Standard staff
  READONLY = 'readonly'         // Read-only access
}

// Permission format: 'resource:action'
// Example: 'users:read', 'inventory:create', 'orders:delete'
```

## Development Workflow

### Branch Naming
```
feature/{ticket-number}-{short-description}
fix/{ticket-number}-{short-description}
hotfix/{ticket-number}-{short-description}
```

### Commit Message Format
Follow Conventional Commits:
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Examples**:
```
feat(auth): add JWT token refresh mechanism
fix(inventory): correct stock calculation for multi-location items
docs(api): update OpenAPI spec for user endpoints
```

### Pre-commit Checks
The following checks run automatically via Husky:
1. **lint-staged**: ESLint and Prettier on staged files
2. **type-check**: TypeScript compilation check
3. **commitlint**: Commit message validation

### Pull Request Requirements
- [ ] Descriptive title and detailed description
- [ ] Linked to an issue
- [ ] All tests passing
- [ ] Code coverage maintained or improved
- [ ] Documentation updated
- [ ] No merge conflicts
- [ ] Code review approved
- [ ] CI/CD pipeline passing

## Building and Running

### Development
```bash
# Install all dependencies
npm run install:all

# Start development servers (backend + frontend)
npm run dev

# Start backend only
npm run dev:backend

# Start frontend only
npm run dev:frontend
```

### Building
```bash
# Build all
npm run build

# Build backend only
npm run build:backend

# Build frontend only
npm run build:frontend
```

### Linting and Formatting
```bash
# Lint all code
npm run lint

# Fix linting issues
npm run lint:fix

# Format all code
npm run format

# Check formatting
npm run format:check

# Type check
npm run type-check
```

### Testing
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e
```

## Task Completion Criteria

When assigned a task, the following criteria must be met before considering it complete:

### Code Quality
- [ ] All new code follows the coding standards outlined above
- [ ] ESLint passes with no errors or warnings
- [ ] Prettier formatting applied
- [ ] TypeScript compilation succeeds with no errors
- [ ] No use of `any` type (use proper types or `unknown`)
- [ ] Proper error handling implemented
- [ ] Input validation added where necessary
- [ ] Security best practices followed

### Testing
- [ ] Unit tests written for all new functions/methods
- [ ] Integration tests added for new endpoints/features
- [ ] All tests passing
- [ ] Code coverage meets minimum thresholds (80% backend, 75% frontend)
- [ ] Edge cases covered in tests
- [ ] Error scenarios tested

### Documentation
- [ ] JSDoc comments added to all public functions/methods
- [ ] README updated if necessary
- [ ] API documentation updated (OpenAPI spec)
- [ ] Inline comments for complex logic
- [ ] CHANGELOG.md entry added

### Security
- [ ] No secrets or credentials in code
- [ ] Input validation implemented
- [ ] Output sanitization where needed
- [ ] Authentication/authorization checks in place
- [ ] Security audit passed

### Review & Integration
- [ ] Self-reviewed code changes
- [ ] Manual testing performed
- [ ] No console.log statements left in code
- [ ] Git history clean (meaningful commits)
- [ ] PR description complete with context

## Common Patterns and Examples

### Creating a New API Endpoint

1. **Define the route** in `backend/src/routes/`
```typescript
// backend/src/routes/restaurant.routes.ts
import { Router } from 'express';
import { RestaurantController } from '@/controllers/RestaurantController';
import { authenticate } from '@/middleware/auth';

const router = Router();
const controller = new RestaurantController();

router.post('/restaurants', authenticate, controller.create);
router.get('/restaurants', authenticate, controller.list);
router.get('/restaurants/:id', authenticate, controller.getById);

export { router as restaurantRouter };
```

2. **Create the controller** in `backend/src/controllers/`
```typescript
// backend/src/controllers/RestaurantController.ts
import { Request, Response } from 'express';
import { RestaurantService } from '@/services/RestaurantService';

export class RestaurantController {
  private service: RestaurantService;

  constructor() {
    this.service = new RestaurantService();
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    try {
      const restaurant = await this.service.create(req.body);
      res.status(201).json({ success: true, data: restaurant });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: { code: 'CREATION_FAILED', message: error.message } 
      });
    }
  };
}
```

3. **Create the service** in `backend/src/services/`
```typescript
// backend/src/services/RestaurantService.ts
import { RestaurantRepository } from '@/repositories/RestaurantRepository';
import { IRestaurant, ICreateRestaurantDto } from '@/types';

export class RestaurantService {
  private repository: RestaurantRepository;

  constructor() {
    this.repository = new RestaurantRepository();
  }

  public async create(data: ICreateRestaurantDto): Promise<IRestaurant> {
    // Validation logic
    if (!data.name || !data.countryCode) {
      throw new Error('Missing required fields');
    }
    
    // Business logic
    return await this.repository.create(data);
  }
}
```

4. **Write tests** in `backend/tests/`
```typescript
// backend/tests/services/RestaurantService.test.ts
import { RestaurantService } from '@/services/RestaurantService';

describe('RestaurantService', () => {
  let service: RestaurantService;

  beforeEach(() => {
    service = new RestaurantService();
  });

  describe('create', () => {
    it('should create restaurant with valid data', async () => {
      const data = { name: 'Test Restaurant', countryCode: 'US' };
      const result = await service.create(data);
      expect(result).toHaveProperty('id');
    });

    it('should throw error with missing name', async () => {
      await expect(service.create({ countryCode: 'US' }))
        .rejects.toThrow('Missing required fields');
    });
  });
});
```

### Creating a New React Component

```typescript
// frontend/src/components/RestaurantCard.tsx
import React from 'react';
import { IRestaurant } from '@/types';

interface RestaurantCardProps {
  restaurant: IRestaurant;
  onSelect?: (id: string) => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ 
  restaurant, 
  onSelect 
}) => {
  return (
    <div className="restaurant-card" onClick={() => onSelect?.(restaurant.id)}>
      <h3>{restaurant.name}</h3>
      <p>{restaurant.address.city}, {restaurant.countryCode}</p>
    </div>
  );
};
```

```typescript
// frontend/tests/components/RestaurantCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { RestaurantCard } from '@/components/RestaurantCard';

describe('RestaurantCard', () => {
  const mockRestaurant = {
    id: '1',
    name: 'Test Restaurant',
    countryCode: 'US',
    address: { city: 'New York' }
  };

  it('renders restaurant information', () => {
    render(<RestaurantCard restaurant={mockRestaurant} />);
    expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
    expect(screen.getByText(/New York/)).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const onSelect = jest.fn();
    render(<RestaurantCard restaurant={mockRestaurant} onSelect={onSelect} />);
    
    fireEvent.click(screen.getByText('Test Restaurant'));
    expect(onSelect).toHaveBeenCalledWith('1');
  });
});
```

## Common Pitfalls to Avoid

1. **Don't modify working code unnecessarily**: Only change what's required for the task
2. **Don't remove existing tests**: Update them if needed, but don't delete
3. **Don't bypass validation**: Always validate user input
4. **Don't use `any` type**: Use proper TypeScript types
5. **Don't commit `console.log`**: Use proper logging mechanisms
6. **Don't hardcode values**: Use configuration files or environment variables
7. **Don't ignore errors**: Always handle errors properly
8. **Don't skip tests**: Every new feature needs tests
9. **Don't merge without approval**: Wait for code review
10. **Don't commit generated files**: Add them to `.gitignore`

## Additional Resources

- **Project Documentation**: See `/docs` directory
- **API Documentation**: Generated at `/docs/api` (run `npm run docs:generate`)
- **Copilot Configuration**: See `.github/copilot/` for detailed configs
  - `config.yml` - Project structure and coding standards
  - `development.yml` - ESLint, Prettier, Jest configurations
  - `docs.yml` - Documentation standards
  - `security.yml` - Security policies and RBAC
  - `cicd.yml` - CI/CD pipeline configuration
- **Implementation Status**: See `IMPLEMENTATION_STATUS.md` for completed features

## Questions or Clarifications?

If any requirements are unclear or you need additional context:
1. Check the existing codebase for similar patterns
2. Review the detailed configuration files in `.github/copilot/`
3. Consult the project documentation in `/docs`
4. Ask for clarification in the issue or PR comments

Remember: **Quality over speed**. Take time to write clean, tested, secure code that follows our standards.

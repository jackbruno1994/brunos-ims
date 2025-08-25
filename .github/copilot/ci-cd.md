# CI/CD Configuration

## Build Process Automation

### Monorepo Build Strategy

#### Root Package.json Configuration
```json
{
  "name": "brunos-ims",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*",
    "services/*"
  ],
  "packageManager": "pnpm@8.15.0",
  "scripts": {
    "build": "pnpm -r build",
    "dev": "pnpm -r --parallel dev",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint",
    "typecheck": "pnpm -r typecheck",
    "format": "prettier --write .",
    "clean": "pnpm -r clean && rm -rf node_modules",
    "db:migrate": "cd db && pnpm prisma migrate deploy",
    "db:seed": "cd db && pnpm prisma db seed"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0"
  }
}
```

#### Multi-stage Docker Build
```dockerfile
# Dockerfile (multi-stage for production)
FROM node:20-alpine AS base
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY packages packages
COPY apps apps

# Dependencies stage
FROM base AS deps
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
RUN pnpm build

# Production web stage
FROM node:20-alpine AS web-prod
WORKDIR /app
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public
EXPOSE 3000
CMD ["node", "apps/web/server.js"]

# API stage
FROM python:3.11-slim AS api-prod
WORKDIR /app
COPY services/api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY services/api .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Build Optimization
```yaml
# .github/workflows/build-matrix.yml
name: Build Matrix
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  changes:
    runs-on: ubuntu-latest
    outputs:
      web: ${{ steps.changes.outputs.web }}
      api: ${{ steps.changes.outputs.api }}
      packages: ${{ steps.changes.outputs.packages }}
      db: ${{ steps.changes.outputs.db }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v2
        id: changes
        with:
          filters: |
            web:
              - 'apps/web/**'
              - 'packages/**'
            api:
              - 'services/api/**'
            packages:
              - 'packages/**'
            db:
              - 'db/**'

  build-web:
    needs: changes
    if: ${{ needs.changes.outputs.web == 'true' }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: corepack enable
      - run: pnpm install --frozen-lockfile
      - run: pnpm -w build
      - uses: actions/upload-artifact@v4
        with:
          name: web-build
          path: apps/web/.next

  build-api:
    needs: changes
    if: ${{ needs.changes.outputs.api == 'true' }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
      - run: |
          pip install -r services/api/requirements.txt
          python -m py_compile services/api/main.py
```

### Dependency Management

#### Frontend Dependencies (pnpm)
```json
// apps/web/package.json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "@tanstack/react-query": "^5.0.0"
  },
  "scripts": {
    "build": "next build",
    "dev": "next dev",
    "start": "next start"
  }
}
```

#### API Dependencies (uv)
```toml
# services/api/pyproject.toml
[project]
name = "brunos-ims-api"
dependencies = [
    "fastapi>=0.104.0",
    "uvicorn[standard]>=0.24.0",
    "sqlalchemy[asyncio]>=2.0.0",
    "asyncpg>=0.29.0",
    "pydantic>=2.5.0",
    "python-jose[cryptography]>=3.3.0"
]

[tool.uv]
dev-dependencies = [
    "pytest>=7.4.0",
    "pytest-asyncio>=0.21.0",
    "httpx>=0.25.0",
    "ruff>=0.1.0",
    "mypy>=1.7.0"
]
```

#### Dependency Security Scanning
```yaml
# .github/workflows/security-scan.yml
name: Security Scan
on:
  schedule:
    - cron: '0 2 * * 1'  # Weekly on Monday
  push:
    paths:
      - '**/package.json'
      - '**/requirements.txt'
      - '**/pyproject.toml'

jobs:
  scan-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=moderate
      
  scan-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pypa/gh-action-pip-audit@v1.0.8
        with:
          inputs: services/api/requirements.txt
```

## Test Automation

### Comprehensive Test Pipeline

```yaml
# .github/workflows/test-suite.yml
name: Test Suite
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        component: [web, api, packages]
    steps:
      - uses: actions/checkout@v4
      
      # Web tests
      - name: Web Unit Tests
        if: matrix.component == 'web'
        run: |
          corepack enable
          pnpm install --frozen-lockfile
          pnpm -w test:unit
          
      # API tests
      - name: API Unit Tests
        if: matrix.component == 'api'
        run: |
          cd services/api
          pip install -r requirements.txt
          pytest tests/unit/ -v --cov=./ --cov-report=xml
          
      # Package tests
      - name: Package Tests
        if: matrix.component == 'packages'
        run: |
          pnpm -r --filter="./packages/**" test

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: brunos_ims_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
          
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Database
        run: |
          cd db
          pnpm prisma migrate deploy
          pnpm prisma db seed
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/brunos_ims_test
          
      - name: API Integration Tests
        run: |
          cd services/api
          pytest tests/integration/ -v
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/brunos_ims_test
          REDIS_URL: redis://localhost:6379

  e2e-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4
      
      - name: Start Application
        run: |
          docker-compose -f docker-compose.test.yml up -d
          
      - name: Wait for Services
        run: |
          npx wait-on http://localhost:3000 http://localhost:8000/health
          
      - name: Install Playwright
        run: |
          pnpm install
          pnpm exec playwright install --with-deps
          
      - name: Run E2E Tests
        run: |
          pnpm exec playwright test
          
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

### Test Coverage Requirements

```yaml
# .github/workflows/coverage.yml
name: Coverage Report
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Generate Coverage
        run: |
          # Frontend coverage
          pnpm -w test:coverage
          
          # API coverage
          cd services/api
          pytest --cov=./ --cov-report=xml --cov-fail-under=70
          
      - name: Upload to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info,./services/api/coverage.xml
          fail_ci_if_error: true
          verbose: true
```

### Performance Testing

```yaml
# .github/workflows/performance.yml
name: Performance Tests
on:
  push:
    branches: [main]
  schedule:
    - cron: '0 4 * * *'  # Daily at 4 AM

jobs:
  api-load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Application
        run: docker-compose -f docker-compose.perf.yml up -d
        
      - name: Load Test with Artillery
        run: |
          npm install -g artillery
          artillery run tests/performance/api-load-test.yml
          
      - name: Database Performance Test
        run: |
          cd services/api
          python tests/performance/db_benchmark.py
```

## Deployment Settings

### Environment Configuration

#### Development Environment
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  web:
    build:
      context: .
      target: base
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    volumes:
      - ./apps/web:/app/apps/web
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    command: pnpm -w dev

  api:
    build:
      context: ./services/api
      dockerfile: Dockerfile.dev
    ports:
      - "8000:8000"
    volumes:
      - ./services/api:/app
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/brunos_ims
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: brunos_ims
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

#### Production Deployment
```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production
on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
          
      - name: Build and Push Docker Images
        run: |
          # Build images
          docker build -f Dockerfile --target web-prod -t brunos-ims-web:${{ github.sha }} .
          docker build -f Dockerfile --target api-prod -t brunos-ims-api:${{ github.sha }} .
          
          # Push to ECR
          aws ecr get-login-password | docker login --username AWS --password-stdin ${{ vars.ECR_REGISTRY }}
          docker tag brunos-ims-web:${{ github.sha }} ${{ vars.ECR_REGISTRY }}/brunos-ims-web:${{ github.sha }}
          docker tag brunos-ims-api:${{ github.sha }} ${{ vars.ECR_REGISTRY }}/brunos-ims-api:${{ github.sha }}
          docker push ${{ vars.ECR_REGISTRY }}/brunos-ims-web:${{ github.sha }}
          docker push ${{ vars.ECR_REGISTRY }}/brunos-ims-api:${{ github.sha }}
          
      - name: Deploy to ECS
        run: |
          # Update ECS service
          aws ecs update-service \
            --cluster brunos-ims-cluster \
            --service brunos-ims-web \
            --task-definition brunos-ims-web:LATEST \
            --force-new-deployment
            
          aws ecs update-service \
            --cluster brunos-ims-cluster \
            --service brunos-ims-api \
            --task-definition brunos-ims-api:LATEST \
            --force-new-deployment
```

### Blue-Green Deployment Strategy

```yaml
# .github/workflows/blue-green-deploy.yml
name: Blue-Green Deployment
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Target environment'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Green Environment
        run: |
          # Deploy new version to green environment
          terraform apply -var="environment=green" -var="image_tag=${{ github.sha }}"
          
      - name: Health Check Green Environment
        run: |
          # Comprehensive health checks
          curl -f http://green.brunos-ims.com/health
          
          # Run smoke tests
          pnpm exec playwright test --config=playwright.smoke.config.ts
          
      - name: Switch Traffic to Green
        run: |
          # Update load balancer to point to green
          aws elbv2 modify-listener \
            --listener-arn ${{ vars.ALB_LISTENER_ARN }} \
            --default-actions file://green-target-group.json
            
      - name: Monitor Green Environment
        run: |
          # Monitor for 5 minutes
          sleep 300
          
          # Check error rates and response times
          python scripts/monitor-deployment.py --duration=5m
          
      - name: Rollback on Failure
        if: failure()
        run: |
          # Switch back to blue environment
          aws elbv2 modify-listener \
            --listener-arn ${{ vars.ALB_LISTENER_ARN }} \
            --default-actions file://blue-target-group.json
```

## Environment Management

### Infrastructure as Code

```hcl
# terraform/environments/production/main.tf
module "brunos_ims" {
  source = "../../modules/brunos-ims"
  
  environment = "production"
  
  # Scaling configuration
  web_instances = {
    min_capacity = 2
    max_capacity = 10
    desired_capacity = 3
  }
  
  api_instances = {
    min_capacity = 2
    max_capacity = 8
    desired_capacity = 2
  }
  
  # Database configuration
  database = {
    instance_class = "db.r6g.xlarge"
    allocated_storage = 100
    backup_retention_period = 7
    multi_az = true
  }
  
  # Monitoring
  enable_detailed_monitoring = true
  enable_container_insights = true
  
  # Security
  enable_waf = true
  enable_cloudtrail = true
  
  tags = {
    Environment = "production"
    Project = "brunos-ims"
    ManagedBy = "terraform"
  }
}
```

### Environment Variables Management

```yaml
# .github/workflows/env-config.yml
name: Environment Configuration
on:
  workflow_dispatch:
    inputs:
      environment:
        required: true
        type: choice
        options: [development, staging, production]

jobs:
  configure:
    runs-on: ubuntu-latest
    steps:
      - name: Set Environment Variables
        run: |
          case "${{ github.event.inputs.environment }}" in
            development)
              echo "DATABASE_URL=${{ secrets.DEV_DATABASE_URL }}" >> $GITHUB_ENV
              echo "API_URL=http://localhost:8000" >> $GITHUB_ENV
              ;;
            staging)
              echo "DATABASE_URL=${{ secrets.STAGING_DATABASE_URL }}" >> $GITHUB_ENV
              echo "API_URL=https://staging-api.brunos-ims.com" >> $GITHUB_ENV
              ;;
            production)
              echo "DATABASE_URL=${{ secrets.PROD_DATABASE_URL }}" >> $GITHUB_ENV
              echo "API_URL=https://api.brunos-ims.com" >> $GITHUB_ENV
              ;;
          esac
```

### Configuration Validation

```python
# services/api/config/validation.py
from pydantic import BaseSettings, validator
from typing import List, Optional

class Settings(BaseSettings):
    environment: str = "development"
    database_url: str
    redis_url: str
    jwt_secret_key: str
    
    # API configuration
    cors_origins: List[str] = ["http://localhost:3000"]
    api_key_header: str = "X-API-Key"
    
    # Feature flags
    enable_audit_logging: bool = True
    enable_rate_limiting: bool = True
    enable_caching: bool = True
    
    @validator('environment')
    def validate_environment(cls, v):
        allowed = ['development', 'staging', 'production']
        if v not in allowed:
            raise ValueError(f'Environment must be one of {allowed}')
        return v
    
    @validator('cors_origins', pre=True)
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v
    
    class Config:
        env_file = '.env'
        case_sensitive = False

settings = Settings()
```

### Multi-Region Deployment

```yaml
# .github/workflows/multi-region-deploy.yml
name: Multi-Region Deployment
on:
  push:
    tags: ['v*']

jobs:
  deploy-matrix:
    strategy:
      matrix:
        region: [us-east-1, eu-west-1, ap-southeast-1]
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to ${{ matrix.region }}
        run: |
          # Configure region-specific settings
          export AWS_DEFAULT_REGION=${{ matrix.region }}
          
          # Deploy infrastructure
          cd terraform/regions/${{ matrix.region }}
          terraform init
          terraform apply -auto-approve
          
          # Deploy application
          cd ../../../
          ./scripts/deploy-region.sh ${{ matrix.region }}
          
      - name: Health Check ${{ matrix.region }}
        run: |
          # Wait for deployment to complete
          sleep 60
          
          # Check regional endpoint
          curl -f https://${{ matrix.region }}.brunos-ims.com/health
```

### Database Migration Pipeline

```yaml
# .github/workflows/database-migration.yml
name: Database Migration
on:
  push:
    paths:
      - 'db/migrations/**'
  workflow_dispatch:

jobs:
  migrate:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        environment: [staging, production]
    steps:
      - name: Run Migrations
        run: |
          # Backup database before migration
          pg_dump ${{ secrets[format('{0}_DATABASE_URL', matrix.environment)] }} > backup-$(date +%Y%m%d).sql
          
          # Run migrations
          cd db
          pnpm prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets[format('{0}_DATABASE_URL', matrix.environment)] }}
          
      - name: Verify Migration
        run: |
          # Run data integrity checks
          python scripts/verify-migration.py
          
          # Run smoke tests
          pytest tests/smoke/ -v
```

### Rollback Strategy

```yaml
# .github/workflows/rollback.yml
name: Emergency Rollback
on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to rollback to'
        required: true
      environment:
        description: 'Environment to rollback'
        required: true
        type: choice
        options: [staging, production]

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
      - name: Rollback Application
        run: |
          # Rollback ECS services
          aws ecs update-service \
            --cluster brunos-ims-${{ github.event.inputs.environment }} \
            --service brunos-ims-web \
            --task-definition brunos-ims-web:${{ github.event.inputs.version }}
            
          aws ecs update-service \
            --cluster brunos-ims-${{ github.event.inputs.environment }} \
            --service brunos-ims-api \
            --task-definition brunos-ims-api:${{ github.event.inputs.version }}
            
      - name: Rollback Database
        if: github.event.inputs.include_database == 'true'
        run: |
          # Restore from backup
          psql ${{ secrets[format('{0}_DATABASE_URL', github.event.inputs.environment)] }} < backup-${{ github.event.inputs.version }}.sql
          
      - name: Verify Rollback
        run: |
          # Health checks
          curl -f https://${{ github.event.inputs.environment }}.brunos-ims.com/health
          
          # Run critical path tests
          pytest tests/critical/ -v
```
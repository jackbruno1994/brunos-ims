---
applies_to:
  - apps/web/**
---

# Web Application — Copilot Instructions

Next.js application for Bruno's IMS frontend with TypeScript, TanStack Query, and feature-based architecture.

## Architecture Guidelines

### Feature Organization
- Organize code by domain in `apps/web/src/features/<domain>/`
- Each feature should be self-contained with its own components, hooks, utils, and tests
- Keep domain logic in pure utils and custom hooks
- Use React Server Components where appropriate for better performance

### State Management
- **Server State**: Use TanStack Query for all server data fetching and caching
- **Client State**: Use React state (useState, useReducer) for local component state
- **Global State**: Use Zustand for complex global state (user preferences, UI state)
- **Form State**: Use React Hook Form with Zod validation

### Routing & Navigation
- Use Next.js App Router for file-based routing
- Implement route protection with middleware for authentication
- Use dynamic imports for code splitting on route level

## Development Guidelines

### Component Patterns
```typescript
// ✅ Good: Feature-based component with proper typing
export interface InventoryListProps {
  locationId?: string;
  onItemSelect: (itemId: string) => void;
}

export function InventoryList({ locationId, onItemSelect }: InventoryListProps) {
  const { data: items, isLoading, error } = useInventoryQuery({ locationId });
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div className="inventory-list">
      {items.map(item => (
        <InventoryCard
          key={item.id}
          item={item}
          onSelect={() => onItemSelect(item.id)}
        />
      ))}
    </div>
  );
}
```

### Data Fetching Patterns
```typescript
// ✅ Good: Custom hook with TanStack Query
export function useInventoryQuery(filters: InventoryFilters) {
  return useQuery({
    queryKey: ['inventory', filters],
    queryFn: () => inventoryApi.getItems(filters),
    refetchInterval: 30_000, // Real-time inventory updates
    keepPreviousData: true,
  });
}

// ✅ Good: Mutation with optimistic updates
export function useUpdateInventoryMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: inventoryApi.updateItem,
    onMutate: async (variables) => {
      await queryClient.cancelQueries(['inventory']);
      const previousData = queryClient.getQueryData(['inventory']);
      
      // Optimistic update
      queryClient.setQueryData(['inventory'], (old: any) => 
        old?.map((item: any) => 
          item.id === variables.id ? { ...item, ...variables } : item
        )
      );
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['inventory'], context?.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['inventory']);
    },
  });
}
```

### Form Handling
```typescript
// ✅ Good: Form with validation and error handling
const purchaseOrderSchema = z.object({
  supplierId: z.string().uuid(),
  deliveryDate: z.date().min(new Date()),
  items: z.array(z.object({
    itemId: z.string().uuid(),
    quantity: z.number().positive(),
    unitPrice: z.number().positive()
  })).min(1)
});

export function CreatePurchaseOrderForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(purchaseOrderSchema)
  });
  
  const createMutation = useCreatePurchaseOrderMutation();
  
  const onSubmit = handleSubmit(async (data) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success('Purchase order created successfully');
      router.push('/purchase-orders');
    } catch (error) {
      toast.error('Failed to create purchase order');
    }
  });
  
  return (
    <form onSubmit={onSubmit}>
      {/* Form fields with proper error handling */}
    </form>
  );
}
```

## Testing Requirements

### Component Testing
```typescript
// ✅ Good: Component test with proper setup
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InventoryList } from './InventoryList';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}

describe('InventoryList', () => {
  it('displays inventory items when loaded', async () => {
    const mockItems = [
      { id: '1', name: 'Tomatoes', stockLevel: 100 }
    ];
    
    vi.mocked(inventoryApi.getItems).mockResolvedValue(mockItems);
    
    renderWithProviders(
      <InventoryList onItemSelect={vi.fn()} />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Tomatoes')).toBeInTheDocument();
    });
  });
});
```

### E2E Testing
```typescript
// ✅ Good: E2E test for critical user journeys
import { test, expect } from '@playwright/test';

test('create purchase order flow', async ({ page }) => {
  await page.goto('/purchase-orders');
  await page.click('[data-testid="create-po-button"]');
  
  // Fill form
  await page.selectOption('[data-testid="supplier-select"]', 'supplier-1');
  await page.fill('[data-testid="delivery-date"]', '2024-12-31');
  
  // Add item
  await page.click('[data-testid="add-item-button"]');
  await page.selectOption('[data-testid="item-select-0"]', 'item-1');
  await page.fill('[data-testid="quantity-0"]', '100');
  await page.fill('[data-testid="price-0"]', '2.50');
  
  // Submit
  await page.click('[data-testid="submit-button"]');
  
  // Verify success
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  await expect(page).toHaveURL(/\/purchase-orders\/\d+/);
});
```

## UX & Accessibility Guidelines

### Accessibility Requirements
- All interactive elements must be keyboard accessible
- Proper ARIA labels and roles for complex components
- Color contrast ratios must meet WCAG AA standards
- Screen reader support for data tables and forms
- Focus management for modals and dynamic content

### UX Patterns
```typescript
// ✅ Good: Accessible data table
export function InventoryTable({ items }: InventoryTableProps) {
  return (
    <table role="table" aria-label="Inventory items">
      <thead>
        <tr>
          <th scope="col">Item Name</th>
          <th scope="col">Stock Level</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <tr key={item.id}>
            <td>{item.name}</td>
            <td>
              <span aria-label={`${item.stockLevel} ${item.baseUom}`}>
                {item.stockLevel} {item.baseUom}
              </span>
            </td>
            <td>
              <button 
                aria-label={`Edit ${item.name}`}
                onClick={() => onEdit(item.id)}
              >
                Edit
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## Commands

### Development
```bash
pnpm -w dev              # Start development server
pnpm -w build            # Build for production
pnpm -w start            # Start production server
pnpm -w lint             # Run ESLint
pnpm -w lint:fix         # Fix ESLint issues
pnpm -w typecheck        # TypeScript type checking
pnpm -w format           # Format with Prettier
```

### Testing
```bash
pnpm -w test             # Run all tests
pnpm -w test:unit        # Run unit tests only
pnpm -w test:e2e         # Run E2E tests
pnpm -w test:watch       # Run tests in watch mode
pnpm -w test:coverage    # Run tests with coverage
```

### Storybook
```bash
pnpm -w storybook        # Start Storybook dev server
pnpm -w build-storybook  # Build Storybook for deployment
```

## Performance Guidelines

### Bundle Optimization
- Use dynamic imports for code splitting
- Implement proper image optimization with Next.js Image component
- Use React.memo for expensive components
- Implement virtualization for large lists

### Caching Strategy
- Leverage Next.js static generation where possible
- Use TanStack Query for intelligent server state caching
- Implement proper cache invalidation strategies
- Use service workers for offline functionality

## Security Considerations

### Input Validation
- Validate all user inputs with Zod schemas
- Sanitize HTML content before rendering
- Use proper CSRF protection with Next.js
- Implement rate limiting for API calls

### Authentication & Authorization
- Use JWT tokens with proper expiration
- Implement role-based route protection
- Secure storage of sensitive data
- Proper session management

## Examples

### Feature Module Structure
```
apps/web/src/features/inventory/
├── components/
│   ├── InventoryList/
│   │   ├── index.ts
│   │   ├── InventoryList.tsx
│   │   ├── InventoryList.test.tsx
│   │   └── InventoryList.stories.tsx
│   └── index.ts
├── hooks/
│   ├── useInventoryQuery.ts
│   ├── useInventoryMutation.ts
│   └── index.ts
├── utils/
│   ├── inventoryCalculations.ts
│   ├── inventoryValidation.ts
│   └── index.ts
├── types/
│   ├── inventory.types.ts
│   └── index.ts
└── index.ts
```

## Constraints

- Must maintain compatibility with the existing backend during migration
- All new components must include Storybook stories
- Performance budget: First Contentful Paint < 2s, Largest Contentful Paint < 4s
- Bundle size should not exceed 1MB for any single route
- All forms must have proper error handling and user feedback
- Real-time features should gracefully degrade when WebSocket connections fail
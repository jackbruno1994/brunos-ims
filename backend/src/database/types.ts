// Re-export Prisma types for convenience
export * from '@prisma/client';

// Custom types for the application
export interface StockLevel {
  itemId: string;
  itemName: string;
  currentStock: number;
  baseUom: string;
  locationBreakdown?: Array<{
    locationId: string;
    locationName: string;
    stock: number;
  }>;
}

export interface StockMovementSummary {
  itemId: string;
  itemName: string;
  totalIn: number;
  totalOut: number;
  netMovement: number;
  baseUom: string;
  lastMovement?: Date;
}

export interface RecipeCostBreakdown {
  recipeId: string;
  recipeName: string;
  totalCost: number;
  costPerUnit: number;
  ingredients: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
    baseUom: string;
  }>;
}

export interface InventoryValuation {
  itemId: string;
  itemName: string;
  currentStock: number;
  averageCost: number;
  totalValue: number;
  baseUom: string;
}

// Enums for better type safety
export enum StockMovementReason {
  PURCHASE = 'purchase',
  SALE = 'sale',
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment',
  PRODUCTION_IN = 'production_in',
  PRODUCTION_OUT = 'production_out',
  WASTAGE = 'wastage',
  COUNT_ADJUSTMENT = 'count_adjustment',
}

export enum PurchaseOrderStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
}

export enum BatchStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// Request/Response types for API
export interface CreateItemRequest {
  name: string;
  description?: string;
  sku: string;
  baseUom: string;
  categoryId?: string;
}

export interface UpdateItemRequest {
  name?: string;
  description?: string;
  baseUom?: string;
  categoryId?: string;
  active?: boolean;
}

export interface CreateStockMovementRequest {
  itemId: string;
  qtyBase: number;
  costPerBase?: number;
  source?: string;
  dest?: string;
  reason: string;
  reference?: string;
}

export interface CreatePurchaseOrderRequest {
  supplierId: string;
  orderNumber?: string;
  items: Array<{
    itemId: string;
    qtyOrdered: number;
    costPerBase: number;
    notes?: string;
  }>;
}

export interface CreateReceiptRequest {
  purchaseOrderId?: string;
  receiptNumber?: string;
  items: Array<{
    itemId: string;
    qtyReceived: number;
    costPerBase: number;
    notes?: string;
  }>;
}

export interface CreateRecipeRequest {
  name: string;
  description?: string;
  yieldUom: string;
  yieldQtyBase: number;
  items: Array<{
    itemId: string;
    qtyBase: number;
    lossPct?: number;
  }>;
}

export interface CreateBatchRequest {
  recipeId: string;
  batchNumber?: string;
  producedQtyBase: number;
  notes?: string;
}

export interface CreateCountRequest {
  locationId: string;
  itemId: string;
  qtyBase: number;
  notes?: string;
}

export interface CreateWastageRequest {
  itemId: string;
  qtyBase: number;
  reason: string;
  notes?: string;
}

// Query parameter types
export interface ItemQueryParams {
  categoryId?: string;
  active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface StockMovementQueryParams {
  itemId?: string;
  startDate?: Date;
  endDate?: Date;
  reason?: string;
  page?: number;
  limit?: number;
}

export interface PurchaseOrderQueryParams {
  supplierId?: string;
  status?: PurchaseOrderStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Database filter types
export interface DateRangeFilter {
  startDate?: Date;
  endDate?: Date;
}

export interface SearchFilter {
  search?: string;
  fields: string[];
}

// UOM conversion types
export interface UomConversionRequest {
  itemId: string;
  fromUom: string;
  toUom: string;
  factor: number;
}

export interface ConversionResult {
  success: boolean;
  convertedQuantity?: number;
  error?: string;
}
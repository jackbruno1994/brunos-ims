// TypeScript interfaces for Bruno's IMS database models
// Generated from Prisma schema for type safety

export interface Supplier {
  id: string;
  name: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
  country?: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UOM {
  id: string;
  name: string;
  abbreviation: string;
  type: string; // weight, volume, count, etc.
  baseUnit: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversion {
  id: string;
  fromUomId: string;
  toUomId: string;
  factor: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  id: string;
  name: string;
  description?: string | null;
  locationType: string; // warehouse, kitchen, prep, etc.
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Item {
  id: string;
  name: string;
  description?: string | null;
  sku?: string | null;
  category?: string | null;
  uomId: string;
  minStock?: number | null;
  maxStock?: number | null;
  costPerBase?: number | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  status: string; // pending, ordered, received, cancelled
  orderDate: Date;
  expectedDate?: Date | null;
  totalAmount?: number | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Receipt {
  id: string;
  purchaseOrderId: string;
  receiptNumber: string;
  receivedDate: Date;
  receivedBy?: string | null; // user ID who received
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMove {
  id: string;
  itemId: string;
  qtyBase: number;
  costPerBase?: number | null;
  source?: string | null; // location or external
  destination?: string | null; // location or external
  reason: string; // received, transferred, consumed, etc.
  reference?: string | null; // PO number, recipe batch, etc.
  locationId?: string | null;
  createdAt: Date;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string | null;
  yieldUom: string; // UOM for the recipe output
  yieldQtyBase: number;
  instructions?: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeItem {
  id: string;
  recipeId: string;
  itemId: string;
  qtyBase: number;
  lossPct?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Batch {
  id: string;
  recipeId: string;
  batchNumber: string;
  producedQtyBase: number;
  productionDate: Date;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Count {
  id: string;
  locationId: string;
  itemId: string;
  qtyBase: number;
  countDate: Date;
  countedBy?: string | null; // user ID
  variance?: number | null;
  notes?: string | null;
  createdAt: Date;
}

export interface WastageLog {
  id: string;
  itemId: string;
  qtyBase: number;
  reason: string;
  cost?: number | null;
  wasteDate: Date;
  notes?: string | null;
  createdAt: Date;
}

// Extended interfaces with relationships for API responses
export interface SupplierWithRelations extends Supplier {
  purchaseOrders?: PurchaseOrder[];
}

export interface ItemWithRelations extends Item {
  uom?: UOM;
  stockMoves?: StockMove[];
  recipeItems?: RecipeItem[];
  counts?: Count[];
  wastageLogs?: WastageLog[];
}

export interface PurchaseOrderWithRelations extends PurchaseOrder {
  supplier?: Supplier;
  receipts?: Receipt[];
}

export interface RecipeWithRelations extends Recipe {
  items?: RecipeItem[];
  batches?: Batch[];
}

export interface StockMoveWithRelations extends StockMove {
  item?: Item;
  location?: Location;
}

// Input types for creating/updating records
export type CreateSupplierInput = Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateSupplierInput = Partial<CreateSupplierInput>;

export type CreateUOMInput = Omit<UOM, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateUOMInput = Partial<CreateUOMInput>;

export type CreateLocationInput = Omit<Location, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateLocationInput = Partial<CreateLocationInput>;

export type CreateItemInput = Omit<Item, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateItemInput = Partial<CreateItemInput>;

export type CreatePurchaseOrderInput = Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdatePurchaseOrderInput = Partial<CreatePurchaseOrderInput>;

export type CreateStockMoveInput = Omit<StockMove, 'id' | 'createdAt'>;

export type CreateRecipeInput = Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateRecipeInput = Partial<CreateRecipeInput>;

// Query filter types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ItemFilters extends PaginationParams {
  category?: string;
  active?: boolean;
  search?: string;
  uomId?: string;
}

export interface StockMoveFilters extends PaginationParams {
  itemId?: string;
  locationId?: string;
  reason?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface PurchaseOrderFilters extends PaginationParams {
  supplierId?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

// Database operation result types
export interface DatabaseOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  affectedRows?: number;
}

// Validation error types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
// Inventory Management Module Models

export interface Item {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  baseUom: string;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovement {
  id: string;
  itemId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  uom: string;
  location: string;
  reference: string;
  notes: string;
  timestamp: Date;
  createdBy: string;
}

export interface Location {
  id: string;
  code: string;
  name: string;
  type: 'WAREHOUSE' | 'STORE' | 'PRODUCTION';
  active: boolean;
}

export interface StockLevel {
  itemId: string;
  locationId: string;
  quantity: number;
  uom: string;
  lastUpdated: Date;
}

export interface CreateItemRequest {
  sku: string;
  name: string;
  description: string;
  category: string;
  baseUom: string;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
}

export interface UpdateItemRequest {
  sku?: string;
  name?: string;
  description?: string;
  category?: string;
  baseUom?: string;
  minStock?: number;
  maxStock?: number;
  reorderPoint?: number;
}

export interface CreateStockMovementRequest {
  itemId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  uom: string;
  location: string;
  reference: string;
  notes: string;
  createdBy: string;
}

export interface CreateLocationRequest {
  code: string;
  name: string;
  type: 'WAREHOUSE' | 'STORE' | 'PRODUCTION';
  active?: boolean;
}

export interface StockAlert {
  itemId: string;
  itemName: string;
  currentStock: number;
  minStock: number;
  reorderPoint: number;
  alertType: 'LOW_STOCK' | 'REORDER_POINT' | 'OUT_OF_STOCK';
  location: string;
}
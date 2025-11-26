// Frontend types for inventory management

export interface Item {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock?: number;
  unitCost: number;
  baseUom: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovement {
  id: string;
  itemId: string;
  quantity: number;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  reason: string;
  reference?: string;
  location?: string;
  createdBy: string;
  createdAt: Date;
}

export interface Location {
  id: string;
  name: string;
  type: 'warehouse' | 'kitchen' | 'storage' | 'receiving';
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
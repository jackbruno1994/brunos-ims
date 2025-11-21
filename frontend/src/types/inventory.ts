// Inventory types for frontend

export interface Item {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock?: number;
  costPerUnit: number;
  supplier?: string;
  location?: string;
  status: 'active' | 'inactive' | 'discontinued';
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovement {
  id: string;
  itemId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER';
  quantity: number;
  reason: string;
  reference?: string;
  fromLocation?: string;
  toLocation?: string;
  costPerUnit?: number;
  createdBy: string;
  createdAt: Date;
}

export interface Location {
  id: string;
  name: string;
  description?: string;
  type: 'warehouse' | 'kitchen' | 'storage' | 'refrigerator' | 'freezer';
  capacity?: number;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}
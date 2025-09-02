// Example data models/interfaces for Bruno's IMS

export interface Restaurant {
  id: string;
  name: string;
  location: string;
  country: string;
  address: string;
  phone: string;
  email: string;
  managerId: string;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  restaurantId?: string;
  country: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  restaurantId: string;
  availability: boolean;
  allergens?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Inventory Management Interfaces
export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  sku: string;
  categoryId: string;
  unit: string;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  cost: number;
  currency: string;
  supplier?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovement {
  id: string;
  itemId: string;
  locationId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER';
  quantity: number;
  reason: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
}

export interface InventoryLocation {
  id: string;
  name: string;
  address: string;
  country: string;
  restaurantId?: string;
  type: 'warehouse' | 'restaurant' | 'supplier';
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

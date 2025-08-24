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

// Inventory Management Models
export interface InventoryItem {
  id: string;
  sku: string; // unique identifier
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  reorderLevel: number;
  category: string;
  location: string; // warehouse/location identifier
  restaurantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovement {
  id: string;
  inventoryItemId: string;
  movementType: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  reason: string;
  reference?: string; // order ID, transfer ID, etc.
  fromLocation?: string;
  toLocation?: string;
  userId: string; // who performed the movement
  createdAt: Date;
}

export interface InventoryAlert {
  id: string;
  inventoryItemId: string;
  alertType: 'low_stock' | 'out_of_stock' | 'overstock';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface BatchUpdateItem {
  id: string;
  quantity?: number;
  unitPrice?: number;
  reorderLevel?: number;
  location?: string;
}

export interface BatchUpdateRequest {
  items: BatchUpdateItem[];
  reason: string;
  userId: string;
}

// Order Processing Integration Models
export interface Order {
  id: string;
  restaurantId: string;
  items: OrderItem[];
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  totalAmount: number;
  currency: string;
  customerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  inventoryItemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
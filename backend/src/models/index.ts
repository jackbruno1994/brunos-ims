import { prisma } from '../config/database';

// Export prisma client for direct use
export { prisma };

// Type definitions that match our Prisma schema
export interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  countryId: string;
  settings?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface Item {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  categoryId: string;
  supplierId?: string;
  locationId: string;
  unit: string;
  costPrice: number;
  sellingPrice?: number;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel?: number;
  reorderPoint: number;
  isActive: boolean;
  expiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  id: string;
  name: string;
  description?: string;
  restaurantId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovement {
  id: string;
  itemId: string;
  locationId: string;
  type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT' | 'WASTE' | 'RETURN';
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  reason?: string;
  reference?: string;
  createdBy: string;
  createdAt: Date;
}

export const healthCheck = {
  database: true,
  server: true,
  timestamp: new Date().toISOString()
};

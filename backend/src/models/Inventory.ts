// Inventory models for Bruno's IMS

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

// Mock implementations for now - these will be replaced with actual database models
export class Item {
  constructor(data: Partial<Item>) {
    Object.assign(this, data);
  }

  static async find() {
    // Mock implementation
    return [];
  }

  static async findById(_id: string): Promise<Item | null> {
    // Mock implementation
    return null;
  }

  async save(): Promise<Item> {
    // Mock implementation
    return this;
  }

  async remove(): Promise<Item> {
    // Mock implementation
    return this;
  }
}

export class StockMovement {
  constructor(data: Partial<StockMovement>) {
    Object.assign(this, data);
  }

  static async find() {
    // Mock implementation
    return [];
  }

  static async aggregate(_pipeline: any[]) {
    // Mock implementation for aggregation
    return [];
  }

  async save() {
    // Mock implementation
    return this;
  }
}

export class Location {
  constructor(data: Partial<Location>) {
    Object.assign(this, data);
  }

  static async find() {
    // Mock implementation
    return [];
  }

  static async findById(_id: string): Promise<Location | null> {
    // Mock implementation
    return null;
  }

  async save(): Promise<Location> {
    // Mock implementation
    return this;
  }

  async remove(): Promise<Location> {
    // Mock implementation
    return this;
  }
}

export class Category {
  constructor(data: Partial<Category>) {
    Object.assign(this, data);
  }

  static async find() {
    // Mock implementation
    return [];
  }

  static async findById(_id: string): Promise<Category | null> {
    // Mock implementation
    return null;
  }

  async save(): Promise<Category> {
    // Mock implementation
    return this;
  }

  async remove(): Promise<Category> {
    // Mock implementation
    return this;
  }
}
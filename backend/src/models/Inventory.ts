// Inventory models for Bruno's IMS
// Simple in-memory implementation for batch processing

export interface ItemData {
  id: string;
  name: string;
  description?: string;
  sku: string;
  categoryId?: string;
  locationId?: string;
  unit: string;
  reorderLevel: number;
  currentStock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovementData {
  id: string;
  itemId: string;
  locationId: string;
  type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';
  quantity: number;
  reference?: string;
  notes?: string;
  createdBy?: string;
  createdAt: Date;
}

export interface LocationData {
  id: string;
  name: string;
  type: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryData {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage (will be replaced with actual database later)
const items: ItemData[] = [];
const stockMovements: StockMovementData[] = [];
const locations: LocationData[] = [];
const categories: CategoryData[] = [];

// Simple model classes with basic CRUD operations
export class Item {
  static async find(): Promise<ItemData[]> {
    return items;
  }

  static async findById(id: string): Promise<ItemData | null> {
    return items.find(item => item.id === id) || null;
  }

  static async findByIdAndUpdate(id: string, data: Partial<ItemData>, _options?: any): Promise<ItemData | null> {
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...data, updatedAt: new Date() };
    return items[index];
  }

  static async findByIdAndDelete(id: string): Promise<ItemData | null> {
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;
    const [deleted] = items.splice(index, 1);
    return deleted;
  }

  constructor(public data: Partial<ItemData>) {}

  async save(): Promise<ItemData> {
    const newItem: ItemData = {
      id: Date.now().toString(),
      name: this.data.name || '',
      sku: this.data.sku || '',
      unit: this.data.unit || '',
      reorderLevel: this.data.reorderLevel || 0,
      currentStock: this.data.currentStock || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...this.data,
    };
    items.push(newItem);
    return newItem;
  }
}

export class StockMovement {
  static async find(): Promise<StockMovementData[]> {
    return stockMovements;
  }

  static async aggregate(_pipeline: any[]): Promise<any[]> {
    // Simple aggregation for stock levels
    const grouped: { [key: string]: number } = {};
    stockMovements.forEach(movement => {
      if (!grouped[movement.itemId]) {
        grouped[movement.itemId] = 0;
      }
      const multiplier = movement.type === 'IN' ? 1 : -1;
      grouped[movement.itemId] += movement.quantity * multiplier;
    });
    return Object.entries(grouped).map(([itemId, totalStock]) => ({
      _id: itemId,
      totalStock,
    }));
  }

  constructor(public data: Partial<StockMovementData>) {}

  async save(): Promise<StockMovementData> {
    const newMovement: StockMovementData = {
      id: Date.now().toString(),
      itemId: this.data.itemId || '',
      locationId: this.data.locationId || '',
      type: this.data.type || 'IN',
      quantity: this.data.quantity || 0,
      createdAt: new Date(),
      ...this.data,
    };
    stockMovements.push(newMovement);
    return newMovement;
  }

  // Method stub for populate
  populate(_field: string, _select?: string): this {
    return this;
  }

  // Method stub for sort
  sort(_field: string): this {
    return this;
  }
}

export class Location {
  static async find(query?: any): Promise<LocationData[]> {
    if (query && 'active' in query) {
      return locations.filter(loc => loc.active === query.active);
    }
    return locations;
  }

  static async findById(id: string): Promise<LocationData | null> {
    return locations.find(loc => loc.id === id) || null;
  }

  static async findByIdAndUpdate(id: string, data: Partial<LocationData>, _options?: any): Promise<LocationData | null> {
    const index = locations.findIndex(loc => loc.id === id);
    if (index === -1) return null;
    locations[index] = { ...locations[index], ...data, updatedAt: new Date() };
    return locations[index];
  }

  constructor(public data: Partial<LocationData>) {}

  async save(): Promise<LocationData> {
    const newLocation: LocationData = {
      id: Date.now().toString(),
      name: this.data.name || '',
      type: this.data.type || '',
      active: this.data.active !== undefined ? this.data.active : true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...this.data,
    };
    locations.push(newLocation);
    return newLocation;
  }
}

export class Category {
  static async find(): Promise<CategoryData[]> {
    return categories;
  }

  static async findById(id: string): Promise<CategoryData | null> {
    return categories.find(cat => cat.id === id) || null;
  }

  constructor(public data: Partial<CategoryData>) {}

  async save(): Promise<CategoryData> {
    const newCategory: CategoryData = {
      id: Date.now().toString(),
      name: this.data.name || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...this.data,
    };
    categories.push(newCategory);
    return newCategory;
  }
}

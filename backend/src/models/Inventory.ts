// Inventory Management Models for Bruno's IMS
// These are mock implementations that simulate database operations

export interface ItemInterface {
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

export interface StockMovementInterface {
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

export interface LocationInterface {
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

export interface CategoryInterface {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Mock data storage
let items: ItemInterface[] = [];
let stockMovements: StockMovementInterface[] = [];
let locations: LocationInterface[] = [];
let categories: CategoryInterface[] = [];

// Helper function to generate IDs
const generateId = (): string => Math.random().toString(36).substr(2, 9);

// Mock Item model with database-like operations
export const Item = {
  async find(query: any = {}): Promise<ItemInterface[]> {
    return items.filter(item => {
      if (Object.keys(query).length === 0) return true;
      return Object.keys(query).every(key => (item as any)[key] === query[key]);
    });
  },

  async findById(id: string): Promise<ItemInterface | null> {
    return items.find(item => item.id === id) || null;
  },

  async findByIdAndUpdate(id: string, updateData: Partial<ItemInterface>, options: any = {}): Promise<ItemInterface | null> {
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    items[index] = { ...items[index], ...updateData, updatedAt: new Date() };
    return options.new ? items[index] : items[index];
  },

  async findByIdAndDelete(id: string): Promise<ItemInterface | null> {
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    const deletedItem = items[index];
    items.splice(index, 1);
    return deletedItem;
  },

  // Constructor-like function for creating new items
  constructor: function(data: Omit<ItemInterface, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date();
    const item: ItemInterface = {
      id: generateId(),
      ...data,
      createdAt: now,
      updatedAt: now
    };

    return {
      ...item,
      async save(): Promise<ItemInterface> {
        items.push(item);
        return item;
      }
    };
  }
};

// Mock StockMovement model
export const StockMovement = {
  async find(query: any = {}): Promise<StockMovementInterface[]> {
    return stockMovements.filter(movement => {
      if (Object.keys(query).length === 0) return true;
      return Object.keys(query).every(key => (movement as any)[key] === query[key]);
    });
  },

  async aggregate(pipeline: any[]): Promise<any[]> {
    // Simplified aggregation for stock levels calculation
    if (pipeline.length > 0 && pipeline[0].$group) {
      const grouped: any = {};
      stockMovements.forEach(movement => {
        const itemId = movement.itemId;
        if (!grouped[itemId]) {
          grouped[itemId] = { _id: itemId, totalStock: 0 };
        }
        
        const quantity = movement.type === 'IN' ? movement.quantity : -movement.quantity;
        grouped[itemId].totalStock += quantity;
      });
      
      return Object.values(grouped);
    }
    return [];
  },

  constructor: function(data: Omit<StockMovementInterface, 'id' | 'createdAt'>) {
    const movement: StockMovementInterface = {
      id: generateId(),
      ...data,
      createdAt: new Date()
    };

    return {
      ...movement,
      async save(): Promise<StockMovementInterface> {
        stockMovements.push(movement);
        return movement;
      }
    };
  }
};

// Mock Location model
export const Location = {
  async find(query: any = {}): Promise<LocationInterface[]> {
    return locations.filter(location => {
      if (Object.keys(query).length === 0) return true;
      return Object.keys(query).every(key => (location as any)[key] === query[key]);
    });
  },

  async findByIdAndUpdate(id: string, updateData: Partial<LocationInterface>, options: any = {}): Promise<LocationInterface | null> {
    const index = locations.findIndex(location => location.id === id);
    if (index === -1) return null;
    
    locations[index] = { ...locations[index], ...updateData, updatedAt: new Date() };
    return options.new ? locations[index] : locations[index];
  },

  constructor: function(data: Omit<LocationInterface, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date();
    const location: LocationInterface = {
      id: generateId(),
      ...data,
      createdAt: now,
      updatedAt: now
    };

    return {
      ...location,
      async save(): Promise<LocationInterface> {
        locations.push(location);
        return location;
      }
    };
  }
};

// Mock Category model
export const Category = {
  async find(query: any = {}): Promise<CategoryInterface[]> {
    return categories.filter(category => {
      if (Object.keys(query).length === 0) return true;
      return Object.keys(query).every(key => (category as any)[key] === query[key]);
    });
  },

  constructor: function(data: Omit<CategoryInterface, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date();
    const category: CategoryInterface = {
      id: generateId(),
      ...data,
      createdAt: now,
      updatedAt: now
    };

    return {
      ...category,
      async save(): Promise<CategoryInterface> {
        categories.push(category);
        return category;
      }
    };
  }
};

// Add some sample data for testing
const sampleCategory = new (Category.constructor as any)({
  name: "Food",
  description: "Food items",
  active: true
});
sampleCategory.save();

const sampleLocation = new (Location.constructor as any)({
  name: "Main Warehouse",
  address: "123 Storage St",
  country: "USA",
  type: "warehouse",
  active: true
});
sampleLocation.save();

const sampleItem = new (Item.constructor as any)({
  name: "Chicken Breast",
  description: "Fresh chicken breast",
  sku: "CHKN-001",
  categoryId: "1",
  unit: "kg",
  minStockLevel: 10,
  maxStockLevel: 100,
  reorderPoint: 20,
  cost: 15.50,
  currency: "USD",
  active: true
});
sampleItem.save();
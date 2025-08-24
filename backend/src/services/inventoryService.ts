import { 
  InventoryItem, 
  StockMovement, 
  InventoryAlert, 
  BatchUpdateRequest,
  BatchUpdateItem 
} from '../models';

// In-memory storage for demo purposes
// In a real application, this would be replaced with database operations
let inventoryItems: InventoryItem[] = [
  {
    id: '1',
    sku: 'PASTA-001',
    name: 'Premium Pasta',
    description: 'High-quality pasta for restaurant dishes',
    quantity: 50,
    unitPrice: 12.99,
    currency: 'USD',
    reorderLevel: 20,
    category: 'Dry Goods',
    location: 'Warehouse A',
    restaurantId: 'rest-001',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: '2',
    sku: 'TOMATO-001',
    name: 'Organic Tomatoes',
    description: 'Fresh organic tomatoes',
    quantity: 15,
    unitPrice: 8.50,
    currency: 'USD',
    reorderLevel: 30,
    category: 'Fresh Produce',
    location: 'Cold Storage',
    restaurantId: 'rest-001',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  }
];

let stockMovements: StockMovement[] = [];
let inventoryAlerts: InventoryAlert[] = [];

export class InventoryService {
  // CRUD Operations
  static async getAllItems(filters?: { 
    category?: string; 
    location?: string; 
    restaurantId?: string;
    lowStock?: boolean;
  }): Promise<InventoryItem[]> {
    let filteredItems = [...inventoryItems];

    if (filters) {
      if (filters.category) {
        filteredItems = filteredItems.filter(item => 
          item.category.toLowerCase().includes(filters.category!.toLowerCase())
        );
      }
      if (filters.location) {
        filteredItems = filteredItems.filter(item => 
          item.location.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }
      if (filters.restaurantId) {
        filteredItems = filteredItems.filter(item => 
          item.restaurantId === filters.restaurantId
        );
      }
      if (filters.lowStock) {
        filteredItems = filteredItems.filter(item => 
          item.quantity <= item.reorderLevel
        );
      }
    }

    return filteredItems;
  }

  static async getItemById(id: string): Promise<InventoryItem | null> {
    const item = inventoryItems.find(item => item.id === id);
    return item || null;
  }

  static async getItemBySku(sku: string): Promise<InventoryItem | null> {
    const item = inventoryItems.find(item => item.sku === sku);
    return item || null;
  }

  static async createItem(itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem> {
    // Check if SKU already exists
    const existingItem = await this.getItemBySku(itemData.sku);
    if (existingItem) {
      throw new Error(`Item with SKU ${itemData.sku} already exists`);
    }

    const newItem: InventoryItem = {
      ...itemData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    inventoryItems.push(newItem);
    
    // Check for low stock alert
    await this.checkAndCreateAlert(newItem);
    
    return newItem;
  }

  static async updateItem(id: string, updates: Partial<Omit<InventoryItem, 'id' | 'createdAt'>>): Promise<InventoryItem | null> {
    const itemIndex = inventoryItems.findIndex(item => item.id === id);
    if (itemIndex === -1) {
      return null;
    }

    const updatedItem: InventoryItem = {
      ...inventoryItems[itemIndex],
      ...updates,
      updatedAt: new Date()
    };

    inventoryItems[itemIndex] = updatedItem;
    
    // Check for alerts after update
    await this.checkAndCreateAlert(updatedItem);
    
    return updatedItem;
  }

  static async deleteItem(id: string): Promise<boolean> {
    const itemIndex = inventoryItems.findIndex(item => item.id === id);
    if (itemIndex === -1) {
      return false;
    }

    inventoryItems.splice(itemIndex, 1);
    return true;
  }

  // Stock Movement Tracking
  static async recordStockMovement(movement: Omit<StockMovement, 'id' | 'createdAt'>): Promise<StockMovement> {
    const newMovement: StockMovement = {
      ...movement,
      id: Date.now().toString(),
      createdAt: new Date()
    };

    stockMovements.push(newMovement);

    // Update inventory quantity based on movement
    const item = await this.getItemById(movement.inventoryItemId);
    if (item) {
      let quantityChange = 0;
      
      switch (movement.movementType) {
        case 'in':
          quantityChange = movement.quantity;
          break;
        case 'out':
          quantityChange = -movement.quantity;
          break;
        case 'adjustment':
          quantityChange = movement.quantity; // Can be positive or negative
          break;
        case 'transfer':
          // For transfers, this depends on whether this is the source or destination
          quantityChange = movement.fromLocation === item.location ? -movement.quantity : movement.quantity;
          break;
      }

      await this.updateItem(item.id, {
        quantity: item.quantity + quantityChange
      });
    }

    return newMovement;
  }

  static async getStockMovements(inventoryItemId?: string): Promise<StockMovement[]> {
    if (inventoryItemId) {
      return stockMovements.filter(movement => movement.inventoryItemId === inventoryItemId);
    }
    return [...stockMovements];
  }

  // Batch Operations
  static async batchUpdate(request: BatchUpdateRequest): Promise<InventoryItem[]> {
    const updatedItems: InventoryItem[] = [];

    for (const item of request.items) {
      const updatedItem = await this.updateItem(item.id, {
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        reorderLevel: item.reorderLevel,
        location: item.location
      });

      if (updatedItem) {
        updatedItems.push(updatedItem);
        
        // Record the batch update as a stock movement if quantity changed
        if (item.quantity !== undefined) {
          await this.recordStockMovement({
            inventoryItemId: item.id,
            movementType: 'adjustment',
            quantity: item.quantity - (await this.getItemById(item.id))!.quantity,
            reason: request.reason,
            userId: request.userId
          });
        }
      }
    }

    return updatedItems;
  }

  // Alert Management
  static async checkAndCreateAlert(item: InventoryItem): Promise<void> {
    // Remove existing alerts for this item
    inventoryAlerts = inventoryAlerts.filter(alert => 
      alert.inventoryItemId !== item.id || alert.isRead
    );

    // Check for low stock
    if (item.quantity <= item.reorderLevel) {
      const alertType = item.quantity === 0 ? 'out_of_stock' : 'low_stock';
      const severity = item.quantity === 0 ? 'critical' : 
                      item.quantity <= item.reorderLevel * 0.5 ? 'high' : 'medium';

      const alert: InventoryAlert = {
        id: Date.now().toString(),
        inventoryItemId: item.id,
        alertType,
        message: `${item.name} (${item.sku}) is ${alertType === 'out_of_stock' ? 'out of stock' : 'running low'}. Current quantity: ${item.quantity}, Reorder level: ${item.reorderLevel}`,
        severity,
        isRead: false,
        createdAt: new Date()
      };

      inventoryAlerts.push(alert);
    }
  }

  static async getAlerts(unreadOnly: boolean = false): Promise<InventoryAlert[]> {
    if (unreadOnly) {
      return inventoryAlerts.filter(alert => !alert.isRead);
    }
    return [...inventoryAlerts];
  }

  static async markAlertAsRead(alertId: string): Promise<boolean> {
    const alertIndex = inventoryAlerts.findIndex(alert => alert.id === alertId);
    if (alertIndex === -1) {
      return false;
    }

    inventoryAlerts[alertIndex] = {
      ...inventoryAlerts[alertIndex],
      isRead: true,
      resolvedAt: new Date()
    };

    return true;
  }

  // Order Integration
  static async processOrder(orderId: string, orderItems: Array<{ inventoryItemId: string; quantity: number }>): Promise<boolean> {
    // Check stock availability
    for (const orderItem of orderItems) {
      const inventoryItem = await this.getItemById(orderItem.inventoryItemId);
      if (!inventoryItem || inventoryItem.quantity < orderItem.quantity) {
        throw new Error(`Insufficient stock for item ${inventoryItem?.name || orderItem.inventoryItemId}`);
      }
    }

    // Process stock movements
    for (const orderItem of orderItems) {
      await this.recordStockMovement({
        inventoryItemId: orderItem.inventoryItemId,
        movementType: 'out',
        quantity: orderItem.quantity,
        reason: 'Order fulfillment',
        reference: orderId,
        userId: 'system'
      });
    }

    return true;
  }

  // Utility Methods
  static async getLowStockItems(): Promise<InventoryItem[]> {
    return inventoryItems.filter(item => item.quantity <= item.reorderLevel);
  }

  static async getStockValue(): Promise<{ totalValue: number; currency: string }> {
    const totalValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    return {
      totalValue,
      currency: inventoryItems[0]?.currency || 'USD'
    };
  }
}
import { Request, Response } from 'express';
import { 
  Item, 
  StockMovement, 
  Location, 
  StockLevel,
  CreateItemRequest,
  UpdateItemRequest,
  CreateStockMovementRequest,
  CreateLocationRequest,
  StockAlert
} from '../models/Inventory';

// In-memory storage (to be replaced with database implementation)
let items: Item[] = [
  {
    id: '1',
    sku: 'ITEM-001',
    name: 'Premium Coffee Beans',
    description: 'High-quality arabica coffee beans',
    category: 'Beverages',
    baseUom: 'kg',
    minStock: 10,
    maxStock: 100,
    reorderPoint: 20,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    sku: 'ITEM-002',
    name: 'Whole Milk',
    description: 'Fresh whole milk for beverages',
    category: 'Dairy',
    baseUom: 'l',
    minStock: 5,
    maxStock: 50,
    reorderPoint: 15,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

let stockMovements: StockMovement[] = [
  {
    id: '1',
    itemId: '1',
    type: 'IN',
    quantity: 50,
    uom: 'kg',
    location: 'MAIN-WAREHOUSE',
    reference: 'PO-001',
    notes: 'Initial stock receipt',
    timestamp: new Date('2024-01-01'),
    createdBy: 'admin'
  },
  {
    id: '2',
    itemId: '2',
    type: 'IN',
    quantity: 25,
    uom: 'l',
    location: 'MAIN-WAREHOUSE',
    reference: 'PO-002',
    notes: 'Weekly milk delivery',
    timestamp: new Date('2024-01-01'),
    createdBy: 'admin'
  }
];

let locations: Location[] = [
  {
    id: '1',
    code: 'MAIN-WAREHOUSE',
    name: 'Main Warehouse',
    type: 'WAREHOUSE',
    active: true
  },
  {
    id: '2',
    code: 'STORE-001',
    name: 'Downtown Store',
    type: 'STORE',
    active: true
  },
  {
    id: '3',
    code: 'KITCHEN-001',
    name: 'Main Kitchen',
    type: 'PRODUCTION',
    active: true
  }
];

let stockLevels: StockLevel[] = [
  {
    itemId: '1',
    locationId: '1',
    quantity: 45,
    uom: 'kg',
    lastUpdated: new Date()
  },
  {
    itemId: '2',
    locationId: '1',
    quantity: 8,
    uom: 'l',
    lastUpdated: new Date()
  }
];

// Helper functions
const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

const calculateStockLevel = (itemId: string, locationId: string): number => {
  const movements = stockMovements.filter(m => m.itemId === itemId && m.location === locationId);
  let totalStock = 0;
  
  movements.forEach(movement => {
    switch (movement.type) {
      case 'IN':
        totalStock += movement.quantity;
        break;
      case 'OUT':
        totalStock -= movement.quantity;
        break;
      case 'ADJUSTMENT':
        totalStock = movement.quantity; // Adjustment sets absolute value
        break;
    }
  });
  
  return Math.max(0, totalStock);
};

const updateStockLevel = (itemId: string, locationId: string): void => {
  const currentLevel = stockLevels.find(sl => sl.itemId === itemId && sl.locationId === locationId);
  const newQuantity = calculateStockLevel(itemId, locationId);
  
  if (currentLevel) {
    currentLevel.quantity = newQuantity;
    currentLevel.lastUpdated = new Date();
  } else {
    const item = items.find(i => i.id === itemId);
    stockLevels.push({
      itemId,
      locationId,
      quantity: newQuantity,
      uom: item?.baseUom || 'unit',
      lastUpdated: new Date()
    });
  }
};

export class InventoryController {
  // Item management endpoints
  static async getAllItems(req: Request, res: Response): Promise<void> {
    try {
      const { category, search } = req.query;
      let filteredItems = [...items];
      
      if (category) {
        filteredItems = filteredItems.filter(item => 
          item.category.toLowerCase().includes((category as string).toLowerCase())
        );
      }
      
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        filteredItems = filteredItems.filter(item => 
          item.name.toLowerCase().includes(searchTerm) ||
          item.sku.toLowerCase().includes(searchTerm) ||
          item.description.toLowerCase().includes(searchTerm)
        );
      }
      
      res.status(200).json({
        message: 'Items retrieved successfully',
        data: filteredItems,
        total: filteredItems.length
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch items',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async getItemById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = items.find(i => i.id === id);
      
      if (!item) {
        res.status(404).json({
          error: 'Item not found',
          message: `Item with ID ${id} does not exist`
        });
        return;
      }
      
      // Include current stock levels for this item
      const itemStockLevels = stockLevels.filter(sl => sl.itemId === id);
      
      res.status(200).json({
        message: 'Item retrieved successfully',
        data: {
          ...item,
          stockLevels: itemStockLevels
        }
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch item',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async createItem(req: Request, res: Response): Promise<void> {
    try {
      const itemData: CreateItemRequest = req.body;
      
      // Check if SKU already exists
      const existingItem = items.find(i => i.sku === itemData.sku);
      if (existingItem) {
        res.status(400).json({
          error: 'SKU already exists',
          message: `Item with SKU ${itemData.sku} already exists`
        });
        return;
      }
      
      const newItem: Item = {
        id: generateId(),
        ...itemData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      items.push(newItem);
      
      res.status(201).json({
        message: 'Item created successfully',
        data: newItem
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to create item',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async updateItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateItemRequest = req.body;
      
      const itemIndex = items.findIndex(i => i.id === id);
      if (itemIndex === -1) {
        res.status(404).json({
          error: 'Item not found',
          message: `Item with ID ${id} does not exist`
        });
        return;
      }
      
      // Check if SKU already exists for different item
      if (updateData.sku) {
        const existingItem = items.find(i => i.sku === updateData.sku && i.id !== id);
        if (existingItem) {
          res.status(400).json({
            error: 'SKU already exists',
            message: `Item with SKU ${updateData.sku} already exists`
          });
          return;
        }
      }
      
      items[itemIndex] = {
        ...items[itemIndex],
        ...updateData,
        updatedAt: new Date()
      };
      
      res.status(200).json({
        message: 'Item updated successfully',
        data: items[itemIndex]
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to update item',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async deleteItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const itemIndex = items.findIndex(i => i.id === id);
      if (itemIndex === -1) {
        res.status(404).json({
          error: 'Item not found',
          message: `Item with ID ${id} does not exist`
        });
        return;
      }
      
      // Check if item has stock movements
      const hasMovements = stockMovements.some(sm => sm.itemId === id);
      if (hasMovements) {
        res.status(400).json({
          error: 'Cannot delete item',
          message: 'Item has associated stock movements and cannot be deleted'
        });
        return;
      }
      
      const deletedItem = items.splice(itemIndex, 1)[0];
      
      // Remove associated stock levels
      stockLevels = stockLevels.filter(sl => sl.itemId !== id);
      
      res.status(200).json({
        message: 'Item deleted successfully',
        data: deletedItem
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to delete item',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Stock management endpoints
  static async getCurrentStock(req: Request, res: Response): Promise<void> {
    try {
      const { itemId, locationId, lowStock } = req.query;
      let filteredLevels = [...stockLevels];
      
      if (itemId) {
        filteredLevels = filteredLevels.filter(sl => sl.itemId === itemId);
      }
      
      if (locationId) {
        filteredLevels = filteredLevels.filter(sl => sl.locationId === locationId);
      }
      
      // Enrich with item and location details
      const enrichedLevels = filteredLevels.map(level => {
        const item = items.find(i => i.id === level.itemId);
        const location = locations.find(l => l.id === level.locationId);
        
        return {
          ...level,
          item: item ? { id: item.id, name: item.name, sku: item.sku, minStock: item.minStock, reorderPoint: item.reorderPoint } : null,
          location: location ? { id: location.id, name: location.name, code: location.code } : null
        };
      });
      
      // Filter by low stock if requested
      let finalLevels = enrichedLevels;
      if (lowStock === 'true') {
        finalLevels = enrichedLevels.filter(level => 
          level.item && level.quantity <= level.item.reorderPoint
        );
      }
      
      res.status(200).json({
        message: 'Stock levels retrieved successfully',
        data: finalLevels,
        total: finalLevels.length
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch stock levels',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async recordStockMovement(req: Request, res: Response): Promise<void> {
    try {
      const movementData: CreateStockMovementRequest = req.body;
      
      // Validate item exists
      const item = items.find(i => i.id === movementData.itemId);
      if (!item) {
        res.status(404).json({
          error: 'Item not found',
          message: `Item with ID ${movementData.itemId} does not exist`
        });
        return;
      }
      
      // Validate location exists
      const location = locations.find(l => l.code === movementData.location);
      if (!location) {
        res.status(404).json({
          error: 'Location not found',
          message: `Location with code ${movementData.location} does not exist`
        });
        return;
      }
      
      const newMovement: StockMovement = {
        id: generateId(),
        ...movementData,
        timestamp: new Date()
      };
      
      stockMovements.push(newMovement);
      
      // Update stock level
      updateStockLevel(movementData.itemId, location.id);
      
      res.status(201).json({
        message: 'Stock movement recorded successfully',
        data: newMovement
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to record stock movement',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async getStockMovementHistory(req: Request, res: Response): Promise<void> {
    try {
      const { itemId, location, type, startDate, endDate, limit } = req.query;
      let filteredMovements = [...stockMovements];
      
      if (itemId) {
        filteredMovements = filteredMovements.filter(sm => sm.itemId === itemId);
      }
      
      if (location) {
        filteredMovements = filteredMovements.filter(sm => sm.location === location);
      }
      
      if (type) {
        filteredMovements = filteredMovements.filter(sm => sm.type === type);
      }
      
      if (startDate) {
        const start = new Date(startDate as string);
        filteredMovements = filteredMovements.filter(sm => sm.timestamp >= start);
      }
      
      if (endDate) {
        const end = new Date(endDate as string);
        filteredMovements = filteredMovements.filter(sm => sm.timestamp <= end);
      }
      
      // Sort by timestamp (newest first)
      filteredMovements.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      // Apply limit
      if (limit) {
        const limitNum = parseInt(limit as string);
        filteredMovements = filteredMovements.slice(0, limitNum);
      }
      
      // Enrich with item details
      const enrichedMovements = filteredMovements.map(movement => {
        const item = items.find(i => i.id === movement.itemId);
        return {
          ...movement,
          item: item ? { id: item.id, name: item.name, sku: item.sku } : null
        };
      });
      
      res.status(200).json({
        message: 'Stock movement history retrieved successfully',
        data: enrichedMovements,
        total: enrichedMovements.length
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch stock movement history',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Location management endpoints
  static async getAllLocations(req: Request, res: Response): Promise<void> {
    try {
      const { type, active } = req.query;
      let filteredLocations = [...locations];
      
      if (type) {
        filteredLocations = filteredLocations.filter(loc => loc.type === type);
      }
      
      if (active !== undefined) {
        const isActive = active === 'true';
        filteredLocations = filteredLocations.filter(loc => loc.active === isActive);
      }
      
      res.status(200).json({
        message: 'Locations retrieved successfully',
        data: filteredLocations,
        total: filteredLocations.length
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch locations',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async createLocation(req: Request, res: Response): Promise<void> {
    try {
      const locationData: CreateLocationRequest = req.body;
      
      // Check if code already exists
      const existingLocation = locations.find(l => l.code === locationData.code);
      if (existingLocation) {
        res.status(400).json({
          error: 'Location code already exists',
          message: `Location with code ${locationData.code} already exists`
        });
        return;
      }
      
      const newLocation: Location = {
        id: generateId(),
        ...locationData,
        active: locationData.active !== undefined ? locationData.active : true
      };
      
      locations.push(newLocation);
      
      res.status(201).json({
        message: 'Location created successfully',
        data: newLocation
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to create location',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Stock alerts endpoint
  static async getStockAlerts(_req: Request, res: Response): Promise<void> {
    try {
      const alerts: StockAlert[] = [];
      
      stockLevels.forEach(level => {
        const item = items.find(i => i.id === level.itemId);
        const location = locations.find(l => l.id === level.locationId);
        
        if (item && location) {
          if (level.quantity === 0) {
            alerts.push({
              itemId: item.id,
              itemName: item.name,
              currentStock: level.quantity,
              minStock: item.minStock,
              reorderPoint: item.reorderPoint,
              alertType: 'OUT_OF_STOCK',
              location: location.code
            });
          } else if (level.quantity <= item.minStock) {
            alerts.push({
              itemId: item.id,
              itemName: item.name,
              currentStock: level.quantity,
              minStock: item.minStock,
              reorderPoint: item.reorderPoint,
              alertType: 'LOW_STOCK',
              location: location.code
            });
          } else if (level.quantity <= item.reorderPoint) {
            alerts.push({
              itemId: item.id,
              itemName: item.name,
              currentStock: level.quantity,
              minStock: item.minStock,
              reorderPoint: item.reorderPoint,
              alertType: 'REORDER_POINT',
              location: location.code
            });
          }
        }
      });
      
      res.status(200).json({
        message: 'Stock alerts retrieved successfully',
        data: alerts,
        total: alerts.length
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch stock alerts',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
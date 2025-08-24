import { Request, Response } from 'express';
import { InventoryService } from '../services/inventoryService';

// Example controller for restaurant management
export class RestaurantController {
  static async getAllRestaurants(req: Request, res: Response) {
    try {
      // TODO: Implement database query
      res.status(200).json({
        message: 'Get all restaurants',
        data: []
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch restaurants',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createRestaurant(req: Request, res: Response) {
    try {
      // TODO: Implement restaurant creation
      res.status(201).json({
        message: 'Restaurant created successfully',
        data: req.body
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to create restaurant',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

// Inventory Controller
export class InventoryController {
  // GET /api/inventory - List all items with filtering
  static async getAllItems(req: Request, res: Response) {
    try {
      const { category, location, restaurantId, lowStock } = req.query;
      
      const filters = {
        category: category as string,
        location: location as string,
        restaurantId: restaurantId as string,
        lowStock: lowStock === 'true'
      };

      // Remove undefined filters
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof typeof filters] === undefined) {
          delete filters[key as keyof typeof filters];
        }
      });

      const items = await InventoryService.getAllItems(Object.keys(filters).length > 0 ? filters : undefined);
      
      res.status(200).json({
        message: 'Inventory items retrieved successfully',
        data: items,
        count: items.length
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch inventory items',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // GET /api/inventory/:id - Get specific item
  static async getItemById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await InventoryService.getItemById(id);
      
      if (!item) {
        res.status(404).json({
          error: 'Item not found',
          message: `Inventory item with ID ${id} does not exist`
        });
        return;
      }

      res.status(200).json({
        message: 'Inventory item retrieved successfully',
        data: item
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch inventory item',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // POST /api/inventory - Create new item
  static async createItem(req: Request, res: Response): Promise<void> {
    try {
      const {
        sku,
        name,
        description,
        quantity,
        unitPrice,
        currency,
        reorderLevel,
        category,
        location,
        restaurantId
      } = req.body;

      // Validate required fields
      if (!sku || !name || !quantity || !unitPrice || !reorderLevel || !category || !location || !restaurantId) {
        res.status(400).json({
          error: 'Missing required fields',
          message: 'SKU, name, quantity, unitPrice, reorderLevel, category, location, and restaurantId are required'
        });
        return;
      }

      const newItem = await InventoryService.createItem({
        sku,
        name,
        description: description || '',
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        currency: currency || 'USD',
        reorderLevel: Number(reorderLevel),
        category,
        location,
        restaurantId
      });

      res.status(201).json({
        message: 'Inventory item created successfully',
        data: newItem
      });
    } catch (error) {
      res.status(400).json({
        error: 'Failed to create inventory item',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // PUT /api/inventory/:id - Update item
  static async updateItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Convert numeric fields
      if (updates.quantity !== undefined) updates.quantity = Number(updates.quantity);
      if (updates.unitPrice !== undefined) updates.unitPrice = Number(updates.unitPrice);
      if (updates.reorderLevel !== undefined) updates.reorderLevel = Number(updates.reorderLevel);

      const updatedItem = await InventoryService.updateItem(id, updates);
      
      if (!updatedItem) {
        res.status(404).json({
          error: 'Item not found',
          message: `Inventory item with ID ${id} does not exist`
        });
        return;
      }

      res.status(200).json({
        message: 'Inventory item updated successfully',
        data: updatedItem
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to update inventory item',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // DELETE /api/inventory/:id - Remove item
  static async deleteItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await InventoryService.deleteItem(id);
      
      if (!success) {
        res.status(404).json({
          error: 'Item not found',
          message: `Inventory item with ID ${id} does not exist`
        });
        return;
      }

      res.status(200).json({
        message: 'Inventory item deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to delete inventory item',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // POST /api/inventory/batch - Batch update
  static async batchUpdate(req: Request, res: Response): Promise<void> {
    try {
      const { items, reason, userId } = req.body;

      if (!items || !Array.isArray(items) || !reason || !userId) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'items (array), reason, and userId are required'
        });
        return;
      }

      const updatedItems = await InventoryService.batchUpdate({
        items,
        reason,
        userId
      });

      res.status(200).json({
        message: 'Batch update completed successfully',
        data: updatedItems,
        count: updatedItems.length
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to perform batch update',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // GET /api/inventory/movements - Get stock movements
  static async getStockMovements(req: Request, res: Response) {
    try {
      const { inventoryItemId } = req.query;
      const movements = await InventoryService.getStockMovements(inventoryItemId as string);

      res.status(200).json({
        message: 'Stock movements retrieved successfully',
        data: movements,
        count: movements.length
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch stock movements',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // GET /api/inventory/alerts - Get low stock alerts
  static async getAlerts(req: Request, res: Response) {
    try {
      const { unreadOnly } = req.query;
      const alerts = await InventoryService.getAlerts(unreadOnly === 'true');

      res.status(200).json({
        message: 'Inventory alerts retrieved successfully',
        data: alerts,
        count: alerts.length
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch inventory alerts',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // PUT /api/inventory/alerts/:id/read - Mark alert as read
  static async markAlertAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await InventoryService.markAlertAsRead(id);

      if (!success) {
        res.status(404).json({
          error: 'Alert not found',
          message: `Alert with ID ${id} does not exist`
        });
        return;
      }

      res.status(200).json({
        message: 'Alert marked as read successfully'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to mark alert as read',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // POST /api/inventory/stock-movement - Record stock movement
  static async recordStockMovement(req: Request, res: Response): Promise<void> {
    try {
      const {
        inventoryItemId,
        movementType,
        quantity,
        reason,
        reference,
        fromLocation,
        toLocation,
        userId
      } = req.body;

      if (!inventoryItemId || !movementType || !quantity || !reason || !userId) {
        res.status(400).json({
          error: 'Missing required fields',
          message: 'inventoryItemId, movementType, quantity, reason, and userId are required'
        });
        return;
      }

      const movement = await InventoryService.recordStockMovement({
        inventoryItemId,
        movementType,
        quantity: Number(quantity),
        reason,
        reference,
        fromLocation,
        toLocation,
        userId
      });

      res.status(201).json({
        message: 'Stock movement recorded successfully',
        data: movement
      });
    } catch (error) {
      res.status(400).json({
        error: 'Failed to record stock movement',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // GET /api/inventory/low-stock - Get low stock items
  static async getLowStockItems(req: Request, res: Response) {
    try {
      const items = await InventoryService.getLowStockItems();

      res.status(200).json({
        message: 'Low stock items retrieved successfully',
        data: items,
        count: items.length
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch low stock items',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // GET /api/inventory/value - Get total stock value
  static async getStockValue(req: Request, res: Response) {
    try {
      const stockValue = await InventoryService.getStockValue();

      res.status(200).json({
        message: 'Stock value calculated successfully',
        data: stockValue
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to calculate stock value',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
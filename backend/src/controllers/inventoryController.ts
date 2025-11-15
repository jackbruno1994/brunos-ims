import { Request, Response } from 'express';

// Placeholder data until database is connected
const mockItems: any[] = [];
const mockStockMovements: any[] = [];
const mockLocations: any[] = [];
const mockCategories: any[] = [];

export const inventoryController = {
  // Item Controllers
  async getAllItems(_req: Request, res: Response): Promise<void> {
    try {
      res.json(mockItems);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching items', error });
    }
  },

  async createItem(req: Request, res: Response): Promise<void> {
    try {
      const item = { id: Date.now().toString(), ...req.body };
      mockItems.push(item);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: 'Error creating item', error });
    }
  },

  async getItem(req: Request, res: Response): Promise<void> {
    try {
      const item = mockItems.find(i => i.id === req.params.id);
      if (!item) {
        res.status(404).json({ message: 'Item not found' });
        return;
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching item', error });
    }
  },

  async updateItem(req: Request, res: Response): Promise<void> {
    try {
      const index = mockItems.findIndex(i => i.id === req.params.id);
      if (index === -1) {
        res.status(404).json({ message: 'Item not found' });
        return;
      }
      mockItems[index] = { ...mockItems[index], ...req.body };
      res.json(mockItems[index]);
    } catch (error) {
      res.status(400).json({ message: 'Error updating item', error });
    }
  },

  async deleteItem(req: Request, res: Response): Promise<void> {
    try {
      const index = mockItems.findIndex(i => i.id === req.params.id);
      if (index === -1) {
        res.status(404).json({ message: 'Item not found' });
        return;
      }
      mockItems.splice(index, 1);
      res.json({ message: 'Item deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting item', error });
    }
  },

  // Stock Movement Controllers
  async recordStockMovement(req: Request, res: Response): Promise<void> {
    try {
      const movement = {
        id: Date.now().toString(),
        ...req.body,
        createdAt: new Date(),
      };
      mockStockMovements.push(movement);
      res.status(201).json(movement);
    } catch (error) {
      res.status(400).json({ message: 'Error recording stock movement', error });
    }
  },

  async getStockLevels(_req: Request, res: Response): Promise<void> {
    try {
      // Simplified mock aggregation
      const stockLevels = mockStockMovements.reduce((acc: any, movement: any) => {
        if (!acc[movement.itemId]) {
          acc[movement.itemId] = 0;
        }
        acc[movement.itemId] += movement.type === 'IN' ? movement.quantity : -movement.quantity;
        return acc;
      }, {});
      res.json(stockLevels);
    } catch (error) {
      res.status(500).json({ message: 'Error calculating stock levels', error });
    }
  },

  async getStockHistory(_req: Request, res: Response): Promise<void> {
    try {
      const history = mockStockMovements.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching stock history', error });
    }
  },

  // Location Controllers
  async getAllLocations(_req: Request, res: Response): Promise<void> {
    try {
      const locations = mockLocations.filter(l => l.active !== false);
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching locations', error });
    }
  },

  async createLocation(req: Request, res: Response): Promise<void> {
    try {
      const location = { id: Date.now().toString(), ...req.body, active: true };
      mockLocations.push(location);
      res.status(201).json(location);
    } catch (error) {
      res.status(400).json({ message: 'Error creating location', error });
    }
  },

  async updateLocation(req: Request, res: Response): Promise<void> {
    try {
      const index = mockLocations.findIndex(l => l.id === req.params.id);
      if (index === -1) {
        res.status(404).json({ message: 'Location not found' });
        return;
      }
      mockLocations[index] = { ...mockLocations[index], ...req.body };
      res.json(mockLocations[index]);
    } catch (error) {
      res.status(400).json({ message: 'Error updating location', error });
    }
  },

  async deleteLocation(req: Request, res: Response): Promise<void> {
    try {
      const index = mockLocations.findIndex(l => l.id === req.params.id);
      if (index === -1) {
        res.status(404).json({ message: 'Location not found' });
        return;
      }
      mockLocations[index].active = false;
      res.json({ message: 'Location deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting location', error });
    }
  },

  // Category Controllers
  async getAllCategories(_req: Request, res: Response): Promise<void> {
    try {
      res.json(mockCategories);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching categories', error });
    }
  },

  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const category = { id: Date.now().toString(), ...req.body };
      mockCategories.push(category);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: 'Error creating category', error });
    }
  },
};

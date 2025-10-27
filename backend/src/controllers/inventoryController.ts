import { Request, Response } from 'express';
import { Item, StockMovement, Location, Category } from '../models/Inventory';

// Temporary stub implementations - these would be replaced with actual database operations
const mockItems: Item[] = [];
const mockMovements: StockMovement[] = [];
const mockLocations: Location[] = [];
const mockCategories: Category[] = [];

export const inventoryController = {
    // Item Controllers
    async getAllItems(_req: Request, res: Response) {
        try {
            res.json(mockItems);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching items', error });
        }
    },

    async createItem(req: Request, res: Response) {
        try {
            const item: Item = {
                id: Date.now().toString(),
                ...req.body,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            mockItems.push(item);
            res.status(201).json(item);
        } catch (error) {
            res.status(400).json({ message: 'Error creating item', error });
        }
    },

    async getItem(req: Request, res: Response) {
        try {
            const item = mockItems.find(i => i.id === req.params.id);
            if (!item) {
                return res.status(404).json({ message: 'Item not found' });
            }
            return res.json(item);
        } catch (error) {
            return res.status(500).json({ message: 'Error fetching item', error });
        }
    },

    async updateItem(req: Request, res: Response) {
        try {
            const index = mockItems.findIndex(i => i.id === req.params.id);
            if (index === -1) {
                return res.status(404).json({ message: 'Item not found' });
            }
            
            mockItems[index] = { ...mockItems[index], ...req.body, updatedAt: new Date() };
            return res.json(mockItems[index]);
        } catch (error) {
            return res.status(400).json({ message: 'Error updating item', error });
        }
    },

    async deleteItem(req: Request, res: Response) {
        try {
            const index = mockItems.findIndex(i => i.id === req.params.id);
            if (index === -1) {
                return res.status(404).json({ message: 'Item not found' });
            }
            
            mockItems.splice(index, 1);
            return res.json({ message: 'Item deleted successfully' });
        } catch (error) {
            return res.status(500).json({ message: 'Error deleting item', error });
        }
    },

    // Stock Movement Controllers
    async recordStockMovement(req: Request, res: Response) {
        try {
            const movement: StockMovement = {
                id: Date.now().toString(),
                ...req.body,
                createdBy: req.user?.id || 'unknown',
                createdAt: new Date(),
            };
            mockMovements.push(movement);
            res.status(201).json(movement);
        } catch (error) {
            res.status(400).json({ message: 'Error recording stock movement', error });
        }
    },

    async getStockLevels(_req: Request, res: Response) {
        try {
            // Simple aggregation for mock data
            const stockLevels = mockMovements.reduce((acc, movement) => {
                if (!acc[movement.itemId]) {
                    acc[movement.itemId] = 0;
                }
                const multiplier = movement.type === 'IN' ? 1 : -1;
                acc[movement.itemId] += movement.quantity * multiplier;
                return acc;
            }, {} as Record<string, number>);

            const result = Object.entries(stockLevels).map(([itemId, totalStock]) => ({
                _id: itemId,
                totalStock,
            }));

            res.json(result);
        } catch (error) {
            res.status(500).json({ message: 'Error calculating stock levels', error });
        }
    },

    async getStockHistory(_req: Request, res: Response) {
        try {
            const history = mockMovements
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .slice(0, 100);
            res.json(history);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching stock history', error });
        }
    },

    // Location Controllers
    async getAllLocations(_req: Request, res: Response) {
        try {
            const activeLocations = mockLocations.filter(loc => loc.isActive);
            res.json(activeLocations);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching locations', error });
        }
    },

    async createLocation(req: Request, res: Response) {
        try {
            const location: Location = {
                id: Date.now().toString(),
                ...req.body,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            mockLocations.push(location);
            res.status(201).json(location);
        } catch (error) {
            res.status(400).json({ message: 'Error creating location', error });
        }
    },

    async updateLocation(req: Request, res: Response) {
        try {
            const index = mockLocations.findIndex(l => l.id === req.params.id);
            if (index === -1) {
                return res.status(404).json({ message: 'Location not found' });
            }
            
            mockLocations[index] = { ...mockLocations[index], ...req.body, updatedAt: new Date() };
            return res.json(mockLocations[index]);
        } catch (error) {
            return res.status(400).json({ message: 'Error updating location', error });
        }
    },

    async deleteLocation(req: Request, res: Response) {
        try {
            const index = mockLocations.findIndex(l => l.id === req.params.id);
            if (index === -1) {
                return res.status(404).json({ message: 'Location not found' });
            }
            
            mockLocations[index] = { ...mockLocations[index], isActive: false, updatedAt: new Date() };
            return res.json({ message: 'Location deactivated successfully' });
        } catch (error) {
            return res.status(500).json({ message: 'Error deactivating location', error });
        }
    },

    // Category Controllers
    async getAllCategories(_req: Request, res: Response) {
        try {
            res.json(mockCategories);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching categories', error });
        }
    },

    async createCategory(req: Request, res: Response) {
        try {
            const category: Category = {
                id: Date.now().toString(),
                ...req.body,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            mockCategories.push(category);
            res.status(201).json(category);
        } catch (error) {
            res.status(400).json({ message: 'Error creating category', error });
        }
    },
};
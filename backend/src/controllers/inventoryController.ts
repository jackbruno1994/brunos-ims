import { Request, Response } from 'express';
import { Item, StockMovement, Location, Category } from '../models/Inventory';

// Extend Request interface to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const inventoryController = {
    // Item Controllers
    async getAllItems(_req: Request, res: Response) {
        try {
            const items = await Item.find();
            res.json(items);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching items', error });
        }
    },

    async createItem(req: Request, res: Response) {
        try {
            const item = new (Item.constructor as any)(req.body);
            await item.save();
            res.status(201).json(item);
        } catch (error) {
            res.status(400).json({ message: 'Error creating item', error });
        }
    },

    async getItem(req: Request, res: Response): Promise<void> {
        try {
            const item = await Item.findById(req.params.id);
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
            const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!item) {
                res.status(404).json({ message: 'Item not found' });
                return;
            }
            res.json(item);
        } catch (error) {
            res.status(400).json({ message: 'Error updating item', error });
        }
    },

    async deleteItem(req: Request, res: Response): Promise<void> {
        try {
            const item = await Item.findByIdAndDelete(req.params.id);
            if (!item) {
                res.status(404).json({ message: 'Item not found' });
                return;
            }
            res.json({ message: 'Item deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting item', error });
        }
    },

    // Stock Movement Controllers
    async recordStockMovement(req: AuthenticatedRequest, res: Response) {
        try {
            const movement = new (StockMovement.constructor as any)({
                ...req.body,
                createdBy: req.user?.id || 'unknown'
            });
            await movement.save();
            res.status(201).json(movement);
        } catch (error) {
            res.status(400).json({ message: 'Error recording stock movement', error });
        }
    },

    async getStockLevels(_req: Request, res: Response) {
        try {
            const movements = await StockMovement.aggregate([
                { $group: {
                    _id: '$itemId',
                    totalStock: {
                        $sum: {
                            $cond: [
                                { $eq: ['$type', 'IN'] },
                                '$quantity',
                                { $multiply: ['$quantity', -1] }
                            ]
                        }
                    }
                }}
            ]);
            res.json(movements);
        } catch (error) {
            res.status(500).json({ message: 'Error calculating stock levels', error });
        }
    },

    async getStockHistory(_req: Request, res: Response) {
        try {
            // For mock implementation, just return stock movements sorted by date
            const history = await StockMovement.find();
            const sortedHistory = history.sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            res.json(sortedHistory);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching stock history', error });
        }
    },

    // Location Controllers
    async getAllLocations(_req: Request, res: Response) {
        try {
            const locations = await Location.find({ active: true });
            res.json(locations);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching locations', error });
        }
    },

    async createLocation(req: Request, res: Response) {
        try {
            const location = new (Location.constructor as any)(req.body);
            await location.save();
            res.status(201).json(location);
        } catch (error) {
            res.status(400).json({ message: 'Error creating location', error });
        }
    },

    async updateLocation(req: Request, res: Response): Promise<void> {
        try {
            const location = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!location) {
                res.status(404).json({ message: 'Location not found' });
                return;
            }
            res.json(location);
        } catch (error) {
            res.status(400).json({ message: 'Error updating location', error });
        }
    },

    async deleteLocation(req: Request, res: Response): Promise<void> {
        try {
            const location = await Location.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
            if (!location) {
                res.status(404).json({ message: 'Location not found' });
                return;
            }
            res.json({ message: 'Location deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting location', error });
        }
    },

    // Category Controllers
    async getAllCategories(_req: Request, res: Response) {
        try {
            const categories = await Category.find();
            res.json(categories);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching categories', error });
        }
    },

    async createCategory(req: Request, res: Response) {
        try {
            const category = new (Category.constructor as any)(req.body);
            await category.save();
            res.status(201).json(category);
        } catch (error) {
            res.status(400).json({ message: 'Error creating category', error });
        }
    }
};
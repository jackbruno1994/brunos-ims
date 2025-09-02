import { Request, Response } from 'express';
import { Item, StockMovement, Location, Category } from '../models/Inventory';

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
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
            const item = new Item(req.body);
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
            // Mock update functionality
            const item = await Item.findById(req.params.id);
            if (!item) {
                res.status(404).json({ message: 'Item not found' });
                return;
            }
            Object.assign(item, req.body);
            const savedItem = await item.save();
            res.json(savedItem);
        } catch (error) {
            res.status(400).json({ message: 'Error updating item', error });
        }
    },

    async deleteItem(req: Request, res: Response): Promise<void> {
        try {
            // Mock delete functionality
            const item = await Item.findById(req.params.id);
            if (!item) {
                res.status(404).json({ message: 'Item not found' });
                return;
            }
            await item.remove();
            res.json({ message: 'Item deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting item', error });
        }
    },

    // Stock Movement Controllers
    async recordStockMovement(req: AuthenticatedRequest, res: Response) {
        try {
            const movement = new StockMovement({
                ...req.body,
                createdBy: req.user?.id || 'anonymous'
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
            // Mock implementation for stock history
            const history = await StockMovement.find();
            res.json(history);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching stock history', error });
        }
    },

    // Location Controllers
    async getAllLocations(_req: Request, res: Response) {
        try {
            const locations = await Location.find();
            res.json(locations);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching locations', error });
        }
    },

    async createLocation(req: Request, res: Response) {
        try {
            const location = new Location(req.body);
            await location.save();
            res.status(201).json(location);
        } catch (error) {
            res.status(400).json({ message: 'Error creating location', error });
        }
    },

    async updateLocation(req: Request, res: Response): Promise<void> {
        try {
            // Mock update functionality
            const location = await Location.findById(req.params.id);
            if (!location) {
                res.status(404).json({ message: 'Location not found' });
                return;
            }
            Object.assign(location, req.body);
            const savedLocation = await location.save();
            res.json(savedLocation);
        } catch (error) {
            res.status(400).json({ message: 'Error updating location', error });
        }
    },

    async deleteLocation(req: Request, res: Response): Promise<void> {
        try {
            // Mock soft delete functionality
            const location = await Location.findById(req.params.id);
            if (!location) {
                res.status(404).json({ message: 'Location not found' });
                return;
            }
            Object.assign(location, { status: 'inactive' });
            await location.save();
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
            const category = new Category(req.body);
            await category.save();
            res.status(201).json(category);
        } catch (error) {
            res.status(400).json({ message: 'Error creating category', error });
        }
    }
};
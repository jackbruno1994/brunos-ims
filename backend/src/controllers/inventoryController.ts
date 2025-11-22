import { Request, Response } from 'express';
import { Item, StockMovement, Location, Category } from '../models/Inventory';

// Extend Request type to include user property
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
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

    async createItem(req: Request, res: Response): Promise<Response> {
        try {
            const item = await Item.create(req.body);
            return res.status(201).json(item);
        } catch (error) {
            return res.status(400).json({ message: 'Error creating item', error });
        }
    },

    async getItem(req: Request, res: Response): Promise<Response> {
        try {
            const item = await Item.findById(req.params.id);
            if (!item) return res.status(404).json({ message: 'Item not found' });
            return res.json(item);
        } catch (error) {
            return res.status(500).json({ message: 'Error fetching item', error });
        }
    },

    async updateItem(req: Request, res: Response): Promise<Response> {
        try {
            const item = await Item.update(req.params.id, req.body);
            if (!item) return res.status(404).json({ message: 'Item not found' });
            return res.json(item);
        } catch (error) {
            return res.status(400).json({ message: 'Error updating item', error });
        }
    },

    async deleteItem(req: Request, res: Response): Promise<Response> {
        try {
            const result = await Item.delete(req.params.id);
            if (!result) return res.status(404).json({ message: 'Item not found' });
            return res.json({ message: 'Item deleted successfully' });
        } catch (error) {
            return res.status(500).json({ message: 'Error deleting item', error });
        }
    },

    // Stock Movement Controllers
    async recordStockMovement(req: AuthenticatedRequest, res: Response) {
        try {
            const movement = await StockMovement.create({
                ...req.body,
                createdBy: req.user?.id
            });
            res.status(201).json(movement);
        } catch (error) {
            res.status(400).json({ message: 'Error recording stock movement', error });
        }
    },

    async getStockLevels(_req: Request, res: Response) {
        try {
            // Simplified implementation for now
            const movements = await StockMovement.find();
            res.json(movements);
        } catch (error) {
            res.status(500).json({ message: 'Error calculating stock levels', error });
        }
    },

    async getStockHistory(_req: Request, res: Response) {
        try {
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
            const location = await Location.create(req.body);
            res.status(201).json(location);
        } catch (error) {
            res.status(400).json({ message: 'Error creating location', error });
        }
    },

    async updateLocation(req: Request, res: Response): Promise<Response> {
        try {
            const location = await Location.update(req.params.id, req.body);
            if (!location) return res.status(404).json({ message: 'Location not found' });
            return res.json(location);
        } catch (error) {
            return res.status(400).json({ message: 'Error updating location', error });
        }
    },

    async deleteLocation(req: Request, res: Response): Promise<Response> {
        try {
            const result = await Location.delete(req.params.id);
            if (!result) return res.status(404).json({ message: 'Location not found' });
            return res.json({ message: 'Location deleted successfully' });
        } catch (error) {
            return res.status(500).json({ message: 'Error deleting location', error });
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
            const category = await Category.create(req.body);
            res.status(201).json(category);
        } catch (error) {
            res.status(400).json({ message: 'Error creating category', error });
        }
    }
};
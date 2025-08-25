import { Request, Response } from 'express';
import { Item, StockMovement, Location, Category } from '../models/Inventory';

export const inventoryController = {
    // Item Controllers
    async getAllItems(req: Request, res: Response) {
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

    async getItem(req: Request, res: Response) {
        try {
            const item = await Item.findById(req.params.id);
            if (!item) return res.status(404).json({ message: 'Item not found' });
            res.json(item);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching item', error });
        }
    },

    async updateItem(req: Request, res: Response) {
        try {
            const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!item) return res.status(404).json({ message: 'Item not found' });
            res.json(item);
        } catch (error) {
            res.status(400).json({ message: 'Error updating item', error });
        }
    },

    async deleteItem(req: Request, res: Response) {
        try {
            const item = await Item.findByIdAndDelete(req.params.id);
            if (!item) return res.status(404).json({ message: 'Item not found' });
            res.json({ message: 'Item deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting item', error });
        }
    },

    // Stock Movement Controllers
    async recordStockMovement(req: Request, res: Response) {
        try {
            const movement = new StockMovement({
                ...req.body,
                createdBy: req.user?.id
            });
            await movement.save();
            res.status(201).json(movement);
        } catch (error) {
            res.status(400).json({ message: 'Error recording stock movement', error });
        }
    },

    async getStockLevels(req: Request, res: Response) {
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

    async getStockHistory(req: Request, res: Response) {
        try {
            const history = await StockMovement.find()
                .populate('itemId')
                .populate('createdBy', 'username')
                .sort('-createdAt');
            res.json(history);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching stock history', error });
        }
    },

    // Location Controllers
    async getAllLocations(req: Request, res: Response) {
        try {
            const locations = await Location.find({ active: true });
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

    async updateLocation(req: Request, res: Response) {
        try {
            const location = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!location) return res.status(404).json({ message: 'Location not found' });
            res.json(location);
        } catch (error) {
            res.status(400).json({ message: 'Error updating location', error });
        }
    },

    async deleteLocation(req: Request, res: Response) {
        try {
            const location = await Location.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
            if (!location) return res.status(404).json({ message: 'Location not found' });
            res.json({ message: 'Location deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting location', error });
        }
    },

    // Category Controllers
    async getAllCategories(req: Request, res: Response) {
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
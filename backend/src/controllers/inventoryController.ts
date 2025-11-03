import { Request, Response } from 'express';
import { Item, StockMovement, Location, Category } from '../models/Inventory';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        [key: string]: any;
      };
    }
  }
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
            // Note: populate and sort will be implemented when using actual database
            const history = await StockMovement.find();
            res.json(history);
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
            const location = new Location(req.body);
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
            const category = new Category(req.body);
            await category.save();
            res.status(201).json(category);
        } catch (error) {
            res.status(400).json({ message: 'Error creating category', error });
        }
    },

    // Batch Processing Controllers
    async batchStockMovement(req: Request, res: Response) {
        try {
            const { movements, batchSize = 100 } = req.body;

            if (!movements || !Array.isArray(movements)) {
                res.status(400).json({ message: 'Invalid request: movements array is required' });
                return;
            }

            const results = {
                total: movements.length,
                processed: 0,
                failed: 0,
                batches: [] as any[],
            };

            // Process in batches of specified size (default 100)
            for (let i = 0; i < movements.length; i += batchSize) {
                const batch = movements.slice(i, i + batchSize);
                const batchResults = {
                    batchNumber: Math.floor(i / batchSize) + 1,
                    size: batch.length,
                    success: [] as any[],
                    errors: [] as any[],
                };

                for (const movementData of batch) {
                    try {
                        const movement = new StockMovement({
                            ...movementData,
                            createdBy: req.user?.id,
                        });
                        const saved = await movement.save();
                        batchResults.success.push(saved);
                        results.processed++;
                    } catch (error) {
                        batchResults.errors.push({
                            movement: movementData,
                            error: error instanceof Error ? error.message : 'Unknown error',
                        });
                        results.failed++;
                    }
                }

                results.batches.push(batchResults);
            }

            res.status(201).json({
                message: `Batch processing completed: ${results.processed} successful, ${results.failed} failed`,
                results,
            });
        } catch (error) {
            res.status(500).json({ message: 'Error processing batch stock movements', error });
        }
    },

    async batchCreateItems(req: Request, res: Response) {
        try {
            const { items, batchSize = 100 } = req.body;

            if (!items || !Array.isArray(items)) {
                res.status(400).json({ message: 'Invalid request: items array is required' });
                return;
            }

            const results = {
                total: items.length,
                processed: 0,
                failed: 0,
                batches: [] as any[],
            };

            // Process in batches of specified size (default 100)
            for (let i = 0; i < items.length; i += batchSize) {
                const batch = items.slice(i, i + batchSize);
                const batchResults = {
                    batchNumber: Math.floor(i / batchSize) + 1,
                    size: batch.length,
                    success: [] as any[],
                    errors: [] as any[],
                };

                for (const itemData of batch) {
                    try {
                        const item = new Item(itemData);
                        const saved = await item.save();
                        batchResults.success.push(saved);
                        results.processed++;
                    } catch (error) {
                        batchResults.errors.push({
                            item: itemData,
                            error: error instanceof Error ? error.message : 'Unknown error',
                        });
                        results.failed++;
                    }
                }

                results.batches.push(batchResults);
            }

            res.status(201).json({
                message: `Batch processing completed: ${results.processed} successful, ${results.failed} failed`,
                results,
            });
        } catch (error) {
            res.status(500).json({ message: 'Error processing batch items', error });
        }
    },
};
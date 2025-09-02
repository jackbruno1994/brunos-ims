import { Request, Response } from 'express';
import { ItemService, StockMovementService, LocationService, CategoryService } from '../models/Inventory';

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
    async getAllItems(req: Request, res: Response) {
        try {
            const { page = 1, limit = 10, search, category, status } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            
            const where: any = {};
            if (search) {
                where.OR = [
                    { name: { contains: search as string, mode: 'insensitive' } },
                    { sku: { contains: search as string, mode: 'insensitive' } },
                ];
            }
            if (category) {
                where.categoryId = category as string;
            }
            if (status) {
                where.status = status;
            }

            const [items, total] = await Promise.all([
                ItemService.findMany(where, { name: 'asc' }, Number(limit), skip),
                ItemService.count(where),
            ]);

            res.json({
                items,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit)),
                },
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching items', error });
        }
    },

    async createItem(req: AuthenticatedRequest, res: Response) {
        try {
            const itemData = {
                ...req.body,
                createdById: req.user?.id || 'anonymous',
            };
            const item = await ItemService.create(itemData);
            res.status(201).json(item);
        } catch (error) {
            res.status(400).json({ message: 'Error creating item', error });
        }
    },

    async getItem(req: Request, res: Response): Promise<void> {
        try {
            const item = await ItemService.findById(req.params.id);
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
            const item = await ItemService.update(req.params.id, req.body);
            res.json(item);
        } catch (error: any) {
            if (error.code === 'P2025') {
                res.status(404).json({ message: 'Item not found' });
                return;
            }
            res.status(400).json({ message: 'Error updating item', error });
        }
    },

    async deleteItem(req: Request, res: Response): Promise<void> {
        try {
            await ItemService.delete(req.params.id);
            res.json({ message: 'Item deleted successfully' });
        } catch (error: any) {
            if (error.code === 'P2025') {
                res.status(404).json({ message: 'Item not found' });
                return;
            }
            res.status(500).json({ message: 'Error deleting item', error });
        }
    },

    // Stock Movement Controllers
    async recordStockMovement(req: AuthenticatedRequest, res: Response) {
        try {
            const movementData = {
                ...req.body,
                createdById: req.user?.id || 'anonymous',
            };
            const movement = await StockMovementService.create(movementData);
            res.status(201).json(movement);
        } catch (error) {
            res.status(400).json({ message: 'Error recording stock movement', error });
        }
    },

    async getStockLevels(_req: Request, res: Response) {
        try {
            const stockLevels = await StockMovementService.getStockLevels();
            res.json(stockLevels);
        } catch (error) {
            res.status(500).json({ message: 'Error calculating stock levels', error });
        }
    },

    async getStockHistory(req: Request, res: Response) {
        try {
            const { page = 1, limit = 50, itemId } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            
            const where: any = {};
            if (itemId) {
                where.itemId = itemId as string;
            }

            const [movements, total] = await Promise.all([
                StockMovementService.findMany(
                    where,
                    { createdAt: 'desc' },
                    Number(limit),
                    skip
                ),
                StockMovementService.count(where),
            ]);

            res.json({
                movements,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit)),
                },
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching stock history', error });
        }
    },

    async getLowStockItems(_req: Request, res: Response) {
        try {
            const lowStockItems = await ItemService.getLowStockItems();
            res.json(lowStockItems);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching low stock items', error });
        }
    },

    // Location Controllers
    async getAllLocations(req: Request, res: Response) {
        try {
            const { status } = req.query;
            const where: any = {};
            if (status) {
                where.status = status;
            }
            
            const locations = await LocationService.findMany(where, { name: 'asc' });
            res.json(locations);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching locations', error });
        }
    },

    async createLocation(req: Request, res: Response) {
        try {
            const location = await LocationService.create(req.body);
            res.status(201).json(location);
        } catch (error) {
            res.status(400).json({ message: 'Error creating location', error });
        }
    },

    async getLocation(req: Request, res: Response): Promise<void> {
        try {
            const location = await LocationService.findById(req.params.id);
            if (!location) {
                res.status(404).json({ message: 'Location not found' });
                return;
            }
            res.json(location);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching location', error });
        }
    },

    async updateLocation(req: Request, res: Response): Promise<void> {
        try {
            const location = await LocationService.update(req.params.id, req.body);
            res.json(location);
        } catch (error: any) {
            if (error.code === 'P2025') {
                res.status(404).json({ message: 'Location not found' });
                return;
            }
            res.status(400).json({ message: 'Error updating location', error });
        }
    },

    async deleteLocation(req: Request, res: Response): Promise<void> {
        try {
            await LocationService.delete(req.params.id);
            res.json({ message: 'Location deleted successfully' });
        } catch (error: any) {
            if (error.code === 'P2025') {
                res.status(404).json({ message: 'Location not found' });
                return;
            }
            res.status(500).json({ message: 'Error deleting location', error });
        }
    },

    // Category Controllers
    async getAllCategories(req: Request, res: Response) {
        try {
            const { status } = req.query;
            const where: any = {};
            if (status) {
                where.status = status;
            }
            
            const categories = await CategoryService.findMany(where, { name: 'asc' });
            res.json(categories);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching categories', error });
        }
    },

    async createCategory(req: Request, res: Response) {
        try {
            const category = await CategoryService.create(req.body);
            res.status(201).json(category);
        } catch (error) {
            res.status(400).json({ message: 'Error creating category', error });
        }
    },

    async getCategory(req: Request, res: Response): Promise<void> {
        try {
            const category = await CategoryService.findById(req.params.id);
            if (!category) {
                res.status(404).json({ message: 'Category not found' });
                return;
            }
            res.json(category);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching category', error });
        }
    },

    async updateCategory(req: Request, res: Response): Promise<void> {
        try {
            const category = await CategoryService.update(req.params.id, req.body);
            res.json(category);
        } catch (error: any) {
            if (error.code === 'P2025') {
                res.status(404).json({ message: 'Category not found' });
                return;
            }
            res.status(400).json({ message: 'Error updating category', error });
        }
    },

    async deleteCategory(req: Request, res: Response): Promise<void> {
        try {
            await CategoryService.delete(req.params.id);
            res.json({ message: 'Category deleted successfully' });
        } catch (error: any) {
            if (error.code === 'P2025') {
                res.status(404).json({ message: 'Category not found' });
                return;
            }
            res.status(500).json({ message: 'Error deleting category', error });
        }
    }
};
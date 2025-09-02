import { Request, Response } from 'express';
import prisma, { executeWithTimeout } from '../config/database';

export const inventoryController = {
    // Item Controllers
    async getAllItems(_req: Request, res: Response) {
        try {
            const items = await executeWithTimeout(
                () => prisma.item.findMany({
                    include: {
                        category: true,
                        supplier: true,
                        conversions: true,
                    },
                })
            );
            res.json(items);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching items', error: error instanceof Error ? error.message : 'Unknown error' });
        }
    },

    async createItem(req: Request, res: Response) {
        try {
            const item = await executeWithTimeout(
                () => prisma.item.create({
                    data: req.body,
                    include: {
                        category: true,
                        supplier: true,
                    },
                })
            );
            res.status(201).json(item);
        } catch (error) {
            res.status(400).json({ message: 'Error creating item', error: error instanceof Error ? error.message : 'Unknown error' });
        }
    },

    async getItem(req: Request, res: Response): Promise<Response> {
        try {
            const item = await executeWithTimeout(
                () => prisma.item.findUnique({
                    where: { id: req.params.id },
                    include: {
                        category: true,
                        supplier: true,
                        conversions: true,
                        stockMovements: {
                            take: 10,
                            orderBy: { createdAt: 'desc' },
                        },
                    },
                })
            );
            
            if (!item) {
                return res.status(404).json({ message: 'Item not found' });
            }
            
            return res.json(item);
        } catch (error) {
            return res.status(500).json({ message: 'Error fetching item', error: error instanceof Error ? error.message : 'Unknown error' });
        }
    },

    async updateItem(req: Request, res: Response): Promise<Response> {
        try {
            const item = await executeWithTimeout(
                () => prisma.item.update({
                    where: { id: req.params.id },
                    data: req.body,
                    include: {
                        category: true,
                        supplier: true,
                    },
                })
            );
            return res.json(item);
        } catch (error) {
            if (error instanceof Error && error.message.includes('Record to update not found')) {
                return res.status(404).json({ message: 'Item not found' });
            }
            return res.status(400).json({ message: 'Error updating item', error: error instanceof Error ? error.message : 'Unknown error' });
        }
    },

    async deleteItem(req: Request, res: Response): Promise<Response> {
        try {
            await executeWithTimeout(
                () => prisma.item.update({
                    where: { id: req.params.id },
                    data: { status: 'INACTIVE' },
                })
            );
            return res.json({ message: 'Item deactivated successfully' });
        } catch (error) {
            if (error instanceof Error && error.message.includes('Record to update not found')) {
                return res.status(404).json({ message: 'Item not found' });
            }
            return res.status(500).json({ message: 'Error deleting item', error: error instanceof Error ? error.message : 'Unknown error' });
        }
    },

    // Stock Movement Controllers
    async recordStockMovement(req: Request, res: Response) {
        try {
            // For now, use a default user ID since authentication is not implemented
            const movement = await executeWithTimeout(
                () => prisma.stockMovement.create({
                    data: {
                        ...req.body,
                        createdById: req.body.createdById || 'default-user-id', // TODO: Get from auth middleware
                    },
                    include: {
                        item: true,
                        fromLocation: true,
                        toLocation: true,
                        createdBy: true,
                    },
                })
            );
            res.status(201).json(movement);
        } catch (error) {
            res.status(400).json({ message: 'Error recording stock movement', error: error instanceof Error ? error.message : 'Unknown error' });
        }
    },

    async getStockLevels(_req: Request, res: Response) {
        try {
            const stockLevels = await executeWithTimeout(
                () => prisma.stockMovement.groupBy({
                    by: ['itemId'],
                    _sum: {
                        qtyBase: true,
                    },
                    where: {
                        reason: {
                            in: ['PURCHASE_RECEIPT', 'PRODUCTION_OUTPUT', 'ADJUSTMENT'],
                        },
                    },
                })
            );
            
            // Get item details for each stock level
            const enrichedStockLevels = await Promise.all(
                (stockLevels as Array<{ itemId: string; _sum: { qtyBase: number | null } }>).map(async (level) => {
                    const item = await prisma.item.findUnique({
                        where: { id: level.itemId },
                        select: { id: true, name: true, sku: true, baseUom: true },
                    });
                    return {
                        ...level,
                        item,
                        totalStock: level._sum.qtyBase || 0,
                    };
                })
            );
            
            res.json(enrichedStockLevels);
        } catch (error) {
            res.status(500).json({ message: 'Error calculating stock levels', error: error instanceof Error ? error.message : 'Unknown error' });
        }
    },

    async getStockHistory(_req: Request, res: Response) {
        try {
            const history = await executeWithTimeout(
                () => prisma.stockMovement.findMany({
                    include: {
                        item: true,
                        fromLocation: true,
                        toLocation: true,
                        createdBy: {
                            select: { id: true, firstName: true, lastName: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 100, // Limit to last 100 movements
                })
            );
            res.json(history);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching stock history', error: error instanceof Error ? error.message : 'Unknown error' });
        }
    },

    // Location Controllers
    async getAllLocations(_req: Request, res: Response) {
        try {
            const locations = await executeWithTimeout(
                () => prisma.location.findMany({
                    where: { active: true },
                })
            );
            res.json(locations);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching locations', error: error instanceof Error ? error.message : 'Unknown error' });
        }
    },

    async createLocation(req: Request, res: Response) {
        try {
            const location = await executeWithTimeout(
                () => prisma.location.create({
                    data: req.body,
                })
            );
            res.status(201).json(location);
        } catch (error) {
            res.status(400).json({ message: 'Error creating location', error: error instanceof Error ? error.message : 'Unknown error' });
        }
    },

    async updateLocation(req: Request, res: Response): Promise<Response> {
        try {
            const location = await executeWithTimeout(
                () => prisma.location.update({
                    where: { id: req.params.id },
                    data: req.body,
                })
            );
            return res.json(location);
        } catch (error) {
            if (error instanceof Error && error.message.includes('Record to update not found')) {
                return res.status(404).json({ message: 'Location not found' });
            }
            return res.status(400).json({ message: 'Error updating location', error: error instanceof Error ? error.message : 'Unknown error' });
        }
    },

    async deleteLocation(req: Request, res: Response): Promise<Response> {
        try {
            await executeWithTimeout(
                () => prisma.location.update({
                    where: { id: req.params.id },
                    data: { active: false },
                })
            );
            return res.json({ message: 'Location deleted successfully' });
        } catch (error) {
            if (error instanceof Error && error.message.includes('Record to update not found')) {
                return res.status(404).json({ message: 'Location not found' });
            }
            return res.status(500).json({ message: 'Error deleting location', error: error instanceof Error ? error.message : 'Unknown error' });
        }
    },

    // Category Controllers
    async getAllCategories(_req: Request, res: Response) {
        try {
            const categories = await executeWithTimeout(
                () => prisma.category.findMany({
                    include: {
                        _count: {
                            select: { items: true },
                        },
                    },
                })
            );
            res.json(categories);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching categories', error: error instanceof Error ? error.message : 'Unknown error' });
        }
    },

    async createCategory(req: Request, res: Response) {
        try {
            const category = await executeWithTimeout(
                () => prisma.category.create({
                    data: req.body,
                })
            );
            res.status(201).json(category);
        } catch (error) {
            res.status(400).json({ message: 'Error creating category', error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
};
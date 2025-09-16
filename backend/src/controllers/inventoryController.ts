import { Request, Response } from 'express';
import { prisma } from '../config/database';

export const inventoryController = {
    // Item Controllers
    async getAllItems(_req: Request, res: Response) {
        try {
            const items = await prisma.item.findMany({
                include: {
                    category: true,
                    supplier: true,
                    location: true,
                }
            });
            res.json(items);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching items', error });
        }
    },

    async createItem(req: Request, res: Response) {
        try {
            const item = await prisma.item.create({
                data: req.body,
                include: {
                    category: true,
                    supplier: true,
                    location: true,
                }
            });
            res.status(201).json(item);
        } catch (error) {
            res.status(400).json({ message: 'Error creating item', error });
        }
    },

    async getItem(req: Request, res: Response): Promise<void> {
        try {
            const item = await prisma.item.findUnique({
                where: { id: req.params.id },
                include: {
                    category: true,
                    supplier: true,
                    location: true,
                    stockMovements: true,
                }
            });
            if (!item) {
                res.status(404).json({ message: 'Item not found' });
                return;
            }
            res.json(item);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching item', error });
        }
    },

    async updateItem(req: Request, res: Response) {
        try {
            const item = await prisma.item.update({
                where: { id: req.params.id },
                data: req.body,
                include: {
                    category: true,
                    supplier: true,
                    location: true,
                }
            });
            res.json(item);
        } catch (error) {
            res.status(400).json({ message: 'Error updating item', error });
        }
    },

    async deleteItem(req: Request, res: Response) {
        try {
            await prisma.item.delete({
                where: { id: req.params.id }
            });
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ message: 'Error deleting item', error });
        }
    },

    async recordStockMovement(req: Request, res: Response) {
        try {
            const movement = await prisma.stockMovement.create({
                data: {
                    ...req.body,
                    createdBy: req.body.createdBy || 'system' // TODO: Get from authenticated user
                },
                include: {
                    item: true,
                    location: true,
                    user: true,
                }
            });
            res.status(201).json(movement);
        } catch (error) {
            res.status(400).json({ message: 'Error recording stock movement', error });
        }
    },

    async getStockLevels(_req: Request, res: Response) {
        try {
            const stockLevels = await prisma.item.findMany({
                select: {
                    id: true,
                    name: true,
                    currentStock: true,
                    minStockLevel: true,
                    maxStockLevel: true,
                    reorderPoint: true,
                    category: {
                        select: {
                            name: true
                        }
                    },
                    location: {
                        select: {
                            name: true
                        }
                    }
                },
                where: {
                    isActive: true
                }
            });
            res.json(stockLevels);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching stock levels', error });
        }
    },

    async getStockHistory(_req: Request, res: Response) {
        try {
            const history = await prisma.stockMovement.findMany({
                include: {
                    item: {
                        select: {
                            name: true,
                            unit: true
                        }
                    },
                    location: {
                        select: {
                            name: true
                        }
                    },
                    user: {
                        select: {
                            firstName: true,
                            lastName: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 100 // Limit to recent 100 movements
            });
            res.json(history);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching stock history', error });
        }
    },

    // Location Controllers
    async getAllLocations(_req: Request, res: Response) {
        try {
            const locations = await prisma.location.findMany({
                include: {
                    restaurant: {
                        select: {
                            name: true
                        }
                    },
                    _count: {
                        select: {
                            items: true
                        }
                    }
                }
            });
            res.json(locations);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching locations', error });
        }
    },

    async createLocation(req: Request, res: Response) {
        try {
            const location = await prisma.location.create({
                data: req.body,
                include: {
                    restaurant: {
                        select: {
                            name: true
                        }
                    }
                }
            });
            res.status(201).json(location);
        } catch (error) {
            res.status(400).json({ message: 'Error creating location', error });
        }
    },

    async updateLocation(req: Request, res: Response) {
        try {
            const location = await prisma.location.update({
                where: { id: req.params.id },
                data: req.body,
                include: {
                    restaurant: {
                        select: {
                            name: true
                        }
                    }
                }
            });
            res.json(location);
        } catch (error) {
            res.status(400).json({ message: 'Error updating location', error });
        }
    },

    async deleteLocation(req: Request, res: Response) {
        try {
            await prisma.location.delete({
                where: { id: req.params.id }
            });
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ message: 'Error deleting location', error });
        }
    },

    // Category Controllers
    async getAllCategories(_req: Request, res: Response) {
        try {
            const categories = await prisma.category.findMany({
                include: {
                    _count: {
                        select: {
                            items: true
                        }
                    }
                }
            });
            res.json(categories);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching categories', error });
        }
    },

    async createCategory(req: Request, res: Response) {
        try {
            const category = await prisma.category.create({
                data: req.body
            });
            res.status(201).json(category);
        } catch (error) {
            res.status(400).json({ message: 'Error creating category', error });
        }
    }
};
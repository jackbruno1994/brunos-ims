import { Request, Response } from 'express';
import { db, safeDatabaseOperation, NotFoundError, ValidationError } from '../database';
import { CreateItemRequest, UpdateItemRequest, ItemQueryParams } from '../database/types';

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

export const inventoryController = {
  // Item Controllers
  async getAllItems(req: Request, res: Response) {
    try {
      const { categoryId, active, search, page = 1, limit = 50 } = req.query as any;
      
      const where: any = {};
      if (categoryId) where.categoryId = categoryId;
      if (active !== undefined) where.active = active === 'true';
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const result = await safeDatabaseOperation(async () => {
        const [items, total] = await Promise.all([
          db.getPrismaClient().item.findMany({
            where,
            include: {
              category: true,
              conversions: true,
            },
            skip,
            take: parseInt(limit),
            orderBy: { name: 'asc' },
          }),
          db.getPrismaClient().item.count({ where }),
        ]);

        return {
          data: items,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
            hasNext: skip + parseInt(limit) < total,
            hasPrev: parseInt(page) > 1,
          },
        };
      });

      if (!result.success) {
        return res.status(500).json({ message: 'Error fetching items', error: result.error?.message });
      }

      res.json(result.data);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching items', error });
    }
  },

  async createItem(req: Request, res: Response) {
    try {
      const itemData: CreateItemRequest = req.body;
      
      const result = await safeDatabaseOperation(async () => {
        return await db.getPrismaClient().item.create({
          data: itemData,
          include: {
            category: true,
            conversions: true,
          },
        });
      });

      if (!result.success) {
        return res.status(400).json({ message: 'Error creating item', error: result.error?.message });
      }

      res.status(201).json(result.data);
    } catch (error) {
      res.status(400).json({ message: 'Error creating item', error });
    }
  },

  async getItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const result = await safeDatabaseOperation(async () => {
        const item = await db.getPrismaClient().item.findUnique({
          where: { id },
          include: {
            category: true,
            conversions: true,
            stockMoves: {
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
          },
        });

        if (!item) {
          throw new NotFoundError('Item', id);
        }

        return item;
      });

      if (!result.success) {
        return res.status(result.error?.code === 'NOT_FOUND' ? 404 : 500)
          .json({ message: result.error?.message });
      }

      res.json(result.data);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching item', error });
    }
  },

  async updateItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: UpdateItemRequest = req.body;
      
      const result = await safeDatabaseOperation(async () => {
        return await db.getPrismaClient().item.update({
          where: { id },
          data: updateData,
          include: {
            category: true,
            conversions: true,
          },
        });
      });

      if (!result.success) {
        return res.status(result.error?.code === 'NOT_FOUND' ? 404 : 400)
          .json({ message: result.error?.message });
      }

      res.json(result.data);
    } catch (error) {
      res.status(500).json({ message: 'Error updating item', error });
    }
  },

  async deleteItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const result = await safeDatabaseOperation(async () => {
        // Soft delete by setting active to false
        return await db.getPrismaClient().item.update({
          where: { id },
          data: { active: false },
        });
      });

      if (!result.success) {
        return res.status(result.error?.code === 'NOT_FOUND' ? 404 : 400)
          .json({ message: result.error?.message });
      }

      res.json({ message: 'Item deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting item', error });
    }
  },

  // Stock Movement Controllers
  async recordStockMovement(req: AuthenticatedRequest, res: Response) {
    try {
      const movementData = {
        ...req.body,
        userId: req.user?.id,
      };
      
      const result = await safeDatabaseOperation(async () => {
        return await db.getPrismaClient().stockMovement.create({
          data: movementData,
          include: {
            item: true,
            sourceLocation: true,
            destLocation: true,
          },
        });
      });

      if (!result.success) {
        return res.status(400).json({ message: 'Error recording stock movement', error: result.error?.message });
      }

      res.status(201).json(result.data);
    } catch (error) {
      res.status(400).json({ message: 'Error recording stock movement', error });
    }
  },

  async getStockLevels(req: Request, res: Response) {
    try {
      const result = await safeDatabaseOperation(async () => {
        const stockLevels = await db.getPrismaClient().$queryRaw`
          SELECT 
            i.id as "itemId",
            i.name as "itemName",
            i."baseUom",
            COALESCE(SUM(sm."qtyBase"), 0) as "currentStock"
          FROM items i
          LEFT JOIN stock_moves sm ON i.id = sm."itemId"
          WHERE i.active = true
          GROUP BY i.id, i.name, i."baseUom"
          ORDER BY i.name
        `;
        
        return stockLevels;
      });

      if (!result.success) {
        return res.status(500).json({ message: 'Error calculating stock levels', error: result.error?.message });
      }

      res.json(result.data);
    } catch (error) {
      res.status(500).json({ message: 'Error calculating stock levels', error });
    }
  },

  async getStockHistory(req: Request, res: Response) {
    try {
      const { itemId, startDate, endDate, page = 1, limit = 50 } = req.query as any;
      
      const where: any = {};
      if (itemId) where.itemId = itemId;
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const result = await safeDatabaseOperation(async () => {
        const [movements, total] = await Promise.all([
          db.getPrismaClient().stockMovement.findMany({
            where,
            include: {
              item: true,
              sourceLocation: true,
              destLocation: true,
            },
            skip,
            take: parseInt(limit),
            orderBy: { createdAt: 'desc' },
          }),
          db.getPrismaClient().stockMovement.count({ where }),
        ]);

        return {
          data: movements,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
            hasNext: skip + parseInt(limit) < total,
            hasPrev: parseInt(page) > 1,
          },
        };
      });

      if (!result.success) {
        return res.status(500).json({ message: 'Error fetching stock history', error: result.error?.message });
      }

      res.json(result.data);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching stock history', error });
    }
  },

  // Location Controllers
  async getAllLocations(req: Request, res: Response) {
    try {
      const result = await safeDatabaseOperation(async () => {
        return await db.getPrismaClient().location.findMany({
          where: { active: true },
          orderBy: { name: 'asc' },
        });
      });

      if (!result.success) {
        return res.status(500).json({ message: 'Error fetching locations', error: result.error?.message });
      }

      res.json(result.data);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching locations', error });
    }
  },

  async createLocation(req: Request, res: Response) {
    try {
      const result = await safeDatabaseOperation(async () => {
        return await db.getPrismaClient().location.create({
          data: req.body,
        });
      });

      if (!result.success) {
        return res.status(400).json({ message: 'Error creating location', error: result.error?.message });
      }

      res.status(201).json(result.data);
    } catch (error) {
      res.status(400).json({ message: 'Error creating location', error });
    }
  },

  async updateLocation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const result = await safeDatabaseOperation(async () => {
        return await db.getPrismaClient().location.update({
          where: { id },
          data: req.body,
        });
      });

      if (!result.success) {
        return res.status(result.error?.code === 'NOT_FOUND' ? 404 : 400)
          .json({ message: result.error?.message });
      }

      res.json(result.data);
    } catch (error) {
      res.status(500).json({ message: 'Error updating location', error });
    }
  },

  async deleteLocation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const result = await safeDatabaseOperation(async () => {
        return await db.getPrismaClient().location.update({
          where: { id },
          data: { active: false },
        });
      });

      if (!result.success) {
        return res.status(result.error?.code === 'NOT_FOUND' ? 404 : 400)
          .json({ message: result.error?.message });
      }

      res.json({ message: 'Location deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting location', error });
    }
  },

  // Category Controllers
  async getAllCategories(req: Request, res: Response) {
    try {
      const result = await safeDatabaseOperation(async () => {
        return await db.getPrismaClient().category.findMany({
          where: { active: true },
          include: {
            _count: {
              select: { items: true },
            },
          },
          orderBy: { name: 'asc' },
        });
      });

      if (!result.success) {
        return res.status(500).json({ message: 'Error fetching categories', error: result.error?.message });
      }

      res.json(result.data);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching categories', error });
    }
  },
};
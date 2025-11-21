import { Request, Response } from 'express';
import { AuditLogService } from '../models/AuditLog';

export const auditController = {
    async getAuditLogs(req: Request, res: Response) {
        try {
            const { 
                page = 1, 
                limit = 50, 
                action, 
                entityType, 
                entityId,
                userId,
                startDate,
                endDate 
            } = req.query;
            
            const skip = (Number(page) - 1) * Number(limit);
            
            const where: any = {};
            if (action) {
                where.action = action;
            }
            if (entityType) {
                where.entityType = entityType;
            }
            if (entityId) {
                where.entityId = entityId as string;
            }
            if (userId) {
                where.createdById = userId as string;
            }
            if (startDate || endDate) {
                where.createdAt = {};
                if (startDate) {
                    where.createdAt.gte = new Date(startDate as string);
                }
                if (endDate) {
                    where.createdAt.lte = new Date(endDate as string);
                }
            }

            const [auditLogs, total] = await Promise.all([
                AuditLogService.findMany(
                    where, 
                    { createdAt: 'desc' }, 
                    Number(limit), 
                    skip
                ),
                AuditLogService.count(where),
            ]);

            res.json({
                auditLogs,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit)),
                },
                filters: {
                    action,
                    entityType,
                    entityId,
                    userId,
                    startDate,
                    endDate,
                },
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching audit logs', error });
        }
    },

    async getAuditSummary(req: Request, res: Response) {
        try {
            const { days = 30 } = req.query;
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - Number(days));

            // In a real implementation, we'd use aggregation queries
            // For now, we'll return a simple summary structure
            const summary = {
                totalActions: 0,
                actionBreakdown: {
                    CREATE: 0,
                    UPDATE: 0,
                    DELETE: 0,
                    LOGIN: 0,
                    LOGOUT: 0,
                    STOCK_MOVEMENT: 0,
                    ORDER_STATUS_CHANGE: 0,
                },
                entityBreakdown: {
                    User: 0,
                    Item: 0,
                    Order: 0,
                    StockMovement: 0,
                    Supplier: 0,
                    Category: 0,
                    Location: 0,
                },
                topUsers: [],
                dateRange: {
                    start: startDate.toISOString(),
                    end: new Date().toISOString(),
                },
            };

            res.json(summary);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching audit summary', error });
        }
    },

    async getUserActivity(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const { page = 1, limit = 20, days = 30 } = req.query;
            
            const skip = (Number(page) - 1) * Number(limit);
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - Number(days));

            const where = {
                createdById: userId,
                createdAt: {
                    gte: startDate,
                },
            };

            const [activities, total] = await Promise.all([
                AuditLogService.findMany(
                    where,
                    { createdAt: 'desc' },
                    Number(limit),
                    skip
                ),
                AuditLogService.count(where),
            ]);

            res.json({
                activities,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit)),
                },
                dateRange: {
                    start: startDate.toISOString(),
                    end: new Date().toISOString(),
                },
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user activity', error });
        }
    },

    async getEntityHistory(req: Request, res: Response) {
        try {
            const { entityType, entityId } = req.params;
            const { page = 1, limit = 20 } = req.query;
            
            const skip = (Number(page) - 1) * Number(limit);

            const where = {
                entityType,
                entityId,
            };

            const [history, total] = await Promise.all([
                AuditLogService.findMany(
                    where,
                    { createdAt: 'desc' },
                    Number(limit),
                    skip
                ),
                AuditLogService.count(where),
            ]);

            res.json({
                history,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit)),
                },
                entity: {
                    type: entityType,
                    id: entityId,
                },
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching entity history', error });
        }
    },
};
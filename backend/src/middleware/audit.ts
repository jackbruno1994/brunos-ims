import { Request, Response, NextFunction } from 'express';
import { AuditLogService } from '../models/AuditLog';

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

// Middleware to automatically log certain actions
export const auditLogger = (entityType: string, action?: string) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        // Store original methods
        const originalJson = res.json;

        // Override res.json to capture response data
        res.json = function(data: any) {
            // Only log successful operations (2xx status codes)
            if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
                const logAction = action || mapMethodToAction(req.method);
                const entityId = req.params.id || data?.id;

                // Log the action asynchronously (don't block response)
                setImmediate(async () => {
                    try {
                        if (logAction === 'CREATE' && data) {
                            await AuditLogService.logCreate(
                                entityType,
                                entityId,
                                data,
                                req.user!.id,
                                req
                            );
                        } else if (logAction === 'UPDATE' && data) {
                            await AuditLogService.logUpdate(
                                entityType,
                                entityId,
                                null, // Would need to capture old values in real implementation
                                data,
                                req.user!.id,
                                req
                            );
                        } else if (logAction === 'DELETE') {
                            await AuditLogService.logDelete(
                                entityType,
                                entityId,
                                null, // Would need to capture old values in real implementation
                                req.user!.id,
                                req
                            );
                        }
                    } catch (error) {
                        console.error('Audit logging error:', error);
                    }
                });
            }

            // Call original method
            return originalJson.call(this, data);
        };

        next();
    };
};

// Map HTTP methods to audit actions
function mapMethodToAction(method: string): string {
    switch (method.toUpperCase()) {
        case 'POST':
            return 'CREATE';
        case 'PUT':
        case 'PATCH':
            return 'UPDATE';
        case 'DELETE':
            return 'DELETE';
        default:
            return 'READ';
    }
}

// Specialized audit loggers for specific actions
export const auditStockMovement = async (
    req: AuthenticatedRequest,
    movementData: any
) => {
    if (req.user) {
        try {
            await AuditLogService.logStockMovement(
                movementData.itemId,
                movementData,
                req.user.id,
                req
            );
        } catch (error) {
            console.error('Stock movement audit logging error:', error);
        }
    }
};

export const auditOrderStatusChange = async (
    req: AuthenticatedRequest,
    orderId: string,
    oldStatus: string,
    newStatus: string
) => {
    if (req.user) {
        try {
            await AuditLogService.logOrderStatusChange(
                orderId,
                oldStatus,
                newStatus,
                req.user.id,
                req
            );
        } catch (error) {
            console.error('Order status change audit logging error:', error);
        }
    }
};

export const auditLogin = async (
    req: Request,
    userId: string
) => {
    try {
        await AuditLogService.logLogin(userId, req);
    } catch (error) {
        console.error('Login audit logging error:', error);
    }
};
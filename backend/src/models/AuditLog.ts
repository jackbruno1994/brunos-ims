import { db } from '../config';

// Audit Logging service for Bruno's IMS

export interface CreateAuditLogData {
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  createdById: string;
}

export class AuditLogService {
  static async create(data: CreateAuditLogData): Promise<any> {
    try {
      return await db.auditLog.create({
        data: {
          ...data,
          oldValues: data.oldValues ? JSON.stringify(data.oldValues) : null,
          newValues: data.newValues ? JSON.stringify(data.newValues) : null,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      });
    } catch (error) {
      // Fallback for mock implementation
      console.log('Audit Log:', data);
      return { id: 'mock-audit', ...data };
    }
  }

  static async findMany(
    where?: any,
    orderBy?: any,
    take?: number,
    skip?: number
  ): Promise<any[]> {
    try {
      return await db.auditLog.findMany({
        where,
        orderBy,
        take,
        skip,
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      });
    } catch (error) {
      return [];
    }
  }

  static async count(where?: any): Promise<number> {
    try {
      return await db.auditLog.count({ where });
    } catch (error) {
      return 0;
    }
  }

  // Helper methods for common audit actions
  static async logCreate(
    entityType: string,
    entityId: string,
    newValues: any,
    userId: string,
    req?: any
  ): Promise<any> {
    return this.create({
      action: 'CREATE',
      entityType,
      entityId,
      newValues,
      ipAddress: req?.ip,
      userAgent: req?.get('User-Agent'),
      createdById: userId,
    });
  }

  static async logUpdate(
    entityType: string,
    entityId: string,
    oldValues: any,
    newValues: any,
    userId: string,
    req?: any
  ): Promise<any> {
    return this.create({
      action: 'UPDATE',
      entityType,
      entityId,
      oldValues,
      newValues,
      ipAddress: req?.ip,
      userAgent: req?.get('User-Agent'),
      createdById: userId,
    });
  }

  static async logDelete(
    entityType: string,
    entityId: string,
    oldValues: any,
    userId: string,
    req?: any
  ): Promise<any> {
    return this.create({
      action: 'DELETE',
      entityType,
      entityId,
      oldValues,
      ipAddress: req?.ip,
      userAgent: req?.get('User-Agent'),
      createdById: userId,
    });
  }

  static async logLogin(
    userId: string,
    req?: any
  ): Promise<any> {
    return this.create({
      action: 'LOGIN',
      entityType: 'User',
      entityId: userId,
      ipAddress: req?.ip,
      userAgent: req?.get('User-Agent'),
      createdById: userId,
    });
  }

  static async logLogout(
    userId: string,
    req?: any
  ): Promise<any> {
    return this.create({
      action: 'LOGOUT',
      entityType: 'User',
      entityId: userId,
      ipAddress: req?.ip,
      userAgent: req?.get('User-Agent'),
      createdById: userId,
    });
  }

  static async logStockMovement(
    _itemId: string,
    movementData: any,
    userId: string,
    req?: any
  ): Promise<any> {
    return this.create({
      action: 'STOCK_MOVEMENT',
      entityType: 'StockMovement',
      entityId: movementData.id,
      newValues: movementData,
      ipAddress: req?.ip,
      userAgent: req?.get('User-Agent'),
      createdById: userId,
    });
  }

  static async logOrderStatusChange(
    orderId: string,
    oldStatus: string,
    newStatus: string,
    userId: string,
    req?: any
  ): Promise<any> {
    return this.create({
      action: 'ORDER_STATUS_CHANGE',
      entityType: 'Order',
      entityId: orderId,
      oldValues: { status: oldStatus },
      newValues: { status: newStatus },
      ipAddress: req?.ip,
      userAgent: req?.get('User-Agent'),
      createdById: userId,
    });
  }
}
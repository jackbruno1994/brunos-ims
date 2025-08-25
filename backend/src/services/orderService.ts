import { Order, OrderStatus, OrderPriority, OrderItem, OrderMetrics, QueueItem } from '../models';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';

export class OrderService extends EventEmitter {
  private orders: Map<string, Order> = new Map();
  private orderMetrics: Map<string, OrderMetrics> = new Map();
  private orderQueue: QueueItem[] = [];

  constructor() {
    super();
  }

  async createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const order: Order = {
      ...orderData,
      id: uuidv4(),
      orderNumber: this.generateOrderNumber(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.orders.set(order.id, order);
    
    // Add to queue for processing
    await this.addToQueue(order);
    
    // Emit real-time event
    this.emit('orderCreated', order);
    
    return order;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error(`Order with ID ${orderId} not found`);
    }

    const previousStatus = order.status;
    order.status = status;
    order.updatedAt = new Date();

    if (status === OrderStatus.DELIVERED || status === OrderStatus.CANCELLED) {
      order.completedAt = new Date();
      this.removeFromQueue(orderId);
    }

    this.orders.set(orderId, order);
    
    // Record metrics
    await this.recordOrderMetrics(order, previousStatus);
    
    // Emit real-time event
    this.emit('orderStatusUpdated', { orderId, status, previousStatus });
    
    return order;
  }

  async getOrder(orderId: string): Promise<Order | null> {
    return this.orders.get(orderId) || null;
  }

  async getOrdersByRestaurant(restaurantId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.restaurantId === restaurantId);
  }

  async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.status === status);
  }

  async getOrderQueue(restaurantId?: string): Promise<QueueItem[]> {
    if (restaurantId) {
      const restaurantOrders = await this.getOrdersByRestaurant(restaurantId);
      const restaurantOrderIds = new Set(restaurantOrders.map(o => o.id));
      return this.orderQueue.filter(item => restaurantOrderIds.has(item.orderId));
    }
    return [...this.orderQueue];
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `ORD-${timestamp}-${random}`.toUpperCase();
  }

  private async addToQueue(order: Order): Promise<void> {
    const queueItem: QueueItem = {
      orderId: order.id,
      priority: order.priority,
      estimatedTime: order.estimatedPrepTime,
      dependencies: [],
      resourceRequirements: this.calculateResourceRequirements(order),
      queuedAt: new Date()
    };

    // Insert based on priority
    const insertIndex = this.findQueueInsertIndex(queueItem);
    this.orderQueue.splice(insertIndex, 0, queueItem);
    
    this.emit('orderQueued', queueItem);
  }

  private removeFromQueue(orderId: string): void {
    const index = this.orderQueue.findIndex(item => item.orderId === orderId);
    if (index !== -1) {
      this.orderQueue.splice(index, 1);
      this.emit('orderRemovedFromQueue', orderId);
    }
  }

  private findQueueInsertIndex(queueItem: QueueItem): number {
    const priorityWeights = {
      [OrderPriority.LOW]: 1,
      [OrderPriority.NORMAL]: 2,
      [OrderPriority.HIGH]: 3,
      [OrderPriority.URGENT]: 4
    };

    for (let i = 0; i < this.orderQueue.length; i++) {
      if (priorityWeights[queueItem.priority] > priorityWeights[this.orderQueue[i].priority]) {
        return i;
      }
    }
    return this.orderQueue.length;
  }

  private calculateResourceRequirements(order: Order): any[] {
    // Simplified resource calculation
    const baseStaffRequirement = Math.ceil(order.items.length / 3);
    const estimatedCookTime = order.estimatedPrepTime;
    
    return [
      {
        type: 'staff',
        resourceId: 'kitchen-staff',
        quantity: baseStaffRequirement,
        duration: estimatedCookTime
      }
    ];
  }

  private async recordOrderMetrics(order: Order, previousStatus: OrderStatus): Promise<void> {
    const metrics: OrderMetrics = {
      id: uuidv4(),
      orderId: order.id,
      restaurantId: order.restaurantId,
      processedAt: new Date(),
      preparationTime: order.actualPrepTime || order.estimatedPrepTime,
      queueWaitTime: this.calculateQueueWaitTime(order),
      totalProcessingTime: this.calculateTotalProcessingTime(order),
      kitchenLoad: this.getCurrentKitchenLoad(order.restaurantId),
      staffCount: 5, // This would come from restaurant data
      orderComplexity: this.calculateOrderComplexity(order)
    };

    this.orderMetrics.set(metrics.id, metrics);
    this.emit('metricsRecorded', metrics);
  }

  private calculateQueueWaitTime(order: Order): number {
    const queueItem = this.orderQueue.find(item => item.orderId === order.id);
    if (queueItem) {
      return Math.floor((Date.now() - queueItem.queuedAt.getTime()) / (1000 * 60));
    }
    return 0;
  }

  private calculateTotalProcessingTime(order: Order): number {
    if (order.completedAt) {
      return Math.floor((order.completedAt.getTime() - order.createdAt.getTime()) / (1000 * 60));
    }
    return 0;
  }

  private getCurrentKitchenLoad(restaurantId: string): number {
    const activeOrders = Array.from(this.orders.values()).filter(
      order => order.restaurantId === restaurantId && 
      [OrderStatus.CONFIRMED, OrderStatus.PREPARING].includes(order.status)
    );
    // Simplified load calculation: assume 10 concurrent orders = 100% load
    return Math.min(100, (activeOrders.length / 10) * 100);
  }

  private calculateOrderComplexity(order: Order): number {
    let complexity = order.items.length;
    order.items.forEach(item => {
      if (item.modifiers) {
        complexity += item.modifiers.length * 0.5;
      }
      if (item.specialInstructions) {
        complexity += 1;
      }
    });
    return Math.round(complexity * 10) / 10;
  }

  // Analytics methods
  async getOrderMetrics(restaurantId: string, startDate: Date, endDate: Date): Promise<OrderMetrics[]> {
    return Array.from(this.orderMetrics.values()).filter(metrics => 
      metrics.restaurantId === restaurantId &&
      metrics.processedAt >= startDate &&
      metrics.processedAt <= endDate
    );
  }

  async getAverageProcessingTime(restaurantId: string, days: number = 7): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentMetrics = Array.from(this.orderMetrics.values()).filter(metrics =>
      metrics.restaurantId === restaurantId &&
      metrics.processedAt >= cutoffDate
    );

    if (recentMetrics.length === 0) return 0;

    const totalTime = recentMetrics.reduce((sum, metrics) => sum + metrics.totalProcessingTime, 0);
    return Math.round((totalTime / recentMetrics.length) * 100) / 100;
  }

  async getOrderVolumeAnalytics(restaurantId: string, days: number = 7): Promise<any> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentOrders = Array.from(this.orders.values()).filter(order =>
      order.restaurantId === restaurantId &&
      order.createdAt >= cutoffDate
    );

    const analytics = {
      totalOrders: recentOrders.length,
      averageOrderValue: 0,
      peakHours: [] as string[],
      mostPopularItems: [] as string[],
      hourlyDistribution: {} as Record<string, number>
    };

    if (recentOrders.length > 0) {
      analytics.averageOrderValue = recentOrders.reduce((sum, order) => sum + order.totalAmount, 0) / recentOrders.length;
      
      // Calculate hourly distribution
      recentOrders.forEach(order => {
        const hour = order.createdAt.getHours().toString().padStart(2, '0') + ':00';
        analytics.hourlyDistribution[hour] = (analytics.hourlyDistribution[hour] || 0) + 1;
      });

      // Find peak hours (top 3)
      analytics.peakHours = Object.entries(analytics.hourlyDistribution)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([hour]) => hour);
    }

    return analytics;
  }
}

// Singleton instance
export const orderService = new OrderService();
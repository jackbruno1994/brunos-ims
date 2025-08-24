import { Order, OrderItem } from '../models';

export interface BatchProcessor {
  id: string;
  restaurantId: string;
  orders: Order[];
  status: 'queued' | 'processing' | 'completed' | 'failed';
  priority: number;
  estimatedTime: number;
  startTime?: Date;
  endTime?: Date;
  assignedStaff: string[];
}

export class OrderProcessingService {
  private static batchQueues = new Map<string, BatchProcessor[]>();
  private static processingBatches = new Map<string, BatchProcessor>();

  /**
   * Add order to batch processing queue
   */
  static async addOrderToBatch(order: Order): Promise<void> {
    const restaurantId = order.restaurantId;
    
    if (!this.batchQueues.has(restaurantId)) {
      this.batchQueues.set(restaurantId, []);
    }

    // Try to find compatible batch
    const compatibleBatch = this.findCompatibleBatch(order);
    
    if (compatibleBatch) {
      compatibleBatch.orders.push(order);
      compatibleBatch.estimatedTime = this.calculateBatchTime(compatibleBatch.orders);
      compatibleBatch.priority = this.calculateBatchPriority(compatibleBatch.orders);
    } else {
      // Create new batch
      const newBatch: BatchProcessor = {
        id: this.generateId(),
        restaurantId,
        orders: [order],
        status: 'queued',
        priority: this.getOrderPriority(order),
        estimatedTime: order.estimatedTime,
        assignedStaff: []
      };
      
      this.batchQueues.get(restaurantId)!.push(newBatch);
    }

    // Sort batches by priority and estimated time
    this.sortBatchQueue(restaurantId);
  }

  /**
   * Process next batch in queue
   */
  static async processNextBatch(restaurantId: string): Promise<BatchProcessor | null> {
    const queue = this.batchQueues.get(restaurantId);
    if (!queue || queue.length === 0) {
      return null;
    }

    const batch = queue.shift()!;
    batch.status = 'processing';
    batch.startTime = new Date();
    
    this.processingBatches.set(batch.id, batch);

    // Assign staff based on workload and skills
    batch.assignedStaff = await this.assignOptimalStaff(batch);

    // Update order statuses
    for (const order of batch.orders) {
      order.status = 'in_progress';
    }

    return batch;
  }

  /**
   * Complete batch processing
   */
  static async completeBatch(batchId: string): Promise<void> {
    const batch = this.processingBatches.get(batchId);
    if (!batch) {
      throw new Error('Batch not found');
    }

    batch.status = 'completed';
    batch.endTime = new Date();

    // Update order statuses
    for (const order of batch.orders) {
      order.status = 'completed';
      order.actualTime = Math.ceil((batch.endTime!.getTime() - batch.startTime!.getTime()) / 60000);
    }

    this.processingBatches.delete(batchId);
  }

  /**
   * Get queue status for restaurant
   */
  static getQueueStatus(restaurantId: string): {
    queuedBatches: number;
    processingBatches: number;
    estimatedWaitTime: number;
  } {
    const queue = this.batchQueues.get(restaurantId) || [];
    const processing = Array.from(this.processingBatches.values())
      .filter(batch => batch.restaurantId === restaurantId);

    const estimatedWaitTime = queue.reduce((total, batch) => total + batch.estimatedTime, 0);

    return {
      queuedBatches: queue.length,
      processingBatches: processing.length,
      estimatedWaitTime
    };
  }

  /**
   * Smart queuing based on order characteristics
   */
  static async optimizeQueue(restaurantId: string): Promise<void> {
    const queue = this.batchQueues.get(restaurantId);
    if (!queue) return;

    // Group orders by similar characteristics
    const grouped = this.groupOrdersByCharacteristics(queue);
    
    // Re-create optimized batches
    const optimizedBatches: BatchProcessor[] = [];
    
    for (const group of grouped) {
      const batch: BatchProcessor = {
        id: this.generateId(),
        restaurantId,
        orders: group,
        status: 'queued',
        priority: this.calculateBatchPriority(group),
        estimatedTime: this.calculateBatchTime(group),
        assignedStaff: []
      };
      optimizedBatches.push(batch);
    }

    this.batchQueues.set(restaurantId, optimizedBatches);
    this.sortBatchQueue(restaurantId);
  }

  /**
   * Find compatible batch for order
   */
  private static findCompatibleBatch(order: Order): BatchProcessor | null {
    const queue = this.batchQueues.get(order.restaurantId);
    if (!queue) return null;

    return queue.find(batch => 
      batch.status === 'queued' &&
      batch.orders.length < 10 && // max batch size
      this.areOrdersCompatible(order, batch.orders[0])
    ) || null;
  }

  /**
   * Check if orders are compatible for batching
   */
  private static areOrdersCompatible(order1: Order, order2: Order): boolean {
    // Orders are compatible if they have similar:
    // 1. Order type
    // 2. Priority level
    // 3. Similar menu items
    
    if (order1.orderType !== order2.orderType) return false;
    
    const priorityMap = { low: 1, normal: 2, high: 3, urgent: 4 };
    const priority1 = priorityMap[order1.priority];
    const priority2 = priorityMap[order2.priority];
    
    return Math.abs(priority1 - priority2) <= 1;
  }

  /**
   * Calculate batch processing time
   */
  private static calculateBatchTime(orders: Order[]): number {
    // Batch processing can reduce total time through parallelization
    const totalTime = orders.reduce((sum, order) => sum + order.estimatedTime, 0);
    const batchEfficiency = Math.min(0.8, 1 - (orders.length - 1) * 0.1); // 10% efficiency gain per order, max 80%
    return Math.ceil(totalTime * batchEfficiency);
  }

  /**
   * Calculate batch priority
   */
  private static calculateBatchPriority(orders: Order[]): number {
    const priorityMap = { low: 1, normal: 2, high: 3, urgent: 4 };
    const maxPriority = Math.max(...orders.map(order => priorityMap[order.priority]));
    const avgPriority = orders.reduce((sum, order) => sum + priorityMap[order.priority], 0) / orders.length;
    
    return Math.ceil(maxPriority * 0.7 + avgPriority * 0.3);
  }

  /**
   * Get order priority as number
   */
  private static getOrderPriority(order: Order): number {
    const priorityMap = { low: 1, normal: 2, high: 3, urgent: 4 };
    return priorityMap[order.priority];
  }

  /**
   * Sort batch queue by priority and estimated time
   */
  private static sortBatchQueue(restaurantId: string): void {
    const queue = this.batchQueues.get(restaurantId);
    if (!queue) return;

    queue.sort((a, b) => {
      // First by priority (higher first)
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      // Then by estimated time (shorter first)
      return a.estimatedTime - b.estimatedTime;
    });
  }

  /**
   * Group orders by similar characteristics for optimization
   */
  private static groupOrdersByCharacteristics(batches: BatchProcessor[]): Order[][] {
    const allOrders = batches.flatMap(batch => batch.orders);
    const groups: Order[][] = [];
    
    // Group by order type and priority
    const groupMap = new Map<string, Order[]>();
    
    for (const order of allOrders) {
      const key = `${order.orderType}-${order.priority}`;
      if (!groupMap.has(key)) {
        groupMap.set(key, []);
      }
      groupMap.get(key)!.push(order);
    }

    // Split large groups into smaller batches
    for (const group of groupMap.values()) {
      while (group.length > 0) {
        groups.push(group.splice(0, 8)); // max 8 orders per batch
      }
    }

    return groups;
  }

  /**
   * Assign optimal staff to batch
   */
  private static async assignOptimalStaff(batch: BatchProcessor): Promise<string[]> {
    // TODO: Implement staff assignment algorithm based on:
    // - Current workload
    // - Skills/specializations
    // - Shift schedules
    // - Performance metrics
    
    return []; // Placeholder
  }

  private static generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
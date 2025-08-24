import { Order, OrderItem, MenuItem, Customer, OrderStatus, OrderHistory, OrderAudit } from '../models';

export class OrderService {
  // In-memory storage for demonstration (would be replaced with database)
  private static orders: Order[] = [];
  private static orderHistory: OrderHistory[] = [];
  private static orderAudit: OrderAudit[] = [];
  private static customers: Customer[] = [];
  private static menuItems: MenuItem[] = [];

  // Generate unique order number
  private static generateOrderNumber(): string {
    const date = new Date();
    const timestamp = date.getTime();
    return `ORD-${timestamp.toString().slice(-8)}`;
  }

  // Validate order total against item prices
  static validateOrderTotal(items: OrderItem[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      // Validate item exists and price matches
      const menuItem = this.menuItems.find(mi => mi.id === item.menuItemId);
      if (!menuItem) {
        errors.push(`Menu item with ID ${item.menuItemId} not found`);
        continue;
      }

      if (!menuItem.availability) {
        errors.push(`Menu item "${menuItem.name}" is not available`);
        continue;
      }

      // Validate unit price matches menu item price
      if (Math.abs(item.unitPrice - menuItem.price) > 0.01) {
        errors.push(`Unit price for "${menuItem.name}" doesn't match menu price. Expected: ${menuItem.price}, Got: ${item.unitPrice}`);
      }

      // Validate total price calculation
      const expectedTotal = item.quantity * item.unitPrice;
      if (Math.abs(item.totalPrice - expectedTotal) > 0.01) {
        errors.push(`Total price for "${menuItem.name}" is incorrect. Expected: ${expectedTotal}, Got: ${item.totalPrice}`);
      }

      calculatedSubtotal += expectedTotal;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate order status transitions
  static validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): { isValid: boolean; error?: string } {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['preparing', 'cancelled'],
      'preparing': ['ready', 'cancelled'],
      'ready': ['completed', 'cancelled'],
      'completed': [], // Terminal state
      'cancelled': [] // Terminal state
    };

    const allowedTransitions = validTransitions[currentStatus];
    if (!allowedTransitions.includes(newStatus)) {
      return {
        isValid: false,
        error: `Invalid status transition from "${currentStatus}" to "${newStatus}"`
      };
    }

    return { isValid: true };
  }

  // Sanitize customer information
  static sanitizeCustomerInput(customer: Partial<Customer>): Partial<Customer> {
    const sanitized: Partial<Customer> = {};

    if (customer.firstName) {
      sanitized.firstName = customer.firstName.trim().replace(/[<>]/g, '');
    }
    if (customer.lastName) {
      sanitized.lastName = customer.lastName.trim().replace(/[<>]/g, '');
    }
    if (customer.email) {
      sanitized.email = customer.email.trim().toLowerCase();
    }
    if (customer.phone) {
      sanitized.phone = customer.phone.trim().replace(/[^\d\s\-\+\(\)]/g, '');
    }
    if (customer.address) {
      sanitized.address = customer.address.trim().replace(/[<>]/g, '');
    }

    return sanitized;
  }

  // Create a new order
  static async createOrder(orderData: Partial<Order>, createdBy: string): Promise<{ success: boolean; data?: Order; errors?: string[] }> {
    try {
      // Validate required fields
      if (!orderData.customerId || !orderData.restaurantId || !orderData.items || orderData.items.length === 0) {
        return {
          success: false,
          errors: ['Customer ID, Restaurant ID, and at least one item are required']
        };
      }

      // Validate order total
      const totalValidation = this.validateOrderTotal(orderData.items);
      if (!totalValidation.isValid) {
        return {
          success: false,
          errors: totalValidation.errors
        };
      }

      // Calculate totals
      const subtotal = orderData.items.reduce((sum, item) => sum + item.totalPrice, 0);
      const tax = subtotal * 0.1; // 10% tax rate
      const total = subtotal + tax;

      const order: Order = {
        id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        orderNumber: this.generateOrderNumber(),
        customerId: orderData.customerId,
        restaurantId: orderData.restaurantId,
        items: orderData.items,
        subtotal,
        tax,
        total,
        currency: orderData.currency || 'USD',
        status: 'pending',
        orderType: orderData.orderType || 'dine-in',
        specialInstructions: orderData.specialInstructions,
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Store order
      this.orders.push(order);

      // Create audit record
      await this.createAuditRecord(order.id, 'created', null, order, createdBy);

      // Create initial history record
      await this.createHistoryRecord(order.id, 'pending', undefined, createdBy, 'Order created');

      return {
        success: true,
        data: order
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      };
    }
  }

  // Update order status
  static async updateOrderStatus(orderId: string, newStatus: OrderStatus, updatedBy: string, notes?: string): Promise<{ success: boolean; data?: Order; errors?: string[] }> {
    try {
      const order = this.orders.find(o => o.id === orderId);
      if (!order) {
        return {
          success: false,
          errors: ['Order not found']
        };
      }

      // Validate status transition
      const transition = this.validateStatusTransition(order.status, newStatus);
      if (!transition.isValid) {
        return {
          success: false,
          errors: [transition.error!]
        };
      }

      const oldStatus = order.status;
      const oldOrder = { ...order };

      // Update order
      order.status = newStatus;
      order.updatedAt = new Date();

      if (newStatus === 'completed' && !order.actualCompletionTime) {
        order.actualCompletionTime = new Date();
      }

      // Create audit record
      await this.createAuditRecord(orderId, 'status_changed', oldOrder, order, updatedBy);

      // Create history record
      await this.createHistoryRecord(orderId, newStatus, oldStatus, updatedBy, notes);

      return {
        success: true,
        data: order
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      };
    }
  }

  // Get all orders with optional filtering
  static async getOrders(filters?: {
    restaurantId?: string;
    customerId?: string;
    status?: OrderStatus;
    orderType?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<Order[]> {
    let filteredOrders = [...this.orders];

    if (filters) {
      if (filters.restaurantId) {
        filteredOrders = filteredOrders.filter(o => o.restaurantId === filters.restaurantId);
      }
      if (filters.customerId) {
        filteredOrders = filteredOrders.filter(o => o.customerId === filters.customerId);
      }
      if (filters.status) {
        filteredOrders = filteredOrders.filter(o => o.status === filters.status);
      }
      if (filters.orderType) {
        filteredOrders = filteredOrders.filter(o => o.orderType === filters.orderType);
      }
      if (filters.dateFrom) {
        filteredOrders = filteredOrders.filter(o => o.createdAt >= filters.dateFrom!);
      }
      if (filters.dateTo) {
        filteredOrders = filteredOrders.filter(o => o.createdAt <= filters.dateTo!);
      }
    }

    return filteredOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Get order by ID
  static async getOrderById(orderId: string): Promise<Order | null> {
    return this.orders.find(o => o.id === orderId) || null;
  }

  // Get order history
  static async getOrderHistory(orderId: string): Promise<OrderHistory[]> {
    return this.orderHistory
      .filter(h => h.orderId === orderId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Create audit record
  private static async createAuditRecord(orderId: string, action: OrderAudit['action'], oldValues: any, newValues: any, changedBy: string): Promise<void> {
    const auditRecord: OrderAudit = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      orderId,
      action,
      oldValues,
      newValues,
      changedBy,
      timestamp: new Date()
    };

    this.orderAudit.push(auditRecord);
  }

  // Create history record
  private static async createHistoryRecord(orderId: string, status: OrderStatus, previousStatus?: OrderStatus, changedBy?: string, notes?: string): Promise<void> {
    const historyRecord: OrderHistory = {
      id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      orderId,
      status,
      previousStatus,
      changedBy: changedBy || 'system',
      notes,
      timestamp: new Date()
    };

    this.orderHistory.push(historyRecord);
  }

  // Seed some sample data for testing
  static seedSampleData(): void {
    // Clear existing data
    this.orders = [];
    this.orderHistory = [];
    this.orderAudit = [];

    // Add sample menu items
    this.menuItems = [
      {
        id: 'menu_1',
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, mozzarella, and basil',
        price: 15.99,
        currency: 'USD',
        category: 'Pizza',
        restaurantId: 'rest_1',
        availability: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'menu_2',
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with Caesar dressing and croutons',
        price: 12.99,
        currency: 'USD',
        category: 'Salad',
        restaurantId: 'rest_1',
        availability: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Add sample customers
    this.customers = [
      {
        id: 'cust_1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0123',
        address: '123 Main St, City, State 12345',
        restaurantId: 'rest_1',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }
}
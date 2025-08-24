import { Order, OrderItem } from '../models';

// Mock data store - in production this would be a database
let orders: Order[] = [];
let nextOrderId = 1;

export class OrderService {
  static getAllOrders(page: number = 1, limit: number = 10): { orders: Order[], total: number } {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = orders.slice(startIndex, endIndex);
    
    return {
      orders: paginatedOrders,
      total: orders.length
    };
  }

  static getOrderById(id: string): Order | null {
    return orders.find(order => order.id === id) || null;
  }

  static createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'totalAmount'>): Order {
    // Calculate total amount
    const totalAmount = orderData.items.reduce((sum, item) => sum + item.totalPrice, 0);
    
    const newOrder: Order = {
      ...orderData,
      id: nextOrderId.toString(),
      totalAmount,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    orders.push(newOrder);
    nextOrderId++;

    return newOrder;
  }

  static updateOrder(id: string, updateData: Partial<Omit<Order, 'id' | 'createdAt'>>): Order | null {
    const orderIndex = orders.findIndex(order => order.id === id);
    
    if (orderIndex === -1) {
      return null;
    }

    // Recalculate total if items changed
    if (updateData.items) {
      updateData.totalAmount = updateData.items.reduce((sum, item) => sum + item.totalPrice, 0);
    }

    orders[orderIndex] = {
      ...orders[orderIndex],
      ...updateData,
      updatedAt: new Date()
    };

    return orders[orderIndex];
  }

  static updateOrderStatus(id: string, status: Order['status']): Order | null {
    return this.updateOrder(id, { status });
  }

  static cancelOrder(id: string): Order | null {
    return this.updateOrder(id, { status: 'cancelled' });
  }

  static deleteOrder(id: string): boolean {
    const orderIndex = orders.findIndex(order => order.id === id);
    
    if (orderIndex === -1) {
      return false;
    }

    orders.splice(orderIndex, 1);
    return true;
  }

  static validateOrderData(orderData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!orderData.customerName || orderData.customerName.trim() === '') {
      errors.push('Customer name is required');
    }

    if (!orderData.customerEmail || !this.isValidEmail(orderData.customerEmail)) {
      errors.push('Valid customer email is required');
    }

    if (!orderData.restaurantId || orderData.restaurantId.trim() === '') {
      errors.push('Restaurant ID is required');
    }

    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      errors.push('At least one order item is required');
    } else {
      orderData.items.forEach((item: any, index: number) => {
        if (!item.menuItemId || item.menuItemId.trim() === '') {
          errors.push(`Order item ${index + 1}: Menu item ID is required`);
        }
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`Order item ${index + 1}: Quantity must be greater than 0`);
        }
        if (!item.unitPrice || item.unitPrice <= 0) {
          errors.push(`Order item ${index + 1}: Unit price must be greater than 0`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
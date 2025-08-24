// Example data models/interfaces for Bruno's IMS

export interface Restaurant {
  id: string;
  name: string;
  location: string;
  country: string;
  address: string;
  phone: string;
  email: string;
  managerId: string;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  restaurantId?: string;
  country: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  restaurantId: string;
  availability: boolean;
  allergens?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  restaurantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  menuItem?: MenuItem;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: Customer;
  restaurantId: string;
  restaurant?: Restaurant;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  status: OrderStatus;
  orderType: 'dine-in' | 'takeout' | 'delivery';
  specialInstructions?: string;
  estimatedCompletionTime?: Date;
  actualCompletionTime?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  previousStatus?: OrderStatus;
  changedBy: string;
  notes?: string;
  timestamp: Date;
}

export interface OrderAudit {
  id: string;
  orderId: string;
  action: 'created' | 'updated' | 'status_changed' | 'cancelled' | 'deleted';
  oldValues?: any;
  newValues?: any;
  changedBy: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface OrderNotification {
  id: string;
  orderId: string;
  type: 'status_change' | 'order_ready' | 'order_delayed' | 'order_cancelled';
  message: string;
  recipient: string;
  channel: 'email' | 'sms' | 'push' | 'in-app';
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Date;
  createdAt: Date;
}
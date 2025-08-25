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

// Order Processing System Models

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  FAILED = 'failed'
}

export enum OrderPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum OrderType {
  DINE_IN = 'dine_in',
  TAKEAWAY = 'takeaway',
  DELIVERY = 'delivery',
  CATERING = 'catering'
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
  modifiers?: OrderModifier[];
}

export interface OrderModifier {
  id: string;
  name: string;
  price: number;
  type: 'addition' | 'substitution' | 'removal';
}

export interface Order {
  id: string;
  orderNumber: string;
  restaurantId: string;
  customerId?: string;
  customerInfo: CustomerInfo;
  type: OrderType;
  status: OrderStatus;
  priority: OrderPriority;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  totalAmount: number;
  currency: string;
  estimatedPrepTime: number; // minutes
  actualPrepTime?: number; // minutes
  scheduledDelivery?: Date;
  notes?: string;
  source: string; // 'pos', 'mobile_app', 'web', 'third_party'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface CustomerInfo {
  name: string;
  phone?: string;
  email?: string;
  address?: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Order Analytics Models

export interface OrderMetrics {
  id: string;
  orderId: string;
  restaurantId: string;
  processedAt: Date;
  preparationTime: number; // minutes
  queueWaitTime: number; // minutes
  totalProcessingTime: number; // minutes
  kitchenLoad: number; // 0-100%
  staffCount: number;
  orderComplexity: number; // calculated based on items and modifiers
  customerSatisfaction?: number; // 1-5 rating
}

export interface OrderAnalytics {
  date: Date;
  restaurantId: string;
  totalOrders: number;
  averageProcessingTime: number;
  averageOrderValue: number;
  peakHours: string[];
  mostPopularItems: string[];
  customerSatisfactionAvg: number;
  revenue: number;
  cancellationRate: number;
}

// Queue Management Models

export interface QueueItem {
  orderId: string;
  priority: OrderPriority;
  estimatedTime: number;
  dependencies: string[]; // other order IDs this depends on
  resourceRequirements: ResourceRequirement[];
  queuedAt: Date;
}

export interface ResourceRequirement {
  type: 'staff' | 'equipment' | 'ingredient';
  resourceId: string;
  quantity: number;
  duration: number; // minutes
}

export interface QueueConfiguration {
  restaurantId: string;
  maxConcurrentOrders: number;
  priorityWeights: {
    [key in OrderPriority]: number;
  };
  autoScalingEnabled: boolean;
  loadBalancingStrategy: 'round_robin' | 'least_loaded' | 'priority_first';
}
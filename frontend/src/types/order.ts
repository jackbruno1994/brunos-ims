// Type definitions for Order components

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  restaurantId: string;
  items: OrderItem[];
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  totalAmount: number;
  currency: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  restaurantId: string;
  items: Omit<OrderItem, 'id' | 'totalPrice'>[];
  currency: string;
  notes?: string;
  status?: 'pending' | 'processing' | 'completed' | 'cancelled';
}

export interface OrderListResponse {
  message: string;
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
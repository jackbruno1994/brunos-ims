export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  country: string;
  restaurant: string;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  country: string;
  restaurant: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  sku: string;
  category: Category | string;
  price: number;
  cost: number;
  stock: {
    current: number;
    minimum: number;
    maximum?: number;
  };
  unit: 'piece' | 'kg' | 'liter' | 'gram' | 'ml' | 'box' | 'pack';
  isActive: boolean;
  country: string;
  restaurant: string;
  stockStatus: 'in-stock' | 'low-stock' | 'out-of-stock';
  profitMargin: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: Product | string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  type: 'purchase' | 'sale' | 'transfer';
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  totalAmount: number;
  supplier?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  notes?: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  createdBy: User | string;
  country: string;
  restaurant: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: string[];
}

export interface PaginationResponse<T> {
  success: boolean;
  data: {
    [key: string]: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'manager' | 'staff';
  country: string;
  restaurant: string;
}
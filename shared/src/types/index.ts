import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  username: string;
  email: string;
  password: string; // hashed
  role: 'admin' | 'manager' | 'staff';
  restaurantId: ObjectId;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Restaurant {
  _id?: ObjectId;
  name: string;
  location: string;
  country: string;
  operatingHours: {
    open: string;
    close: string;
  };
  contactInfo: {
    phone: string;
    email: string;
  };
  managers: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  _id?: ObjectId;
  name: string;
  description: string;
  categoryId: ObjectId;
  currentStock: number;
  price: number;
  restaurantId: ObjectId;
  minStockLevel: number;
  unit: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  _id?: ObjectId;
  name: string;
  description: string;
  restaurantId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  _id?: ObjectId;
  type: 'purchase' | 'sale' | 'transfer';
  products: {
    productId: ObjectId;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  restaurantId: ObjectId;
  userId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Request/Response types for API
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: Omit<User, 'password'>;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'staff';
  restaurantId: string;
  country: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
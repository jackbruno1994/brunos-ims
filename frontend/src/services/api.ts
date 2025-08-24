import axios, { AxiosResponse } from 'axios';
import {
  User,
  Category,
  Product,
  Order,
  AuthResponse,
  ApiResponse,
  PaginationResponse,
  LoginCredentials,
  RegisterData
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/users/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/users/register', userData);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = await api.get('/users/profile');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Categories API
export const categoriesAPI = {
  getAll: async (params?: { page?: number; limit?: number; active?: boolean }): Promise<PaginationResponse<Category>> => {
    const response: AxiosResponse<PaginationResponse<Category>> = await api.get('/categories', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<{ category: Category }>> => {
    const response: AxiosResponse<ApiResponse<{ category: Category }>> = await api.get(`/categories/${id}`);
    return response.data;
  },

  create: async (categoryData: Partial<Category>): Promise<ApiResponse<{ category: Category }>> => {
    const response: AxiosResponse<ApiResponse<{ category: Category }>> = await api.post('/categories', categoryData);
    return response.data;
  },

  update: async (id: string, categoryData: Partial<Category>): Promise<ApiResponse<{ category: Category }>> => {
    const response: AxiosResponse<ApiResponse<{ category: Category }>> = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<{}>> => {
    const response: AxiosResponse<ApiResponse<{}>> = await api.delete(`/categories/${id}`);
    return response.data;
  }
};

// Products API
export const productsAPI = {
  getAll: async (params?: { 
    page?: number; 
    limit?: number; 
    active?: boolean; 
    category?: string; 
    stockStatus?: string; 
  }): Promise<PaginationResponse<Product>> => {
    const response: AxiosResponse<PaginationResponse<Product>> = await api.get('/products', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<{ product: Product }>> => {
    const response: AxiosResponse<ApiResponse<{ product: Product }>> = await api.get(`/products/${id}`);
    return response.data;
  },

  create: async (productData: Partial<Product>): Promise<ApiResponse<{ product: Product }>> => {
    const response: AxiosResponse<ApiResponse<{ product: Product }>> = await api.post('/products', productData);
    return response.data;
  },

  update: async (id: string, productData: Partial<Product>): Promise<ApiResponse<{ product: Product }>> => {
    const response: AxiosResponse<ApiResponse<{ product: Product }>> = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  updateStock: async (id: string, adjustment: number, reason?: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.patch(`/products/${id}/stock`, { adjustment, reason });
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<{}>> => {
    const response: AxiosResponse<ApiResponse<{}>> = await api.delete(`/products/${id}`);
    return response.data;
  }
};

// Orders API
export const ordersAPI = {
  getAll: async (params?: { 
    page?: number; 
    limit?: number; 
    type?: string; 
    status?: string; 
    dateFrom?: string; 
    dateTo?: string; 
  }): Promise<PaginationResponse<Order>> => {
    const response: AxiosResponse<PaginationResponse<Order>> = await api.get('/orders', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<{ order: Order }>> => {
    const response: AxiosResponse<ApiResponse<{ order: Order }>> = await api.get(`/orders/${id}`);
    return response.data;
  },

  create: async (orderData: Partial<Order>): Promise<ApiResponse<{ order: Order }>> => {
    const response: AxiosResponse<ApiResponse<{ order: Order }>> = await api.post('/orders', orderData);
    return response.data;
  },

  updateStatus: async (id: string, status: string): Promise<ApiResponse<{ order: Order }>> => {
    const response: AxiosResponse<ApiResponse<{ order: Order }>> = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<{}>> => {
    const response: AxiosResponse<ApiResponse<{}>> = await api.delete(`/orders/${id}`);
    return response.data;
  }
};

// Users API (admin only)
export const usersAPI = {
  getAll: async (params?: { page?: number; limit?: number }): Promise<PaginationResponse<User>> => {
    const response: AxiosResponse<PaginationResponse<User>> = await api.get('/users', { params });
    return response.data;
  }
};

export default api;
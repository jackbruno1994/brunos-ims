import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Restaurant endpoints
  getRestaurants: async () => {
    const response = await api.get('/restaurants');
    return response.data.data || [];
  },

  createRestaurant: async (restaurantData: any) => {
    const response = await api.post('/restaurants', restaurantData);
    return response.data;
  },

  // User endpoints
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data.data || [];
  },

  createUser: async (userData: any) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Order endpoints
  getOrders: async (page: number = 1, limit: number = 10) => {
    const response = await api.get(`/orders?page=${page}&limit=${limit}`);
    return response.data;
  },

  getOrderById: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  createOrder: async (orderData: any) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  updateOrder: async (id: string, updateData: any) => {
    const response = await api.put(`/orders/${id}`, updateData);
    return response.data;
  },

  cancelOrder: async (id: string) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
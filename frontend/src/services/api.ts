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
  config => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  response => response,
  error => {
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

  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  // Inventory endpoints
  inventory: {
    // Item management
    getItems: async (params?: { category?: string; search?: string }) => {
      const response = await api.get('/inventory/items', { params });
      return response.data;
    },

    getItemById: async (id: string) => {
      const response = await api.get(`/inventory/items/${id}`);
      return response.data;
    },

    createItem: async (itemData: any) => {
      const response = await api.post('/inventory/items', itemData);
      return response.data;
    },

    updateItem: async (id: string, itemData: any) => {
      const response = await api.put(`/inventory/items/${id}`, itemData);
      return response.data;
    },

    deleteItem: async (id: string) => {
      const response = await api.delete(`/inventory/items/${id}`);
      return response.data;
    },

    // Stock management
    getStockLevels: async (params?: { itemId?: string; locationId?: string; lowStock?: boolean }) => {
      const response = await api.get('/inventory/stock', { params });
      return response.data;
    },

    recordStockMovement: async (movementData: any) => {
      const response = await api.post('/inventory/stock/movement', movementData);
      return response.data;
    },

    getStockMovementHistory: async (params?: { 
      itemId?: string; 
      location?: string; 
      type?: string; 
      startDate?: string; 
      endDate?: string; 
      limit?: number 
    }) => {
      const response = await api.get('/inventory/stock/movement/history', { params });
      return response.data;
    },

    // Location management
    getLocations: async (params?: { type?: string; active?: boolean }) => {
      const response = await api.get('/inventory/locations', { params });
      return response.data;
    },

    createLocation: async (locationData: any) => {
      const response = await api.post('/inventory/locations', locationData);
      return response.data;
    },

    // Stock alerts
    getStockAlerts: async () => {
      const response = await api.get('/inventory/alerts');
      return response.data;
    },
  },
};

export default api;

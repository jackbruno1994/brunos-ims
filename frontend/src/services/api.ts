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

  // Inventory endpoints
  // Core CRUD operations
  getInventoryItems: async (filters?: {
    category?: string;
    location?: string;
    restaurantId?: string;
    lowStock?: boolean;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.category) params.append('category', filters.category);
      if (filters.location) params.append('location', filters.location);
      if (filters.restaurantId) params.append('restaurantId', filters.restaurantId);
      if (filters.lowStock) params.append('lowStock', 'true');
    }
    
    const response = await api.get(`/inventory?${params.toString()}`);
    return response.data;
  },

  getInventoryItem: async (id: string) => {
    const response = await api.get(`/inventory/${id}`);
    return response.data;
  },

  createInventoryItem: async (itemData: any) => {
    const response = await api.post('/inventory', itemData);
    return response.data;
  },

  updateInventoryItem: async (id: string, updates: any) => {
    const response = await api.put(`/inventory/${id}`, updates);
    return response.data;
  },

  deleteInventoryItem: async (id: string) => {
    const response = await api.delete(`/inventory/${id}`);
    return response.data;
  },

  // Batch operations
  batchUpdateInventory: async (batchData: {
    items: Array<{ id: string; [key: string]: any }>;
    reason: string;
    userId: string;
  }) => {
    const response = await api.post('/inventory/batch', batchData);
    return response.data;
  },

  // Stock movements
  getStockMovements: async (inventoryItemId?: string) => {
    const params = inventoryItemId ? `?inventoryItemId=${inventoryItemId}` : '';
    const response = await api.get(`/inventory/movements${params}`);
    return response.data;
  },

  recordStockMovement: async (movementData: {
    inventoryItemId: string;
    movementType: 'in' | 'out' | 'adjustment' | 'transfer';
    quantity: number;
    reason: string;
    reference?: string;
    fromLocation?: string;
    toLocation?: string;
    userId: string;
  }) => {
    const response = await api.post('/inventory/stock-movement', movementData);
    return response.data;
  },

  // Alerts
  getInventoryAlerts: async (unreadOnly?: boolean) => {
    const params = unreadOnly ? '?unreadOnly=true' : '';
    const response = await api.get(`/inventory/alerts${params}`);
    return response.data;
  },

  markAlertAsRead: async (alertId: string) => {
    const response = await api.put(`/inventory/alerts/${alertId}/read`);
    return response.data;
  },

  // Utility endpoints
  getLowStockItems: async () => {
    const response = await api.get('/inventory/low-stock');
    return response.data;
  },

  getStockValue: async () => {
    const response = await api.get('/inventory/value');
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
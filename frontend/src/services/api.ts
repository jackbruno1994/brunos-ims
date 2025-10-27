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

  // Purchase Order endpoints
  getPurchaseOrders: async () => {
    const response = await api.get('/purchase-orders');
    return response.data;
  },

  getPurchaseOrder: async (id: string) => {
    const response = await api.get(`/purchase-orders/${id}`);
    return response.data;
  },

  createPurchaseOrder: async (poData: any) => {
    const response = await api.post('/purchase-orders', poData);
    return response.data;
  },

  updatePurchaseOrder: async (id: string, poData: any) => {
    const response = await api.put(`/purchase-orders/${id}`, poData);
    return response.data;
  },

  deletePurchaseOrder: async (id: string) => {
    const response = await api.delete(`/purchase-orders/${id}`);
    return response.data;
  },

  markPurchaseOrderAsReceived: async (id: string) => {
    const response = await api.post(`/purchase-orders/${id}/receive`);
    return response.data;
  },

  // Document endpoints
  getDocumentsByPO: async (poId: string) => {
    const response = await api.get(`/purchase-orders/${poId}/documents`);
    return response.data;
  },

  uploadDocument: async (poId: string, documentData: any) => {
    const response = await api.post(`/purchase-orders/${poId}/documents`, documentData);
    return response.data;
  },

  // Product Batch endpoints
  getBatchesByPO: async (poId: string) => {
    const response = await api.get(`/purchase-orders/${poId}/batches`);
    return response.data;
  },

  createProductBatch: async (poId: string, batchData: any) => {
    const response = await api.post(`/purchase-orders/${poId}/batches`, batchData);
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;

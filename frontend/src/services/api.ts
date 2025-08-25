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

  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  // Audit System Endpoints
  audit: {
    // Dashboard
    getDashboard: async () => {
      const response = await api.get('/audit/dashboard');
      return response.data;
    },

    // Audit Logs
    getLogs: async (params?: any) => {
      const response = await api.get('/audit/logs', { params });
      return response.data;
    },

    createLog: async (logData: any) => {
      const response = await api.post('/audit/logs', logData);
      return response.data;
    },

    // Analytics
    getAnalytics: async (params?: any) => {
      const response = await api.get('/audit/analytics', { params });
      return response.data;
    },

    getPredictiveAnalytics: async () => {
      const response = await api.get('/audit/analytics/predictive');
      return response.data;
    },

    // Security Events
    getSecurityEvents: async (params?: any) => {
      const response = await api.get('/audit/security/events', { params });
      return response.data;
    },

    createSecurityEvent: async (eventData: any) => {
      const response = await api.post('/audit/security/events', eventData);
      return response.data;
    },

    // Compliance
    getComplianceReports: async (params?: any) => {
      const response = await api.get('/audit/compliance/reports', { params });
      return response.data;
    },

    generateComplianceReport: async (reportData: any) => {
      const response = await api.post('/audit/compliance/reports/generate', reportData);
      return response.data;
    },

    // Investigations
    getInvestigations: async (params?: any) => {
      const response = await api.get('/audit/investigations', { params });
      return response.data;
    },

    createInvestigation: async (investigationData: any) => {
      const response = await api.post('/audit/investigations', investigationData);
      return response.data;
    },

    // Search
    searchAuditData: async (searchData: any) => {
      const response = await api.post('/audit/search', searchData);
      return response.data;
    },

    // Integrations
    getIntegrations: async () => {
      const response = await api.get('/audit/integrations');
      return response.data;
    },

    // Performance Metrics
    getMetrics: async () => {
      const response = await api.get('/audit/metrics');
      return response.data;
    }
  }
};

export default api;
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
  // Authentication endpoints
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Recipe endpoints
  getRecipes: async () => {
    const response = await api.get('/recipes');
    return response.data.data || [];
  },

  getRecipeById: async (id: string) => {
    const response = await api.get(`/recipes/${id}`);
    return response.data.data;
  },

  createRecipe: async (recipeData: any) => {
    const response = await api.post('/recipes', recipeData);
    return response.data;
  },

  updateRecipe: async (id: string, recipeData: any) => {
    const response = await api.put(`/recipes/${id}`, recipeData);
    return response.data;
  },

  deleteRecipe: async (id: string) => {
    const response = await api.delete(`/recipes/${id}`);
    return response.data;
  },

  assignRecipe: async (id: string, userIds: string[]) => {
    const response = await api.post(`/recipes/${id}/assign`, { userIds });
    return response.data;
  },

  // Prep list endpoints
  getTodaysPrepList: async () => {
    const response = await api.get('/prep-list/today');
    return response.data.data;
  },

  updatePrepListItem: async (prepListId: string, itemId: string, data: any) => {
    const response = await api.put(`/prep-list/${prepListId}/items/${itemId}`, data);
    return response.data;
  },

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
};

export default api;
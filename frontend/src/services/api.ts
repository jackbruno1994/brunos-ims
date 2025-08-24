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

  // Recipe endpoints
  getRecipes: async (filters?: {
    category?: string;
    published?: boolean;
    search?: string;
    restaurantId?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.published !== undefined) params.append('published', filters.published.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.restaurantId) params.append('restaurantId', filters.restaurantId);
    
    const response = await api.get(`/recipes?${params.toString()}`);
    return response.data;
  },

  getRecipe: async (id: string) => {
    const response = await api.get(`/recipes/${id}`);
    return response.data;
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

  getRecipeCategories: async () => {
    const response = await api.get('/recipes/categories');
    return response.data;
  },

  searchRecipes: async (query: {
    q?: string;
    category?: string;
    difficulty?: string;
    maxPreparationTime?: number;
    maxCookingTime?: number;
  }) => {
    const params = new URLSearchParams();
    if (query.q) params.append('q', query.q);
    if (query.category) params.append('category', query.category);
    if (query.difficulty) params.append('difficulty', query.difficulty);
    if (query.maxPreparationTime) params.append('maxPreparationTime', query.maxPreparationTime.toString());
    if (query.maxCookingTime) params.append('maxCookingTime', query.maxCookingTime.toString());
    
    const response = await api.get(`/recipes/search?${params.toString()}`);
    return response.data;
  },

  getRecipeCost: async (id: string) => {
    const response = await api.get(`/recipes/${id}/cost`);
    return response.data;
  },

  addMediaToRecipe: async (id: string, mediaData: any) => {
    const response = await api.post(`/recipes/${id}/media`, mediaData);
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
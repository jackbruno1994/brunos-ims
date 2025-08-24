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
  getRecipes: async (filters?: { restaurantId?: string; category?: string; status?: string; difficulty?: string }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const response = await api.get(`/recipes${params.toString() ? `?${params.toString()}` : ''}`);
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

  // Recipe Phase 1 Features
  scaleRecipe: async (id: string, targetServings: number) => {
    const response = await api.post(`/recipes/${id}/scale`, { targetServings });
    return response.data.data;
  },

  getRecipeCostAnalysis: async (id: string) => {
    const response = await api.get(`/recipes/${id}/cost-analysis`);
    return response.data.data;
  },

  addRecipeNote: async (id: string, noteData: { note: string; type?: string; userId: string; userName: string }) => {
    const response = await api.post(`/recipes/${id}/notes`, noteData);
    return response.data.data;
  },

  updateRecipeQuality: async (id: string, qualityData: { status?: string; qualityScore?: number; approvedBy?: string }) => {
    const response = await api.put(`/recipes/${id}/quality`, qualityData);
    return response.data.data;
  },

  addRecipeReview: async (id: string, reviewData: { 
    rating: number; 
    comment?: string; 
    userId: string; 
    userName: string;
    difficultyRating?: number;
    tasteRating?: number;
    presentationRating?: number;
  }) => {
    const response = await api.post(`/recipes/${id}/reviews`, reviewData);
    return response.data.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
// Example data models/interfaces for Bruno's IMS

export interface Restaurant {
  id: string;
  name: string;
  location: string;
  country: string;
  address: string;
  phone: string;
  email: string;
  managerId: string;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: Date;
  updatedAt: Date;
}

// Base interfaces
export interface ApiResponse<T = any> {
  message: string;
  data: T;
  error?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'manager' | 'staff' | 'line_cook' | 'prep_cook' | 'head_chef';
  restaurantId?: string;
  country: string;
  status: 'active' | 'inactive';
  permissions: string[];
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  timezone: string;
  quickAccessItems: string[]; // menu item IDs for quick access
  searchHistory: string[];
  dashboardLayout: any; // flexible dashboard configuration
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  restaurantId: string;
  availability: boolean;
  allergens?: string[];
  recipeId?: string;
  prepTime?: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

// New models for Order Processing System

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  costPerUnit: number;
  currency: string;
  shelfLife: number; // in days
  prepTime: number; // in minutes
  category: 'protein' | 'vegetable' | 'dairy' | 'grain' | 'seasoning' | 'other';
  restaurantId: string;
  currentStock: number;
  minimumStock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  servings: number;
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  instructions: RecipeStep[];
  ingredients: RecipeIngredient[];
  restaurantId: string;
  menuItemId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeStep {
  id: string;
  stepNumber: number;
  instruction: string;
  estimatedTime: number; // in minutes
  dependencies?: string[]; // step IDs this step depends on
}

export interface RecipeIngredient {
  ingredientId: string;
  quantity: number;
  unit: string;
  preparationNotes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  restaurantId: string;
  customerId?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  orderType: 'dine_in' | 'takeout' | 'delivery';
  items: OrderItem[];
  estimatedTime: number; // in minutes
  actualTime?: number; // in minutes
  totalCost: number;
  currency: string;
  notes?: string;
  assignedTo?: string; // user ID
  createdAt: Date;
  updatedAt: Date;
  scheduledFor?: Date;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  specialInstructions?: string;
  status: 'pending' | 'in_progress' | 'completed';
  prepStartTime?: Date;
  prepEndTime?: Date;
}

export interface PrepList {
  id: string;
  name: string;
  restaurantId: string;
  date: Date;
  status: 'draft' | 'active' | 'completed';
  items: PrepListItem[];
  estimatedTotalTime: number; // in minutes
  actualTotalTime?: number; // in minutes
  createdBy: string; // user ID
  assignedTo?: string[]; // user IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface PrepListItem {
  id: string;
  ingredientId: string;
  recipeId?: string;
  quantity: number;
  unit: string;
  priority: 'low' | 'normal' | 'high';
  estimatedTime: number; // in minutes
  actualTime?: number; // in minutes
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo?: string; // user ID
  completedBy?: string; // user ID
  completedAt?: Date;
  notes?: string;
}

// Analytics and Reporting Models

export interface AnalyticsReport {
  id: string;
  type: 'ingredient_usage' | 'cost_analysis' | 'performance' | 'predictive';
  restaurantId: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  data: any; // flexible structure for different report types
  generatedBy: string; // user ID
  createdAt: Date;
}

export interface PerformanceMetrics {
  restaurantId: string;
  date: Date;
  ordersCompleted: number;
  averageOrderTime: number;
  totalRevenue: number;
  ingredientCosts: number;
  wasteAmount: number;
  efficiency: number; // percentage
  popularItems: { menuItemId: string; count: number }[];
}

// Caching and Offline Support Models

export interface CacheEntry {
  key: string;
  data: any;
  timestamp: Date;
  ttl: number; // time to live in seconds
  accessCount: number;
  lastAccessed: Date;
}

export interface SyncOperation {
  id: string;
  operation: 'create' | 'update' | 'delete';
  table: string;
  recordId: string;
  data?: any;
  timestamp: Date;
  status: 'pending' | 'synced' | 'failed';
  deviceId: string;
  userId: string;
}

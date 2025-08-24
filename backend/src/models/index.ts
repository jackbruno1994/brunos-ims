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

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'chef' | 'linecook';
  restaurantId?: string;
  country: string;
  status: 'active' | 'inactive';
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  category: string;
  servings: number;
  prepTime: number; // minutes
  cookTime: number; // minutes
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  nutritionalInfo?: NutritionalInfo;
  cost?: number;
  restaurantId: string;
  createdBy: string;
  assignedTo?: string[]; // user IDs for line cooks
  tags: string[];
  imageUrl?: string;
  status: 'draft' | 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeIngredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface RecipeInstruction {
  id: string;
  stepNumber: number;
  instruction: string;
  duration?: number; // minutes
  temperature?: string;
  notes?: string;
}

export interface NutritionalInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sodium?: number;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  deviceInfo?: string;
  ipAddress?: string;
  createdAt: Date;
}

export interface PrepList {
  id: string;
  date: Date;
  userId: string;
  recipes: PrepListItem[];
  status: 'pending' | 'in_progress' | 'completed';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrepListItem {
  recipeId: string;
  quantity: number;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  completedAt?: Date;
  notes?: string;
}
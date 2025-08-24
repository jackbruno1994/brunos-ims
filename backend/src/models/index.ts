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
  role: 'admin' | 'manager' | 'staff';
  restaurantId?: string;
  country: string;
  status: 'active' | 'inactive';
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

export interface RecipeIngredient {
  ingredientId: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface RecipeInstruction {
  stepNumber: number;
  description: string;
  duration?: number; // in minutes
  temperature?: number; // in celsius
}

export interface RecipeMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  caption?: string;
  isPrimary: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  category: string;
  preparationTime: number; // in minutes
  cookingTime: number; // in minutes
  servingSize: number;
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  cost?: number; // calculated cost
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
  author: string; // user ID
  media: RecipeMedia[];
  restaurantId?: string; // optional, for restaurant-specific recipes
  allergens?: string[];
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbohydrates?: number;
    fat?: number;
    fiber?: number;
    sodium?: number;
  };
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  version: number;
}
// Frontend type definitions for Bruno's IMS

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

export interface RecipeFilters {
  category?: string;
  published?: boolean;
  search?: string;
  restaurantId?: string;
}

export interface RecipeSearchQuery {
  q?: string;
  category?: string;
  difficulty?: string;
  maxPreparationTime?: number;
  maxCookingTime?: number;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
  total?: number;
}
// Recipe Management Types (frontend)

export interface RecipeIngredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  cost?: number;
  notes?: string;
}

export interface RecipeStep {
  id: string;
  stepNumber: number;
  instruction: string;
  timeEstimate?: number; // in minutes
  temperature?: string;
  equipment?: string[];
  notes?: string;
}

export interface NutritionalInfo {
  calories?: number;
  protein?: number; // in grams
  carbohydrates?: number; // in grams
  fat?: number; // in grams
  fiber?: number; // in grams
  sodium?: number; // in mg
  sugar?: number; // in grams
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  category: string;
  cuisine?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  servings: number;
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  totalTime: number; // in minutes
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  nutritionalInfo?: NutritionalInfo;
  totalCost?: number;
  costPerServing?: number;
  tags: string[];
  allergens: string[];
  imageUrl?: string;
  restaurantId: string;
  createdBy: string; // user id
  status: 'draft' | 'active' | 'archived';
  version: number;
  previousVersionId?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeCategory {
  id: string;
  name: string;
  description?: string;
  parentCategoryId?: string;
  color?: string;
  icon?: string;
  restaurantId?: string; // null for global categories
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeFilters {
  category?: string;
  search?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  maxTime?: number;
  ingredients?: string[];
}

export interface RecipeFormData {
  name: string;
  description: string;
  category: string;
  cuisine?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  servings: number;
  prepTime: number;
  cookTime: number;
  ingredients: Omit<RecipeIngredient, 'id'>[];
  steps: Omit<RecipeStep, 'id'>[];
  nutritionalInfo?: NutritionalInfo;
  tags: string[];
  allergens: string[];
  imageUrl?: string;
  isPublic: boolean;
}
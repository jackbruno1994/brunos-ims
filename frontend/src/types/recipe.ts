// Frontend Recipe Types - mirrors backend models

export interface Recipe {
  id: string;
  name: string;
  description: string;
  category: string;
  restaurantId: string;
  
  // Basic recipe information
  servings: number;
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  totalTime: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  
  // Ingredients and instructions
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  
  // Advanced features
  dietaryRestrictions: string[]; // vegetarian, vegan, gluten-free, etc.
  allergens: string[];
  equipmentRequired: string[];
  seasonalIngredients: string[]; // ingredient IDs that are seasonal
  
  // Cost management
  baseCost: number;
  currency: string;
  profitMargin: number; // percentage
  portionCost: number;
  
  // Quality control
  status: 'draft' | 'testing' | 'approved' | 'published' | 'archived';
  approvedBy?: string; // user ID
  lastTested?: Date;
  qualityScore?: number; // 1-5 rating
  
  // Collaboration
  createdBy: string; // user ID
  chefsTips?: string;
  notes: RecipeNote[];
  reviews: RecipeReview[];
  
  // Analytics
  popularityScore: number;
  timesCooked: number;
  averageRating: number;
  
  // Sustainability
  carbonFootprint?: number;
  sustainabilityScore?: number;
  localSourcingPercentage?: number;
  
  // System fields
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeIngredient {
  id: string;
  ingredientId: string; // reference to ingredient master data
  name: string; // ingredient name for display
  quantity: number;
  unit: string;
  notes?: string;
  alternatives?: string[]; // alternative ingredient suggestions
  isSeasonal: boolean;
  cost: number;
  supplier?: string;
}

export interface RecipeInstruction {
  id: string;
  stepNumber: number;
  instruction: string;
  estimatedTime?: number; // in minutes
  temperature?: number;
  equipment?: string[];
  techniques?: string[];
  imageUrl?: string;
  videoUrl?: string;
  tips?: string;
}

export interface RecipeNote {
  id: string;
  userId: string;
  userName: string;
  note: string;
  type: 'general' | 'modification' | 'tip' | 'warning';
  createdAt: Date;
}

export interface RecipeReview {
  id: string;
  userId: string;
  userName: string;
  rating: number; // 1-5 stars
  comment?: string;
  difficultyRating?: number;
  tasteRating?: number;
  presentationRating?: number;
  createdAt: Date;
}

export interface RecipeScaling {
  originalServings: number;
  targetServings: number;
  scalingFactor: number;
  adjustedIngredients: RecipeIngredient[];
  adjustedCookTime?: number;
  notes?: string;
}

export interface RecipeCostAnalysis {
  recipeId: string;
  totalCost: number;
  costPerServing: number;
  ingredientCosts: {
    ingredientId: string;
    name: string;
    cost: number;
    percentage: number;
  }[];
  laborCost?: number;
  overheadCost?: number;
  profitMargin: number;
  suggestedPrice: number;
  lastUpdated: Date;
}

export interface RecipeFilters {
  restaurantId?: string;
  category?: string;
  status?: string;
  difficulty?: string;
  searchTerm?: string;
}
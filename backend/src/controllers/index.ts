import { Request, Response } from 'express';
import { Recipe, RecipeIngredient } from '../models';

// Mock data for development (in real app this would come from database)
let recipes: Recipe[] = [];
let recipeCounter = 1;

// Example controller for restaurant management
export class RestaurantController {
  static async getAllRestaurants(req: Request, res: Response) {
    try {
      // TODO: Implement database query
      res.status(200).json({
        message: 'Get all restaurants',
        data: []
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch restaurants',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createRestaurant(req: Request, res: Response) {
    try {
      // TODO: Implement restaurant creation
      res.status(201).json({
        message: 'Restaurant created successfully',
        data: req.body
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to create restaurant',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

// Recipe controller for recipe management
export class RecipeController {
  // Get all recipes with optional filtering
  static async getAllRecipes(req: Request, res: Response) {
    try {
      const { category, published, search, restaurantId } = req.query;
      let filteredRecipes = [...recipes];

      // Apply filters
      if (category) {
        filteredRecipes = filteredRecipes.filter(r => r.category === category);
      }
      if (published !== undefined) {
        filteredRecipes = filteredRecipes.filter(r => r.published === (published === 'true'));
      }
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        filteredRecipes = filteredRecipes.filter(r => 
          r.name.toLowerCase().includes(searchTerm) ||
          r.description.toLowerCase().includes(searchTerm) ||
          r.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }
      if (restaurantId) {
        filteredRecipes = filteredRecipes.filter(r => r.restaurantId === restaurantId);
      }

      res.status(200).json({
        message: 'Recipes retrieved successfully',
        data: filteredRecipes,
        total: filteredRecipes.length
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch recipes',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get specific recipe by ID
  static async getRecipeById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const recipe = recipes.find(r => r.id === id);

      if (!recipe) {
        return res.status(404).json({
          error: 'Recipe not found',
          message: `Recipe with ID ${id} does not exist`
        });
      }

      return res.status(200).json({
        message: 'Recipe retrieved successfully',
        data: recipe
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to fetch recipe',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Create new recipe
  static async createRecipe(req: Request, res: Response) {
    try {
      const recipeData = req.body;
      const now = new Date();
      
      const newRecipe: Recipe = {
        id: `recipe_${recipeCounter++}`,
        name: recipeData.name,
        description: recipeData.description,
        category: recipeData.category,
        preparationTime: recipeData.preparationTime,
        cookingTime: recipeData.cookingTime,
        servingSize: recipeData.servingSize,
        ingredients: recipeData.ingredients || [],
        instructions: recipeData.instructions || [],
        currency: recipeData.currency || 'USD',
        createdAt: now,
        updatedAt: now,
        published: recipeData.published || false,
        author: recipeData.author,
        media: recipeData.media || [],
        restaurantId: recipeData.restaurantId,
        allergens: recipeData.allergens,
        nutritionalInfo: recipeData.nutritionalInfo,
        tags: recipeData.tags,
        difficulty: recipeData.difficulty,
        version: 1
      };

      // Calculate cost (simplified calculation)
      newRecipe.cost = RecipeController.calculateRecipeCost(newRecipe.ingredients);

      recipes.push(newRecipe);

      res.status(201).json({
        message: 'Recipe created successfully',
        data: newRecipe
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to create recipe',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update recipe
  static async updateRecipe(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const recipeIndex = recipes.findIndex(r => r.id === id);
      if (recipeIndex === -1) {
        return res.status(404).json({
          error: 'Recipe not found',
          message: `Recipe with ID ${id} does not exist`
        });
      }

      const existingRecipe = recipes[recipeIndex];
      const updatedRecipe: Recipe = {
        ...existingRecipe,
        ...updateData,
        id: existingRecipe.id, // Preserve ID
        createdAt: existingRecipe.createdAt, // Preserve creation date
        updatedAt: new Date(),
        version: existingRecipe.version + 1
      };

      // Recalculate cost if ingredients changed
      if (updateData.ingredients) {
        updatedRecipe.cost = RecipeController.calculateRecipeCost(updatedRecipe.ingredients);
      }

      recipes[recipeIndex] = updatedRecipe;

      return res.status(200).json({
        message: 'Recipe updated successfully',
        data: updatedRecipe
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to update recipe',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Delete recipe
  static async deleteRecipe(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const recipeIndex = recipes.findIndex(r => r.id === id);
      
      if (recipeIndex === -1) {
        return res.status(404).json({
          error: 'Recipe not found',
          message: `Recipe with ID ${id} does not exist`
        });
      }

      const deletedRecipe = recipes.splice(recipeIndex, 1)[0];

      return res.status(200).json({
        message: 'Recipe deleted successfully',
        data: deletedRecipe
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to delete recipe',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get recipe categories
  static async getCategories(req: Request, res: Response) {
    try {
      const categories = [...new Set(recipes.map(r => r.category))];
      
      res.status(200).json({
        message: 'Categories retrieved successfully',
        data: categories
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch categories',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get recipe cost
  static async getRecipeCost(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const recipe = recipes.find(r => r.id === id);

      if (!recipe) {
        return res.status(404).json({
          error: 'Recipe not found',
          message: `Recipe with ID ${id} does not exist`
        });
      }

      const cost = RecipeController.calculateRecipeCost(recipe.ingredients);

      return res.status(200).json({
        message: 'Recipe cost calculated successfully',
        data: {
          recipeId: id,
          cost: cost,
          currency: recipe.currency,
          servingSize: recipe.servingSize,
          costPerServing: cost / recipe.servingSize
        }
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to calculate recipe cost',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Search recipes
  static async searchRecipes(req: Request, res: Response) {
    try {
      const { q, category, difficulty, maxPreparationTime, maxCookingTime } = req.query;
      let filteredRecipes = [...recipes];

      if (q) {
        const searchTerm = (q as string).toLowerCase();
        filteredRecipes = filteredRecipes.filter(r => 
          r.name.toLowerCase().includes(searchTerm) ||
          r.description.toLowerCase().includes(searchTerm) ||
          r.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ||
          r.ingredients.some(ing => ing.ingredientId.toLowerCase().includes(searchTerm))
        );
      }

      if (category) {
        filteredRecipes = filteredRecipes.filter(r => r.category === category);
      }

      if (difficulty) {
        filteredRecipes = filteredRecipes.filter(r => r.difficulty === difficulty);
      }

      if (maxPreparationTime) {
        filteredRecipes = filteredRecipes.filter(r => r.preparationTime <= Number(maxPreparationTime));
      }

      if (maxCookingTime) {
        filteredRecipes = filteredRecipes.filter(r => r.cookingTime <= Number(maxCookingTime));
      }

      res.status(200).json({
        message: 'Search completed successfully',
        data: filteredRecipes,
        total: filteredRecipes.length,
        query: req.query
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to search recipes',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Add media to recipe
  static async addMediaToRecipe(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const mediaData = req.body;
      
      const recipe = recipes.find(r => r.id === id);
      if (!recipe) {
        return res.status(404).json({
          error: 'Recipe not found',
          message: `Recipe with ID ${id} does not exist`
        });
      }

      const newMedia = {
        id: `media_${Date.now()}`,
        type: mediaData.type,
        url: mediaData.url,
        caption: mediaData.caption,
        isPrimary: mediaData.isPrimary || false
      };

      recipe.media.push(newMedia);
      recipe.updatedAt = new Date();

      return res.status(200).json({
        message: 'Media added to recipe successfully',
        data: newMedia
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to add media to recipe',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Helper method to calculate recipe cost
  private static calculateRecipeCost(ingredients: RecipeIngredient[]): number {
    // Simplified cost calculation
    // In a real application, this would fetch prices from inventory system
    let totalCost = 0;
    
    ingredients.forEach(ingredient => {
      // Mock pricing based on ingredient type
      const baseCost = 2.5; // Base cost per unit
      const quantityMultiplier = ingredient.quantity * 0.1;
      totalCost += baseCost * quantityMultiplier;
    });

    return Math.round(totalCost * 100) / 100; // Round to 2 decimal places
  }
}
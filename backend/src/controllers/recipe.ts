import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Recipe, PrepList } from '../models';

// Mock data storage - in a real app, this would be a database
const recipes: Recipe[] = [];
const prepLists: PrepList[] = [];

export class RecipeController {
  static async getAllRecipes(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      let filteredRecipes = recipes;

      // Filter recipes based on user role
      if (user.role === 'linecook') {
        // Line cooks can only see recipes assigned to them
        filteredRecipes = recipes.filter(recipe => 
          recipe.assignedTo?.includes(user.id) || recipe.status === 'active'
        );
      } else if (user.role === 'chef') {
        // Chefs can see all recipes in their restaurant
        filteredRecipes = recipes.filter(recipe => 
          recipe.restaurantId === user.restaurantId
        );
      }
      // Managers and admins can see all recipes

      res.status(200).json({
        message: 'Recipes retrieved successfully',
        data: filteredRecipes
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch recipes',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getRecipeById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user!;
      
      const recipe = recipes.find(r => r.id === id);
      if (!recipe) {
        res.status(404).json({ error: 'Recipe not found' });
        return;
        return;
      }

      // Check access permissions
      if (user.role === 'linecook' && 
          !recipe.assignedTo?.includes(user.id) && 
          recipe.status !== 'active') {
        res.status(403).json({ error: 'Access denied to this recipe' });
        return;
        return;
      }

      if (user.role === 'chef' && recipe.restaurantId !== user.restaurantId) {
        res.status(403).json({ error: 'Access denied to this recipe' });
        return;
        return;
      }

      res.status(200).json({
        message: 'Recipe retrieved successfully',
        data: recipe
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch recipe',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createRecipe(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      
      if (user.role === 'linecook') {
        res.status(403).json({ error: 'Line cooks cannot create recipes' });
        return;
        return;
      }

      const recipeData = req.body;
      const newRecipe: Recipe = {
        id: Date.now().toString(),
        ...recipeData,
        restaurantId: user.restaurantId || '',
        createdBy: user.id,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      };

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

  static async updateRecipe(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user!;
      
      if (user.role === 'linecook') {
        res.status(403).json({ error: 'Line cooks cannot update recipes' });
        return;
      }

      const recipeIndex = recipes.findIndex(r => r.id === id);
      if (recipeIndex === -1) {
        res.status(404).json({ error: 'Recipe not found' });
        return;
      }

      const recipe = recipes[recipeIndex];
      
      // Check permissions
      if (user.role === 'chef' && recipe.restaurantId !== user.restaurantId) {
        res.status(403).json({ error: 'Access denied to this recipe' });
        return;
      }

      recipes[recipeIndex] = {
        ...recipe,
        ...req.body,
        updatedAt: new Date()
      };

      res.status(200).json({
        message: 'Recipe updated successfully',
        data: recipes[recipeIndex]
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to update recipe',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async deleteRecipe(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user!;
      
      if (user.role === 'linecook') {
        res.status(403).json({ error: 'Line cooks cannot delete recipes' });
        return;
      }

      const recipeIndex = recipes.findIndex(r => r.id === id);
      if (recipeIndex === -1) {
        res.status(404).json({ error: 'Recipe not found' });
        return;
      }

      const recipe = recipes[recipeIndex];
      
      // Check permissions
      if (user.role === 'chef' && recipe.restaurantId !== user.restaurantId) {
        res.status(403).json({ error: 'Access denied to this recipe' });
        return;
      }

      recipes.splice(recipeIndex, 1);

      res.status(200).json({
        message: 'Recipe deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to delete recipe',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async assignRecipe(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { userIds } = req.body;
      const user = req.user!;
      
      if (user.role === 'linecook') {
        res.status(403).json({ error: 'Line cooks cannot assign recipes' });
        return;
      }

      const recipeIndex = recipes.findIndex(r => r.id === id);
      if (recipeIndex === -1) {
        res.status(404).json({ error: 'Recipe not found' });
        return;
      }

      const recipe = recipes[recipeIndex];
      
      // Check permissions
      if (user.role === 'chef' && recipe.restaurantId !== user.restaurantId) {
        res.status(403).json({ error: 'Access denied to this recipe' });
        return;
      }

      recipes[recipeIndex] = {
        ...recipe,
        assignedTo: userIds,
        updatedAt: new Date()
      };

      res.status(200).json({
        message: 'Recipe assigned successfully',
        data: recipes[recipeIndex]
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to assign recipe',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getTodaysPrepList(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const today = new Date().toDateString();
      
      let userPrepList = prepLists.find(pl => 
        pl.userId === user.id && 
        pl.date.toDateString() === today
      );

      if (!userPrepList) {
        // Create a prep list based on assigned recipes
        const assignedRecipes = recipes.filter(recipe => 
          recipe.assignedTo?.includes(user.id) && 
          recipe.status === 'active'
        );

        userPrepList = {
          id: Date.now().toString(),
          date: new Date(),
          userId: user.id,
          recipes: assignedRecipes.map(recipe => ({
            recipeId: recipe.id,
            quantity: 1,
            priority: 'medium' as const,
            completed: false
          })),
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        prepLists.push(userPrepList);
      }

      res.status(200).json({
        message: 'Prep list retrieved successfully',
        data: userPrepList
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch prep list',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updatePrepListItem(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { prepListId, itemId } = req.params;
      const { completed, notes } = req.body;
      const user = req.user!;
      
      const prepListIndex = prepLists.findIndex(pl => pl.id === prepListId);
      if (prepListIndex === -1) {
        res.status(404).json({ error: 'Prep list not found' });
        return;
      }

      const prepList = prepLists[prepListIndex];
      
      if (prepList.userId !== user.id) {
        res.status(403).json({ error: 'Access denied to this prep list' });
        return;
      }

      const itemIndex = prepList.recipes.findIndex(item => item.recipeId === itemId);
      if (itemIndex === -1) {
        res.status(404).json({ error: 'Prep list item not found' });
        return;
      }

      prepList.recipes[itemIndex] = {
        ...prepList.recipes[itemIndex],
        completed,
        completedAt: completed ? new Date() : undefined,
        notes
      };

      prepList.updatedAt = new Date();

      res.status(200).json({
        message: 'Prep list item updated successfully',
        data: prepList
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to update prep list item',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
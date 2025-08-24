import { Router } from 'express';
import { RestaurantController, RecipeController } from '../controllers';

const router = Router();

// Restaurant routes
router.get('/restaurants', RestaurantController.getAllRestaurants);
router.post('/restaurants', RestaurantController.createRestaurant);

// Recipe routes
router.get('/recipes', RecipeController.getAllRecipes);
router.get('/recipes/search', RecipeController.searchRecipes);
router.get('/recipes/categories', RecipeController.getCategories);
router.post('/recipes/categories', RecipeController.createCategory);
router.get('/recipes/:id', RecipeController.getRecipeById);
router.post('/recipes', RecipeController.createRecipe);
router.put('/recipes/:id', RecipeController.updateRecipe);
router.delete('/recipes/:id', RecipeController.deleteRecipe);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Bruno\'s IMS API',
    timestamp: new Date().toISOString()
  });
});

export default router;
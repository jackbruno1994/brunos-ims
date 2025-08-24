import { Router } from 'express';
import { RestaurantController, RecipeController } from '../controllers';

const router = Router();

// API welcome route
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Bruno\'s IMS API',
    version: '1.0.0'
  });
});

// Restaurant routes
router.get('/restaurants', RestaurantController.getAllRestaurants);
router.post('/restaurants', RestaurantController.createRestaurant);

// Recipe routes
router.get('/recipes', RecipeController.getAllRecipes);
router.post('/recipes', RecipeController.createRecipe);
router.get('/recipes/categories', RecipeController.getCategories);
router.get('/recipes/search', RecipeController.searchRecipes);
router.get('/recipes/:id', RecipeController.getRecipeById);
router.put('/recipes/:id', RecipeController.updateRecipe);
router.delete('/recipes/:id', RecipeController.deleteRecipe);
router.get('/recipes/:id/cost', RecipeController.getRecipeCost);
router.post('/recipes/:id/media', RecipeController.addMediaToRecipe);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Bruno\'s IMS API',
    timestamp: new Date().toISOString()
  });
});

export default router;
import { Router } from 'express';
import { RestaurantController, RecipeController } from '../controllers';

const router = Router();

// Restaurant routes
router.get('/restaurants', RestaurantController.getAllRestaurants);
router.post('/restaurants', RestaurantController.createRestaurant);

// Recipe routes
router.get('/recipes', RecipeController.getAllRecipes);
router.get('/recipes/:id', RecipeController.getRecipeById);
router.post('/recipes', RecipeController.createRecipe);
router.put('/recipes/:id', RecipeController.updateRecipe);
router.delete('/recipes/:id', RecipeController.deleteRecipe);

// Recipe Phase 1 Features
router.post('/recipes/:id/scale', RecipeController.scaleRecipe);
router.get('/recipes/:id/cost-analysis', RecipeController.analyzeCost);
router.post('/recipes/:id/notes', RecipeController.addNote);
router.put('/recipes/:id/quality', RecipeController.updateQualityStatus);
router.post('/recipes/:id/reviews', RecipeController.addReview);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Bruno\'s IMS API',
    timestamp: new Date().toISOString()
  });
});

export default router;
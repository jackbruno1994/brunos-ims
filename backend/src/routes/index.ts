import { Router } from 'express';
import { RestaurantController, RecipeController, AuthController } from '../controllers';
import { authenticate, authorize, authorizeRoles } from '../middleware/auth';

const router = Router();

// Authentication routes (public)
router.post('/auth/login', AuthController.login);
router.post('/auth/register', AuthController.register);
router.post('/auth/refresh', AuthController.refreshToken);

// Protected routes (require authentication)
router.use(authenticate);

// User profile
router.get('/auth/profile', AuthController.getProfile);
router.post('/auth/logout', AuthController.logout);

// Restaurant routes
router.get('/restaurants', RestaurantController.getAllRestaurants);
router.post('/restaurants', authorizeRoles(['admin', 'manager']), RestaurantController.createRestaurant);

// Recipe routes
router.get('/recipes', RecipeController.getAllRecipes);
router.get('/recipes/:id', RecipeController.getRecipeById);
router.post('/recipes', authorizeRoles(['chef', 'manager', 'admin']), RecipeController.createRecipe);
router.put('/recipes/:id', authorizeRoles(['chef', 'manager', 'admin']), RecipeController.updateRecipe);
router.delete('/recipes/:id', authorizeRoles(['chef', 'manager', 'admin']), RecipeController.deleteRecipe);
router.post('/recipes/:id/assign', authorizeRoles(['chef', 'manager', 'admin']), RecipeController.assignRecipe);

// Prep list routes
router.get('/prep-list/today', RecipeController.getTodaysPrepList);
router.put('/prep-list/:prepListId/items/:itemId', authorize(['preplist:write']), RecipeController.updatePrepListItem);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Bruno\'s IMS API',
    timestamp: new Date().toISOString()
  });
});

export default router;
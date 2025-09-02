import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticateToken, rateLimitLogin, validateRequest } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', 
    validateRequest(['email', 'firstName', 'lastName', 'password']),
    authController.register
);

router.post('/login',
    rateLimitLogin,
    validateRequest(['email', 'password']),
    authController.login
);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);

router.put('/profile', 
    authenticateToken, 
    authController.updateProfile
);

router.post('/change-password',
    authenticateToken,
    validateRequest(['currentPassword', 'newPassword']),
    authController.changePassword
);

export default router;
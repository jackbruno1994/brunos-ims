import express from 'express';
import { roleRoutes } from './roles';
import { userRoutes } from './users';

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Bruno\'s IMS API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/roles', roleRoutes);
router.use('/users', userRoutes);

export { router as apiRoutes };
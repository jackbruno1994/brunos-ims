import { Request, Response } from 'express';
import { CachingService } from '../services/cachingService';

export class CachingController {
  /**
   * Get cache metrics
   */
  static getCacheMetrics(req: Request, res: Response) {
    try {
      const metrics = CachingService.getMetrics();
      
      res.status(200).json({
        message: 'Cache metrics retrieved successfully',
        data: metrics
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get cache metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Clear cache
   */
  static clearCache(req: Request, res: Response) {
    try {
      CachingService.clear();
      
      res.status(200).json({
        message: 'Cache cleared successfully'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to clear cache',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Invalidate cache by pattern
   */
  static invalidateCacheByPattern(req: Request, res: Response): void {
    try {
      const { pattern } = req.body;
      
      if (!pattern) {
        res.status(400).json({
          error: 'Pattern is required'
        });
        return;
      }
      
      const invalidated = CachingService.invalidateByPattern(pattern);
      
      res.status(200).json({
        message: `${invalidated} cache entries invalidated`,
        data: { invalidated }
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to invalidate cache',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Preload frequent data
   */
  static async preloadFrequentData(req: Request, res: Response) {
    try {
      const { restaurantId } = req.params;
      
      await CachingService.preloadFrequentData(restaurantId);
      
      res.status(200).json({
        message: 'Frequent data preloaded successfully'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to preload data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Warm cache
   */
  static async warmCache(req: Request, res: Response) {
    try {
      const { restaurantId } = req.params;
      
      await CachingService.warmCache(restaurantId);
      
      res.status(200).json({
        message: 'Cache warmed successfully'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to warm cache',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
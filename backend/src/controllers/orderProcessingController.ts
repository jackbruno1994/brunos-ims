import { Request, Response } from 'express';
import { PrepListService } from '../services/prepListService';
import { OrderProcessingService } from '../services/orderProcessingService';
import { AnalyticsService } from '../services/analyticsService';
import { SmartSearchService } from '../services/smartSearchService';

export class OrderProcessingController {
  /**
   * Generate smart prep list
   */
  static async generatePrepList(req: Request, res: Response) {
    try {
      const { restaurantId, orders, date } = req.body;
      
      const prepList = await PrepListService.generatePrepList(
        restaurantId,
        orders,
        new Date(date)
      );
      
      res.status(200).json({
        message: 'Prep list generated successfully',
        data: prepList
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to generate prep list',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update prep list with new order
   */
  static async updatePrepList(req: Request, res: Response) {
    try {
      const { prepListId } = req.params;
      const { newOrder } = req.body;
      
      const updatedPrepList = await PrepListService.updatePrepListForNewOrder(
        prepListId,
        newOrder
      );
      
      res.status(200).json({
        message: 'Prep list updated successfully',
        data: updatedPrepList
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to update prep list',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Add order to batch queue
   */
  static async addOrderToBatch(req: Request, res: Response) {
    try {
      const { order } = req.body;
      
      await OrderProcessingService.addOrderToBatch(order);
      
      res.status(200).json({
        message: 'Order added to batch queue successfully'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to add order to batch',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Process next batch
   */
  static async processNextBatch(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId } = req.params;
      
      const batch = await OrderProcessingService.processNextBatch(restaurantId);
      
      if (!batch) {
        res.status(404).json({
          message: 'No batches available for processing'
        });
        return;
      }
      
      res.status(200).json({
        message: 'Batch processing started',
        data: batch
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to process batch',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Complete batch processing
   */
  static async completeBatch(req: Request, res: Response) {
    try {
      const { batchId } = req.params;
      
      await OrderProcessingService.completeBatch(batchId);
      
      res.status(200).json({
        message: 'Batch completed successfully'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to complete batch',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get queue status for restaurant
   */
  static async getQueueStatus(req: Request, res: Response) {
    try {
      const { restaurantId } = req.params;
      
      const status = OrderProcessingService.getQueueStatus(restaurantId);
      
      res.status(200).json({
        message: 'Queue status retrieved successfully',
        data: status
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get queue status',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Optimize queue for restaurant
   */
  static async optimizeQueue(req: Request, res: Response) {
    try {
      const { restaurantId } = req.params;
      
      await OrderProcessingService.optimizeQueue(restaurantId);
      
      res.status(200).json({
        message: 'Queue optimized successfully'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to optimize queue',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export class AnalyticsController {
  /**
   * Generate predictive analytics
   */
  static async generatePredictiveAnalytics(req: Request, res: Response) {
    try {
      const { restaurantId } = req.params;
      const { forecastDays } = req.query;
      
      const analytics = await AnalyticsService.generatePredictiveAnalytics(
        restaurantId,
        forecastDays ? parseInt(forecastDays as string) : 7
      );
      
      res.status(200).json({
        message: 'Predictive analytics generated successfully',
        data: analytics
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to generate predictive analytics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Generate cost analysis report
   */
  static async generateCostAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        res.status(400).json({
          error: 'Start date and end date are required'
        });
        return;
      }
      
      const report = await AnalyticsService.generateCostAnalysisReport(
        restaurantId,
        new Date(startDate as string),
        new Date(endDate as string)
      );
      
      res.status(200).json({
        message: 'Cost analysis report generated successfully',
        data: report
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to generate cost analysis',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get performance metrics
   */
  static async getPerformanceMetrics(req: Request, res: Response) {
    try {
      const { restaurantId } = req.params;
      const { date } = req.query;
      
      const metrics = await AnalyticsService.generatePerformanceMetrics(
        restaurantId,
        date ? new Date(date as string) : new Date()
      );
      
      res.status(200).json({
        message: 'Performance metrics retrieved successfully',
        data: metrics
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get performance metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get role-based dashboard
   */
  static async getRoleDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const { userId, role } = req.query;
      
      if (!userId || !role) {
        res.status(400).json({
          error: 'User ID and role are required'
        });
        return;
      }
      
      const dashboard = await AnalyticsService.generateRoleDashboard(
        userId as string,
        role as string,
        restaurantId
      );
      
      res.status(200).json({
        message: 'Dashboard data retrieved successfully',
        data: dashboard
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get dashboard data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export class SearchController {
  /**
   * Perform smart search
   */
  static async search(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const { query, userId, context } = req.query;
      
      if (!query || !userId) {
        res.status(400).json({
          error: 'Query and user ID are required'
        });
        return;
      }
      
      const results = await SmartSearchService.search(
        query as string,
        userId as string,
        restaurantId,
        (context as string) || 'general'
      );
      
      res.status(200).json({
        message: 'Search completed successfully',
        data: results
      });
    } catch (error) {
      res.status(500).json({
        error: 'Search failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get search suggestions
   */
  static async getSearchSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const { userId, partialQuery } = req.query;
      
      if (!userId || !partialQuery) {
        res.status(400).json({
          error: 'User ID and partial query are required'
        });
        return;
      }
      
      const suggestions = SmartSearchService.getSearchSuggestions(
        userId as string,
        partialQuery as string
      );
      
      res.status(200).json({
        message: 'Search suggestions retrieved successfully',
        data: suggestions
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get search suggestions',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get quick access items
   */
  static async getQuickAccessItems(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      const items = SmartSearchService.getQuickAccessItems(userId);
      
      res.status(200).json({
        message: 'Quick access items retrieved successfully',
        data: items
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get quick access items',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Record search result selection
   */
  static async recordSelection(req: Request, res: Response): Promise<void> {
    try {
      const { userId, resultId } = req.body;
      
      if (!userId || !resultId) {
        res.status(400).json({
          error: 'User ID and result ID are required'
        });
        return;
      }
      
      SmartSearchService.recordResultSelection(userId, resultId);
      
      res.status(200).json({
        message: 'Selection recorded successfully'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to record selection',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Index content for search
   */
  static async indexContent(req: Request, res: Response) {
    try {
      const { restaurantId } = req.params;
      
      await SmartSearchService.indexContent(restaurantId);
      
      res.status(200).json({
        message: 'Content indexed successfully'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to index content',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
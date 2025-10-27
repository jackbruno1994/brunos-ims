import { Router } from 'express';
import { 
  RestaurantController,
  OrderProcessingController,
  AnalyticsController,
  SearchController,
  CachingController,
  OfflineSyncController
} from '../controllers';

const router = Router();

// Restaurant routes
router.get('/restaurants', RestaurantController.getAllRestaurants);
router.post('/restaurants', RestaurantController.createRestaurant);

// Order Processing routes
router.post('/order-processing/prep-list', OrderProcessingController.generatePrepList);
router.put('/order-processing/prep-list/:prepListId', OrderProcessingController.updatePrepList);
router.post('/order-processing/batch/add', OrderProcessingController.addOrderToBatch);
router.post('/order-processing/batch/:restaurantId/process-next', OrderProcessingController.processNextBatch);
router.put('/order-processing/batch/:batchId/complete', OrderProcessingController.completeBatch);
router.get('/order-processing/queue/:restaurantId/status', OrderProcessingController.getQueueStatus);
router.post('/order-processing/queue/:restaurantId/optimize', OrderProcessingController.optimizeQueue);

// Analytics routes
router.get('/analytics/:restaurantId/predictive', AnalyticsController.generatePredictiveAnalytics);
router.get('/analytics/:restaurantId/cost-analysis', AnalyticsController.generateCostAnalysis);
router.get('/analytics/:restaurantId/performance', AnalyticsController.getPerformanceMetrics);
router.get('/analytics/:restaurantId/dashboard', AnalyticsController.getRoleDashboard);

// Search routes
router.get('/search/:restaurantId', SearchController.search);
router.get('/search/suggestions', SearchController.getSearchSuggestions);
router.get('/search/quick-access/:userId', SearchController.getQuickAccessItems);
router.post('/search/record-selection', SearchController.recordSelection);
router.post('/search/:restaurantId/index', SearchController.indexContent);

// Caching routes
router.get('/cache/metrics', CachingController.getCacheMetrics);
router.delete('/cache/clear', CachingController.clearCache);
router.post('/cache/invalidate', CachingController.invalidateCacheByPattern);
router.post('/cache/:restaurantId/preload', CachingController.preloadFrequentData);
router.post('/cache/:restaurantId/warm', CachingController.warmCache);

// Offline Sync routes
router.post('/offline-sync/initialize', OfflineSyncController.initializeDevice);
router.post('/offline-sync/queue-operation', OfflineSyncController.queueOperation);
router.post('/offline-sync/:deviceId/sync', OfflineSyncController.syncWithServer);
router.get('/offline-sync/:deviceId/status', OfflineSyncController.getSyncStatus);
router.post('/offline-sync/:deviceId/cache', OfflineSyncController.cacheDataForOffline);
router.get('/offline-sync/:deviceId/cache/:table', OfflineSyncController.getCachedData);
router.post('/offline-sync/:deviceId/background-sync', OfflineSyncController.startBackgroundSync);
router.get('/offline-sync/:deviceId/export', OfflineSyncController.exportOfflineData);
router.post('/offline-sync/:deviceId/import', OfflineSyncController.importOfflineData);

// Health check route
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    service: "Bruno's IMS API",
    timestamp: new Date().toISOString(),
    features: [
      'Smart Prep-List Generator',
      'Order Processing Optimizations',
      'Advanced Analytics',
      'Smart Search with Learning',
      'Offline-First Architecture',
      'Intelligent Caching'
    ]
  });
});

export default router;

import { apiService } from './api';

export interface PrepList {
  id: string;
  name: string;
  restaurantId: string;
  date: Date;
  status: 'draft' | 'active' | 'completed';
  items: PrepListItem[];
  estimatedTotalTime: number;
  actualTotalTime?: number;
  createdBy: string;
  assignedTo?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PrepListItem {
  id: string;
  ingredientId: string;
  recipeId?: string;
  quantity: number;
  unit: string;
  priority: 'low' | 'normal' | 'high';
  estimatedTime: number;
  actualTime?: number;
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo?: string;
  completedBy?: string;
  completedAt?: Date;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  restaurantId: string;
  customerId?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  orderType: 'dine_in' | 'takeout' | 'delivery';
  items: any[];
  estimatedTime: number;
  actualTime?: number;
  totalCost: number;
  currency: string;
  notes?: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  scheduledFor?: Date;
}

export const orderProcessingService = {
  // Prep List Management
  generatePrepList: async (restaurantId: string, orders: Order[], date: Date): Promise<PrepList> => {
    const response = await apiService.post('/order-processing/prep-list', {
      restaurantId,
      orders,
      date: date.toISOString()
    });
    return response.data.data;
  },

  updatePrepList: async (prepListId: string, newOrder: Order): Promise<PrepList> => {
    const response = await apiService.put(`/order-processing/prep-list/${prepListId}`, {
      newOrder
    });
    return response.data.data;
  },

  // Batch Processing
  addOrderToBatch: async (order: Order): Promise<void> => {
    await apiService.post('/order-processing/batch/add', { order });
  },

  processNextBatch: async (restaurantId: string): Promise<any> => {
    const response = await apiService.post(`/order-processing/batch/${restaurantId}/process-next`);
    return response.data.data;
  },

  completeBatch: async (batchId: string): Promise<void> => {
    await apiService.put(`/order-processing/batch/${batchId}/complete`);
  },

  getQueueStatus: async (restaurantId: string): Promise<any> => {
    const response = await apiService.get(`/order-processing/queue/${restaurantId}/status`);
    return response.data.data;
  },

  optimizeQueue: async (restaurantId: string): Promise<void> => {
    await apiService.post(`/order-processing/queue/${restaurantId}/optimize`);
  }
};

export const analyticsService = {
  // Predictive Analytics
  generatePredictiveAnalytics: async (restaurantId: string, forecastDays: number = 7): Promise<any> => {
    const response = await apiService.get(`/analytics/${restaurantId}/predictive`, {
      params: { forecastDays }
    });
    return response.data.data;
  },

  // Cost Analysis
  generateCostAnalysis: async (restaurantId: string, startDate: Date, endDate: Date): Promise<any> => {
    const response = await apiService.get(`/analytics/${restaurantId}/cost-analysis`, {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    });
    return response.data.data;
  },

  // Performance Metrics
  getPerformanceMetrics: async (restaurantId: string, date?: Date): Promise<any> => {
    const response = await apiService.get(`/analytics/${restaurantId}/performance`, {
      params: date ? { date: date.toISOString() } : {}
    });
    return response.data.data;
  },

  // Role-based Dashboard
  getRoleDashboard: async (restaurantId: string, userId: string, role: string): Promise<any> => {
    const response = await apiService.get(`/analytics/${restaurantId}/dashboard`, {
      params: { userId, role }
    });
    return response.data.data;
  }
};

export const searchService = {
  // Smart Search
  search: async (
    restaurantId: string, 
    query: string, 
    userId: string, 
    context: string = 'general'
  ): Promise<any[]> => {
    const response = await apiService.get(`/search/${restaurantId}`, {
      params: { query, userId, context }
    });
    return response.data.data;
  },

  // Search Suggestions
  getSearchSuggestions: async (userId: string, partialQuery: string): Promise<string[]> => {
    const response = await apiService.get('/search/suggestions', {
      params: { userId, partialQuery }
    });
    return response.data.data;
  },

  // Quick Access Items
  getQuickAccessItems: async (userId: string): Promise<any[]> => {
    const response = await apiService.get(`/search/quick-access/${userId}`);
    return response.data.data;
  },

  // Record Selection
  recordSelection: async (userId: string, resultId: string): Promise<void> => {
    await apiService.post('/search/record-selection', { userId, resultId });
  },

  // Index Content
  indexContent: async (restaurantId: string): Promise<void> => {
    await apiService.post(`/search/${restaurantId}/index`);
  }
};

export const cachingService = {
  // Cache Metrics
  getCacheMetrics: async (): Promise<any> => {
    const response = await apiService.get('/cache/metrics');
    return response.data.data;
  },

  // Clear Cache
  clearCache: async (): Promise<void> => {
    await apiService.delete('/cache/clear');
  },

  // Invalidate by Pattern
  invalidateByPattern: async (pattern: string): Promise<number> => {
    const response = await apiService.post('/cache/invalidate', { pattern });
    return response.data.data.invalidated;
  },

  // Preload Data
  preloadFrequentData: async (restaurantId: string): Promise<void> => {
    await apiService.post(`/cache/${restaurantId}/preload`);
  },

  // Warm Cache
  warmCache: async (restaurantId: string): Promise<void> => {
    await apiService.post(`/cache/${restaurantId}/warm`);
  }
};

export const offlineSyncService = {
  // Device Initialization
  initializeDevice: async (deviceId: string, userId: string): Promise<void> => {
    await apiService.post('/offline-sync/initialize', { deviceId, userId });
  },

  // Queue Operation
  queueOperation: async (
    deviceId: string,
    operation: 'create' | 'update' | 'delete',
    table: string,
    recordId: string,
    data?: any,
    userId?: string
  ): Promise<void> => {
    await apiService.post('/offline-sync/queue-operation', {
      deviceId,
      operation,
      table,
      recordId,
      data,
      userId
    });
  },

  // Sync with Server
  syncWithServer: async (deviceId: string): Promise<any> => {
    const response = await apiService.post(`/offline-sync/${deviceId}/sync`);
    return response.data.data;
  },

  // Get Sync Status
  getSyncStatus: async (deviceId: string): Promise<any> => {
    const response = await apiService.get(`/offline-sync/${deviceId}/status`);
    return response.data.data;
  },

  // Cache Data for Offline
  cacheDataForOffline: async (deviceId: string, table: string, data: any[]): Promise<void> => {
    await apiService.post(`/offline-sync/${deviceId}/cache`, { table, data });
  },

  // Get Cached Data
  getCachedData: async (deviceId: string, table: string): Promise<any[]> => {
    const response = await apiService.get(`/offline-sync/${deviceId}/cache/${table}`);
    return response.data.data;
  },

  // Start Background Sync
  startBackgroundSync: async (deviceId: string, intervalMinutes: number = 5): Promise<void> => {
    await apiService.post(`/offline-sync/${deviceId}/background-sync`, { intervalMinutes });
  },

  // Export/Import Data
  exportOfflineData: async (deviceId: string): Promise<string> => {
    const response = await apiService.get(`/offline-sync/${deviceId}/export`);
    return response.data;
  },

  importOfflineData: async (deviceId: string, data: string): Promise<void> => {
    await apiService.post(`/offline-sync/${deviceId}/import`, { data });
  }
};
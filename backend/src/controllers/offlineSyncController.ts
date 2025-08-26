import { Request, Response } from 'express';
import { OfflineSyncService } from '../services/offlineSyncService';

export class OfflineSyncController {
  /**
   * Initialize device for offline sync
   */
  static initializeDevice(req: Request, res: Response): void {
    try {
      const { deviceId, userId } = req.body;
      
      if (!deviceId || !userId) {
        res.status(400).json({
          error: 'Device ID and user ID are required'
        });
        return;
      }
      
      OfflineSyncService.initializeDevice(deviceId, userId);
      
      res.status(200).json({
        message: 'Device initialized for offline sync'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to initialize device',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Queue operation for offline sync
   */
  static queueOperation(req: Request, res: Response): void {
    try {
      const { deviceId, operation, table, recordId, data, userId } = req.body;
      
      if (!deviceId || !operation || !table || !recordId) {
        res.status(400).json({
          error: 'Device ID, operation, table, and record ID are required'
        });
        return;
      }
      
      OfflineSyncService.queueOperation(deviceId, operation, table, recordId, data, userId);
      
      res.status(200).json({
        message: 'Operation queued for sync'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to queue operation',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Sync with server
   */
  static async syncWithServer(req: Request, res: Response) {
    try {
      const { deviceId } = req.params;
      
      const result = await OfflineSyncService.syncWithServer(deviceId);
      
      res.status(200).json({
        message: 'Sync completed',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        error: 'Sync failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get sync status
   */
  static getSyncStatus(req: Request, res: Response) {
    try {
      const { deviceId } = req.params;
      
      const status = OfflineSyncService.getSyncStatus(deviceId);
      
      res.status(200).json({
        message: 'Sync status retrieved',
        data: status
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get sync status',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Cache data for offline access
   */
  static cacheDataForOffline(req: Request, res: Response): void {
    try {
      const { deviceId } = req.params;
      const { table, data } = req.body;
      
      if (!table || !data) {
        res.status(400).json({
          error: 'Table and data are required'
        });
        return;
      }
      
      OfflineSyncService.cacheDataForOffline(deviceId, table, data);
      
      res.status(200).json({
        message: 'Data cached for offline access'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to cache data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get cached data for offline access
   */
  static getCachedData(req: Request, res: Response) {
    try {
      const { deviceId, table } = req.params;
      
      const data = OfflineSyncService.getCachedData(deviceId, table);
      
      res.status(200).json({
        message: 'Cached data retrieved',
        data
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get cached data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Start background sync
   */
  static startBackgroundSync(req: Request, res: Response) {
    try {
      const { deviceId } = req.params;
      const { intervalMinutes } = req.body;
      
      OfflineSyncService.startBackgroundSync(deviceId, intervalMinutes);
      
      res.status(200).json({
        message: 'Background sync started'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to start background sync',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Export offline data
   */
  static exportOfflineData(req: Request, res: Response) {
    try {
      const { deviceId } = req.params;
      
      const data = OfflineSyncService.exportOfflineData(deviceId);
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="offline-data-${deviceId}.json"`);
      res.send(data);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to export offline data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Import offline data
   */
  static importOfflineData(req: Request, res: Response): void {
    try {
      const { deviceId } = req.params;
      const { data } = req.body;
      
      if (!data) {
        res.status(400).json({
          error: 'Data is required'
        });
        return;
      }
      
      OfflineSyncService.importOfflineData(deviceId, data);
      
      res.status(200).json({
        message: 'Offline data imported successfully'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to import offline data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
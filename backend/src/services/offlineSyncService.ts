import { SyncOperation } from '../models';

// Type declarations for browser globals
declare const navigator: any;
declare const window: any;

export interface OfflineData {
  lastSync: Date;
  pendingOperations: SyncOperation[];
  cachedData: { [table: string]: any[] };
  conflicts: ConflictResolution[];
}

export interface ConflictResolution {
  id: string;
  operation: SyncOperation;
  serverData: any;
  clientData: any;
  resolution: 'client_wins' | 'server_wins' | 'merge' | 'manual';
  resolvedData?: any;
  timestamp: Date;
}

export class OfflineSyncService {
  private static offlineData = new Map<string, OfflineData>(); // keyed by deviceId
  private static syncInProgress = new Set<string>();

  /**
   * Initialize offline storage for device
   */
  static initializeDevice(deviceId: string, userId: string): void {
    if (!this.offlineData.has(deviceId)) {
      this.offlineData.set(deviceId, {
        lastSync: new Date(),
        pendingOperations: [],
        cachedData: {},
        conflicts: []
      });
    }
  }

  /**
   * Queue operation for offline sync
   */
  static queueOperation(
    deviceId: string,
    operation: 'create' | 'update' | 'delete',
    table: string,
    recordId: string,
    data?: any,
    userId?: string
  ): void {
    const offlineData = this.offlineData.get(deviceId);
    if (!offlineData) {
      this.initializeDevice(deviceId, userId || 'unknown');
      return this.queueOperation(deviceId, operation, table, recordId, data, userId);
    }

    const syncOp: SyncOperation = {
      id: this.generateId(),
      operation,
      table,
      recordId,
      data,
      timestamp: new Date(),
      status: 'pending',
      deviceId,
      userId: userId || 'unknown'
    };

    offlineData.pendingOperations.push(syncOp);
  }

  /**
   * Sync pending operations with server
   */
  static async syncWithServer(deviceId: string): Promise<{
    synced: number;
    conflicts: number;
    failed: number;
  }> {
    if (this.syncInProgress.has(deviceId)) {
      throw new Error('Sync already in progress for this device');
    }

    this.syncInProgress.add(deviceId);
    
    try {
      const offlineData = this.offlineData.get(deviceId);
      if (!offlineData) {
        throw new Error('Device not initialized');
      }

      let synced = 0;
      let conflicts = 0;
      let failed = 0;

      for (const operation of offlineData.pendingOperations) {
        try {
          const result = await this.syncOperation(operation);
          
          if (result.conflict) {
            offlineData.conflicts.push(result.conflict);
            conflicts++;
          } else {
            operation.status = 'synced';
            synced++;
          }
        } catch (error) {
          operation.status = 'failed';
          failed++;
        }
      }

      // Remove successfully synced operations
      offlineData.pendingOperations = offlineData.pendingOperations.filter(
        op => op.status !== 'synced'
      );

      offlineData.lastSync = new Date();

      return { synced, conflicts, failed };
    } finally {
      this.syncInProgress.delete(deviceId);
    }
  }

  /**
   * Sync single operation with conflict detection
   */
  private static async syncOperation(operation: SyncOperation): Promise<{
    success: boolean;
    conflict?: ConflictResolution;
  }> {
    // Check for conflicts with server data
    const serverData = await this.getServerData(operation.table, operation.recordId);
    
    if (serverData && this.hasConflict(operation, serverData)) {
      const conflict: ConflictResolution = {
        id: this.generateId(),
        operation,
        serverData,
        clientData: operation.data,
        resolution: this.determineResolution(operation, serverData),
        timestamp: new Date()
      };

      // Auto-resolve if possible
      if (conflict.resolution !== 'manual') {
        conflict.resolvedData = this.resolveConflict(conflict);
        await this.applyResolution(conflict);
      }

      return { success: false, conflict };
    }

    // No conflict, apply operation
    await this.applyOperation(operation);
    return { success: true };
  }

  /**
   * Check if operation conflicts with server data
   */
  private static hasConflict(operation: SyncOperation, serverData: any): boolean {
    if (!serverData) return false;

    // Simple timestamp-based conflict detection
    const serverTimestamp = new Date(serverData.updatedAt);
    return serverTimestamp > operation.timestamp;
  }

  /**
   * Determine conflict resolution strategy
   */
  private static determineResolution(
    operation: SyncOperation, 
    serverData: any
  ): 'client_wins' | 'server_wins' | 'merge' | 'manual' {
    // Simple rules for auto-resolution
    if (operation.table === 'prep_list_items' && operation.operation === 'update') {
      // For prep list items, prefer client completion status
      return 'merge';
    }

    if (operation.table === 'orders' && operation.operation === 'update') {
      // For orders, prefer latest status update
      return operation.timestamp > new Date(serverData.updatedAt) ? 'client_wins' : 'server_wins';
    }

    // Default to manual resolution for complex conflicts
    return 'manual';
  }

  /**
   * Resolve conflict based on resolution strategy
   */
  private static resolveConflict(conflict: ConflictResolution): any {
    switch (conflict.resolution) {
      case 'client_wins':
        return conflict.clientData;
      
      case 'server_wins':
        return conflict.serverData;
      
      case 'merge':
        return this.mergeData(conflict.serverData, conflict.clientData);
      
      default:
        return null; // Manual resolution required
    }
  }

  /**
   * Merge client and server data intelligently
   */
  private static mergeData(serverData: any, clientData: any): any {
    const merged = { ...serverData };

    // Merge specific fields based on data type
    if (clientData.status && this.isStatusProgression(serverData.status, clientData.status)) {
      merged.status = clientData.status;
      merged.statusUpdatedAt = clientData.statusUpdatedAt || new Date();
    }

    if (clientData.completedAt && !serverData.completedAt) {
      merged.completedAt = clientData.completedAt;
      merged.completedBy = clientData.completedBy;
    }

    if (clientData.notes && clientData.notes !== serverData.notes) {
      merged.notes = `${serverData.notes || ''}\n[Offline]: ${clientData.notes}`.trim();
    }

    return merged;
  }

  /**
   * Check if status change represents valid progression
   */
  private static isStatusProgression(oldStatus: string, newStatus: string): boolean {
    const progressions: { [key: string]: string[] } = {
      'pending': ['in_progress', 'completed'],
      'in_progress': ['completed', 'cancelled'],
      'completed': [], // No further progression
      'cancelled': []
    };

    return progressions[oldStatus]?.includes(newStatus) || false;
  }

  /**
   * Cache data for offline access
   */
  static cacheDataForOffline(
    deviceId: string,
    table: string,
    data: any[]
  ): void {
    const offlineData = this.offlineData.get(deviceId);
    if (!offlineData) return;

    offlineData.cachedData[table] = data;
  }

  /**
   * Get cached data for offline access
   */
  static getCachedData(deviceId: string, table: string): any[] {
    const offlineData = this.offlineData.get(deviceId);
    return offlineData?.cachedData[table] || [];
  }

  /**
   * Get sync status for device
   */
  static getSyncStatus(deviceId: string): {
    lastSync: Date | null;
    pendingOperations: number;
    conflicts: number;
    isOnline: boolean;
    nextSyncETA?: Date;
  } {
    const offlineData = this.offlineData.get(deviceId);
    
    return {
      lastSync: offlineData?.lastSync || null,
      pendingOperations: offlineData?.pendingOperations.length || 0,
      conflicts: offlineData?.conflicts.length || 0,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : false,
      nextSyncETA: this.calculateNextSyncETA(deviceId)
    };
  }

  /**
   * Start background sync process
   */
  static startBackgroundSync(deviceId: string, intervalMinutes: number = 5): void {
    setInterval(async () => {
      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      if (isOnline && !this.syncInProgress.has(deviceId)) {
        try {
          await this.syncWithServer(deviceId);
        } catch (error) {
          console.error('Background sync failed:', error);
        }
      }
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * Handle network connectivity changes
   */
  static handleConnectivityChange(deviceId: string): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', async () => {
        if (!this.syncInProgress.has(deviceId)) {
          try {
            await this.syncWithServer(deviceId);
          } catch (error) {
            console.error('Auto-sync on reconnection failed:', error);
          }
        }
      });

      window.addEventListener('offline', () => {
        console.log('Device went offline, queuing operations for later sync');
      });
    }
  }

  /**
   * Export offline data for backup/debugging
   */
  static exportOfflineData(deviceId: string): string {
    const offlineData = this.offlineData.get(deviceId);
    return JSON.stringify(offlineData, null, 2);
  }

  /**
   * Import offline data from backup
   */
  static importOfflineData(deviceId: string, data: string): void {
    try {
      const parsed = JSON.parse(data);
      this.offlineData.set(deviceId, parsed);
    } catch (error) {
      throw new Error('Invalid offline data format');
    }
  }

  // Helper methods (placeholder implementations)
  private static async getServerData(table: string, recordId: string): Promise<any> {
    // TODO: Implement server data fetch
    return null;
  }

  private static async applyOperation(operation: SyncOperation): Promise<void> {
    // TODO: Implement server operation application
  }

  private static async applyResolution(conflict: ConflictResolution): Promise<void> {
    // TODO: Implement conflict resolution application
  }

  private static calculateNextSyncETA(deviceId: string): Date | undefined {
    // TODO: Implement ETA calculation based on sync patterns
    return undefined;
  }

  private static generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
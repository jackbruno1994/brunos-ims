import { CacheEntry } from '../models';

interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  cleanupInterval: number;
}

export class CachingService {
  private static cache = new Map<string, CacheEntry>();
  private static config: CacheConfig = {
    maxSize: 1000,
    defaultTTL: 3600, // 1 hour in seconds
    cleanupInterval: 300 // 5 minutes in seconds
  };
  private static metrics = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalRequests: 0
  };

  /**
   * Initialize caching service
   */
  static initialize(config?: Partial<CacheConfig>): void {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Start cleanup interval
    setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval * 1000);
  }

  /**
   * Get value from cache
   */
  static get<T>(key: string): T | null {
    this.metrics.totalRequests++;
    
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.metrics.misses++;
      return null;
    }

    // Check if entry has expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.metrics.misses++;
      return null;
    }

    // Update access metrics
    entry.accessCount++;
    entry.lastAccessed = new Date();
    this.metrics.hits++;

    return entry.data as T;
  }

  /**
   * Set value in cache
   */
  static set(key: string, data: any, ttl?: number): void {
    // Check cache size limit
    if (this.cache.size >= this.config.maxSize) {
      this.evictLeastUsed();
    }

    const entry: CacheEntry = {
      key,
      data,
      timestamp: new Date(),
      ttl: ttl || this.config.defaultTTL,
      accessCount: 1,
      lastAccessed: new Date()
    };

    this.cache.set(key, entry);
  }

  /**
   * Delete value from cache
   */
  static delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  static clear(): void {
    this.cache.clear();
    this.resetMetrics();
  }

  /**
   * Get cache metrics
   */
  static getMetrics(): {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
    evictions: number;
    totalRequests: number;
  } {
    const hitRate = this.metrics.totalRequests > 0 
      ? (this.metrics.hits / this.metrics.totalRequests) * 100 
      : 0;

    return {
      size: this.cache.size,
      hits: this.metrics.hits,
      misses: this.metrics.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      evictions: this.metrics.evictions,
      totalRequests: this.metrics.totalRequests
    };
  }

  /**
   * Smart cache invalidation for related data
   */
  static invalidateByPattern(pattern: string): number {
    let invalidated = 0;
    const regex = new RegExp(pattern);

    for (const [key] of this.cache) {
      if (regex.test(key)) {
        this.cache.delete(key);
        invalidated++;
      }
    }

    return invalidated;
  }

  /**
   * Cache frequently accessed recipes
   */
  static async cacheRecipe(recipeId: string, recipe: any): Promise<void> {
    const key = `recipe:${recipeId}`;
    this.set(key, recipe, 7200); // 2 hours TTL for recipes
  }

  /**
   * Cache menu items
   */
  static async cacheMenuItem(menuItemId: string, menuItem: any): Promise<void> {
    const key = `menuitem:${menuItemId}`;
    this.set(key, menuItem, 3600); // 1 hour TTL for menu items
  }

  /**
   * Cache prep lists
   */
  static async cachePrepList(prepListId: string, prepList: any): Promise<void> {
    const key = `preplist:${prepListId}`;
    this.set(key, prepList, 1800); // 30 minutes TTL for prep lists
  }

  /**
   * Cache user search results
   */
  static async cacheSearchResults(query: string, results: any): Promise<void> {
    const key = `search:${this.hashString(query)}`;
    this.set(key, results, 900); // 15 minutes TTL for search results
  }

  /**
   * Get cached search results
   */
  static getCachedSearchResults(query: string): any | null {
    const key = `search:${this.hashString(query)}`;
    return this.get(key);
  }

  /**
   * Preload frequently accessed data
   */
  static async preloadFrequentData(restaurantId: string): Promise<void> {
    // This would be called during low-traffic periods
    // TODO: Implement preloading of:
    // - Popular menu items
    // - Frequently used recipes
    // - Common search queries
    // - User preferences
  }

  /**
   * Smart cache warming based on usage patterns
   */
  static async warmCache(restaurantId: string): Promise<void> {
    // TODO: Implement intelligent cache warming based on:
    // - Historical access patterns
    // - Time of day
    // - Day of week
    // - Seasonal trends
  }

  /**
   * Check if cache entry is expired
   */
  private static isExpired(entry: CacheEntry): boolean {
    const now = new Date();
    const expiryTime = new Date(entry.timestamp.getTime() + (entry.ttl * 1000));
    return now > expiryTime;
  }

  /**
   * Evict least recently used entry
   */
  private static evictLeastUsed(): void {
    let oldestEntry: CacheEntry | null = null;
    let oldestKey = '';

    for (const [key, entry] of this.cache) {
      if (!oldestEntry || entry.lastAccessed < oldestEntry.lastAccessed) {
        oldestEntry = entry;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.metrics.evictions++;
    }
  }

  /**
   * Cleanup expired entries
   */
  private static cleanup(): void {
    const now = new Date();
    const toDelete: string[] = [];

    for (const [key, entry] of this.cache) {
      if (this.isExpired(entry)) {
        toDelete.push(key);
      }
    }

    for (const key of toDelete) {
      this.cache.delete(key);
    }
  }

  /**
   * Reset metrics
   */
  private static resetMetrics(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalRequests: 0
    };
  }

  /**
   * Simple string hash function
   */
  private static hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }
}
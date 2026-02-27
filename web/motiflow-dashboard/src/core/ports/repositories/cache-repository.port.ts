/**
 * Cache Repository Port
 * 
 * Port (interface) for cache operations.
 * Follows Repository Pattern and Strategy Pattern for different cache strategies.
 */

export interface CacheEntry<T> {
  key: string;
  value: T;
  expiresAt: number;
}

export interface CacheRepositoryPort {
  /**
   * Get value from cache
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Set value in cache with optional TTL (time to live in seconds)
   */
  set<T>(key: string, value: T, ttl?: number): Promise<void>;

  /**
   * Delete value from cache
   */
  delete(key: string): Promise<void>;

  /**
   * Clear all cache entries
   */
  clear(): Promise<void>;

  /**
   * Check if key exists in cache
   */
  has(key: string): Promise<boolean>;

  /**
   * Get cache statistics
   */
  getStats(): Promise<{
    size: number;
    hitRate: number;
    missRate: number;
  }>;
}

/**
 * Memory Cache Repository
 * 
 * In-memory implementation of CacheRepositoryPort.
 * Uses Strategy Pattern - can be swapped with Redis, etc.
 */

import type { CacheRepositoryPort, CacheEntry } from '@/core/ports/repositories/cache-repository.port';

interface CacheStats {
  hits: number;
  misses: number;
}

export class MemoryCacheRepository implements CacheRepositoryPort {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
  };

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const expiresAt = ttl ? Date.now() + ttl * 1000 : Number.MAX_SAFE_INTEGER;

    this.cache.set(key, {
      key,
      value,
      expiresAt,
    });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    // Check if expired
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  async getStats(): Promise<{
    size: number;
    hitRate: number;
    missRate: number;
  }> {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? this.stats.hits / total : 0;
    const missRate = total > 0 ? this.stats.misses / total : 0;

    return {
      size: this.cache.size,
      hitRate,
      missRate,
    };
  }
}

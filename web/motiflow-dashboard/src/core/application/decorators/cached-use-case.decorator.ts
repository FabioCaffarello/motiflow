/**
 * Cached Use Case Decorator
 * 
 * Decorator Pattern implementation for adding cache to use cases.
 * Wraps use cases with caching functionality without modifying their implementation.
 */

import type { CacheRepositoryPort } from '@/core/ports/repositories/cache-repository.port';

export interface UseCase<TCommand, TResult> {
  execute(command: TCommand): Promise<TResult>;
}

/**
 * Cache key generator function type
 */
export type CacheKeyGenerator<TCommand> = (command: TCommand) => string;

/**
 * Cached Use Case Decorator
 * 
 * Adds caching layer to any use case.
 * 
 * @example
 * ```ts
 * const cachedListEpics = cachedUseCase(
 *   listEpicsUseCase,
 *   cacheRepository,
 *   (command) => `epics:${command.status || 'all'}`
 * );
 * ```
 */
export function cachedUseCase<TCommand, TResult>(
  useCase: UseCase<TCommand, TResult>,
  cacheRepository: CacheRepositoryPort,
  keyGenerator: CacheKeyGenerator<TCommand>,
  ttl?: number // Time to live in seconds
): UseCase<TCommand, TResult> {
  return {
    async execute(command: TCommand): Promise<TResult> {
      const cacheKey = keyGenerator(command);

      // Try to get from cache
      const cached = await cacheRepository.get<TResult>(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Execute use case
      const result = await useCase.execute(command);

      // Store in cache
      await cacheRepository.set(cacheKey, result, ttl);

      return result;
    },
  };
}

/**
 * Helper to create cache key from command
 */
export function createCacheKey(prefix: string, ...parts: (string | number | undefined)[]): string {
  const validParts = parts.filter((p): p is string | number => p !== undefined);
  return `${prefix}:${validParts.join(':')}`;
}

/**
 * Result type for Server Actions
 * Provides type-safe success/error handling
 */
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Helper to create success result
 */
export function success<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

/**
 * Helper to create error result
 */
export function failure(error: string): ActionResult<never> {
  return { success: false, error };
}

import { z } from 'zod';

/**
 * localStorage Utilities
 *
 * Typed helpers for localStorage access with Zod validation.
 * Never access localStorage directly - always use these helpers.
 *
 * Key pattern: autocare:{category}:{identifier}
 * - autocare:vehicle:current - Currently selected vehicle
 * - autocare:guide:active - Active guide state
 * - autocare:cache:guides - Cached guide data
 */

/**
 * Save data to localStorage with JSON serialization
 * @param key - Storage key (should follow autocare: namespace pattern)
 * @param data - Data to store (will be JSON stringified)
 */
export function saveToStorage<T>(key: string, data: T): void {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.error(`Failed to save to localStorage key "${key}":`, error);
  }
}

/**
 * Load data from localStorage with Zod validation
 * @param key - Storage key
 * @param schema - Zod schema to validate the data against
 * @returns Validated data or null if not found/invalid
 */
export function loadFromStorage<T>(key: string, schema: z.ZodType<T>): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    const validated = schema.parse(parsed);

    return validated;
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Schema validation failed - corrupted or outdated data
      console.error(`localStorage data for key "${key}" failed validation:`, error.issues);
      // Remove corrupted data
      localStorage.removeItem(key);
    } else if (error instanceof SyntaxError) {
      // JSON parse error
      console.error(`localStorage data for key "${key}" is not valid JSON:`, error);
      localStorage.removeItem(key);
    } else {
      console.error(`Failed to load from localStorage key "${key}":`, error);
    }

    return null;
  }
}

/**
 * Remove data from localStorage
 * @param key - Storage key to remove
 */
export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove localStorage key "${key}":`, error);
  }
}

/**
 * Check if a key exists in localStorage
 * @param key - Storage key to check
 * @returns true if key exists
 */
export function existsInStorage(key: string): boolean {
  try {
    return localStorage.getItem(key) !== null;
  } catch {
    return false;
  }
}

/**
 * Clear all autocare: namespaced keys from localStorage
 * Use with caution - this removes all app data
 */
export function clearAllAppStorage(): void {
  try {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('autocare:')) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.error('Failed to clear app storage:', error);
  }
}

// Storage key constants
export const STORAGE_KEYS = {
  CURRENT_VEHICLE: 'autocare:vehicle:current',
  ACTIVE_GUIDE: 'autocare:guide:active',
  CACHED_GUIDES: 'autocare:cache:guides',
  COST_TRACKING: 'autocare:costs:monthly',
} as const;

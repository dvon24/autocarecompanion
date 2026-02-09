'use client';

import { useState, useCallback, useEffect } from 'react';
import { type Guide } from '@/schemas/guide.schema';

/**
 * useGuideCache - Hook for caching guides for offline use
 *
 * Story 2.1: Guide Caching via Service Worker
 * Story 2.2: Cache Status Badge & Proactive Caching
 *
 * Features:
 * - Cache guides to localStorage for offline access
 * - Check if a guide is cached
 * - List all cached guides
 * - Remove cached guides
 * - 30+ day cache validity
 */

const CACHE_KEY_PREFIX = 'au7o_guide_';
const CACHE_INDEX_KEY = 'au7o_cached_guides';
const CACHE_VALIDITY_DAYS = 30;

type CachedGuideEntry = {
  id: string;
  title: string;
  vehicleInfo: string;
  cachedAt: number;
  expiresAt: number;
};

type UseGuideCacheReturn = {
  /** Cache a guide for offline use */
  cacheGuide: (guide: Guide) => Promise<boolean>;
  /** Get a cached guide by ID */
  getCachedGuide: (guideId: string) => Guide | null;
  /** Check if a guide is cached */
  isGuideCached: (guideId: string) => boolean;
  /** Remove a cached guide */
  removeCachedGuide: (guideId: string) => void;
  /** Get all cached guide entries (metadata only) */
  cachedGuides: CachedGuideEntry[];
  /** Clear all cached guides */
  clearAllCachedGuides: () => void;
  /** Get cache size in bytes (approximate) */
  cacheSize: number;
};

/**
 * Get the cache key for a guide
 */
function getGuideKey(guideId: string): string {
  return `${CACHE_KEY_PREFIX}${guideId}`;
}

/**
 * Check if a cache entry is expired
 */
function isExpired(expiresAt: number): boolean {
  return Date.now() > expiresAt;
}

export function useGuideCache(): UseGuideCacheReturn {
  const [cachedGuides, setCachedGuides] = useState<CachedGuideEntry[]>([]);
  const [cacheSize, setCacheSize] = useState(0);

  // Load cached guide index on mount
  useEffect(() => {
    loadCacheIndex();
  }, []);

  // Load the cache index from localStorage
  const loadCacheIndex = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      const indexJson = localStorage.getItem(CACHE_INDEX_KEY);
      if (!indexJson) {
        setCachedGuides([]);
        return;
      }

      const index: CachedGuideEntry[] = JSON.parse(indexJson);

      // Filter out expired entries
      const validEntries = index.filter(entry => !isExpired(entry.expiresAt));

      // Clean up expired guides
      const expiredEntries = index.filter(entry => isExpired(entry.expiresAt));
      expiredEntries.forEach(entry => {
        localStorage.removeItem(getGuideKey(entry.id));
      });

      // Update index if we removed expired entries
      if (expiredEntries.length > 0) {
        localStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(validEntries));
      }

      setCachedGuides(validEntries);

      // Calculate approximate cache size
      let size = 0;
      validEntries.forEach(entry => {
        const guideJson = localStorage.getItem(getGuideKey(entry.id));
        if (guideJson) {
          size += guideJson.length * 2; // UTF-16 = 2 bytes per char
        }
      });
      setCacheSize(size);
    } catch (error) {
      console.error('Error loading cache index:', error);
      setCachedGuides([]);
    }
  }, []);

  // Cache a guide for offline use
  const cacheGuide = useCallback(async (guide: Guide): Promise<boolean> => {
    if (typeof window === 'undefined') return false;

    try {
      const now = Date.now();
      const expiresAt = now + (CACHE_VALIDITY_DAYS * 24 * 60 * 60 * 1000);

      // Store the guide
      const guideJson = JSON.stringify(guide);
      localStorage.setItem(getGuideKey(guide.id), guideJson);

      // Update the index
      const entry: CachedGuideEntry = {
        id: guide.id,
        title: guide.title,
        vehicleInfo: `${guide.vehicle.year} ${guide.vehicle.make} ${guide.vehicle.model}`,
        cachedAt: now,
        expiresAt,
      };

      const currentIndex = [...cachedGuides.filter(e => e.id !== guide.id), entry];
      localStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(currentIndex));

      setCachedGuides(currentIndex);
      setCacheSize(prev => prev + guideJson.length * 2);

      return true;
    } catch (error) {
      // localStorage might be full
      console.error('Error caching guide:', error);
      return false;
    }
  }, [cachedGuides]);

  // Get a cached guide by ID
  const getCachedGuide = useCallback((guideId: string): Guide | null => {
    if (typeof window === 'undefined') return null;

    try {
      const guideJson = localStorage.getItem(getGuideKey(guideId));
      if (!guideJson) return null;

      return JSON.parse(guideJson) as Guide;
    } catch (error) {
      console.error('Error getting cached guide:', error);
      return null;
    }
  }, []);

  // Check if a guide is cached
  const isGuideCached = useCallback((guideId: string): boolean => {
    return cachedGuides.some(entry => entry.id === guideId && !isExpired(entry.expiresAt));
  }, [cachedGuides]);

  // Remove a cached guide
  const removeCachedGuide = useCallback((guideId: string): void => {
    if (typeof window === 'undefined') return;

    try {
      // Remove the guide data
      const guideJson = localStorage.getItem(getGuideKey(guideId));
      localStorage.removeItem(getGuideKey(guideId));

      // Update the index
      const newIndex = cachedGuides.filter(e => e.id !== guideId);
      localStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(newIndex));

      setCachedGuides(newIndex);
      if (guideJson) {
        setCacheSize(prev => Math.max(0, prev - guideJson.length * 2));
      }
    } catch (error) {
      console.error('Error removing cached guide:', error);
    }
  }, [cachedGuides]);

  // Clear all cached guides
  const clearAllCachedGuides = useCallback((): void => {
    if (typeof window === 'undefined') return;

    try {
      // Remove all guide data
      cachedGuides.forEach(entry => {
        localStorage.removeItem(getGuideKey(entry.id));
      });

      // Clear the index
      localStorage.removeItem(CACHE_INDEX_KEY);

      setCachedGuides([]);
      setCacheSize(0);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }, [cachedGuides]);

  return {
    cacheGuide,
    getCachedGuide,
    isGuideCached,
    removeCachedGuide,
    cachedGuides,
    clearAllCachedGuides,
    cacheSize,
  };
}

/**
 * Server-Side Guide Cache
 *
 * Caches AI-generated repair guides in the database so subsequent requests
 * for the same YMMT + maintenance type return instantly without an AI call.
 *
 * Key features:
 * - Cache key per year/make/model/trim/type
 * - Nearby-year fallback (+/-3 years, same platform sharing)
 * - Fresh IDs per served guide (for progress tracking)
 * - Fire-and-forget store (doesn't block response)
 * - Daily hit/miss stats tracking
 */

import prisma from '@/lib/db';
import { generateGuideId, type Guide } from '@/schemas/guide.schema';
import { getMaintenanceTypeByName, MAINTENANCE_SCHEDULES } from '@/lib/maintenance';

/**
 * Build a deterministic cache key from vehicle + maintenance type.
 * e.g., "2019_chevrolet_camaro_zl1_oil-change"
 */
export function buildCacheKey(
  year: number,
  make: string,
  model: string,
  trim: string,
  maintenanceType: string
): string {
  const parts = [
    String(year),
    make.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    model.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    trim ? trim.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '',
    maintenanceType.replace(/_/g, '-'),
  ].filter(Boolean);
  return parts.join('_');
}

/**
 * Extract maintenance type ID from a diagnosis title.
 * Maps "Oil Change" -> "oil_change", "Spark Plugs" -> "spark_plugs".
 * Falls back to slugifying the title for non-standard diagnoses.
 */
export function extractMaintenanceType(diagnosis: { id?: string; title: string }): string {
  // Try exact name match via MAINTENANCE_SCHEDULES
  const byName = getMaintenanceTypeByName(diagnosis.title);
  if (byName) return byName;

  // Try partial match - check if any schedule name is contained in the diagnosis title
  const titleLower = diagnosis.title.toLowerCase();
  for (const [id, type] of Object.entries(MAINTENANCE_SCHEDULES)) {
    if (titleLower.includes(type.name.toLowerCase())) return id;
  }

  // Fallback: slugify the title
  return diagnosis.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Look up a cached guide by exact key, with nearby-year fallback.
 * If found, increments hitCount and returns a clone with fresh IDs.
 */
export async function getCachedGuide(
  year: number,
  make: string,
  model: string,
  trim: string,
  maintenanceType: string
): Promise<Guide | null> {
  try {
    const cacheKey = buildCacheKey(year, make, model, trim, maintenanceType);

    // Try exact match first
    let cached = await prisma.cachedGuide.findUnique({
      where: { cacheKey },
    });

    // On miss, try nearby years (+/-3) for same make/model/trim/type
    if (!cached) {
      const nearbyYears: number[] = [];
      for (let delta = 1; delta <= 3; delta++) {
        nearbyYears.push(year - delta, year + delta);
      }

      const nearbyKeys = nearbyYears.map((y) =>
        buildCacheKey(y, make, model, trim, maintenanceType)
      );

      cached = await prisma.cachedGuide.findFirst({
        where: {
          cacheKey: { in: nearbyKeys },
        },
        orderBy: {
          // Prefer closest year (by hitCount as proxy for popularity)
          hitCount: 'desc',
        },
      });
    }

    if (!cached) return null;

    // Increment hit count (fire-and-forget)
    prisma.cachedGuide
      .update({
        where: { id: cached.id },
        data: {
          hitCount: { increment: 1 },
          lastHitAt: new Date(),
        },
      })
      .catch(() => {
        // Non-critical - don't fail the request
      });

    // Clone guide with fresh IDs and requested year
    const guide = cached.guideJson as unknown as Guide;
    return cloneGuideWithNewIds(guide, year);
  } catch (error) {
    console.error('[guide-cache] getCachedGuide error:', error);
    return null;
  }
}

/**
 * Store a generated guide in the cache. Uses upsert to handle
 * concurrent first-generation race conditions gracefully.
 */
export async function storeCachedGuide(
  guide: Guide,
  maintenanceType: string,
  costUsd?: number,
  status?: string
): Promise<void> {
  try {
    const vehicle = guide.vehicle;
    const cacheKey = buildCacheKey(
      vehicle.year,
      vehicle.make,
      vehicle.model,
      vehicle.trim,
      maintenanceType
    );

    await prisma.cachedGuide.upsert({
      where: { cacheKey },
      create: {
        cacheKey,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        trim: vehicle.trim || '',
        maintenanceType,
        guideJson: guide as any,
        title: guide.title,
        status: status || 'auto-generated',
        version: 1,
        hitCount: 0,
        generationCostUsd: costUsd ?? null,
      },
      update: {
        // Don't overwrite if already exists (first-writer wins)
      },
    });
  } catch (error) {
    console.error('[guide-cache] storeCachedGuide error:', error);
  }
}

/**
 * Record a cache hit or miss in daily stats.
 */
export async function recordCacheEvent(
  hit: boolean,
  savingsUsd?: number
): Promise<void> {
  try {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    await prisma.guideCacheStats.upsert({
      where: { date: today },
      create: {
        date: today,
        hits: hit ? 1 : 0,
        misses: hit ? 0 : 1,
        savings: savingsUsd ?? 0,
      },
      update: {
        hits: hit ? { increment: 1 } : undefined,
        misses: hit ? undefined : { increment: 1 },
        savings: savingsUsd ? { increment: savingsUsd } : undefined,
      },
    });
  } catch (error) {
    console.error('[guide-cache] recordCacheEvent error:', error);
  }
}

/**
 * Clone a cached guide with fresh unique IDs and a new year.
 * Each served guide gets unique IDs for progress tracking.
 */
export function cloneGuideWithNewIds(cached: Guide, requestedYear: number): Guide {
  const guideId = generateGuideId();

  return {
    ...cached,
    id: guideId,
    vehicle: {
      ...cached.vehicle,
      year: requestedYear,
    },
    steps: cached.steps.map((step, stepIdx) => ({
      ...step,
      tips: step.tips.map((tip, tipIdx) => ({
        ...tip,
        id: `tip_${guideId}_${stepIdx}_${tipIdx}`,
      })),
      safetyWarnings: step.safetyWarnings.map((warn, warnIdx) => ({
        ...warn,
        id: `warn_${guideId}_${stepIdx}_${warnIdx}`,
      })),
    })),
    tools: cached.tools.map((tool, idx) => ({
      ...tool,
      id: `tool_${guideId}_${idx}`,
    })),
    parts: cached.parts.map((part, idx) => ({
      ...part,
      id: `part_${guideId}_${idx}`,
    })),
    createdAt: Date.now(),
  };
}

const ESTIMATED_COST_PER_GUIDE = 0.21;

/**
 * Get aggregate cache stats for the admin dashboard.
 */
export async function getCacheStats(): Promise<{
  totalCached: number;
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  totalSavings: number;
  pendingReview: number;
}> {
  try {
    const [totalCached, pendingReview, statsAgg] = await Promise.all([
      prisma.cachedGuide.count(),
      prisma.cachedGuide.count({ where: { status: 'auto-generated' } }),
      prisma.guideCacheStats.aggregate({
        _sum: { hits: true, misses: true, savings: true },
      }),
    ]);

    const totalHits = statsAgg._sum.hits ?? 0;
    const totalMisses = statsAgg._sum.misses ?? 0;
    const total = totalHits + totalMisses;

    return {
      totalCached,
      totalHits,
      totalMisses,
      hitRate: total > 0 ? (totalHits / total) * 100 : 0,
      totalSavings: statsAgg._sum.savings ?? 0,
      pendingReview,
    };
  } catch (error) {
    console.error('[guide-cache] getCacheStats error:', error);
    return {
      totalCached: 0,
      totalHits: 0,
      totalMisses: 0,
      hitRate: 0,
      totalSavings: 0,
      pendingReview: 0,
    };
  }
}

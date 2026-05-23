/**
 * Owner's manual maintenance schedule loader.
 *
 * Loads per-YMMT detailed schedules sourced directly from manufacturer
 * owner's manuals — anchored intervals + fluid specs + capacities + cited
 * source URL. Distinct from MAINTENANCE_SCHEDULES in src/lib/maintenance.ts
 * which only stores generic default intervals.
 *
 * Data lives in src/data/maintenance-schedules.json, structured:
 *   Make > Model > Generation > schedule.{service_type}.{interval, fluid, capacity, note, verified}
 *
 * Phase 0 POC: 2019 Chevrolet Camaro ZL1 (LT4) only.
 * Phase 1 will expand to top 25 US vehicles via verified-source pipeline.
 */

import schedulesData from '@/data/maintenance-schedules.json';

export interface ServiceInterval {
  /** Primary interval, e.g. "60,000 mi or every 5 years" */
  interval: string;
  /** Severe-service interval if defined */
  interval_severe?: string;
  /** Manufacturer-recommended fluid specification */
  fluid?: string;
  /** Capacity (with units) */
  capacity?: string;
  /** Additional owner-relevant note */
  note?: string;
  /** Owner-manual sourced (true) vs estimated (false) */
  verified: boolean;
  // Some service types use slightly different fields; keep loose typing
  [key: string]: string | number | boolean | undefined;
}

export interface VehicleSchedule {
  years: number[];
  trims: string[];
  engine: string;
  transmission: string;
  source: {
    primary: string;
    url?: string;
    supplement_url?: string;
    section?: string;
  };
  /** Keyed by service type id (e.g., "engine_oil", "supercharger_oil") */
  schedule: Record<string, ServiceInterval>;
  /** Top-level alerts the owner should know about this specific vehicle */
  owner_alerts?: string[];
}

interface SchedulesFile {
  _note?: string;
  _schema_version?: string;
  [make: string]: unknown;
}

/**
 * Get the full owner's-manual-sourced schedule for a specific YMMT.
 *
 * Matches by year + make + model + (optionally) trim. Falls back to the
 * widest generation entry that includes the requested year.
 */
export function getOwnersManualSchedule(opts: {
  year: number;
  make: string;
  model: string;
  trim?: string;
}): VehicleSchedule | null {
  const data = schedulesData as SchedulesFile;
  const makeData = data[opts.make] as Record<string, Record<string, VehicleSchedule>> | undefined;
  if (!makeData) return null;

  const modelData = makeData[opts.model];
  if (!modelData) return null;

  // Find a generation entry whose years includes the requested year.
  // If trim is provided, prefer entries listing that trim.
  let bestMatch: VehicleSchedule | null = null;
  for (const generation of Object.values(modelData)) {
    if (!generation.years.includes(opts.year)) continue;
    // Trim match takes priority
    if (opts.trim && generation.trims.some((t) => t.toLowerCase() === opts.trim?.toLowerCase())) {
      return generation;
    }
    // Otherwise keep the first year-matched entry as fallback
    if (!bestMatch) bestMatch = generation;
  }

  return bestMatch;
}

/**
 * Count how many YMMT combinations are currently covered by owner's-manual
 * schedules. Used for admin/dashboard coverage reporting.
 */
export function getScheduleCoverage(): {
  totalSchedules: number;
  byMake: Record<string, number>;
} {
  const data = schedulesData as SchedulesFile;
  const byMake: Record<string, number> = {};
  let total = 0;
  for (const [make, makeData] of Object.entries(data)) {
    if (make.startsWith('_')) continue;
    if (!makeData || typeof makeData !== 'object') continue;
    let makeTotal = 0;
    for (const modelData of Object.values(makeData as Record<string, unknown>)) {
      if (!modelData || typeof modelData !== 'object') continue;
      makeTotal += Object.keys(modelData as Record<string, unknown>).length;
    }
    byMake[make] = makeTotal;
    total += makeTotal;
  }
  return { totalSchedules: total, byMake };
}

/**
 * Owner's manual maintenance schedule loader.
 *
 * Loads per-YMMT detailed schedules sourced directly from manufacturer
 * owner's manuals — anchored intervals + fluid specs + capacities + cited
 * source URL. Distinct from MAINTENANCE_SCHEDULES in src/lib/maintenance.ts
 * which only stores generic default intervals.
 *
 * Data lives in src/data/maintenance-schedules.json, structured:
 *   Make > Model > Generation > schedule.{service_type}
 *
 * Schema v1.1 adds structured numeric intervals (interval_miles +
 * interval_months) alongside the human-readable interval_display string,
 * so the SMS reminder engine can compute "is this due now?" math.
 *
 * Phase 0/1 POC: 2019 Chevrolet Camaro ZL1 (LT4).
 * Phase 1 expansion: top 25 US vehicles via verified-source pipeline.
 */

import schedulesData from '@/data/maintenance-schedules.json';

export interface ServiceInterval {
  /** Human-readable interval, e.g. "60,000 mi or every 5 years" */
  interval_display: string;
  /** Mileage interval as integer; null when interval is time-based only */
  interval_miles: number | null;
  /** Time interval in months; null when interval is mileage-based only */
  interval_months: number | null;
  /** Optional severe-service display string */
  interval_severe_display?: string;
  /** Severe-service mileage interval */
  interval_severe_miles?: number | null;
  /** Severe-service time interval in months */
  interval_severe_months?: number | null;
  /** For services with distinct first/subsequent intervals (e.g., engine coolant) */
  interval_first_miles?: number;
  interval_first_months?: number;
  /** Manufacturer-recommended fluid specification */
  fluid?: string;
  /** Capacity (with units) */
  capacity?: string;
  /** Part number for consumables (spark plugs, filters) */
  part_number?: string;
  /** Spark plug gap, torque, etc. */
  gap?: string;
  torque?: string;
  spec?: string;
  /** Additional owner-relevant note */
  note?: string;
  /** Owner-manual sourced (true) vs estimated (false) */
  verified: boolean;
}

export interface VehicleScheduleSource {
  primary: string;
  url?: string;
  supplement_url?: string;
  section?: string;
}

export interface VehicleSchedule {
  years: number[];
  trims: string[];
  engine: string;
  transmission: string;
  source: VehicleScheduleSource;
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
 * Compute days-until-due for a service given the user's current mileage,
 * date of last service, and the service interval. Returns the SOONER of
 * miles-based or time-based estimate (whichever expires first).
 *
 * Required for the SMS reminder engine: "Your oil change is due in 12
 * days based on 1,200 mi/month average."
 *
 * Returns null if interval has neither mileage nor time component.
 */
export function computeDueEstimate(opts: {
  service: ServiceInterval;
  currentMileage: number;
  lastServiceMileage: number;
  lastServiceDate: Date;
  /** Average miles driven per month (computed from user history or 1k default) */
  avgMilesPerMonth?: number;
}): { milesUntilDue: number | null; daysUntilDue: number | null; soonest: 'miles' | 'time' | null } | null {
  const { service, currentMileage, lastServiceMileage, lastServiceDate, avgMilesPerMonth = 1000 } = opts;

  let milesUntilDue: number | null = null;
  if (service.interval_miles != null) {
    const dueAt = lastServiceMileage + service.interval_miles;
    milesUntilDue = dueAt - currentMileage;
  }

  let daysUntilDue: number | null = null;
  if (service.interval_months != null) {
    const dueDate = new Date(lastServiceDate);
    dueDate.setMonth(dueDate.getMonth() + service.interval_months);
    daysUntilDue = Math.round((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }

  // For SMS reminders we want the SOONEST trigger. Convert milesUntilDue to days
  // using the avg miles/month and compare.
  if (milesUntilDue == null && daysUntilDue == null) return null;

  let soonest: 'miles' | 'time' | null = null;
  if (milesUntilDue != null && daysUntilDue == null) {
    soonest = 'miles';
  } else if (daysUntilDue != null && milesUntilDue == null) {
    soonest = 'time';
  } else if (milesUntilDue != null && daysUntilDue != null) {
    const milesAsDays = (milesUntilDue / avgMilesPerMonth) * 30;
    soonest = milesAsDays < daysUntilDue ? 'miles' : 'time';
  }

  return { milesUntilDue, daysUntilDue, soonest };
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

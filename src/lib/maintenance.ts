/**
 * Maintenance Schedule Logic
 *
 * Epic 5, Story 5.4: Maintenance Schedule & Reminders
 * Defines maintenance types, intervals, and due status calculations.
 * Supports vehicle-specific overrides via maintenance-overrides.json.
 */

import maintenanceOverrides from '@/data/maintenance-overrides.json';
import vehicleSpecsData from '@/data/vehicle-specs.json';

// ─── Vehicle Specs Types ───────────────────────────────────────────────

export interface OilSpecs {
  type: string;
  capacity: string;
  filterPartNumber: string;
  drainPlugSize?: string;
  drainPlugTorque?: string;
  filterLocation?: string;
  recommendedProducts?: string;
  oilNotes?: string;
}

export interface CoolantSpecs {
  type: string;
  capacity: string;
}

export interface TransmissionSpecs {
  type: string;
  capacity: string;
}

export interface BrakeFluidSpecs {
  type: string;
}

export interface SparkPlugSpecs {
  partNumber: string;
  gap: string;
  torque: string;
  quantity: number;
}

export interface LugSpecs {
  size: string;
  torque: string;
  useBolts: boolean; // German brands use lug bolts, not nuts
}

export interface DifferentialSpecs {
  type: string;
  capacity: string;
}

export interface TransferCaseSpecs {
  fluidType: string;
  capacity: string;
}

export interface SuperchargerSpecs {
  intercoolerFluid: string;
  intercoolerCapacity: string;
  beltSize?: string;
}

export interface JackPointSpecs {
  front: string;
  rear: string;
  frontLift?: string;
  rearLift?: string;
}

export interface ProcedureHints {
  stepHints: string[];
  specialTools?: string[];
  commonMistakes?: string[];
  verified?: boolean;
}

export interface BulbSpecs {
  headlightLow?: string;
  headlightHigh?: string;
  frontTurnSignal?: string;
  rearTurnSignal?: string;
  taillight?: string;
  brakeLight?: string;
  fogLight?: string;
  reverseLight?: string;
  licensePlate?: string;
  drl?: string;
  notes?: string;
}

export interface BrakeEndSpecs {
  rotorSize: string;
  rotorPartNumber: string;
  padPartNumber: string;
  caliperType?: string;
  aftermarketRotors?: { brand: string; partNumber: string }[];
  aftermarketPads?: { brand: string; partNumber: string }[];
}

export interface FuelEconomySpecs {
  city: number | null;
  highway: number | null;
  combined: number | null;
  /** EPA MPGe combined for EVs and PHEVs */
  mpgeCombined: number | null;
  source: 'epa-estimate' | 'manual' | 'obd-measured';
}

export interface TankCapacitySpecs {
  /** Fuel tank in US gallons (null for pure EVs) */
  gallons: number | null;
  /** Battery capacity in kWh (null for non-electrified vehicles) */
  batteryKwh: number | null;
}

export interface VehicleSpecs {
  engine: string;
  oil?: OilSpecs;
  coolant?: CoolantSpecs;
  transmission?: TransmissionSpecs;
  brakeFluid?: BrakeFluidSpecs;
  sparkPlugs?: SparkPlugSpecs;
  lug?: LugSpecs;
  brakes?: {
    front?: BrakeEndSpecs;
    rear?: BrakeEndSpecs;
  };
  differentials?: {
    front?: DifferentialSpecs;
    rear?: DifferentialSpecs;
  };
  transferCase?: TransferCaseSpecs;
  supercharger?: SuperchargerSpecs;
  jackPoints?: JackPointSpecs;
  bulbs?: BulbSpecs;
  safety?: string[];
  procedures?: Record<string, ProcedureHints>;
  fuelEconomy?: FuelEconomySpecs;
  tankCapacity?: TankCapacitySpecs;
}

// ─── Maintenance Specs Map ─────────────────────────────────────────────

/** Maps maintenance type IDs to the spec fields relevant for display on that card */
export const MAINTENANCE_SPECS_MAP: Record<string, (specs: VehicleSpecs) => Record<string, string> | null> = {
  oil_change: (s) => {
    if (!s.oil) return null;
    const r: Record<string, string> = {};
    r['Oil'] = s.oil.type;
    r['Capacity'] = s.oil.capacity;
    r['Filter'] = s.oil.filterPartNumber;
    if (s.oil.drainPlugSize) r['Drain Plug'] = `${s.oil.drainPlugSize}${s.oil.drainPlugTorque ? ` @ ${s.oil.drainPlugTorque}` : ''}`;
    return r;
  },
  transmission_fluid: (s) => {
    if (!s.transmission) return null;
    return { 'Fluid': s.transmission.type, 'Capacity': s.transmission.capacity };
  },
  coolant_flush: (s) => {
    if (!s.coolant) return null;
    return { 'Coolant': s.coolant.type, 'Capacity': s.coolant.capacity };
  },
  brake_fluid: (s) => {
    if (!s.brakeFluid) return null;
    const r: Record<string, string> = { 'Fluid': s.brakeFluid.type };
    if (s.lug) r['Lug'] = `${s.lug.size} @ ${s.lug.torque}`;
    return r;
  },
  brake_inspection: (s) => {
    if (!s.brakeFluid && !s.lug) return null;
    const r: Record<string, string> = {};
    if (s.brakeFluid) r['Fluid'] = s.brakeFluid.type;
    if (s.lug) r['Lug'] = `${s.lug.size} @ ${s.lug.torque}`;
    return r;
  },
  spark_plugs: (s) => {
    if (!s.sparkPlugs) return null;
    return {
      'Part #': s.sparkPlugs.partNumber,
      'Gap': s.sparkPlugs.gap,
      'Qty': String(s.sparkPlugs.quantity),
    };
  },
  tire_rotation: (s) => {
    if (!s.lug) return null;
    return { 'Lug': `${s.lug.size} @ ${s.lug.torque}` };
  },
  differential_fluid: (s) => {
    if (!s.differentials) return null;
    const r: Record<string, string> = {};
    if (s.differentials.rear) r['Rear'] = `${s.differentials.rear.type}, ${s.differentials.rear.capacity}`;
    if (s.differentials.front) r['Front'] = `${s.differentials.front.type}, ${s.differentials.front.capacity}`;
    return r;
  },
  transfer_case_fluid: (s) => {
    if (!s.transferCase) return null;
    return { 'Fluid': s.transferCase.fluidType, 'Capacity': s.transferCase.capacity };
  },
  bulb_replacement: (s) => {
    if (!s.bulbs) return null;
    const r: Record<string, string> = {};
    if (s.bulbs.headlightLow) r['Low Beam'] = s.bulbs.headlightLow;
    if (s.bulbs.headlightHigh) r['High Beam'] = s.bulbs.headlightHigh;
    if (s.bulbs.fogLight) r['Fog Light'] = s.bulbs.fogLight;
    if (s.bulbs.taillight) r['Tail Light'] = s.bulbs.taillight;
    if (s.bulbs.brakeLight) r['Brake Light'] = s.bulbs.brakeLight;
    if (s.bulbs.frontTurnSignal) r['Front Turn'] = s.bulbs.frontTurnSignal;
    if (s.bulbs.rearTurnSignal) r['Rear Turn'] = s.bulbs.rearTurnSignal;
    return r;
  },
};

// ─── Vehicle Specs Lookup ──────────────────────────────────────────────

/**
 * Look up vehicle-specific specs from vehicle-specs.json.
 * Supports trim-aware matching (e.g., ZL1/LT4 vs SS/LT1).
 * Returns null if no specs found for this vehicle.
 */
/**
 * Expand a trim name into the engine/generation tokens that appear in the spec
 * DB's generation keys, so a performance trim resolves to the RIGHT generation
 * instead of falling through to the arbitrary first (usually base V6) gen.
 *
 * This is the fix for the silent-poisoning bug: gen keys are engine-coded
 * ("2015+ 6.4 SRT"), but a "Scat Pack" or "392" trim contains none of those
 * tokens, so it matched nothing and got the V6 block injected as ground truth —
 * wrong plugs/filter/fluids for the highest-volume 6.4L trim on the road.
 *
 * Precedence matters: "R/T Scat Pack" is a 6.4L car, so "scat pack" must win
 * over the "r/t" (5.7L) token. Mopar-focused because that's where the
 * cross-engine contamination lives; the tokens don't appear on other makes.
 */
function expandTrimForGenMatch(trim: string): string {
  const t = trim.toLowerCase();
  // REPLACE (not append) with the engine tokens the gen keys use, so a stray
  // "r/t" in "R/T Scat Pack" can't cross-match the 5.7L gen before the 6.4L one.
  // Order = most specific first. Trims that already literal-match a gen key
  // (R/T, SXT, GT, base V6) fall through unchanged.
  if (/\b(demon|redeye|hellcat)\b/.test(t)) return 'hellcat redeye';  // 6.2 supercharged
  if (/scat\s*pack|\b392\b/.test(t)) return '6.4 392 srt';            // Scat Pack / 392 = 6.4L (beats R/T)
  if (/\bsrt-?8?\b/.test(t)) return '6.4 srt';                        // SRT / SRT8 = 6.4L
  return t;
}

export function getVehicleSpecs(vehicle: { year: number; make: string; model: string; trim?: string }): VehicleSpecs | null {
  const allSpecs = vehicleSpecsData as unknown as Record<string, Record<string, Record<string, any>>>;
  const makeData = allSpecs[vehicle.make];
  if (!makeData) return null;

  // Try exact model match first, then partial match
  let modelData = makeData[vehicle.model];
  if (!modelData) {
    const modelKey = Object.keys(makeData).find(k =>
      vehicle.model.toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().includes(vehicle.model.toLowerCase())
    );
    if (modelKey) modelData = makeData[modelKey];
  }
  if (!modelData) return null;

  // Find the right generation/trim variant
  let rawSpecs: any = null;
  const trim = expandTrimForGenMatch(vehicle.trim || '');

  for (const [genKey, genData] of Object.entries(modelData) as [string, any][]) {
    if (!genData.years || !genData.years.includes(vehicle.year)) continue;

    // For trim-specific entries, check trim match
    const genKeyLower = genKey.toLowerCase();
    const hasTrimMatch =
      (trim && genKeyLower.split(/[\/,]/).some((part: string) => part.trim().length > 1 && trim.includes(part.trim()))) ||
      (trim && trim.split(/[\s,]/).some((part: string) => part.length > 1 && genKeyLower.includes(part)));

    if (hasTrimMatch) {
      rawSpecs = genData;
      break;
    }
    // Default/fallback: use the first matching year entry
    if (!rawSpecs) rawSpecs = genData;
  }

  if (!rawSpecs) return null;

  // Normalize lug nuts/bolts into unified lug field
  let lug: LugSpecs | undefined;
  if (rawSpecs.lugBolts) {
    lug = { size: rawSpecs.lugBolts.size, torque: rawSpecs.lugBolts.torque, useBolts: true };
  } else if (rawSpecs.lugNuts) {
    lug = { size: rawSpecs.lugNuts.size, torque: rawSpecs.lugNuts.torque, useBolts: false };
  }

  // Normalize transferCase field
  let transferCase: TransferCaseSpecs | undefined;
  if (rawSpecs.transferCase) {
    transferCase = {
      fluidType: rawSpecs.transferCase.fluidType || rawSpecs.transferCase.type,
      capacity: rawSpecs.transferCase.capacity,
    };
  }

  return {
    engine: rawSpecs.engine,
    oil: rawSpecs.oil,
    coolant: rawSpecs.coolant,
    transmission: rawSpecs.transmission,
    brakeFluid: rawSpecs.brakeFluid,
    sparkPlugs: rawSpecs.sparkPlugs,
    lug,
    brakes: rawSpecs.brakes,
    differentials: rawSpecs.differentials,
    transferCase,
    supercharger: rawSpecs.supercharger,
    jackPoints: rawSpecs.jackPoints,
    safety: rawSpecs.safety,
    procedures: rawSpecs.procedures,
  };
}

/**
 * Get specs relevant to a specific maintenance type for a given vehicle.
 * Returns key-value pairs suitable for display on a maintenance card.
 */
export function getSpecsForMaintenanceType(
  typeId: string,
  vehicle: { year: number; make: string; model: string; trim?: string }
): Record<string, string> | null {
  const specs = getVehicleSpecs(vehicle);
  if (!specs) return null;

  const mapper = MAINTENANCE_SPECS_MAP[typeId];
  if (!mapper) return null;

  return mapper(specs);
}

// ─── Core Maintenance Types ────────────────────────────────────────────

export interface MaintenanceType {
  id: string;
  name: string;
  description: string;
  defaultIntervalMiles: number;
  defaultIntervalMonths: number;
  icon: string;
  category: 'routine' | 'periodic' | 'major';
}

export interface VehicleContext {
  make: string;
  model: string;
  year: number;
  trim?: string;
}

export interface ResolvedSchedule extends MaintenanceType {
  intervalMiles: number;
  intervalMonths: number;
  estimatedCost: number;
  note?: string;
}

interface OverrideEntry {
  intervalMiles?: number;
  intervalMonths?: number;
  cost?: number;
  notApplicable?: boolean;
  note?: string;
}

export const MAINTENANCE_SCHEDULES: Record<string, MaintenanceType> = {
  oil_change: {
    id: 'oil_change',
    name: 'Oil Change',
    description: 'Engine oil and filter replacement',
    defaultIntervalMiles: 5000,
    defaultIntervalMonths: 6,
    icon: 'droplet',
    category: 'routine',
  },
  tire_rotation: {
    id: 'tire_rotation',
    name: 'Tire Rotation',
    description: 'Rotate tires for even wear',
    defaultIntervalMiles: 7500,
    defaultIntervalMonths: 6,
    icon: 'refresh-cw',
    category: 'routine',
  },
  wiper_blades: {
    id: 'wiper_blades',
    name: 'Wiper Blades',
    description: 'Replace windshield wiper blades',
    defaultIntervalMiles: 15000,
    defaultIntervalMonths: 12,
    icon: 'cloud-rain',
    category: 'routine',
  },
  brake_inspection: {
    id: 'brake_inspection',
    name: 'Brake Inspection',
    description: 'Inspect brake pads, rotors, and fluid',
    defaultIntervalMiles: 15000,
    defaultIntervalMonths: 12,
    icon: 'disc',
    category: 'periodic',
  },
  air_filter: {
    id: 'air_filter',
    name: 'Air Filter',
    description: 'Replace engine air filter',
    defaultIntervalMiles: 15000,
    defaultIntervalMonths: 12,
    icon: 'wind',
    category: 'periodic',
  },
  cabin_filter: {
    id: 'cabin_filter',
    name: 'Cabin Air Filter',
    description: 'Replace cabin air filter for HVAC',
    defaultIntervalMiles: 15000,
    defaultIntervalMonths: 12,
    icon: 'air-vent',
    category: 'periodic',
  },
  wheel_alignment: {
    id: 'wheel_alignment',
    name: 'Wheel Alignment',
    description: 'Check and adjust wheel alignment',
    defaultIntervalMiles: 15000,
    defaultIntervalMonths: 12,
    icon: 'crosshair',
    category: 'periodic',
  },
  transmission_fluid: {
    id: 'transmission_fluid',
    name: 'Transmission Fluid',
    description: 'Replace transmission fluid',
    defaultIntervalMiles: 30000,
    defaultIntervalMonths: 24,
    icon: 'settings',
    category: 'periodic',
  },
  coolant_flush: {
    id: 'coolant_flush',
    name: 'Coolant Flush',
    description: 'Replace engine coolant',
    defaultIntervalMiles: 30000,
    defaultIntervalMonths: 24,
    icon: 'thermometer',
    category: 'periodic',
  },
  brake_fluid: {
    id: 'brake_fluid',
    name: 'Brake Fluid',
    description: 'Replace brake fluid',
    defaultIntervalMiles: 30000,
    defaultIntervalMonths: 24,
    icon: 'droplets',
    category: 'periodic',
  },
  fuel_filter: {
    id: 'fuel_filter',
    name: 'Fuel Filter',
    description: 'Replace fuel filter',
    defaultIntervalMiles: 30000,
    defaultIntervalMonths: 24,
    icon: 'filter',
    category: 'periodic',
  },
  differential_fluid: {
    id: 'differential_fluid',
    name: 'Differential Fluid',
    description: 'Replace differential fluid',
    defaultIntervalMiles: 30000,
    defaultIntervalMonths: 36,
    icon: 'git-branch',
    category: 'periodic',
  },
  transfer_case_fluid: {
    id: 'transfer_case_fluid',
    name: 'Transfer Case Fluid',
    description: 'Replace transfer case fluid (AWD/4WD)',
    defaultIntervalMiles: 30000,
    defaultIntervalMonths: 36,
    icon: 'box',
    category: 'periodic',
  },
  power_steering_fluid: {
    id: 'power_steering_fluid',
    name: 'Power Steering Fluid',
    description: 'Replace power steering fluid',
    defaultIntervalMiles: 50000,
    defaultIntervalMonths: 36,
    icon: 'navigation',
    category: 'periodic',
  },
  spark_plugs: {
    id: 'spark_plugs',
    name: 'Spark Plugs',
    description: 'Replace spark plugs',
    defaultIntervalMiles: 60000,
    defaultIntervalMonths: 48,
    icon: 'zap',
    category: 'major',
  },
  timing_belt: {
    id: 'timing_belt',
    name: 'Timing Belt',
    description: 'Replace timing belt (interference engines)',
    defaultIntervalMiles: 90000,
    defaultIntervalMonths: 84,
    icon: 'link',
    category: 'major',
  },
  serpentine_belt: {
    id: 'serpentine_belt',
    name: 'Serpentine Belt',
    description: 'Replace serpentine/accessory belt',
    defaultIntervalMiles: 60000,
    defaultIntervalMonths: 60,
    icon: 'repeat',
    category: 'major',
  },
  battery: {
    id: 'battery',
    name: 'Battery',
    description: 'Replace 12V battery',
    defaultIntervalMiles: 50000,
    defaultIntervalMonths: 48,
    icon: 'battery-charging',
    category: 'major',
  },
  ev_battery_check: {
    id: 'ev_battery_check',
    name: 'HV Battery Health Check',
    description: 'Check high-voltage battery health (EV/Hybrid)',
    defaultIntervalMiles: 30000,
    defaultIntervalMonths: 24,
    icon: 'battery-full',
    category: 'major',
  },
  bulb_replacement: {
    id: 'bulb_replacement',
    name: 'Light Bulb Replacement',
    description: 'Replace headlights, taillights, turn signals, or fog lights',
    defaultIntervalMiles: 50000,
    defaultIntervalMonths: 36,
    icon: 'lightbulb',
    category: 'routine',
  },
};

/**
 * Reverse lookup: find maintenance type ID by display name.
 * "Oil Change" -> "oil_change", "Spark Plugs" -> "spark_plugs"
 * Returns null if no match found.
 */
export function getMaintenanceTypeByName(name: string): string | null {
  const normalized = name.toLowerCase().trim();
  for (const [id, type] of Object.entries(MAINTENANCE_SCHEDULES)) {
    if (type.name.toLowerCase() === normalized) return id;
  }
  return null;
}

// Default costs for each maintenance type (used when no override exists)
const DEFAULT_COSTS: Record<string, number> = {
  oil_change: 75,
  tire_rotation: 30,
  wiper_blades: 25,
  brake_inspection: 50,
  air_filter: 35,
  cabin_filter: 40,
  wheel_alignment: 100,
  transmission_fluid: 150,
  coolant_flush: 120,
  brake_fluid: 80,
  fuel_filter: 60,
  differential_fluid: 100,
  transfer_case_fluid: 100,
  power_steering_fluid: 80,
  spark_plugs: 200,
  timing_belt: 800,
  serpentine_belt: 150,
  battery: 200,
  ev_battery_check: 0,
  bulb_replacement: 25,
};

// ICE-only types that should be hidden for EVs
const ICE_ONLY_TYPES = new Set([
  'oil_change', 'spark_plugs', 'serpentine_belt', 'air_filter',
  'fuel_filter', 'transmission_fluid', 'timing_belt',
]);

// EV-only types that should be hidden for ICE vehicles
const EV_ONLY_TYPES = new Set(['ev_battery_check']);

// Types only relevant for AWD/4WD vehicles (shown only when override exists)
const DRIVETRAIN_TYPES = new Set(['transfer_case_fluid', 'differential_fluid']);

/**
 * Look up the override for a specific maintenance type on a vehicle.
 * Resolution order: trim+year > model _defaults > make _defaults > null (use global default).
 *
 * Trim-level entries in the JSON look like:
 *   "Camaro": {
 *     "_defaults": { "oil_change": { ... } },
 *     "trims": {
 *       "ZL1": { "years": [2017,...,2024], "engine": "6.2L SC V8 LT4", "oil_change": { ... } }
 *     }
 *   }
 * The trim key is slash-separated for aliases: "SS/1SS/2SS".
 */
function getOverride(typeId: string, vehicle: VehicleContext): OverrideEntry | null {
  const makes = maintenanceOverrides.makes as Record<string, {
    _defaults?: Record<string, OverrideEntry>;
    models?: Record<string, any>;
  }>;

  const makeData = makes[vehicle.make];
  if (!makeData) return null;

  const modelData = makeData.models?.[vehicle.model];

  // 1. Check trim-level override (highest priority)
  // Score each trim entry and pick the best match
  if (modelData?.trims && vehicle.trim) {
    const trimLower = vehicle.trim.toLowerCase();
    let bestMatch: { key: string; data: any; score: number } | null = null;

    for (const [trimKey, trimData] of Object.entries(modelData.trims) as [string, any][]) {
      // If trim entry has a years array, check year match first
      if (trimData.years && !trimData.years.includes(vehicle.year)) continue;

      const aliases = trimKey.toLowerCase().split('/').map((s: string) => s.trim());
      let score = 0;

      for (const alias of aliases) {
        if (!alias) continue;
        // Exact match (trim === alias)
        if (trimLower === alias) { score = Math.max(score, 100); continue; }
        // Trim contains the full alias as a word boundary match
        // e.g. "ZL1 1LE" contains "zl1", "SRT Hellcat Redeye" contains "srt hellcat"
        if (trimLower.includes(alias)) {
          score = Math.max(score, 50 + alias.length);
          continue;
        }
        // Alias contains the full trim
        if (alias.includes(trimLower)) {
          score = Math.max(score, 40 + trimLower.length);
          continue;
        }
        // Check if any word in the trim matches any word in the alias
        const trimWords = trimLower.split(/[\s\-_,]+/).filter(Boolean);
        const aliasWords = alias.split(/[\s\-_,]+/).filter(Boolean);
        const wordMatches = trimWords.filter(tw => aliasWords.some(aw => tw === aw || aw === tw));
        if (wordMatches.length > 0) {
          score = Math.max(score, 20 + wordMatches.length * 5 + wordMatches.join('').length);
        }
      }

      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { key: trimKey, data: trimData, score };
      }
    }

    if (bestMatch && bestMatch.data[typeId] !== undefined) {
      return bestMatch.data[typeId];
    }
  }

  // 2. Check model-level _defaults (or flat model overrides for backward compat)
  if (modelData) {
    // New structure: model._defaults
    if (modelData._defaults?.[typeId] !== undefined) {
      return modelData._defaults[typeId];
    }
    // Legacy flat structure: model.oil_change directly
    if (modelData[typeId] !== undefined && typeId !== 'trims' && typeId !== '_defaults' && typeId !== 'engine') {
      return modelData[typeId];
    }
  }

  // 3. Fall back to make-level defaults
  const makeDefaults = makeData._defaults;
  if (makeDefaults?.[typeId] !== undefined) {
    return makeDefaults[typeId];
  }

  return null;
}

/**
 * Check if a vehicle is a known EV
 */
function isEV(vehicle: VehicleContext): boolean {
  const evModels = maintenanceOverrides.evModels as Record<string, string[]>;
  return evModels[vehicle.make]?.includes(vehicle.model) ?? false;
}

/**
 * Check if a vehicle is a known hybrid
 */
function isHybrid(vehicle: VehicleContext): boolean {
  const hybridModels = maintenanceOverrides.hybridModels as Record<string, string[]>;
  return hybridModels[vehicle.make]?.includes(vehicle.model) ?? false;
}

/**
 * Resolve the schedule for a specific type on a specific vehicle.
 * Returns the MaintenanceType with vehicle-specific intervals, or null if not applicable.
 */
export function getScheduleForVehicle(
  typeId: string,
  vehicle: VehicleContext
): ResolvedSchedule | null {
  const baseType = MAINTENANCE_SCHEDULES[typeId];
  if (!baseType) return null;

  const override = getOverride(typeId, vehicle);

  // If explicitly marked not applicable, return null
  if (override?.notApplicable) return null;

  return {
    ...baseType,
    intervalMiles: override?.intervalMiles ?? baseType.defaultIntervalMiles,
    intervalMonths: override?.intervalMonths ?? baseType.defaultIntervalMonths,
    estimatedCost: override?.cost ?? DEFAULT_COSTS[typeId] ?? 100,
    note: override?.note,
  };
}

/**
 * Get all applicable maintenance schedules for a vehicle.
 * Filters out non-applicable types (ICE items for EVs, EV items for ICE, etc.)
 */
export function getApplicableSchedules(vehicle: VehicleContext): ResolvedSchedule[] {
  const vehicleIsEV = isEV(vehicle);
  const vehicleIsHybrid = isHybrid(vehicle);
  const schedules: ResolvedSchedule[] = [];

  for (const typeId of Object.keys(MAINTENANCE_SCHEDULES)) {
    // Hide ICE-only types for EVs (but not hybrids)
    if (vehicleIsEV && ICE_ONLY_TYPES.has(typeId)) continue;

    // Hide EV-only types for pure ICE vehicles
    if (!vehicleIsEV && !vehicleIsHybrid && EV_ONLY_TYPES.has(typeId)) continue;

    // For drivetrain types, only show if there's an override (means this vehicle has AWD/4WD)
    if (DRIVETRAIN_TYPES.has(typeId)) {
      const override = getOverride(typeId, vehicle);
      if (!override || override.notApplicable) continue;
    }

    const resolved = getScheduleForVehicle(typeId, vehicle);
    if (resolved) {
      schedules.push(resolved);
    }
  }

  return schedules;
}

export type MaintenanceStatus = 'ok' | 'due_soon' | 'overdue' | 'unknown';

export interface MaintenanceStatusResult {
  status: MaintenanceStatus;
  message: string;
  milesSinceService?: number;
  daysSinceService?: number;
  dueAtMileage?: number;
  dueAtDate?: Date;
  milesUntilDue?: number;
  daysUntilDue?: number;
  /** True when the computation used an estimated mileage or a synthesized delivery-time service record. */
  isEstimated?: boolean;
}

interface MaintenanceRecord {
  id: string;
  type: string;
  mileage: number;
  date: Date;
  nextDueMileage?: number | null;
  nextDueDate?: Date | null;
}

interface Vehicle {
  year?: number;
  currentMileage?: number | null;
  lastMileageUpdate?: Date | null;
  annualMileage?: number | null;
}

const DEFAULT_ANNUAL_MILEAGE = 12000; // US average

/**
 * Estimate a vehicle's current mileage when the user hasn't entered one.
 * Projects from either an older known mileage (using annualMileage rate)
 * or from the model-year delivery date with US-average driving.
 * Returns null when there isn't enough info.
 */
export function estimateCurrentMileage(vehicle: Vehicle, now: Date = new Date()): number | null {
  const annualRate = vehicle.annualMileage && vehicle.annualMileage > 0
    ? vehicle.annualMileage
    : DEFAULT_ANNUAL_MILEAGE;

  // If we already have a mileage reading, project forward from the last update date.
  if (vehicle.currentMileage != null && vehicle.lastMileageUpdate) {
    const msSince = now.getTime() - new Date(vehicle.lastMileageUpdate).getTime();
    if (msSince <= 0) return vehicle.currentMileage;
    const yearsSince = msSince / (365.25 * 24 * 60 * 60 * 1000);
    return Math.round(vehicle.currentMileage + annualRate * yearsSince);
  }

  if (vehicle.currentMileage != null) return vehicle.currentMileage;

  // Fall back to model-year delivery estimate.
  if (!vehicle.year) return null;
  // Cars of model year Y are typically delivered starting ~Sep of Y-1; use mid-year for simplicity.
  const assumedDelivery = new Date(vehicle.year, 0, 1);
  const yearsSince = (now.getTime() - assumedDelivery.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  if (yearsSince <= 0) return 500; // brand-new car
  return Math.round(yearsSince * annualRate);
}

/**
 * Resolve a usable mileage for status computation, preferring real data.
 * Returns { mileage, isEstimated } so the UI can show an "est" hint.
 * Treats freshly entered readings (<24h) as exact; older or absent readings become estimates.
 */
function resolveMileage(vehicle: Vehicle, now: Date = new Date()): { mileage: number | null; isEstimated: boolean } {
  if (vehicle.currentMileage != null && vehicle.lastMileageUpdate) {
    const hoursSince = (now.getTime() - new Date(vehicle.lastMileageUpdate).getTime()) / 3_600_000;
    if (hoursSince < 24) {
      return { mileage: vehicle.currentMileage, isEstimated: false };
    }
  }
  if (vehicle.currentMileage != null && !vehicle.lastMileageUpdate) {
    return { mileage: vehicle.currentMileage, isEstimated: false };
  }
  const projected = estimateCurrentMileage(vehicle, now);
  if (projected == null) return { mileage: null, isEstimated: false };
  return { mileage: projected, isEstimated: true };
}

/**
 * Calculate maintenance status based on vehicle mileage and service history.
 * When vehicleContext is provided, uses vehicle-specific intervals instead of defaults.
 */
export function getMaintenanceStatus(
  vehicle: Vehicle,
  records: MaintenanceRecord[],
  maintenanceType: string,
  vehicleContext?: VehicleContext
): MaintenanceStatusResult {
  const schedule = MAINTENANCE_SCHEDULES[maintenanceType];

  if (!schedule) {
    return { status: 'unknown', message: 'Unknown maintenance type' };
  }

  // Resolve vehicle-specific intervals
  const resolved = vehicleContext
    ? getScheduleForVehicle(maintenanceType, vehicleContext)
    : null;
  const intervalMiles = resolved?.intervalMiles ?? schedule.defaultIntervalMiles;
  const intervalMonths = resolved?.intervalMonths ?? schedule.defaultIntervalMonths;

  const { mileage: currentMileage, isEstimated: mileageEstimated } = resolveMileage(vehicle);

  if (!currentMileage) {
    return { status: 'unknown', message: 'Update your mileage to see status' };
  }

  // Find the most recent record of this type
  const realLastRecord = records
    .filter((r) => r.type === maintenanceType)
    .sort((a, b) => b.mileage - a.mileage)[0];

  // No service logged yet — synthesize a "delivered from factory" baseline so the dashboard
  // can still project a useful due-by number. The UI will flag this as estimated.
  const lastRecord = realLastRecord ?? (vehicle.year
    ? { id: 'est-delivery', type: maintenanceType, mileage: 0, date: new Date(vehicle.year, 0, 1), nextDueMileage: null, nextDueDate: null }
    : null);

  if (!lastRecord) {
    return {
      status: 'unknown',
      message: 'No service history - log your first service',
    };
  }

  const isEstimated = mileageEstimated || !realLastRecord;

  const milesSinceService = currentMileage - lastRecord.mileage;
  const daysSinceService = Math.floor(
    (Date.now() - new Date(lastRecord.date).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Use custom interval if set, otherwise use resolved interval
  const dueAtMileage = lastRecord.nextDueMileage ?? lastRecord.mileage + intervalMiles;
  const dueAtDate = lastRecord.nextDueDate
    ? new Date(lastRecord.nextDueDate)
    : new Date(new Date(lastRecord.date).getTime() + intervalMonths * 30 * 24 * 60 * 60 * 1000);

  const milesUntilDue = dueAtMileage - currentMileage;
  const daysUntilDue = Math.floor((dueAtDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  // Check if overdue
  if (currentMileage >= dueAtMileage || Date.now() > dueAtDate.getTime()) {
    const overdueMiles = currentMileage - dueAtMileage;
    const overdueDays = Math.floor((Date.now() - dueAtDate.getTime()) / (1000 * 60 * 60 * 24));

    if (overdueMiles > 0 && overdueDays > 0) {
      return {
        status: 'overdue',
        message: `Overdue by ${overdueMiles.toLocaleString()} miles or ${overdueDays} days`,
        milesSinceService,
        daysSinceService,
        dueAtMileage,
        dueAtDate,
        milesUntilDue,
        daysUntilDue,
        isEstimated,
      };
    } else if (overdueMiles > 0) {
      return {
        status: 'overdue',
        message: `Overdue by ${overdueMiles.toLocaleString()} miles`,
        milesSinceService,
        daysSinceService,
        dueAtMileage,
        dueAtDate,
        milesUntilDue,
        daysUntilDue,
        isEstimated,
      };
    } else {
      return {
        status: 'overdue',
        message: `Overdue by ${overdueDays} days`,
        milesSinceService,
        daysSinceService,
        dueAtMileage,
        dueAtDate,
        milesUntilDue,
        daysUntilDue,
        isEstimated,
      };
    }
  }

  // Check if due soon (within 500 miles or 30 days)
  if (milesUntilDue < 500 || daysUntilDue < 30) {
    if (milesUntilDue < 500 && daysUntilDue < 30) {
      return {
        status: 'due_soon',
        message: `Due in ${milesUntilDue.toLocaleString()} miles or ${daysUntilDue} days`,
        milesSinceService,
        daysSinceService,
        dueAtMileage,
        dueAtDate,
        milesUntilDue,
        daysUntilDue,
        isEstimated,
      };
    } else if (milesUntilDue < 500) {
      return {
        status: 'due_soon',
        message: `Due in ${milesUntilDue.toLocaleString()} miles`,
        milesSinceService,
        daysSinceService,
        dueAtMileage,
        dueAtDate,
        milesUntilDue,
        daysUntilDue,
        isEstimated,
      };
    } else {
      return {
        status: 'due_soon',
        message: `Due in ${daysUntilDue} days`,
        milesSinceService,
        daysSinceService,
        dueAtMileage,
        dueAtDate,
        milesUntilDue,
        daysUntilDue,
        isEstimated,
      };
    }
  }

  // Status is OK
  return {
    status: 'ok',
    message: `Next at ${dueAtMileage.toLocaleString()} miles`,
    milesSinceService,
    daysSinceService,
    dueAtMileage,
    dueAtDate,
    milesUntilDue,
    daysUntilDue,
    isEstimated,
  };
}

/**
 * Convenience helper that returns the resolved current mileage and whether it was estimated.
 * Exported so UI code doesn't have to recompute it.
 */
export function getResolvedMileage(vehicle: Vehicle, now: Date = new Date()): { mileage: number | null; isEstimated: boolean } {
  return resolveMileage(vehicle, now);
}

/**
 * Get all maintenance statuses for a vehicle.
 * When vehicleContext is provided, only checks applicable types with resolved intervals.
 */
export function getAllMaintenanceStatuses(
  vehicle: Vehicle,
  records: MaintenanceRecord[],
  vehicleContext?: VehicleContext
): Record<string, MaintenanceStatusResult> {
  const statuses: Record<string, MaintenanceStatusResult> = {};

  if (vehicleContext) {
    const applicable = getApplicableSchedules(vehicleContext);
    for (const schedule of applicable) {
      statuses[schedule.id] = getMaintenanceStatus(vehicle, records, schedule.id, vehicleContext);
    }
  } else {
    for (const type of Object.keys(MAINTENANCE_SCHEDULES)) {
      statuses[type] = getMaintenanceStatus(vehicle, records, type);
    }
  }

  return statuses;
}

/**
 * Get upcoming maintenance items (due soon or overdue).
 * When vehicleContext is provided, only checks applicable types with resolved intervals.
 */
export function getUpcomingMaintenance(
  vehicle: Vehicle,
  records: MaintenanceRecord[],
  vehicleContext?: VehicleContext
): Array<{ type: MaintenanceType; status: MaintenanceStatusResult }> {
  const upcoming: Array<{ type: MaintenanceType; status: MaintenanceStatusResult }> = [];

  if (vehicleContext) {
    const applicable = getApplicableSchedules(vehicleContext);
    for (const schedule of applicable) {
      const status = getMaintenanceStatus(vehicle, records, schedule.id, vehicleContext);
      if (status.status === 'overdue' || status.status === 'due_soon') {
        upcoming.push({ type: schedule, status });
      }
    }
  } else {
    for (const [typeId, type] of Object.entries(MAINTENANCE_SCHEDULES)) {
      const status = getMaintenanceStatus(vehicle, records, typeId);
      if (status.status === 'overdue' || status.status === 'due_soon') {
        upcoming.push({ type, status });
      }
    }
  }

  // Sort by status (overdue first) then by miles until due
  return upcoming.sort((a, b) => {
    if (a.status.status === 'overdue' && b.status.status !== 'overdue') return -1;
    if (a.status.status !== 'overdue' && b.status.status === 'overdue') return 1;
    return (a.status.milesUntilDue ?? 0) - (b.status.milesUntilDue ?? 0);
  });
}

/**
 * Calculate estimated annual maintenance cost.
 * When vehicleContext is provided, uses vehicle-specific costs and intervals.
 */
export function estimateAnnualMaintenanceCost(
  milesPerYear: number = 12000,
  vehicleContext?: VehicleContext
): { routine: number; periodic: number; major: number; total: number } {
  let routine = 0;
  let periodic = 0;
  let major = 0;

  if (vehicleContext) {
    const applicable = getApplicableSchedules(vehicleContext);
    for (const schedule of applicable) {
      const servicesPerYear = milesPerYear / schedule.intervalMiles;
      const annualCost = schedule.estimatedCost * servicesPerYear;

      if (schedule.category === 'routine') routine += annualCost;
      else if (schedule.category === 'periodic') periodic += annualCost;
      else major += annualCost;
    }
  } else {
    for (const [typeId, type] of Object.entries(MAINTENANCE_SCHEDULES)) {
      const cost = DEFAULT_COSTS[typeId] ?? 100;
      const servicesPerYear = milesPerYear / type.defaultIntervalMiles;
      const annualCost = cost * servicesPerYear;

      if (type.category === 'routine') routine += annualCost;
      else if (type.category === 'periodic') periodic += annualCost;
      else major += annualCost;
    }
  }

  return {
    routine: Math.round(routine),
    periodic: Math.round(periodic),
    major: Math.round(major),
    total: Math.round(routine + periodic + major),
  };
}

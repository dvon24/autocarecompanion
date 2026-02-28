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

export interface VehicleSpecs {
  engine: string;
  oil?: OilSpecs;
  coolant?: CoolantSpecs;
  transmission?: TransmissionSpecs;
  brakeFluid?: BrakeFluidSpecs;
  sparkPlugs?: SparkPlugSpecs;
  lug?: LugSpecs;
  differentials?: {
    front?: DifferentialSpecs;
    rear?: DifferentialSpecs;
  };
  transferCase?: TransferCaseSpecs;
  supercharger?: SuperchargerSpecs;
  jackPoints?: JackPointSpecs;
  safety?: string[];
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
};

// ─── Vehicle Specs Lookup ──────────────────────────────────────────────

/**
 * Look up vehicle-specific specs from vehicle-specs.json.
 * Supports trim-aware matching (e.g., ZL1/LT4 vs SS/LT1).
 * Returns null if no specs found for this vehicle.
 */
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
  const trim = (vehicle.trim || '').toLowerCase();

  for (const [genKey, genData] of Object.entries(modelData) as [string, any][]) {
    if (!genData.years || !genData.years.includes(vehicle.year)) continue;

    // For trim-specific entries, check trim match
    const genKeyLower = genKey.toLowerCase();
    const hasTrimMatch =
      (trim && genKeyLower.split(/[\/,]/).some((part: string) => trim.includes(part.trim()))) ||
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
    differentials: rawSpecs.differentials,
    transferCase,
    supercharger: rawSpecs.supercharger,
    jackPoints: rawSpecs.jackPoints,
    safety: rawSpecs.safety,
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
};

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
 * Resolution order: model-level > make-level > null (use global default).
 */
function getOverride(typeId: string, vehicle: VehicleContext): OverrideEntry | null {
  const makes = maintenanceOverrides.makes as Record<string, {
    _defaults?: Record<string, OverrideEntry>;
    models?: Record<string, Record<string, OverrideEntry>>;
  }>;

  const makeData = makes[vehicle.make];
  if (!makeData) return null;

  // Check model-level override first
  const modelOverrides = makeData.models?.[vehicle.model];
  if (modelOverrides?.[typeId] !== undefined) {
    return modelOverrides[typeId];
  }

  // Fall back to make-level defaults
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
  currentMileage?: number | null;
  lastMileageUpdate?: Date | null;
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

  const currentMileage = vehicle.currentMileage;

  if (!currentMileage) {
    return { status: 'unknown', message: 'Update your mileage to see status' };
  }

  // Find the most recent record of this type
  const lastRecord = records
    .filter((r) => r.type === maintenanceType)
    .sort((a, b) => b.mileage - a.mileage)[0];

  if (!lastRecord) {
    return {
      status: 'unknown',
      message: 'No service history - log your first service',
    };
  }

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
  };
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

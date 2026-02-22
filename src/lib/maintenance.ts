/**
 * Maintenance Schedule Logic
 *
 * Epic 5, Story 5.4: Maintenance Schedule & Reminders
 * Defines maintenance types, intervals, and due status calculations.
 */

export interface MaintenanceType {
  id: string;
  name: string;
  description: string;
  defaultIntervalMiles: number;
  defaultIntervalMonths: number;
  icon: string;
  category: 'routine' | 'periodic' | 'major';
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
};

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
 * Calculate maintenance status based on vehicle mileage and service history
 */
export function getMaintenanceStatus(
  vehicle: Vehicle,
  records: MaintenanceRecord[],
  maintenanceType: string
): MaintenanceStatusResult {
  const schedule = MAINTENANCE_SCHEDULES[maintenanceType];

  if (!schedule) {
    return { status: 'unknown', message: 'Unknown maintenance type' };
  }

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

  // Use custom interval if set, otherwise use defaults
  const dueAtMileage = lastRecord.nextDueMileage ?? lastRecord.mileage + schedule.defaultIntervalMiles;
  const dueAtDate = lastRecord.nextDueDate
    ? new Date(lastRecord.nextDueDate)
    : new Date(new Date(lastRecord.date).getTime() + schedule.defaultIntervalMonths * 30 * 24 * 60 * 60 * 1000);

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
 * Get all maintenance statuses for a vehicle
 */
export function getAllMaintenanceStatuses(
  vehicle: Vehicle,
  records: MaintenanceRecord[]
): Record<string, MaintenanceStatusResult> {
  const statuses: Record<string, MaintenanceStatusResult> = {};

  for (const type of Object.keys(MAINTENANCE_SCHEDULES)) {
    statuses[type] = getMaintenanceStatus(vehicle, records, type);
  }

  return statuses;
}

/**
 * Get upcoming maintenance items (due soon or overdue)
 */
export function getUpcomingMaintenance(
  vehicle: Vehicle,
  records: MaintenanceRecord[]
): Array<{ type: MaintenanceType; status: MaintenanceStatusResult }> {
  const upcoming: Array<{ type: MaintenanceType; status: MaintenanceStatusResult }> = [];

  for (const [typeId, type] of Object.entries(MAINTENANCE_SCHEDULES)) {
    const status = getMaintenanceStatus(vehicle, records, typeId);
    if (status.status === 'overdue' || status.status === 'due_soon') {
      upcoming.push({ type, status });
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
 * Calculate estimated annual maintenance cost
 */
export function estimateAnnualMaintenanceCost(
  milesPerYear: number = 12000
): { routine: number; periodic: number; major: number; total: number } {
  const costs = {
    oil_change: 75,
    tire_rotation: 30,
    brake_inspection: 50,
    air_filter: 35,
    cabin_filter: 40,
    transmission_fluid: 150,
    coolant_flush: 120,
    brake_fluid: 80,
    spark_plugs: 200,
    timing_belt: 800,
    serpentine_belt: 150,
    battery: 200,
  };

  let routine = 0;
  let periodic = 0;
  let major = 0;

  for (const [typeId, type] of Object.entries(MAINTENANCE_SCHEDULES)) {
    const cost = costs[typeId as keyof typeof costs] ?? 100;
    const servicesPerYear = milesPerYear / type.defaultIntervalMiles;
    const annualCost = cost * servicesPerYear;

    if (type.category === 'routine') {
      routine += annualCost;
    } else if (type.category === 'periodic') {
      periodic += annualCost;
    } else {
      major += annualCost;
    }
  }

  return {
    routine: Math.round(routine),
    periodic: Math.round(periodic),
    major: Math.round(major),
    total: Math.round(routine + periodic + major),
  };
}

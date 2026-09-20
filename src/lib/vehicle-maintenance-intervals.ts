import { getScheduleForVehicle } from '@/lib/maintenance';
import { getOwnersManualSchedule } from '@/lib/owners-manual-schedule';
import { reviewedDrivelineIntervals } from '@/lib/physical-driveline-policy';
import { getExactTwinMaintenanceRule, applyExactTwinRuleToNode } from './exact-twin-maintenance-rules';

export type IntervalVehicle = {
  year: number;
  make: string;
  model: string;
  trim?: string | null;
  transmission?: string | null;
};

const MANUAL_SERVICE_KEYS: Record<string, string> = {
  oil_change: 'engine_oil', tire_rotation: 'tire_rotation', brake_fluid: 'brake_fluid',
  coolant_flush: 'engine_coolant', transmission_fluid_auto: 'transmission_fluid_auto',
  transmission_fluid_manual: 'transmission_fluid_manual', differential_fluid: 'rear_differential',
  rear_axle_fluid: 'rear_differential', transfer_case_fluid: 'transfer_case', awd_clutch_fluid: 'awd_clutch_fluid',
  spark_plugs: 'spark_plugs', air_filter: 'air_filter', cabin_filter: 'cabin_filter',
  wiper_blades: 'wiper_blades',
};

// Replacement of wear/damaged hardware has no automatic repeat deadline.
// Owner-entered part lifespans remain a separate, explicit source of evidence.
const CONDITION_BASED_SERVICES = new Set(['brake_service', 'tire_replacement', 'cooling_system_service', 'front_brake_pads', 'rear_brake_pads', 'front_brake_rotors', 'rear_brake_rotors', 'radiator_replacement', 'other_service']);
const positiveInterval = (value: number | null | undefined) =>
  typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;

/** Exact YMMT manual entry (including null clocks), then vehicle overrides/defaults. */
export function getVehicleMaintenanceIntervals(
  type: string,
  vehicle: IntervalVehicle,
  loadManual: typeof getOwnersManualSchedule = getOwnersManualSchedule,
) {
  const exact = getExactTwinMaintenanceRule(type, vehicle);
  if (exact) return { intervalMiles:exact.intervalMiles,intervalMonths:exact.intervalMonths,source:'owners-manual' as const };
  const genericType = type.startsWith('transmission_fluid_') ? 'transmission_fluid' : type;
  const resolvedType = type === 'transmission_fluid' && (vehicle.transmission === 'automatic' || vehicle.transmission === 'manual')
    ? `transmission_fluid_${vehicle.transmission === 'automatic' ? 'auto' : 'manual'}` : type;
  const identity = { ...vehicle, trim: vehicle.trim ?? undefined };
  const schedule = loadManual(identity);
  // The general loader permits a year-only fallback; that must not select a
  // different engine/trim's service intervals for a persisted owner record.
  const exactManual = vehicle.trim && schedule?.trims.some((trim) => (
    trim.toLowerCase() === vehicle.trim!.toLowerCase()
  )) ? schedule : null;
  const entry = exactManual?.schedule[MANUAL_SERVICE_KEYS[resolvedType]];
  if (entry?.verified === true) return {
    intervalMiles: positiveInterval(entry.interval_miles),
    intervalMonths: positiveInterval(entry.interval_months),
    source: 'owners-manual' as const,
  };
  if (CONDITION_BASED_SERVICES.has(type)) return {
    intervalMiles: null, intervalMonths: null, source: 'condition-based' as const,
  };
  const fallback = getScheduleForVehicle(genericType, identity);
  return {
    intervalMiles: positiveInterval(fallback?.intervalMiles),
    intervalMonths: positiveInterval(fallback?.intervalMonths),
    source: 'vehicle-default' as const,
  };
}

/** Calendar addition with month-end clamping, preserving an input UTC offset. */
export function addMaintenanceCalendarMonths(value: string, months: number): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})(.*)$/.exec(value);
  if (!match) return null;
  const monthIndex = Number(match[1]) * 12 + Number(match[2]) - 1 + months;
  const year = Math.floor(monthIndex / 12);
  const month = monthIndex % 12 + 1;
  if (year < 0 || year > 9999) return null;
  const day = Math.min(Number(match[3]), new Date(Date.UTC(year, month, 0)).getUTCDate());
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}${match[4]}`;
}

type ServiceEvidence = {
  id?: string; type: string; mileage: number; date: string;
  nextDueMileage?: number | null; nextDueDate?: string | null;
};
type ServiceNode = {
  serviceRecordId?: string;
  maintenanceType?: string; servicedAt?: number; servicedDate?: string;
  serviceIntervalMiles?: number | null; serviceIntervalMonths?: number | null;
  riskAt?: number | null; dueMileage?: number | null; dueDate?: string | null;
  unlogged?: boolean; firstServiceDeadline?: boolean; overdueByDate?: boolean; dueNote?: string;
};

/** Keep owner-tree fallback clocks consistent with the service-write policy.
 * Explicit record deadlines and installed-part lifespans still take precedence.
 */
export function applyOwnerMaintenanceIntervals(
  trees: Record<string, { nodes: Record<string, ServiceNode> }>,
  records: ServiceEvidence[],
  vehicle: IntervalVehicle,
  currentMileage: number,
  evaluatedAt: string,
) {
  const seen = new Set<ServiceNode>();
  const evaluationTime = Number.isFinite(Date.parse(evaluatedAt)) ? Date.parse(evaluatedAt) : Infinity;
  for (const tree of Object.values(trees)) for (const node of Object.values(tree.nodes)) {
    if (seen.has(node) || !node.maintenanceType) continue;
    seen.add(node);
    applyExactTwinRuleToNode(node, vehicle);
    const intervals = getVehicleMaintenanceIntervals(node.maintenanceType, vehicle);
    node.serviceIntervalMiles = intervals.intervalMiles;
    node.serviceIntervalMonths = intervals.intervalMonths;
    node.riskAt = intervals.intervalMiles;
    delete node.dueNote;
    const record = records.find((item) => (item.type === node.maintenanceType
      || (node.maintenanceType === 'tire_rotation' && item.type === 'tire_replacement'))
      && item.mileage === node.servicedAt && item.mileage <= currentMileage
      && (!Object.hasOwn(node, 'serviceRecordId') || item.id === node.serviceRecordId)
      && Date.parse(item.date) <= evaluationTime
      && (!node.servicedDate || Date.parse(item.date) === Date.parse(node.servicedDate)));
    if (!record) {
      node.unlogged = true;
      delete node.servicedAt;
      delete node.servicedDate;
      delete node.serviceRecordId;
      delete node.riskAt;
      const rule = getExactTwinMaintenanceRule(node.maintenanceType, vehicle);
      const firstMiles = rule?.firstIntervalMiles ?? intervals.intervalMiles;
      node.dueMileage = firstMiles && intervals.intervalMiles && rule?.timing !== 'monitor' && rule?.timing !== 'minder' && rule?.timing !== 'equipment'
        ? currentMileage <= firstMiles ? firstMiles : firstMiles + Math.ceil((currentMileage - firstMiles) / intervals.intervalMiles) * intervals.intervalMiles : null;
      node.firstServiceDeadline = intervals.intervalMiles != null && !['monitor','minder','equipment'].includes(rule?.timing || '');
      node.dueDate = null;
      node.overdueByDate = false;
      continue;
    }
    node.unlogged = false;
    delete node.firstServiceDeadline;
    // Saved deadlines can be owner-entered OR older server-generated values;
    // history has no provenance to distinguish them. Never silently erase them.
    const reviewedDriveline = getExactTwinMaintenanceRule(node.maintenanceType, vehicle)
      ?? reviewedDrivelineIntervals(node.maintenanceType, vehicle);
    node.dueMileage = record.nextDueMileage ?? (intervals.intervalMiles ? record.mileage + intervals.intervalMiles : null);
    node.dueDate = record.nextDueDate ?? (intervals.intervalMonths ? addMaintenanceCalendarMonths(record.date, intervals.intervalMonths) : null);
    if ((reviewedDriveline?.intervalMiles === null && record.nextDueMileage != null)
      || (reviewedDriveline?.intervalMonths === null && record.nextDueDate != null)) {
      node.dueNote = 'Saved service-record deadline; not a verified factory replacement interval.';
    }
    node.overdueByDate = node.dueDate != null && Date.parse(node.dueDate) <= Date.parse(evaluatedAt);
  }
}

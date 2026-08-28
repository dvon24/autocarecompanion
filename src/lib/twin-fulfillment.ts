import { getReviewedTransmissionChoices, resolveReviewedTransmissionBranch } from '@/lib/transmission-options';

export type TwinFulfillmentStatus = 'reserved' | 'building' | 'ready' | 'claimed';

export interface TwinDefinition {
  id: string;
  label: string;
  make: string;
  model: string;
  yearFrom: number;
  yearTo: number;
  trims: readonly string[];
  transmissions: readonly ('automatic' | 'manual')[];
  live: boolean;
}

export interface TwinVehicleIdentity {
  year: number;
  make: string;
  model: string;
  trim?: string | null;
}

export function normalizeTwinIdentityField(value: string | null | undefined): string {
  return value?.trim().toLowerCase().replace(/[\s_-]+/g, ' ') ?? '';
}

/** Exact YMMT equality used whenever a reservation is attached to a garage row. */
export function sameTwinVehicleIdentity(
  left: TwinVehicleIdentity | null | undefined,
  right: TwinVehicleIdentity | null | undefined,
): boolean {
  if (!left || !right || !Number.isInteger(left.year) || !Number.isInteger(right.year)) return false;
  return left.year === right.year
    && normalizeTwinIdentityField(left.make) === normalizeTwinIdentityField(right.make)
    && normalizeTwinIdentityField(left.model) === normalizeTwinIdentityField(right.model)
    && normalizeTwinIdentityField(left.trim) === normalizeTwinIdentityField(right.trim);
}

/**
 * Twin experiences that are honest enough to assign to an owner.
 *
 * This registry is deliberately narrower than the marketing art inventory.
 * Adding a body render to the hero does not make its maintenance tree, parts,
 * hotspots, and fitment data ready for an owner's hub.
 */
export const TWIN_DEFINITIONS: readonly TwinDefinition[] = [
  {
    id: 'dodge-challenger',
    label: 'Dodge Challenger',
    make: 'dodge',
    model: 'challenger',
    yearFrom: 2015,
    yearTo: 2015,
    trims: ['srt 392'],
    transmissions: getReviewedTransmissionChoices({ year: 2015, make: 'dodge', model: 'challenger', trim: 'srt 392' }),
    live: true,
  },
] as const;

export const TWIN_FULFILLMENT_STATUSES: readonly TwinFulfillmentStatus[] = [
  'reserved',
  'building',
  'ready',
  'claimed',
] as const;

export function getTwinDefinition(id: string | null | undefined): TwinDefinition | null {
  if (!id) return null;
  return TWIN_DEFINITIONS.find((definition) => definition.id === id) ?? null;
}

export function twinMatchesVehicle(
  definition: TwinDefinition,
  vehicle: TwinVehicleIdentity,
): boolean {
  const normalizedMake = normalizeTwinIdentityField(vehicle.make);
  const normalizedModel = normalizeTwinIdentityField(vehicle.model);
  const normalizedTrim = normalizeTwinIdentityField(vehicle.trim);
  return definition.live
    && vehicle.year >= definition.yearFrom
    && vehicle.year <= definition.yearTo
    && definition.make === normalizedMake
    && definition.model === normalizedModel
    && definition.trims.includes(normalizedTrim);
}

export interface TwinTransmissionBranch {
  branch: 'automatic' | 'manual' | null;
  requiresChoice: boolean;
  options: readonly ('automatic' | 'manual')[];
}

export function transmissionSelectionFitsReviewedOptions(
  options: readonly ('automatic' | 'manual')[],
  supplied: 'automatic' | 'manual' | null,
): boolean {
  // A persisted selection is meaningful only when the reviewed fitment has a
  // real choice. Single-option vehicles derive their branch and stay null.
  return options.length === 2
    ? supplied == null || options.includes(supplied)
    : supplied == null;
}

/** Resolve only branches explicitly registered by an owner-ready definition. */
export function resolveTwinTransmissionBranch(
  definition: TwinDefinition | null | undefined,
  stored: string | null | undefined,
  vehicle?: TwinVehicleIdentity | null,
): TwinTransmissionBranch {
  if (!definition?.live) return { branch: null, requiresChoice: false, options: [] };
  const reviewed = vehicle ? resolveReviewedTransmissionBranch(vehicle, stored) : null;
  // Exact vehicle evidence never falls back to a definition-level list. A
  // stale definition must not turn an unreviewed YMMT into a selectable branch.
  const options = vehicle ? (reviewed?.options ?? []) : definition.transmissions;
  if (options.length === 1) {
    return { branch: options[0], requiresChoice: false, options };
  }
  if (options.length === 2) {
    return {
      branch: stored === 'automatic' || stored === 'manual' ? (options.includes(stored) ? stored : null) : null,
      requiresChoice: true,
      options,
    };
  }
  return { branch: null, requiresChoice: false, options: [] };
}

export function getLiveTwinForVehicle(
  vehicle: { year: number; make: string; model: string; trim?: string | null },
): TwinDefinition | null {
  return TWIN_DEFINITIONS.find(
    (definition) => twinMatchesVehicle(definition, vehicle),
  ) ?? null;
}

export function twinSupportsVehicle(
  vehicle: { year: number; make: string; model: string; trim?: string | null },
): boolean {
  return getLiveTwinForVehicle(vehicle) !== null;
}

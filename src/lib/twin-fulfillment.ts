export type TwinFulfillmentStatus = 'reserved' | 'building' | 'ready' | 'claimed';

export interface TwinDefinition {
  id: string;
  label: string;
  make: string;
  model: string;
  yearFrom: number;
  yearTo: number;
  trims: readonly string[];
  live: boolean;
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
  vehicle: { year: number; make: string; model: string; trim?: string | null },
): boolean {
  const normalizedMake = vehicle.make.trim().toLowerCase();
  const normalizedModel = vehicle.model.trim().toLowerCase();
  const normalizedTrim = vehicle.trim?.trim().toLowerCase() ?? '';
  return definition.live
    && vehicle.year >= definition.yearFrom
    && vehicle.year <= definition.yearTo
    && definition.make === normalizedMake
    && definition.model === normalizedModel
    && definition.trims.includes(normalizedTrim);
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

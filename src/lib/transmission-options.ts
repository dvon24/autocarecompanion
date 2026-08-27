export type TransmissionChoice = 'automatic' | 'manual';

export interface TransmissionOption {
  value: TransmissionChoice;
  label: string;
}

interface ReviewedTransmissionFitment {
  make: string;
  model: string;
  yearFrom: number;
  yearTo: number;
  trims: readonly string[];
  transmissions: readonly TransmissionChoice[];
}

/**
 * Reviewed YMMT branches where the same trim was sold with either gearbox.
 *
 * This is deliberately an allow-list, not an inference from words such as
 * "Sport" or "SRT". If a vehicle is not listed, the reserve form asks no
 * transmission question. That keeps automatic-only owners from doing extra
 * work and prevents an unknown drivetrain from becoming a fitment claim.
 */
export const REVIEWED_TRANSMISSION_FITMENTS: readonly ReviewedTransmissionFitment[] = [
  {
    make: 'dodge',
    model: 'challenger',
    yearFrom: 2015,
    yearTo: 2023,
    trims: ['srt 392', 'scat pack', 'r/t scat pack', 'srt 392 scat pack'],
    transmissions: ['automatic', 'manual'],
  },
  {
    make: 'chevrolet',
    model: 'camaro',
    yearFrom: 2017,
    yearTo: 2024,
    trims: ['zl1', 'zl1 1le'],
    transmissions: ['automatic', 'manual'],
  },
  {
    make: 'lincoln',
    model: 'nautilus',
    yearFrom: 2019,
    yearTo: 2023,
    trims: ['reserve'],
    transmissions: ['automatic'],
  },
] as const;

function canon(value: string | null | undefined): string {
  return value?.trim().toLowerCase().replace(/[\s_-]+/g, ' ') ?? '';
}

export function getTransmissionOptions(vehicle: {
  year?: number | string | null;
  make?: string | null;
  model?: string | null;
  trim?: string | null;
}): readonly TransmissionOption[] {
  const choices = getReviewedTransmissionChoices(vehicle);
  if (choices.length <= 1) return [];
  return choices.map((value) => ({
    value,
    label: value === 'automatic' ? 'Automatic' : 'Manual',
  }));
}

export type ReviewedTransmissionVehicle = {
  year?: number | string | null;
  make?: string | null;
  model?: string | null;
  trim?: string | null;
};

export type ReviewedTransmissionState = ReviewedTransmissionVehicle & {
  transmission?: string | null;
};

export function getReviewedTransmissionChoices(
  vehicle: ReviewedTransmissionVehicle,
): readonly TransmissionChoice[] {
  const year = Number(vehicle.year);
  if (!Number.isInteger(year)) return [];
  const make = canon(vehicle.make);
  const model = canon(vehicle.model);
  const trim = canon(vehicle.trim);
  if (!make || !model || !trim) return [];

  const match = REVIEWED_TRANSMISSION_FITMENTS.find((fitment) => (
    fitment.make === make
    && fitment.model === model
    && year >= fitment.yearFrom
    && year <= fitment.yearTo
    && fitment.trims.includes(trim)
  ));
  return match?.transmissions ?? [];
}

/**
 * Reviewed fitment and persisted state are separate concerns. Single-option
 * fitments derive their branch from the registry and therefore must keep the
 * stored selection null; dual fitments may store only one reviewed option.
 * Unreviewed vehicles are left to the caller's existing eligibility rules.
 */
export function hasValidReviewedTransmissionState(
  vehicle: ReviewedTransmissionState,
): boolean {
  const options = getReviewedTransmissionChoices(vehicle);
  if (options.length === 0) return true;
  if (options.length === 1) return vehicle.transmission == null;
  return vehicle.transmission == null
    || (isTransmissionChoice(vehicle.transmission) && options.includes(vehicle.transmission));
}

export function resolveReviewedTransmissionBranch(
  vehicle: ReviewedTransmissionVehicle,
  stored: string | null | undefined,
): { branch: TransmissionChoice | null; requiresChoice: boolean; options: readonly TransmissionChoice[] } {
  const options = getReviewedTransmissionChoices(vehicle);
  if (options.length === 1) return { branch: options[0], requiresChoice: false, options };
  if (options.length > 1) {
    return {
      branch: isTransmissionChoice(stored) && options.includes(stored) ? stored : null,
      requiresChoice: true,
      options,
    };
  }
  return { branch: null, requiresChoice: false, options };
}

export function isTransmissionChoice(value: unknown): value is TransmissionChoice {
  return value === 'automatic' || value === 'manual';
}

export function matchesVehicleRevision(expected: unknown, current: Date): boolean {
  if (typeof expected !== 'string') return false;
  const timestamp = Date.parse(expected);
  return Number.isFinite(timestamp) && timestamp === current.getTime();
}

const TRANSMISSION_PATCH_CONTROL_FIELDS = new Set(['transmission', 'expectedUpdatedAt']);

/**
 * A transmission selection is a guarded fitment write, not a general vehicle
 * edit. Reject companion fields so none are silently dropped and so mileage,
 * primary-vehicle, and identity side effects cannot escape the transaction.
 */
export function getTransmissionPatchCompanionFields(body: Record<string, unknown>): string[] {
  if (!Object.prototype.hasOwnProperty.call(body, 'transmission')) return [];
  return Object.keys(body).filter((key) => !TRANSMISSION_PATCH_CONTROL_FIELDS.has(key));
}

export function vehicleRequiresTransmissionChoice(vehicle: Parameters<typeof getTransmissionOptions>[0]): boolean {
  return getTransmissionOptions(vehicle).length > 1;
}

export function resolveVehicleTransmissionUpdate(
  existing: { year: number; make: string; model: string; trim?: string | null; transmission?: string | null },
  update: { year?: number; make?: string; model?: string; trim?: string | null; transmission?: unknown },
): { ok: true; transmission: TransmissionChoice | null; shouldWrite: boolean } | { ok: false; reason: 'unsupported-transmission-fitment' | 'invalid-transmission' } {
  const nextVehicle = {
    year: update.year ?? existing.year,
    make: update.make ?? existing.make,
    model: update.model ?? existing.model,
    trim: update.trim !== undefined ? update.trim : existing.trim,
  };
  const identityChanged = nextVehicle.year !== existing.year
    || canon(nextVehicle.make) !== canon(existing.make)
    || canon(nextVehicle.model) !== canon(existing.model)
    || canon(nextVehicle.trim) !== canon(existing.trim);
  const explicit = Object.prototype.hasOwnProperty.call(update, 'transmission');

  if (explicit && update.transmission !== null && !isTransmissionChoice(update.transmission)) {
    return { ok: false, reason: 'invalid-transmission' };
  }
  if (explicit && update.transmission !== null && !vehicleRequiresTransmissionChoice(nextVehicle)) {
    return { ok: false, reason: 'unsupported-transmission-fitment' };
  }

  if (explicit) {
    return { ok: true, transmission: update.transmission as TransmissionChoice | null, shouldWrite: true };
  }
  if (identityChanged) return { ok: true, transmission: null, shouldWrite: true };
  return {
    ok: true,
    transmission: isTransmissionChoice(existing.transmission) ? existing.transmission : null,
    shouldWrite: false,
  };
}

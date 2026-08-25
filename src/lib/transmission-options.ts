export type TransmissionChoice = 'automatic' | 'manual';

export interface TransmissionOption {
  value: TransmissionChoice;
  label: string;
}

const BOTH: readonly TransmissionOption[] = [
  { value: 'automatic', label: 'Automatic' },
  { value: 'manual', label: 'Manual' },
] as const;

interface DualTransmissionFitment {
  make: string;
  model: string;
  yearFrom: number;
  yearTo: number;
  trims: readonly string[];
}

/**
 * Reviewed YMMT branches where the same trim was sold with either gearbox.
 *
 * This is deliberately an allow-list, not an inference from words such as
 * "Sport" or "SRT". If a vehicle is not listed, the reserve form asks no
 * transmission question. That keeps automatic-only owners from doing extra
 * work and prevents an unknown drivetrain from becoming a fitment claim.
 */
const DUAL_TRANSMISSION_FITMENTS: readonly DualTransmissionFitment[] = [
  {
    make: 'dodge',
    model: 'challenger',
    yearFrom: 2015,
    yearTo: 2023,
    trims: ['srt 392', 'scat pack', 'r/t scat pack', 'srt 392 scat pack'],
  },
  {
    make: 'chevrolet',
    model: 'camaro',
    yearFrom: 2017,
    yearTo: 2024,
    trims: ['zl1', 'zl1 1le'],
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
  const year = Number(vehicle.year);
  if (!Number.isInteger(year)) return [];
  const make = canon(vehicle.make);
  const model = canon(vehicle.model);
  const trim = canon(vehicle.trim);
  if (!make || !model || !trim) return [];

  const match = DUAL_TRANSMISSION_FITMENTS.some((fitment) => (
    fitment.make === make
    && fitment.model === model
    && year >= fitment.yearFrom
    && year <= fitment.yearTo
    && fitment.trims.includes(trim)
  ));
  return match ? BOTH : [];
}

export function isTransmissionChoice(value: unknown): value is TransmissionChoice {
  return value === 'automatic' || value === 'manual';
}

export function vehicleRequiresTransmissionChoice(vehicle: Parameters<typeof getTransmissionOptions>[0]): boolean {
  return getTransmissionOptions(vehicle).length > 1;
}

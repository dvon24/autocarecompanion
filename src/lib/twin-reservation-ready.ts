export interface ReservationReadyState {
  year: number | null;
  make: string | null;
  model: string | null;
  vehicleVerified: boolean | null;
  trim: string | null;
  trimVerified: boolean | null;
}

/** Human-gated provenance check used before fulfillment may expose exact-fit data. */
export function canEnterTwinReadyState(input: {
  reservation: ReservationReadyState;
  hasLiveMatchingTwin: boolean;
  trialDays: number | null;
  transmissionOptionCount: number;
  transmissionOptions?: readonly ('automatic' | 'manual')[];
  transmission: 'automatic' | 'manual' | null;
}): boolean {
  const { reservation } = input;
  const options = input.transmissionOptions;
  const optionCount = options?.length ?? input.transmissionOptionCount;
  const compatibleTransmission = input.transmission == null
    ? optionCount <= 1
    : options == null || options.includes(input.transmission);
  return reservation.vehicleVerified === true
    && Number.isInteger(reservation.year)
    && (reservation.year ?? 0) > 0
    && !!reservation.make?.trim()
    && !!reservation.model?.trim()
    && !!reservation.trim?.trim()
    && reservation.trimVerified === true
    && input.hasLiveMatchingTwin
    && optionCount > 0
    && (input.trialDays === 7 || input.trialDays === 30)
    && compatibleTransmission
    && (optionCount <= 1 || input.transmission != null);
}

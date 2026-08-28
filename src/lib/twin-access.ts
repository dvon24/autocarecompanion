export const TWIN_TRIAL_DURATIONS = [7, 30] as const;

export type TwinAccessReason =
  | 'allowed-founder'
  | 'allowed-customer'
  | 'claimable-ready'
  | 'unsupported-vehicle'
  | 'garage-mismatch'
  | 'missing-mileage'
  | 'missing-reservation'
  | 'vehicle-unverified'
  | 'trim-unverified'
  | 'assignment-mismatch'
  | 'status-not-eligible'
  | 'invalid-trial-duration'
  | 'transmission-unconfirmed'
  | 'transmission-mismatch'
  | 'claim-timestamp-missing'
  | 'claim-timestamp-invalid'
  | 'claim-timestamp-future'
  | 'claim-expired'
  | 'invalid-current-time';

export interface TwinReservationAccessState {
  twinStatus?: string | null;
  transmission?: string | null;
  trialDays?: number | null;
  claimedAt?: string | Date | null;
  vehicleVerified?: boolean | null;
  trim?: string | null;
  trimVerified?: boolean | null;
  year?: number | null;
  make?: string | null;
  model?: string | null;
}

export function normalizeTwinSessionIdentity(session: {
  user?: { id?: string | null; email?: string | null };
} | null | undefined): { userId: string; email: string } | null {
  const userId = session?.user?.id?.trim();
  const email = session?.user?.email?.trim().toLowerCase();
  return userId && email ? { userId, email } : null;
}

export interface TwinAccessInput {
  founder: boolean;
  supported: boolean;
  positiveMileage: boolean;
  garageMatches: boolean;
  assignmentMatches: boolean;
  requiresTransmissionChoice: boolean;
  customerTransmissionMatches: boolean;
  reservation: TwinReservationAccessState | null;
  now: Date;
}

export type TwinAccessDecision =
  | { kind: 'allowed'; allowed: true; claimable: false; reason: 'allowed-founder' | 'allowed-customer'; expiresAt: Date | null }
  | { kind: 'claimable'; allowed: false; claimable: true; reason: 'claimable-ready'; expiresAt: null }
  | { kind: 'denied'; allowed: false; claimable: false; reason: Exclude<TwinAccessReason, 'allowed-founder' | 'allowed-customer' | 'claimable-ready'>; expiresAt: null };

function denied(reason: Extract<TwinAccessDecision, { kind: 'denied' }>['reason']): Extract<TwinAccessDecision, { kind: 'denied' }> {
  return { kind: 'denied', allowed: false, claimable: false, reason, expiresAt: null };
}

export function evaluateTwinReservationProvenance(
  reservation: TwinReservationAccessState | null,
): Extract<TwinAccessDecision, { kind: 'denied' }> | null {
  if (!reservation) return denied('missing-reservation');
  if (reservation.vehicleVerified !== true) return denied('vehicle-unverified');
  if (!Number.isInteger(reservation.year) || (reservation.year ?? 0) <= 0
    || !reservation.make?.trim() || !reservation.model?.trim()) return denied('vehicle-unverified');
  if (!reservation.trim?.trim() || reservation.trimVerified !== true) return denied('trim-unverified');
  return null;
}

function finiteTimestamp(value: string | Date | null | undefined): number | null {
  if (value == null) return null;
  const timestamp = value instanceof Date ? value.getTime() : Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function isAllowedTwinTrialDuration(value: unknown): value is (typeof TWIN_TRIAL_DURATIONS)[number] {
  return typeof value === 'number' && TWIN_TRIAL_DURATIONS.includes(value as (typeof TWIN_TRIAL_DURATIONS)[number]);
}

export function getConfirmedTwinTransmission(
  reservation: TwinReservationAccessState | null,
  assignmentMatches: boolean,
): 'automatic' | 'manual' | null {
  if (!assignmentMatches) return null;
  return reservation?.transmission === 'automatic' || reservation?.transmission === 'manual'
    ? reservation.transmission
    : null;
}

/** One fail-closed decision for every route that can expose an owner twin. */
export function evaluateTwinAccess(input: TwinAccessInput): TwinAccessDecision {
  const now = input.now instanceof Date ? input.now.getTime() : Number.NaN;
  if (!Number.isFinite(now)) return denied('invalid-current-time');
  if (!input.supported) return denied('unsupported-vehicle');
  if (!input.garageMatches) return denied('garage-mismatch');
  if (!input.positiveMileage) return denied('missing-mileage');

  if (input.founder) {
    return { kind: 'allowed', allowed: true, claimable: false, reason: 'allowed-founder', expiresAt: null };
  }

  const reservation = input.reservation;
  const provenanceRejection = evaluateTwinReservationProvenance(reservation);
  if (provenanceRejection) return provenanceRejection;
  if (!reservation) return denied('missing-reservation');
  if (!input.assignmentMatches) return denied('assignment-mismatch');
  if (!isAllowedTwinTrialDuration(reservation.trialDays)) return denied('invalid-trial-duration');
  if (input.requiresTransmissionChoice && !['automatic', 'manual'].includes(reservation.transmission ?? '')) {
    return denied('transmission-unconfirmed');
  }

  if (reservation.twinStatus === 'ready') {
    return { kind: 'claimable', allowed: false, claimable: true, reason: 'claimable-ready', expiresAt: null };
  }
  if (reservation.twinStatus !== 'claimed') return denied('status-not-eligible');
  if (input.requiresTransmissionChoice && !input.customerTransmissionMatches) {
    return denied('transmission-mismatch');
  }
  if (reservation.claimedAt == null) return denied('claim-timestamp-missing');

  const claimedAt = finiteTimestamp(reservation.claimedAt);
  if (claimedAt == null) return denied('claim-timestamp-invalid');
  if (claimedAt > now) return denied('claim-timestamp-future');

  const expiresAtTimestamp = claimedAt + reservation.trialDays * 86_400_000;
  if (!Number.isFinite(expiresAtTimestamp)) return denied('claim-timestamp-invalid');
  if (expiresAtTimestamp <= now) return denied('claim-expired');

  return {
    kind: 'allowed',
    allowed: true,
    claimable: false,
    reason: 'allowed-customer',
    expiresAt: new Date(expiresAtTimestamp),
  };
}

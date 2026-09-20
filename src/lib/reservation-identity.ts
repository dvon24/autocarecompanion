import { normalizeTwinIdentityField, sameTwinVehicleIdentity } from './twin-fulfillment';
import { isTransmissionChoice } from './transmission-options';
/** Shared capture and entitlement identity. Keep SQL normalization in sync. */
export const normalizeReservationText = (value: string | null | undefined) => (value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
export const normalizeReservationEmail = (value: string) => value.trim().toLowerCase();
export function isUSReservationCountry(value: unknown): boolean {
  return typeof value === 'string' && ['us', 'usa', 'united states', 'united states of america'].includes(normalizeReservationText(value));
}
export type ReservationFitment = {
  year?: number | null; make?: string | null; model?: string | null; trim?: string | null;
  transmission?: string | null; vehicle?: string | null; vehicleVerified?: boolean;
};
export function reservationRequestKey(row: ReservationFitment): string {
  const norm = normalizeTwinIdentityField;
  return row.vehicleVerified && row.year && norm(row.make) && norm(row.model)
    ? JSON.stringify(['structured', row.year, norm(row.make), norm(row.model), norm(row.trim), norm(row.transmission)])
    : JSON.stringify(['free', normalizeReservationText(row.vehicle), normalizeReservationText(row.transmission)]);
}
/** Preserve the established catalog's spaces/hyphens/underscores equivalence. */
export function sameReservationVehicle(a: ReservationFitment, b: ReservationFitment): boolean {
  return !!a.year && !!b.year && !!a.make && !!b.make && !!a.model && !!b.model
    && sameTwinVehicleIdentity({year:a.year,make:a.make,model:a.model,trim:a.trim},{year:b.year,make:b.make,model:b.model,trim:b.trim});
}
/** A confirmed other gearbox is independent; missing/invalid gearbox is unresolved. */
export function hasUnresolvedReservationGarage(reservation: ReservationFitment, garage: ReservationFitment[], requiresChoice: boolean): boolean {
  return requiresChoice && garage.some(car=>sameReservationVehicle(reservation,car)&&!isTransmissionChoice(car.transmission));
}
export function sameReservationFitment(a: ReservationFitment, b: ReservationFitment): boolean {
  return sameReservationVehicle(a,b) && (a.transmission ?? null) === (b.transmission ?? null);
}
export function selectedReservation<T extends { id: string }>(rows: T[], id?: string | null): T | null {
  const matches = id ? rows.filter(row => row.id === id) : rows;
  return matches.length === 1 ? matches[0] : null;
}
export function reservationOfferId(value: unknown): string | null {
  return typeof value === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(value) ? value : null;
}
export function reservationClaimHref(id?: string | null): string {
  return reservationOfferId(id) ? `/twin/claim?reservationId=${encodeURIComponent(id!)}` : '/twin/claim';
}

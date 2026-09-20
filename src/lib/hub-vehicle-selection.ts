import { vehicleSlug, hubSupportsYear, parseVehicleSlug } from './vehicle-slug';

export type SavedHubVehicle = {
  id: string; year: number; make: string; model: string;
  trim?: string | null; nickname?: string | null;
};

export function savedVehicleHubHref(vehicle: SavedHubVehicle): string {
  const fallback = `/garage/${encodeURIComponent(vehicle.id)}/records`;
  if (!hubSupportsYear(vehicle.year)) return fallback;
  const slug = vehicleSlug(vehicle.year, vehicle.make, vehicle.model, vehicle.trim);
  const parsed = parseVehicleSlug(slug);
  // Freeform garage names do not always survive catalog model/trim parsing.
  // Preserve the exact saved car through its records page when they do not.
  if (!parsed || !sameHubOwnerIdentity(vehicle, parsed)) return fallback;
  return `/vehicle/${slug}?vehicleId=${encodeURIComponent(vehicle.id)}`;
}

type HubIdentity = { year: number; make: string; model: string; trim?: string | null };
export function sameHubOwnerIdentity(left: HubIdentity, right: HubIdentity): boolean {
  const norm = (value: string | null | undefined) => (value || '').trim().toLowerCase().replace(/[\s_-]+/g, ' ');
  const trim = (value: string | null | undefined) => norm(value) === 'base' ? '' : norm(value);
  return left.year === right.year && norm(left.make) === norm(right.make)
    && norm(left.model) === norm(right.model) && trim(left.trim) === trim(right.trim);
}

/** The caller must first scope candidates to the authenticated owner. */
export function selectHubChatOwnerVehicle<T extends HubIdentity & { id: string }>(candidates: T[], identity: HubIdentity, selectedId?: string): T | null {
  return selectOwnedHubVehicle(candidates.filter((candidate) => sameHubOwnerIdentity(candidate, identity)), selectedId);
}

export function canResumeHubOwnerSession(sessionVehicleId: string | null, selectedVehicleId: string | null): boolean {
  return selectedVehicleId !== null && sessionVehicleId === selectedVehicleId;
}

/** Candidates have already been scoped to the authenticated owner and URL YMMT.
 * Never fall back to a different car when an explicit selection is invalid. */
export function selectOwnedHubVehicle<T extends { id: string }>(candidates: T[], selectedId?: string): T | null {
  if (selectedId) return candidates.find((vehicle) => vehicle.id === selectedId) ?? null;
  return candidates.length === 1 ? candidates[0] : null;
}

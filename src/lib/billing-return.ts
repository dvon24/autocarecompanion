import { productEntitlements, type EntitlementAccount } from './product-entitlements';
import { vehicleSlug } from './vehicle-slug';
import { visualReturnDestination } from './visual-return-destination';

type ReturnVehicle = { id: string; year: number; make: string; model: string; trim: string | null };
/** Inputs come from the authenticated account and an ownership-checked query.
 * Return URLs and Checkout session IDs never grant access. */
export function billingReturnState(account: EntitlementAccount | null, product: 'visual' | 'hub', vehicle: ReturnVehicle | null, reviewRequired = false, returnTo?: unknown) {
  if (reviewRequired) return { ready: false, reviewRequired: true, destination: '/account' };
  const access = productEntitlements(account);
  const ready = product === 'hub' ? access.hub : access.visual;
  return { ready, destination: ready ? product === 'hub'
    ? vehicle ? `/vehicle/${vehicleSlug(vehicle.year, vehicle.make, vehicle.model, vehicle.trim)}?vehicleId=${encodeURIComponent(vehicle.id)}` : '/account'
    : visualReturnDestination(returnTo) : null };
}

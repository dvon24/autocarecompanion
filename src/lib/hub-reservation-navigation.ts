import { savedVehicleHubHref, type SavedHubVehicle } from './hub-vehicle-selection';

/** Input is an owned vehicle loaded by the server, never a user-supplied URL. */
export function hubReservationReturnHref(vehicle: SavedHubVehicle | null): string {
  const href = vehicle ? savedVehicleHubHref(vehicle) : '/account';
  return `${href}${href.includes('?') ? '&' : '?'}reservation=received`;
}

/** Only a fixed marker is accepted. The caller must load any vehicle by owner ID. */
export function hubReservationNavigation(requestedReturn: unknown, ownedVehicle: SavedHubVehicle | null) {
  const vehicle = requestedReturn === 'account' ? null : ownedVehicle;
  return {
    href: hubReservationReturnHref(vehicle),
    label: vehicle ? 'Return to My Hub' as const : 'Return to Account' as const,
    beforeHref: vehicle ? savedVehicleHubHref(vehicle) : '/account',
  };
}

import { getLiveTwinForVehicle } from './twin-fulfillment';
import { getTwinByFulfillmentId } from './vehicle-twin-catalog';
import { ownerHubSetupRequirements, type SetupVehicle } from './owner-hub-setup';

/** Presentation only. Every save still passes the server's owner/access checks. */
export function serviceRecordEntry(vehicle: SetupVehicle, canManageMaintenance: boolean): 'tree' | 'review' | 'none' {
  const twin = getLiveTwinForVehicle(vehicle);
  const catalog = getTwinByFulfillmentId(twin?.id);
  if (catalog?.ownerReady) {
    // Missing mileage/equipment/transmission is completed by the shared setup;
    // conflicting reviewed facts must not silently fall back around that setup.
    return ownerHubSetupRequirements(vehicle) ? 'tree' : 'none';
  }
  return canManageMaintenance ? 'review' : 'none';
}

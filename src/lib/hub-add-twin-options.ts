import { VEHICLE_TWIN_CATALOG, type VehicleTwinCatalogEntry } from './vehicle-twin-catalog';
import type { HubVehicleFields } from '../components/twin/hub/hub-add-vehicle';
import { ownerEquipmentOption } from './twin-owner-equipment';
import { getTransmissionOptions } from './transmission-options';

/** Presentation only: every readiness requirement must already be in the catalog. */
export function getHubAddTwinOptions(catalog: readonly VehicleTwinCatalogEntry[] = VEHICLE_TWIN_CATALOG) {
  return catalog.map((twin) => ({
    id: twin.id,
    equipment:ownerEquipmentOption(twin.identity),
    transmissionOptions:getTransmissionOptions(twin.identity),
    identity: { year: twin.identity.year, make: twin.identity.make, model: twin.identity.model, trim: twin.identity.trim },
    label: `${twin.identity.year} ${twin.identity.make} ${twin.identity.model} ${twin.identity.trim}`,
    artwork: twin.art.available ? twin.art.base : null,
    ownerReady: twin.ownerReady && twin.art.available && Boolean(twin.art.base)
      && twin.treeStatus !== 'structure-only' && Boolean(twin.treeResolver) && Boolean(twin.fulfillmentId),
  }));
}

/** Resolve the ID again before submission; never accept a caller's freeform identity. */
export function hubAddTwinFields(id: string, details: { vin: string; currentMileage: string; reviewedEquipmentId?: string; transmission?:string }): HubVehicleFields {
  const option = getHubAddTwinOptions().find((candidate) => candidate.id === id && candidate.ownerReady);
  if (!option) throw new Error('Choose an available twin for your garage.');
  return { ...option.identity, year: String(option.identity.year), vin: details.vin, currentMileage: details.currentMileage, ...(details.reviewedEquipmentId?{reviewedEquipmentId:details.reviewedEquipmentId}:{}),...(details.transmission?{transmission:details.transmission}:{}) };
}

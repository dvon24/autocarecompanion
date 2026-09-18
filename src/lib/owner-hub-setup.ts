import { getLiveTwinForVehicle } from './twin-fulfillment';
import { getTwinByFulfillmentId } from './vehicle-twin-catalog';
import { getReviewedTransmissionChoices, hasValidReviewedTransmissionState, type TransmissionChoice } from './transmission-options';
import { ownerEquipmentOption, ownerEquipmentReady, validOwnerEquipmentSelection, type ReviewedOwnerEquipment } from './twin-owner-equipment';

export const MAX_HUB_MILEAGE = 2_147_483_647;
export function validHubMileage(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0 && value <= MAX_HUB_MILEAGE;
}
export type SetupVehicle = { id?:string; year:number; make:string; model:string; trim?:string|null; currentMileage?:number|null; transmission?:string|null; reviewedEquipmentId?:string|null };
export type OwnerHubSetup = {
  vehicleId:string; vehicleRevision:string; label:string; needsMileage:boolean;
  transmissionOptions:readonly TransmissionChoice[]; equipment:ReviewedOwnerEquipment|null;
};
export function ownerHubSetupRequirements(vehicle:SetupVehicle) {
  const twin=getLiveTwinForVehicle(vehicle),catalog=getTwinByFulfillmentId(twin?.id);
  if(!twin||!catalog?.ownerReady||!catalog.art.available||!catalog.art.base||catalog.treeStatus==='structure-only'||!catalog.treeResolver
    ||!hasValidReviewedTransmissionState(vehicle)||!validOwnerEquipmentSelection(vehicle,vehicle.reviewedEquipmentId))return null;
  const choices=getReviewedTransmissionChoices(vehicle);
  if(!choices.length)return null;
  return {needsMileage:!validHubMileage(vehicle.currentMileage),transmissionOptions:choices.length>1&&vehicle.transmission==null?choices:[],
    equipment:ownerEquipmentReady(vehicle)?null:ownerEquipmentOption(vehicle)};
}
export function pendingOwnerHubSetup(vehicle:SetupVehicle&{id:string;updatedAt:Date}):OwnerHubSetup|null {
  const requirements=ownerHubSetupRequirements(vehicle);
  if(!requirements||(!requirements.needsMileage&&!requirements.transmissionOptions.length&&!requirements.equipment))return null;
  return {vehicleId:vehicle.id,vehicleRevision:vehicle.updatedAt.toISOString(),label:`${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim?' '+vehicle.trim:''}`,...requirements};
}
/** One-time completion, never an edit of confirmed facts. Unknown fields are rejected by the route schema. */
export function ownerHubSetupChanges(vehicle:SetupVehicle,body:{currentMileage?:number;transmission?:TransmissionChoice;reviewedEquipmentId?:string}) {
  const requirements=ownerHubSetupRequirements(vehicle);
  if(!requirements)throw new Error('This exact vehicle is not available for personal Hub setup. Request your configuration instead.');
  const data:{currentMileage?:number;transmission?:TransmissionChoice;reviewedEquipmentId?:string}={};
  if(requirements.needsMileage){if(!validHubMileage(body.currentMileage))throw new Error('Enter your actual mileage as a whole number greater than zero.');data.currentMileage=body.currentMileage;}
  else if(body.currentMileage!==undefined&&body.currentMileage!==vehicle.currentMileage)throw new Error('Your saved mileage has changed. Reload setup; confirmed details cannot be replaced here.');
  if(requirements.transmissionOptions.length){if(!body.transmission||!requirements.transmissionOptions.includes(body.transmission))throw new Error('Choose your actual Automatic or Manual transmission.');data.transmission=body.transmission;}
  else if(body.transmission!==undefined&&body.transmission!==vehicle.transmission)throw new Error('Your confirmed transmission cannot be changed in setup.');
  if(requirements.equipment){if(body.reviewedEquipmentId!==requirements.equipment.id)throw new Error('Confirm the reviewed equipment for this exact vehicle.');data.reviewedEquipmentId=body.reviewedEquipmentId;}
  else if(body.reviewedEquipmentId!==undefined&&body.reviewedEquipmentId!==vehicle.reviewedEquipmentId)throw new Error('Your confirmed equipment cannot be changed in setup.');
  return data;
}

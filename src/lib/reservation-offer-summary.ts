import { getTwinDefinition, resolveTwinTransmissionBranch, twinMatchesVehicle, transmissionSelectionFitsReviewedOptions } from './twin-fulfillment';
import { getTwinByFulfillmentId } from './vehicle-twin-catalog';
import { canEnterTwinReadyState, type ReservationReadyState } from './twin-reservation-ready';
import { hasValidReviewedTransmissionState, isTransmissionChoice } from './transmission-options';

export function reservationOfferEligible(row: ReservationReadyState & {
  assignedTwin: string | null; transmission: string | null; trialDays: number | null; twinStatus: string; claimedAt: Date | null;
}): boolean {
  const twin = getTwinDefinition(row.assignedTwin);
  if (!['ready','claimed'].includes(row.twinStatus) || (row.twinStatus === 'ready' && row.claimedAt != null)
    || !twin || !getTwinByFulfillmentId(twin.id)?.ownerReady || !row.year || !row.make || !row.model) return false;
  const vehicle = {year:row.year,make:row.make,model:row.model,trim:row.trim};
  const branch = resolveTwinTransmissionBranch(twin,row.transmission,vehicle);
  return hasValidReviewedTransmissionState({...vehicle,transmission:row.transmission})
    && transmissionSelectionFitsReviewedOptions(branch.options,isTransmissionChoice(row.transmission)?row.transmission:null)
    && canEnterTwinReadyState({reservation:row,hasLiveMatchingTwin:twinMatchesVehicle(twin,vehicle),trialDays:row.trialDays,
      transmissionOptionCount:branch.options.length,transmissionOptions:branch.options,transmission:branch.branch});
}

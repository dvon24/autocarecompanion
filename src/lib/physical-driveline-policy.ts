/** Reviewed normal-use clocks only. Equipment confirmation remains an owner-readiness gate.
 * Evidence: twin-owner-manual-evidence-2026-09-11.md and its exact-year manual extracts.
 * These identities do not assert a customer's engine, drivetrain or severe-use selection.
 */
import { exactTwinMaintenanceIdentity, getExactTwinMaintenanceRule, type ExactMaintenanceVehicle } from './exact-twin-maintenance-rules';
import { confirmedOwnerEquipment } from './twin-owner-equipment';
export type DrivelineVehicle = ExactMaintenanceVehicle & { reviewedEquipmentId?:string|null };
export const reviewedDrivelineIdentity = exactTwinMaintenanceIdentity;
export const PHYSICAL_DRIVELINE_TYPES = ['rear_axle_fluid', 'awd_clutch_fluid'] as const;
export function isPhysicalDrivelineType(type: string): boolean {
  return (PHYSICAL_DRIVELINE_TYPES as readonly string[]).includes(type);
}
export function physicalDrivelineTypeEligible(type: string, vehicle: DrivelineVehicle): boolean {
  if (vehicle.reviewedEquipmentId != null && /^(?:rear_axle_fluid|awd_clutch_fluid|differential_fluid|transfer_case_fluid)$/.test(type)) {
    const profile=confirmedOwnerEquipment(vehicle);
    if (!profile) return false;
    // Legacy generic history remains readable, but a new confirmed FWD owner
    // cannot record a non-existent separate axle/transfer circuit as new work.
    if (['nautilus','murano','kicks'].includes(profile.catalogId)) return false;
    if (type==='awd_clutch_fluid') return profile.catalogId==='xt6';
    if (type==='rear_axle_fluid') return profile.catalogId==='xt6'||profile.catalogId==='mdx';
    if (type==='transfer_case_fluid') return profile.catalogId==='mdx';
    if (type==='differential_fluid') return profile.catalogId==='aviator';
  }
  const id = reviewedDrivelineIdentity(vehicle);
  if (type === 'rear_axle_fluid') return id === 'xt6' || id === 'mdx';
  if (type === 'awd_clutch_fluid') return id === 'xt6';
  // Existing generic services remain writable: trim is not drivetrain proof.
  // Only the exact demo graph decides whether it has a separate service leaf.
  return true;
}
// null is authoritative (Minder/condition based or no separately serviced FWD circuit),
// while undefined means this bounded policy has no evidence for the requested service.
export function reviewedDrivelineIntervals(type: string, vehicle: DrivelineVehicle) {
  if (!/^(transmission_fluid(?:_auto)?|rear_axle_fluid|awd_clutch_fluid|differential_fluid|transfer_case_fluid)$/.test(type)) return undefined;
  const rule = getExactTwinMaintenanceRule(type, vehicle);
  return rule ? {intervalMiles:rule.intervalMiles,intervalMonths:rule.intervalMonths,source:'owners-manual' as const} : undefined;
}

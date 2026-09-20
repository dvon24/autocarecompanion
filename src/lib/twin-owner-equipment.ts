/** Versioned, explicitly confirmed owner configurations. Never infer one from trim. */
export type EquipmentVehicle = { year: number; make: string; model: string; trim?: string | null; reviewedEquipmentId?: string | null };
export const REVIEWED_OWNER_EQUIPMENT = [
  { id:'nautilus-2019-2l-fwd-18-solid-rear-v1', catalogId:'nautilus', fulfillmentId:'lincoln-nautilus', year:2019, make:'Lincoln', model:'Nautilus', trim:'Standard', engine:'2.0L EcoBoost I4', details:'2.0L engine · FWD · 18-inch wheels · solid rear brake package' },
  { id:'murano-2023-35l-fwd-18-v1', catalogId:'murano', fulfillmentId:'nissan-murano', year:2023, make:'Nissan', model:'Murano', trim:'SV', engine:'3.5L V6', details:'3.5L V6 · FWD · 18-inch wheels' },
  { id:'xt6-2020-36l-awd-20-v1', catalogId:'xt6', fulfillmentId:'cadillac-xt6', year:2020, make:'Cadillac', model:'XT6', trim:'Sport', engine:'3.6L V6', details:'3.6L V6 · AWD · 20-inch wheels' },
  { id:'kicks-2025-2l-fwd-17-v1', catalogId:'kicks', fulfillmentId:'nissan-kicks', year:2025, make:'Nissan', model:'Kicks', trim:'SV', engine:'2.0L I4', details:'Redesigned 2025 model · 2.0L engine · FWD · 17-inch wheels' },
  { id:'mdx-2019-35l-sh-awd-20-v1', catalogId:'mdx', fulfillmentId:'acura-mdx', year:2019, make:'Acura', model:'MDX', trim:'Technology', engine:'3.5L V6', details:'3.5L V6 · SH-AWD · 20-inch wheels' },
  { id:'aviator-2026-3l-rwd-20-v1', catalogId:'aviator', fulfillmentId:'lincoln-aviator', year:2026, make:'Lincoln', model:'Aviator', trim:'Premiere', engine:'3.0L Twin-Turbo V6', details:'3.0L twin-turbo V6 · RWD · 20-inch wheels' },
] as const;
export type ReviewedOwnerEquipment = (typeof REVIEWED_OWNER_EQUIPMENT)[number];
const normalize = (value: string | null | undefined) => value?.trim().toLowerCase().replace(/[\s_-]+/g,' ') ?? '';
export function ownerEquipmentOption(vehicle: EquipmentVehicle | null | undefined): ReviewedOwnerEquipment | null {
  if (!vehicle) return null;
  return REVIEWED_OWNER_EQUIPMENT.find(profile => profile.year === vehicle.year && normalize(profile.make) === normalize(vehicle.make)
    && normalize(profile.model) === normalize(vehicle.model) && normalize(profile.trim) === normalize(vehicle.trim)) ?? null;
}
export function confirmedOwnerEquipment(vehicle: EquipmentVehicle | null | undefined): ReviewedOwnerEquipment | null {
  const option = ownerEquipmentOption(vehicle);
  return option && vehicle?.reviewedEquipmentId === option.id ? option : null;
}
export function validOwnerEquipmentSelection(vehicle: EquipmentVehicle, id: unknown): boolean {
  return id == null || (typeof id === 'string' && ownerEquipmentOption(vehicle)?.id === id);
}
export function ownerEquipmentReady(vehicle: EquipmentVehicle): boolean {
  return validOwnerEquipmentSelection(vehicle, vehicle.reviewedEquipmentId) && (!ownerEquipmentOption(vehicle) || !!confirmedOwnerEquipment(vehicle));
}
export function ownerEquipmentFitmentKey(catalogId: string, transmission: string | null | undefined, vehicle: EquipmentVehicle): string {
  const profile = confirmedOwnerEquipment(vehicle);
  return `${catalogId}:${transmission || 'single'}${profile ? `:${profile.id}` : ''}`;
}

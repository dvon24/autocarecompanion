import { ownerEquipmentReady } from '@/lib/twin-owner-equipment';
import { getReviewedTransmissionChoices, isTransmissionChoice } from '@/lib/transmission-options';
import { validHubMileage } from '@/lib/owner-hub-setup';
export type HubVehicleFields = {
  year: string;
  make: string;
  model: string;
  trim: string;
  vin: string;
  currentMileage: string;
  reviewedEquipmentId?: string;
  transmission?: string;
};

export type CreatedHubVehicle = { id: string; year: number; make: string; model: string; trim?: string | null; vin?: string | null; currentMileage?: number | null; reviewedEquipmentId?:string|null; transmission?:string|null };

export class HubVehicleSaveUnconfirmedError extends Error {
  constructor() { super('We could not confirm the save. Check your saved vehicles before trying again.'); }
}

function pendingSaveKey(fields: HubVehicleFields) {
  return `au7o:unconfirmed-vehicle:${JSON.stringify([fields.year, fields.make.trim().toLowerCase(), fields.model.trim().toLowerCase(), fields.trim.trim().toLowerCase()])}`;
}
function uncertainSave(fields: HubVehicleFields, value?: boolean): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const key = pendingSaveKey(fields);
    if (value === true) window.sessionStorage.setItem(key, '1');
    if (value === false) window.sessionStorage.removeItem(key);
    return window.sessionStorage.getItem(key) === '1';
  } catch { return false; }
}
export function allowReconciledHubVehicleRetry(fields: HubVehicleFields) { uncertainSave(fields, false); }

export function hubVehiclePayload(fields: HubVehicleFields, currentYear = new Date().getFullYear()) {
  const year = Number(fields.year);
  const make = fields.make.trim();
  const model = fields.model.trim();
  const trim = fields.trim.trim();
  const vin = fields.vin.trim().toUpperCase();
  const mileage = fields.currentMileage.trim();
  if (!ownerEquipmentReady({year,make,model,trim,reviewedEquipmentId:fields.reviewedEquipmentId})) throw new Error('Confirm the reviewed equipment for this exact vehicle before adding it.');
  if (!Number.isInteger(year) || year < 1900 || year > currentYear + 2) {
    throw new Error(`Enter a year between 1900 and ${currentYear + 2}.`);
  }
  if (!make || !model || make.length > 100 || model.length > 100 || trim.length > 100) {
    throw new Error('Enter the make and model, using at most 100 characters per field.');
  }
  if (vin && !/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
    throw new Error('Enter a 17-character VIN without I, O, or Q, or leave it blank.');
  }
  if (!mileage || !validHubMileage(Number(mileage))) throw new Error('Enter your actual mileage as a whole number greater than zero.');
  const choices=getReviewedTransmissionChoices({year,make,model,trim});
  if(choices.length>1&&(!isTransmissionChoice(fields.transmission)||!choices.includes(fields.transmission)))throw new Error('Choose your actual Automatic or Manual transmission.');
  if(choices.length<=1&&fields.transmission)throw new Error('This vehicle does not require a transmission choice.');
  return {
    year, make, model, hubSetup:true as const,
    ...(choices.length>1?{transmission:fields.transmission as 'automatic'|'manual'}:{}),
    ...(fields.reviewedEquipmentId ? {reviewedEquipmentId:fields.reviewedEquipmentId} : {}),
    ...(trim ? { trim } : {}),
    ...(vin ? { vin } : {}),
    ...(mileage ? { currentMileage: Number(mileage) } : {}),
    isPrimary: false,
  };
}

export async function createHubVehicle(fields: HubVehicleFields, request: typeof fetch = fetch, timeoutMs = 15000): Promise<CreatedHubVehicle> {
  const payload = hubVehiclePayload(fields);
  if (uncertainSave(fields)) throw new HubVehicleSaveUnconfirmedError();
  // Survives closing/reloading the page while the response is outstanding.
  uncertainSave(fields, true);
  let response: Response;
  let data: { message?: string; vehicle?: CreatedHubVehicle } | null;
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const completed = await Promise.race([
      request('/api/vehicles', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), signal: controller.signal,
      }).then(async (response) => ({ response, data: await response.json().catch(() => null) })),
      new Promise<never>((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(new HubVehicleSaveUnconfirmedError()); }, timeoutMs); }),
    ]);
    response = completed.response;
    data = completed.data;
  } catch {
    uncertainSave(fields, true);
    throw new HubVehicleSaveUnconfirmedError();
  } finally {
    if (timer) clearTimeout(timer);
  }
  if (response.status === 401) {
    uncertainSave(fields, false);
    throw new Error('Your session has expired. Sign in again before saving this vehicle.');
  }
  if (response.status === 403) {
    uncertainSave(fields, false);
    throw new Error(typeof data?.message === 'string' ? data.message : 'Your account cannot add another vehicle right now.');
  }
  if (!response.ok) {
    if (response.status === 400) {
      uncertainSave(fields, false);
      throw new Error('Check the vehicle details and try again.');
    }
    uncertainSave(fields, true);
    throw new HubVehicleSaveUnconfirmedError();
  }
  const vehicle = data?.vehicle;
  const norm = (value: unknown) => typeof value === 'string' ? value.trim().toLowerCase() : '';
  // POST returns the full created record. A shaped response for another build
  // or different supplied details is still uncertain, never confirmed success.
  if (!vehicle || typeof vehicle.id !== 'string' || !vehicle.id.trim() || vehicle.year !== payload.year
    || typeof vehicle.make !== 'string' || norm(vehicle.make) !== norm(payload.make)
    || typeof vehicle.model !== 'string' || norm(vehicle.model) !== norm(payload.model)
    || norm(vehicle.trim) !== norm(payload.trim)
    || (payload.reviewedEquipmentId !== undefined && vehicle.reviewedEquipmentId !== payload.reviewedEquipmentId)
    || (payload.vin !== undefined && norm(vehicle.vin) !== norm(payload.vin))
    || (payload.currentMileage !== undefined && vehicle.currentMileage !== payload.currentMileage)
    || (payload.transmission!==undefined&&vehicle.transmission!==payload.transmission)) {
    uncertainSave(fields, true);
    throw new HubVehicleSaveUnconfirmedError();
  }
  uncertainSave(fields, false);
  return vehicle;
}

/** A separate read is required after an ambiguous POST; never retry the POST here. */
export async function reconcileHubVehicleSave(fields: HubVehicleFields, request: typeof fetch = fetch): Promise<CreatedHubVehicle[]> {
  const payload = hubVehiclePayload(fields);
  const response = await request('/api/vehicles?view=switcher', { signal: AbortSignal.timeout(10000) });
  const data = await response.json().catch(() => null);
  if (!response.ok || !Array.isArray(data?.vehicles)) throw new Error('Saved vehicles could not be checked. Retry the check before attempting another save.');
  const norm = (value: unknown) => String(value || '').trim().toLowerCase();
  const matches = data.vehicles.filter((value: unknown): value is CreatedHubVehicle => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const vehicle = value as Record<string, unknown>;
    return typeof vehicle.id === 'string' && Boolean(vehicle.id.trim()) && vehicle.year === payload.year
      && typeof vehicle.make === 'string' && typeof vehicle.model === 'string'
      && (vehicle.trim == null || typeof vehicle.trim === 'string')
      && norm(vehicle.make) === norm(payload.make) && norm(vehicle.model) === norm(payload.model) && norm(vehicle.trim) === norm(payload.trim);
  });
  // A YMMT match is only a candidate, not proof that this POST succeeded.
  // Keep the uncertainty lock until the owner explicitly verifies the record.
  return matches;
}

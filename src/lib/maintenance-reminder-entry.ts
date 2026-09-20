import { savedVehicleHubHref, type SavedHubVehicle } from './hub-vehicle-selection';
import type { TwinHubOutcome } from './twin-hub-data';

export type ReminderView = 'schedule' | 'tree' | 'records';
export function maintenanceReminderHref(vehicleId: string, view: ReminderView) {
  return `/maintenance/reminder?vehicleId=${encodeURIComponent(vehicleId)}&view=${view}`;
}

/** Auth and owner lookup happen before capability checking; never choose a substitute car. */
export async function resolveMaintenanceReminderEntry(input: {
  user: {id:string;email?:string|null}|null; vehicleId:string; view:ReminderView;
  findOwnedVehicle:(userId:string,vehicleId:string)=>Promise<SavedHubVehicle|null>;
  loadTwin:(userId:string,email:string,vehicleId:string)=>Promise<TwinHubOutcome>;
}): Promise<string> {
  const {user,vehicleId,view} = input;
  if (!user?.id) return `/auth/signin?callbackUrl=${encodeURIComponent(maintenanceReminderHref(vehicleId,view))}`;
  if (!vehicleId) return '/garage';
  const vehicle = await input.findOwnedVehicle(user.id,vehicleId);
  if (!vehicle || vehicle.id !== vehicleId) return '/garage';
  const records = `/garage/${encodeURIComponent(vehicleId)}/records`;
  if (view === 'records' || !user.email) return records;
  try {
    const outcome = await input.loadTwin(user.id,user.email,vehicleId);
    if (outcome.access.kind !== 'allowed' || !outcome.data || outcome.data.vehicleId !== vehicleId) return records;
    const href = savedVehicleHubHref({...outcome.data.vehicle,id:vehicleId});
    if (!href.startsWith('/vehicle/')) return records;
    return href + (view === 'tree' ? '&open=car' : '&view=schedule');
  } catch { return records; }
}

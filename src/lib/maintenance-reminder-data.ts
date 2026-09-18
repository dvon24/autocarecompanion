import { createHash } from 'node:crypto';
import { buildOwnerMaintenanceTrees } from '../components/twin/owner-maintenance-trees';
import type { TwinHubData } from './twin-hub-data';
import { compareServiceRecordsNewestFirst } from './service-record-order';
import { MAINTENANCE_SCHEDULES, resolveMaintenanceWriteType } from './maintenance';
import { applyOwnerMaintenanceIntervals, type IntervalVehicle } from './vehicle-maintenance-intervals';
import type { MaintenanceAlertEmailItem } from './maintenance-alert-email';

export type ReminderVehicle = IntervalVehicle & { id: string; nickname?: string | null; color?: string | null; currentMileage: number | null };
export type ReminderRecord = { id: string; type: string; mileage: number; date: Date; nextDueMileage?: number | null; nextDueDate?: Date | null };

/** Deliberately no model-year baseline or projected odometer. A reminder is
 * anchored to actual completed work, using the same repeat clocks as the Hub.
 * Unknown/legacy transmission records remain history, not another branch's work. */
export function buildMaintenanceReminders(vehicle: ReminderVehicle, records: readonly ReminderRecord[], now = new Date()): MaintenanceAlertEmailItem[] {
  if (!Number.isFinite(now.getTime())) return [];
  const mileage = typeof vehicle.currentMileage === 'number' && Number.isFinite(vehicle.currentMileage) && vehicle.currentMileage >= 0 ? vehicle.currentMileage : null;
  const ordered = records.filter(record => Number.isFinite(record.mileage) && record.mileage >= 0
    && Number.isFinite(record.date.getTime()) && record.date <= now && (mileage == null || record.mileage <= mileage))
    .sort(compareServiceRecordsNewestFirst);
  const result: MaintenanceAlertEmailItem[] = [];
  const seen = new Set<string>();
  for (const record of ordered) {
    const resolved = resolveMaintenanceWriteType(record.type, vehicle);
    if (!resolved.ok || resolved.type !== record.type || seen.has(record.type)) continue;
    seen.add(record.type);
    const definition = MAINTENANCE_SCHEDULES[record.type] ?? (record.type.startsWith('transmission_fluid_') ? MAINTENANCE_SCHEDULES.transmission_fluid : null);
    if (!definition) continue;
    const node = { maintenanceType:record.type, servicedAt:record.mileage, servicedDate:record.date.toISOString(), dueMileage:null as number | null, dueDate:null as string | null, dueNote:undefined as string | undefined };
    applyOwnerMaintenanceIntervals({ car:{ nodes:{ reminder:node } } }, [{ ...record, date:record.date.toISOString(), nextDueDate:record.nextDueDate && Number.isFinite(record.nextDueDate.getTime()) ? record.nextDueDate.toISOString() : null }], vehicle, mileage ?? record.mileage, now.toISOString());
    const milesRemaining = mileage != null && node.dueMileage != null ? node.dueMileage - mileage : null;
    const dateTime = node.dueDate ? Date.parse(node.dueDate) : NaN;
    const daysRemaining = Number.isFinite(dateTime) ? Math.ceil((dateTime - now.getTime()) / 86400000) : null;
    const overdue = (milesRemaining != null && milesRemaining < 0) || (daysRemaining != null && dateTime <= now.getTime());
    const near = (milesRemaining != null && milesRemaining < 500) || (daysRemaining != null && daysRemaining < 30);
    if (!overdue && !near) continue;
    const facts: string[] = [];
    if (milesRemaining != null && (!overdue || milesRemaining <= 0)) facts.push(milesRemaining < 0 ? `${Math.abs(milesRemaining).toLocaleString('en-US')} mi past due` : milesRemaining === 0 ? 'Due at your saved mileage' : `In ${milesRemaining.toLocaleString('en-US')} mi`);
    if (daysRemaining != null && (!overdue || dateTime <= now.getTime())) facts.push(daysRemaining < 0 ? `${Math.abs(daysRemaining)} days past due` : daysRemaining === 0 ? 'Due today' : `In ${daysRemaining} days`);
    result.push({ vehicleId:vehicle.id, vehicleName:vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''}`, currentMileage:mileage,
      vehicle:{ id:vehicle.id, year:vehicle.year, make:vehicle.make, model:vehicle.model, trim:vehicle.trim, color:vehicle.color },
      maintenanceType:record.type, maintenanceName:record.type === 'transmission_fluid_manual' ? 'Manual transmission fluid' : record.type === 'transmission_fluid_auto' ? 'Automatic transmission fluid' : definition.name, lastServiceDate:record.date.toISOString(),
      status:{ status:overdue ? 'overdue' : 'due_soon', message:facts.join(' · '), dueAtMileage:node.dueMileage ?? undefined, dueAtDate:Number.isFinite(dateTime) ? new Date(dateTime) : undefined, milesUntilDue:milesRemaining ?? undefined, daysUntilDue:daysRemaining ?? undefined, isEstimated:false },
      deadlineNote:node.dueNote,
    });
  }
  return result.sort((a,b) => Number(b.status.status === 'overdue') - Number(a.status.status === 'overdue') || a.maintenanceType.localeCompare(b.maintenanceType));
}

/** Accessible twins use the final Hub nodes, never a second interval calculation. */
export function buildOwnerMaintenanceReminders(vehicle: ReminderVehicle, data: TwinHubData): MaintenanceAlertEmailItem[] {
  if (vehicle.id !== data.vehicleId) return [];
  const trees = buildOwnerMaintenanceTrees(data);
  const now = new Date(data.evaluatedAt);
  if (!trees || !Number.isFinite(now.getTime())) return [];
  const alerts: MaintenanceAlertEmailItem[] = [];
  for (const node of Object.values(trees.car.nodes) as Array<{ maintenanceType?:string; label?:string; unlogged?:boolean; servicedAt?:number; servicedDate?:string; dueMileage?:number|null; dueDate?:string|null; dueNote?:string }>) {
    const type = node.maintenanceType;
    if (!type || node.unlogged || node.servicedAt == null || node.servicedAt > data.miles) continue;
    if (node.servicedDate && (!Number.isFinite(Date.parse(node.servicedDate)) || Date.parse(node.servicedDate) > now.getTime())) continue;
    const dueMileage = typeof node.dueMileage === 'number' && Number.isFinite(node.dueMileage) ? node.dueMileage : null;
    const remaining = dueMileage == null ? null : dueMileage - data.miles;
    const dueTime = node.dueDate ? Date.parse(node.dueDate) : NaN;
    const days = Number.isFinite(dueTime) ? Math.ceil((dueTime-now.getTime())/86400000) : null;
    const overdue = (remaining != null && remaining < 0) || (days != null && dueTime <= now.getTime());
    if (!overdue && !(remaining != null && remaining < 500) && !(days != null && days < 30)) continue;
    const facts: string[] = [];
    if (remaining != null && (!overdue || remaining <= 0)) facts.push(remaining < 0 ? `${Math.abs(remaining).toLocaleString('en-US')} mi past due` : remaining === 0 ? 'Due at your saved mileage' : `In ${remaining.toLocaleString('en-US')} mi`);
    if (days != null && (!overdue || dueTime <= now.getTime())) facts.push(days < 0 ? `${Math.abs(days)} days past due` : days === 0 ? 'Due today' : `In ${days} days`);
    const definition = MAINTENANCE_SCHEDULES[type];
    alerts.push({ vehicleId:vehicle.id, vehicleName:vehicle.nickname || `${data.vehicle.year} ${data.vehicle.make} ${data.vehicle.model} ${data.vehicle.trim}`.trim(),
      vehicle:{...data.vehicle,id:data.vehicleId}, currentMileage:data.miles, destination:'hub', maintenanceType:type,
      maintenanceName:type === 'transmission_fluid_manual' ? 'Manual transmission fluid' : type === 'transmission_fluid_auto' ? 'Automatic transmission fluid' : definition?.name || node.label || type,
      lastServiceDate:node.servicedDate, deadlineNote:node.dueNote,
      status:{status:overdue?'overdue':'due_soon',message:facts.join(' · '),dueAtMileage:dueMileage??undefined,dueAtDate:Number.isFinite(dueTime)?new Date(dueTime):undefined,milesUntilDue:remaining??undefined,daysUntilDue:days??undefined,isEstimated:false},
    });
  }
  // Components of the same service can have independent installed lifespans.
  // Select the most urgent final node before collapsing the canonical action.
  const urgency = (alert: MaintenanceAlertEmailItem) => Math.min(
    alert.status.milesUntilDue == null ? Infinity : alert.status.milesUntilDue / 500,
    alert.status.daysUntilDue == null ? Infinity : alert.status.daysUntilDue / 30,
  );
  const seen = new Set<string>();
  return alerts.sort((a,b)=>Number(b.status.status==='overdue')-Number(a.status.status==='overdue')
    || urgency(a)-urgency(b) || a.maintenanceType.localeCompare(b.maintenanceType)
    || (a.lastServiceDate||'').localeCompare(b.lastServiceDate||''))
    .filter(alert=>{if(seen.has(alert.maintenanceType))return false;seen.add(alert.maintenanceType);return true;});
}

/** Same daily delivery slot across retries; never contains the recipient email. */
export function maintenanceEmailDeliveryKey(userId: string, now: Date): string {
  return `maintenance/${now.toISOString().slice(0,10)}/${createHash('sha256').update(userId).digest('hex')}`;
}

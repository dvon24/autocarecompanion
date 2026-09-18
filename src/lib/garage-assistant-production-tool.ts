import type { Prisma } from '@prisma/client';
import {
  MAINTENANCE_SCHEDULES,
  resolveMaintenanceReadTypes,
  TRANSMISSION_SERVICE_BRANCHES,
} from '@/lib/maintenance';
import {
  executeGarageAssistantMaintenanceInTransaction,
  executeGarageAssistantMileageInTransaction,
} from '@/lib/garage-assistant-maintenance';
import { MaintenanceMutationError } from '@/lib/maintenance-mutation';
import { addMaintenanceCalendarMonths, getVehicleMaintenanceIntervals } from '@/lib/vehicle-maintenance-intervals';
import { getExactTwinMaintenanceRule } from '@/lib/exact-twin-maintenance-rules';

function requiredVehicleId(args: Record<string, unknown>): string {
  const vehicleId = typeof args.vehicleId === 'string' ? args.vehicleId.trim() : '';
  if (!vehicleId) throw new MaintenanceMutationError('Invalid vehicle ID', 400);
  return vehicleId;
}

export async function executeGarageAssistantProductionTool(
  toolName: string,
  args: Record<string, unknown>,
  userId: string,
  db: Prisma.TransactionClient,
  operationTime: Date,
): Promise<string> {
  switch (toolName) {
    case 'list_vehicles': {
      const vehicles = await db.vehicle.findMany({
        where: { userId },
        select: {
          id: true, year: true, make: true, model: true, trim: true,
          nickname: true, currentMileage: true, isPrimary: true,
        },
      });
      if (vehicles.length === 0) return 'No vehicles found in your garage.';
      return JSON.stringify(vehicles.map((vehicle) => ({
        id: vehicle.id,
        name: vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''}`,
        mileage: vehicle.currentMileage,
        isPrimary: vehicle.isPrimary,
      })));
    }
    case 'get_vehicle_info': {
      const vehicleId = requiredVehicleId(args);
      const vehicle = await db.vehicle.findFirst({
        where: { id: vehicleId, userId },
      });
      if (!vehicle) return 'Vehicle not found.';
      const unreadableTransmissionTypes = Object.keys(TRANSMISSION_SERVICE_BRANCHES)
        .filter((type) => !resolveMaintenanceReadTypes(type, vehicle).length);
      const maintenanceRecords = await db.maintenanceRecord.findMany({
        where: {
          vehicleId,
          ...(unreadableTransmissionTypes.length
            ? { type: { notIn: unreadableTransmissionTypes } }
            : {}),
        },
        orderBy: { date: 'desc' },
        take: 10,
      });
      return JSON.stringify({
        id: vehicle.id,
        name: vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        trim: vehicle.trim,
        vin: vehicle.vin,
        currentMileage: vehicle.currentMileage,
        recentMaintenance: maintenanceRecords.map((record) => ({
          type: record.type,
          typeName: MAINTENANCE_SCHEDULES[record.type]?.name || record.type,
          date: record.date.toISOString().split('T')[0],
          mileage: record.mileage,
          cost: record.cost,
        })),
      });
    }
    case 'update_mileage':
      return executeGarageAssistantMileageInTransaction(db, args, userId, operationTime);
    case 'log_maintenance':
      return executeGarageAssistantMaintenanceInTransaction(db, args, userId, operationTime);
    case 'get_maintenance_status': {
      const vehicle = await db.vehicle.findFirst({
        where: { id: requiredVehicleId(args), userId },
        include: { maintenanceRecords: true },
      });
      if (!vehicle) return 'Vehicle not found.';
      if (vehicle.currentMileage == null) return 'Please update your current mileage first to see maintenance status.';

      const statuses: Array<{ type: string; status: string; message: string }> = [];
      for (const [typeId, schedule] of Object.entries(MAINTENANCE_SCHEDULES)) {
        const readTypes = resolveMaintenanceReadTypes(typeId, vehicle);
        const intervals = getVehicleMaintenanceIntervals(typeId, vehicle);
        const rule = getExactTwinMaintenanceRule(typeId, vehicle);
        const timingGuidance = rule ? ` ${rule.guidance}` : '';
        const records = vehicle.maintenanceRecords
          .filter((record) => readTypes.includes(record.type)
            && record.mileage <= vehicle.currentMileage! && record.date <= operationTime)
          .sort((left, right) => right.date.getTime() - left.date.getTime() || right.mileage - left.mileage);
        const lastRecord = records[0];
        if (!lastRecord) {
          statuses.push({ type: schedule.name, status: 'unknown', message: `No service history recorded; a missed service is not established.${timingGuidance}` });
          continue;
        }
        const dueAtMileage = lastRecord.nextDueMileage
          ?? (intervals.intervalMiles ? lastRecord.mileage + intervals.intervalMiles : null);
        const dueDate = lastRecord.nextDueDate?.toISOString()
          ?? (intervals.intervalMonths ? addMaintenanceCalendarMonths(lastRecord.date.toISOString(), intervals.intervalMonths) : null);
        const milesUntilDue = dueAtMileage == null ? null : dueAtMileage - vehicle.currentMileage;
        const daysUntilDue = dueDate ? Math.ceil((Date.parse(dueDate) - operationTime.getTime()) / 86_400_000) : null;
        const overdue = (milesUntilDue != null && milesUntilDue <= 0) || (daysUntilDue != null && daysUntilDue <= 0);
        const dueSoon = (milesUntilDue != null && milesUntilDue < 500) || (daysUntilDue != null && daysUntilDue <= 30);
        const clocks = [
          dueAtMileage == null ? null : `${dueAtMileage.toLocaleString()} mi (${milesUntilDue!.toLocaleString()} mi remaining)`,
          dueDate ? dueDate.slice(0, 10) : null,
        ].filter(Boolean);
        statuses.push({
          type: schedule.name, status: overdue ? 'overdue' : dueSoon ? 'due_soon' : 'ok',
          message: (clocks.length ? `${overdue ? 'Due deadline passed' : rule?.timing === 'monitor' || rule?.timing === 'minder' ? 'Maximum recorded-service limit; monitor may request sooner' : 'Next due'}: ${clocks.join(' or ')}`
            : 'Service logged; no automatic replacement deadline is established.') + timingGuidance,
        });
      }
      const order = { overdue: 0, due_soon: 1, unknown: 2, ok: 3 };
      return JSON.stringify(statuses.sort((left, right) => (
        (order[left.status as keyof typeof order] ?? 4) - (order[right.status as keyof typeof order] ?? 4)
      )));
    }
    default:
      throw new MaintenanceMutationError(`Unknown assistant tool: ${toolName}`, 400);
  }
}

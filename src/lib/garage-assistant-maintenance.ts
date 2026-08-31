import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import type { prisma as prismaClient } from '@/lib/db';
import {
  isLoggableMaintenanceType,
  MAINTENANCE_SCHEDULES,
  resolveMaintenanceWriteType,
} from '@/lib/maintenance';
import {
  guardTransmissionMaintenanceVehicle,
  isTransmissionMaintenanceType,
  MaintenanceMutationError,
  nextMonotonicVehicleRevision,
} from '@/lib/maintenance-mutation';
import { isPrismaWriteConflict } from '@/lib/prisma-conflict';
import { isAcceptedMaintenanceDate, parseMaintenanceCreate } from '@/lib/twin-route-contracts';

const PRISMA_INT_MAX = 2_147_483_647;
export const NO_COMMITTED_GARAGE_ACTION_PREFIX = '[no-commit] ';
const ASSISTANT_MAINTENANCE_FIELDS = new Set([
  'vehicleId', 'type', 'mileage', 'date', 'cost', 'notes', 'shopName',
]);
const AssistantMileageSchema = z.object({
  vehicleId: z.string().trim().min(1),
  mileage: z.number().finite().int().min(0).max(PRISMA_INT_MAX),
}).strict();

function addCalendarMonthsPreservingInput(value: string, months: number): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})(.*)$/.exec(value);
  if (!match) return null;
  const startYear = Number(match[1]);
  const startMonth = Number(match[2]);
  const startDay = Number(match[3]);
  const monthIndex = startYear * 12 + (startMonth - 1) + months;
  const year = Math.floor(monthIndex / 12);
  const month = monthIndex % 12 + 1;
  if (year < 0 || year > 9999) return null;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const day = Math.min(startDay, lastDay);
  const next = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}${match[4]}`;
  return isAcceptedMaintenanceDate(next) ? next : null;
}

function transmissionScheduleType(type: string): string {
  return type === 'transmission_fluid_auto' || type === 'transmission_fluid_manual'
    ? 'transmission_fluid'
    : type;
}

export async function executeGarageAssistantMaintenanceInTransaction(
  tx: Prisma.TransactionClient,
  input: unknown,
  userId: string,
  operationTime: Date,
): Promise<string> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new MaintenanceMutationError('Invalid maintenance data', 400);
  }
  const body = input as Record<string, unknown>;
  if (Object.keys(body).some((key) => !ASSISTANT_MAINTENANCE_FIELDS.has(key))) {
    throw new MaintenanceMutationError('Invalid maintenance data', 400);
  }
  const base = parseMaintenanceCreate({
    vehicleId: body.vehicleId,
    type: body.type,
    mileage: body.mileage,
    date: body.date,
    ...(body.cost !== undefined ? { cost: body.cost } : {}),
    ...(body.notes !== undefined ? { notes: body.notes } : {}),
    ...(body.shopName !== undefined ? { shopName: body.shopName } : {}),
  }, isLoggableMaintenanceType);
  if (!base.success) throw new MaintenanceMutationError('Invalid maintenance data', 400);

  const schedule = MAINTENANCE_SCHEDULES[transmissionScheduleType(base.data.type)];
  if (!schedule) throw new MaintenanceMutationError(`Unknown maintenance type: ${base.data.type}`, 400);
  const nextDueMileage = schedule.defaultIntervalMiles > 0
    && base.data.mileage <= PRISMA_INT_MAX - schedule.defaultIntervalMiles
    ? base.data.mileage + schedule.defaultIntervalMiles
    : undefined;
  const nextDueDate = schedule.defaultIntervalMonths > 0
    ? addCalendarMonthsPreservingInput(base.data.date, schedule.defaultIntervalMonths)
    : null;
  const withDeadlines = parseMaintenanceCreate({
    ...base.data,
    ...(nextDueMileage !== undefined ? { nextDueMileage } : {}),
    ...(nextDueDate ? { nextDueDate } : {}),
  }, isLoggableMaintenanceType);
  if (!withDeadlines.success) throw new MaintenanceMutationError('Invalid maintenance data', 400);

  const vehicle = await tx.vehicle.findFirst({ where: { id: withDeadlines.data.vehicleId, userId } });
  if (!vehicle) throw new MaintenanceMutationError('Vehicle not found or access denied.', 404);
  const resolvedType = resolveMaintenanceWriteType(withDeadlines.data.type, vehicle);
  if (!resolvedType.ok) {
    const message = resolvedType.reason === 'transmission-unselected'
      ? 'Choose Automatic or Manual on this vehicle before logging transmission fluid service'
      : resolvedType.reason === 'transmission-mismatch'
        ? 'This maintenance type does not match the saved transmission branch'
        : 'Invalid maintenance type';
    throw new MaintenanceMutationError(message, 400);
  }
  const guardedRevision = isTransmissionMaintenanceType(withDeadlines.data.type)
    ? await guardTransmissionMaintenanceVehicle(tx, vehicle, operationTime)
    : null;
  const record = await tx.maintenanceRecord.create({
    data: {
      vehicleId: withDeadlines.data.vehicleId,
      type: resolvedType.type,
      mileage: withDeadlines.data.mileage,
      date: new Date(withDeadlines.data.date),
      cost: withDeadlines.data.cost,
      notes: withDeadlines.data.notes,
      shopName: withDeadlines.data.shopName,
      nextDueMileage: withDeadlines.data.nextDueMileage,
      nextDueDate: withDeadlines.data.nextDueDate ? new Date(withDeadlines.data.nextDueDate) : null,
    },
  });
  if (withDeadlines.data.mileage > (vehicle.currentMileage ?? 0)) {
    const finalRevision = guardedRevision
      ?? nextMonotonicVehicleRevision(vehicle.updatedAt, operationTime);
    await tx.vehicle.update({
      where: { id: vehicle.id },
      data: {
        currentMileage: withDeadlines.data.mileage,
        lastMileageUpdate: operationTime,
        updatedAt: finalRevision,
      },
    });
    await tx.mileageLog.create({
      data: {
        vehicleId: vehicle.id,
        mileage: withDeadlines.data.mileage,
        source: 'maintenance',
      },
    });
  }
  const costLabel = record.cost != null ? ` ($${record.cost.toFixed(2)})` : '';
  const dueLabel = record.nextDueMileage != null
    ? ` Next due at ${record.nextDueMileage.toLocaleString()} miles.`
    : '';
  return `Logged ${schedule.name} at ${record.mileage.toLocaleString()} miles${costLabel}.${dueLabel}`;
}

export async function executeGarageAssistantMileageInTransaction(
  tx: Prisma.TransactionClient,
  input: unknown,
  userId: string,
  operationTime: Date,
): Promise<string> {
  const parsed = AssistantMileageSchema.safeParse(input);
  if (!parsed.success) throw new MaintenanceMutationError('Invalid mileage data', 400);
  const vehicle = await tx.vehicle.findFirst({ where: { id: parsed.data.vehicleId, userId } });
  if (!vehicle) throw new MaintenanceMutationError('Vehicle not found or access denied.', 404);
  if (vehicle.currentMileage === parsed.data.mileage) {
    return `${NO_COMMITTED_GARAGE_ACTION_PREFIX}Mileage is already ${parsed.data.mileage.toLocaleString()} miles for ${vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}.`;
  }
  const nextRevision = nextMonotonicVehicleRevision(vehicle.updatedAt, operationTime);
  await tx.vehicle.update({
    where: { id: vehicle.id },
    data: { currentMileage: parsed.data.mileage, lastMileageUpdate: operationTime, updatedAt: nextRevision },
  });
  await tx.mileageLog.create({
    data: { vehicleId: vehicle.id, mileage: parsed.data.mileage, source: 'assistant' },
  });
  return `Updated mileage to ${parsed.data.mileage.toLocaleString()} miles for ${vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}.`;
}

export function createGarageAssistantMaintenanceExecutor(deps: {
  prisma: typeof prismaClient;
  now?: () => Date;
}) {
  return async function executeGarageAssistantMaintenance(input: unknown, userId: string): Promise<string> {
    const operationTime = deps.now?.() ?? new Date();
    try {
      return await deps.prisma.$transaction(
        (tx) => executeGarageAssistantMaintenanceInTransaction(tx, input, userId, operationTime),
        { isolationLevel: 'Serializable' },
      );
    } catch (error) {
      if (isPrismaWriteConflict(error)) {
        throw new MaintenanceMutationError('This vehicle changed while the maintenance record was being saved. Refresh and try again.', 409);
      }
      throw error;
    }
  };
}

export function createGarageAssistantMileageExecutor(deps: {
  prisma: typeof prismaClient;
  now?: () => Date;
}) {
  return async function executeGarageAssistantMileage(input: unknown, userId: string): Promise<string> {
    const operationTime = deps.now?.() ?? new Date();
    try {
      return await deps.prisma.$transaction(
        (tx) => executeGarageAssistantMileageInTransaction(tx, input, userId, operationTime),
        { isolationLevel: 'Serializable' },
      );
    } catch (error) {
      if (isPrismaWriteConflict(error)) {
        throw new MaintenanceMutationError('Mileage changed while it was being saved. Refresh and try again.', 409);
      }
      throw error;
    }
  };
}

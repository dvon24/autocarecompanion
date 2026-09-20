import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import type { prisma as prismaClient } from '@/lib/db';
import {
  isLoggableMaintenanceType,
  MAINTENANCE_SCHEDULES,
} from '@/lib/maintenance';
import {
  MaintenanceMutationError,
  nextMonotonicVehicleRevision,
} from '@/lib/maintenance-mutation';
import { isPrismaWriteConflict } from '@/lib/prisma-conflict';
import { parseMaintenanceCreate } from '@/lib/twin-route-contracts';
import { persistMaintenanceEntry } from '@/lib/maintenance-service-mutation';

const PRISMA_INT_MAX = 2_147_483_647;
export const NO_COMMITTED_GARAGE_ACTION_PREFIX = '[no-commit] ';
const ASSISTANT_MAINTENANCE_FIELDS = new Set([
  'vehicleId', 'type', 'mileage', 'date', 'cost', 'notes', 'shopName',
]);
const AssistantMileageSchema = z.object({
  vehicleId: z.string().trim().min(1),
  mileage: z.number().finite().int().min(0).max(PRISMA_INT_MAX),
}).strict();

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
  const vehicle = await tx.vehicle.findFirst({ where: { id: base.data.vehicleId, userId } });
  if (!vehicle) throw new MaintenanceMutationError('Vehicle not found or access denied.', 404);
  const record = await persistMaintenanceEntry(tx, vehicle, base.data, operationTime);
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

import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { isAcceptedMaintenanceDate } from '@/lib/twin-route-contracts';

const PRISMA_INT_MAX = 2_147_483_647;
const boundedInt = z.number().finite().int().min(0).max(PRISMA_INT_MAX);
const maintenanceDate = z.string().refine(isAcceptedMaintenanceDate, {
  message: 'Use YYYY-MM-DD or an ISO datetime with an explicit offset',
});

const MaintenancePatchSchema = z.object({
  type: z.string().trim().min(1).optional(),
  description: z.string().max(500).optional().nullable(),
  mileage: boundedInt.optional(),
  cost: z.number().finite().min(0).optional().nullable(),
  date: maintenanceDate.optional(),
  nextDueMileage: boundedInt.optional().nullable(),
  nextDueDate: maintenanceDate.optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  receiptUrl: z.string().url().optional().nullable(),
  shopName: z.string().max(200).optional().nullable(),
}).strict().superRefine((value, context) => {
  if (Object.keys(value).length === 0) {
    context.addIssue({ code: 'custom', message: 'At least one maintenance field must change' });
  }
});

export const TRANSMISSION_MAINTENANCE_TYPES = new Set([
  'transmission_fluid',
  'transmission_fluid_auto',
  'transmission_fluid_manual',
]);

export type MaintenanceVehicleRevision = {
  id: string;
  userId: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  transmission: string | null;
  updatedAt: Date;
};

export class MaintenanceMutationError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'MaintenanceMutationError';
    this.status = status;
  }
}

export function isMaintenanceMutationError(error: unknown): error is MaintenanceMutationError {
  return error instanceof MaintenanceMutationError;
}

export function isRecordBody(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function parseMaintenancePatch(body: unknown) {
  return MaintenancePatchSchema.safeParse(body);
}

export function isTransmissionMaintenanceType(type: string): boolean {
  return TRANSMISSION_MAINTENANCE_TYPES.has(type);
}

export function nextMonotonicRevision(current: Date, now: Date): Date {
  const currentTime = new Date(current).getTime();
  const nowTime = new Date(now).getTime();
  if (!Number.isFinite(currentTime) || !Number.isFinite(nowTime)) {
    throw new MaintenanceMutationError('The saved revision is invalid. Refresh and try again.', 409);
  }
  const next = new Date(Math.max(nowTime, currentTime + 1));
  if (!Number.isFinite(next.getTime())) {
    throw new MaintenanceMutationError('The saved revision cannot be advanced. Refresh and try again.', 409);
  }
  return next;
}

export const nextMonotonicVehicleRevision = nextMonotonicRevision;

/**
 * A transmission-service mutation owns the same optimistic vehicle revision as
 * the founder transmission picker. Bumping that revision inside the mutation
 * transaction makes either ordering fail closed instead of attaching evidence
 * to a different saved branch.
 */
export async function guardTransmissionMaintenanceVehicle(
  tx: Prisma.TransactionClient,
  vehicle: MaintenanceVehicleRevision,
  now: Date,
): Promise<Date> {
  const nextRevision = nextMonotonicVehicleRevision(vehicle.updatedAt, now);
  const guarded = await tx.vehicle.updateMany({
    where: {
      id: vehicle.id,
      userId: vehicle.userId,
      updatedAt: vehicle.updatedAt,
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      trim: vehicle.trim,
      transmission: vehicle.transmission,
    },
    data: { updatedAt: nextRevision },
  });

  if (guarded.count !== 1) {
    throw new MaintenanceMutationError(
      'This vehicle changed while the maintenance record was being saved. Refresh and try again.',
      409,
    );
  }
  return nextRevision;
}

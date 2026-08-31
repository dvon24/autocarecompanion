import { NextResponse } from 'next/server';
import type { prisma as prismaClient } from '@/lib/db';
import { isFounderEmail } from '@/lib/founder';
import { isLoggableMaintenanceType, resolveMaintenanceWriteType } from '@/lib/maintenance';
import { isPrismaWriteConflict } from '@/lib/prisma-conflict';
import { parseMaintenanceCreate } from '@/lib/twin-route-contracts';
import { guardTransmissionMaintenanceVehicle, isMaintenanceMutationError, isTransmissionMaintenanceType, nextMonotonicVehicleRevision } from '@/lib/maintenance-mutation';

export function createMaintenancePostHandler(deps: {
  auth: () => Promise<{ user?: { id?: string | null; email?: string | null } } | null>;
  prisma: typeof prismaClient;
  now?: () => Date;
  allowReceiptUrl?: boolean;
}) {
  return async function POST(request: Request) {
    try {
      const session = await deps.auth();
      if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      const userId = session.user.id;

      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
      }
      const parsed = parseMaintenanceCreate(body, isLoggableMaintenanceType);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid data', details: parsed.error.issues }, { status: 400 });
      }
      if (parsed.data.receiptUrl && !deps.allowReceiptUrl) {
        return NextResponse.json(
          { error: 'Use the private receipt upload endpoint to attach receipt files.' },
          { status: 400 },
        );
      }

      if (!isFounderEmail(session.user.email)) {
        const user = await deps.prisma.user.findUnique({
          where: { id: userId },
          select: { subscriptionStatus: true, subscriptionId: true },
        });
        if (!user?.subscriptionId || user.subscriptionStatus !== 'active') {
          return NextResponse.json({
            error: 'tier_required',
            message: 'Logging maintenance to history is a Plus / Pro feature. Upgrade to track services.',
          }, { status: 403 });
        }
      }

      const { vehicleId, date, nextDueDate, ...data } = parsed.data;
      const operationTime = deps.now?.() ?? new Date();
      const result = await deps.prisma.$transaction(async (tx) => {
        const vehicle = await tx.vehicle.findFirst({
          where: { id: vehicleId, userId },
        });
        if (!vehicle) return { ok: false as const, status: 404, error: 'Vehicle not found' };

        const resolvedType = resolveMaintenanceWriteType(data.type, vehicle);
        if (!resolvedType.ok) {
          const message = resolvedType.reason === 'transmission-unselected'
            ? 'Choose Automatic or Manual on this vehicle before logging transmission fluid service'
            : resolvedType.reason === 'transmission-mismatch'
              ? 'This maintenance type does not match the saved transmission branch'
              : 'Invalid maintenance type';
          return { ok: false as const, status: 400, error: message };
        }

        const guardedRevision = isTransmissionMaintenanceType(data.type)
          ? await guardTransmissionMaintenanceVehicle(tx, vehicle, operationTime)
          : null;

        const record = await tx.maintenanceRecord.create({
          data: {
            ...data,
            type: resolvedType.type,
            vehicleId,
            date: new Date(date),
            nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
          },
        });
        if (data.mileage > (vehicle.currentMileage ?? 0)) {
          const finalRevision = guardedRevision
            ?? nextMonotonicVehicleRevision(vehicle.updatedAt, operationTime);
          await tx.vehicle.update({
            where: { id: vehicleId },
            data: {
              currentMileage: data.mileage,
              lastMileageUpdate: operationTime,
              updatedAt: finalRevision,
            },
          });
          await tx.mileageLog.create({
            data: { vehicleId, mileage: data.mileage, source: 'maintenance' },
          });
        }
        return { ok: true as const, record };
      }, { isolationLevel: 'Serializable' });

      if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
      return NextResponse.json({ record: result.record }, { status: 201 });
    } catch (error) {
      if (isMaintenanceMutationError(error)) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      if (isPrismaWriteConflict(error)) {
        return NextResponse.json(
          { error: 'This vehicle changed while the service was being logged. Refresh and try again.' },
          { status: 409 },
        );
      }
      console.error('Error creating maintenance record:', error);
      return NextResponse.json({ error: 'Failed to create maintenance record' }, { status: 500 });
    }
  };
}

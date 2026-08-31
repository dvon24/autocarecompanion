import { NextResponse } from 'next/server';
import type { prisma as prismaClient } from '@/lib/db';
import { isLoggableMaintenanceType, resolveMaintenanceWriteType } from '@/lib/maintenance';
import {
  guardTransmissionMaintenanceVehicle,
  isMaintenanceMutationError,
  isTransmissionMaintenanceType,
  parseMaintenancePatch,
} from '@/lib/maintenance-mutation';
import { isPrismaWriteConflict } from '@/lib/prisma-conflict';
import { parseMaintenanceCreate } from '@/lib/twin-route-contracts';
import { hasValidReviewedTransmissionState } from '@/lib/transmission-options';
import { isManagedMaintenanceReceipt } from '@/lib/maintenance-receipt-storage';

type Session = { user?: { id?: string | null } } | null;
const LEGACY_GENERIC_METADATA_FIELDS = new Set(['notes', 'receiptUrl']);

function nullableValue<T>(
  patch: Record<string, unknown>,
  key: string,
  existing: T | null,
): T | null {
  return Object.prototype.hasOwnProperty.call(patch, key) ? (patch[key] as T | null) : existing;
}

export function createMaintenancePatchHandler(deps: {
  auth: () => Promise<Session>;
  prisma: typeof prismaClient;
  now?: () => Date;
}) {
  return async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await deps.auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = session.user.id;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const parsedPatch = parseMaintenancePatch(body);
    if (!parsedPatch.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsedPatch.error.issues }, { status: 400 });
    }

    try {
      const { id } = await params;
      const result = await deps.prisma.$transaction(async (tx) => {
        const existing = await tx.maintenanceRecord.findUnique({
          where: { id },
          include: { vehicle: true },
        });
        if (!existing) return { ok: false as const, status: 404, error: 'Record not found' };
        if (existing.vehicle.userId !== userId) {
          return { ok: false as const, status: 401, error: 'Unauthorized' };
        }
        if (isTransmissionMaintenanceType(existing.type)
          && !hasValidReviewedTransmissionState(existing.vehicle)) {
          return {
            ok: false as const,
            status: 400,
            error: 'This maintenance type does not match the saved transmission branch',
          };
        }

        const patch = parsedPatch.data as Record<string, unknown>;
        if (Object.prototype.hasOwnProperty.call(patch, 'receiptUrl') && (
          isManagedMaintenanceReceipt(existing.receiptUrl)
          || isManagedMaintenanceReceipt(patch.receiptUrl as string | null | undefined)
        )) {
          return {
            ok: false as const,
            status: 400,
            error: 'Private receipts cannot be replaced through record metadata. Delete the record or attach a new receipt securely.',
          };
        }
        const suppliesDate = Object.prototype.hasOwnProperty.call(patch, 'date');
        const suppliesNextDueDate = Object.prototype.hasOwnProperty.call(patch, 'nextDueDate');
        if (suppliesDate !== suppliesNextDueDate) {
          return {
            ok: false as const,
            status: 400,
            error: 'Change the service date and next due date together',
          };
        }
        const candidate = {
          vehicleId: existing.vehicleId,
          type: parsedPatch.data.type ?? existing.type,
          mileage: parsedPatch.data.mileage ?? existing.mileage,
          date: parsedPatch.data.date ?? existing.date.toISOString(),
          description: nullableValue<string>(patch, 'description', existing.description) ?? undefined,
          cost: nullableValue<number>(patch, 'cost', existing.cost) ?? undefined,
          nextDueMileage: nullableValue<number>(patch, 'nextDueMileage', existing.nextDueMileage) ?? undefined,
          nextDueDate: nullableValue<string>(
            patch,
            'nextDueDate',
            existing.nextDueDate?.toISOString() ?? null,
          ) ?? undefined,
          notes: nullableValue<string>(patch, 'notes', existing.notes) ?? undefined,
          receiptUrl: nullableValue<string>(patch, 'receiptUrl', existing.receiptUrl) ?? undefined,
          shopName: nullableValue<string>(patch, 'shopName', existing.shopName) ?? undefined,
        };
        const validated = parseMaintenanceCreate(candidate, isLoggableMaintenanceType);
        if (!validated.success) {
          return { ok: false as const, status: 400, error: 'Invalid data', details: validated.error.issues };
        }

        const preservesLegacyGeneric = existing.type === 'transmission_fluid'
          && !Object.prototype.hasOwnProperty.call(patch, 'type')
          && Object.keys(patch).every((key) => LEGACY_GENERIC_METADATA_FIELDS.has(key));
        const resolvedType = preservesLegacyGeneric
          ? { ok: true as const, type: existing.type }
          : resolveMaintenanceWriteType(validated.data.type, existing.vehicle);
        if (!resolvedType.ok) {
          const message = resolvedType.reason === 'transmission-unselected'
            ? 'Choose Automatic or Manual on this vehicle before editing transmission service'
            : resolvedType.reason === 'transmission-mismatch'
              ? 'This maintenance type does not match the saved transmission branch'
              : 'Invalid maintenance type';
          return { ok: false as const, status: 400, error: message };
        }
        // A legacy generic row remains unassigned when callers edit another
        // field. Only an explicit type write is a new classification decision.
        const persistedType = resolvedType.type;

        if (isTransmissionMaintenanceType(existing.type)
          || isTransmissionMaintenanceType(validated.data.type)) {
          await guardTransmissionMaintenanceVehicle(
            tx,
            existing.vehicle,
            deps.now?.() ?? new Date(),
          );
        }

        const record = await tx.maintenanceRecord.update({
          where: { id },
          data: {
            type: persistedType,
            description: validated.data.description ?? null,
            mileage: validated.data.mileage,
            cost: validated.data.cost ?? null,
            date: new Date(validated.data.date),
            nextDueMileage: validated.data.nextDueMileage ?? null,
            nextDueDate: validated.data.nextDueDate ? new Date(validated.data.nextDueDate) : null,
            notes: validated.data.notes ?? null,
            receiptUrl: validated.data.receiptUrl ?? null,
            shopName: validated.data.shopName ?? null,
          },
        });
        return { ok: true as const, record };
      }, { isolationLevel: 'Serializable' });

      if (!result.ok) {
        return NextResponse.json(
          { error: result.error, ...('details' in result ? { details: result.details } : {}) },
          { status: result.status },
        );
      }
      return NextResponse.json({ record: result.record });
    } catch (error) {
      if (isMaintenanceMutationError(error)) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      if (isPrismaWriteConflict(error)) {
        return NextResponse.json(
          { error: 'This vehicle changed while the maintenance record was being saved. Refresh and try again.' },
          { status: 409 },
        );
      }
      console.error('Error updating maintenance record:', error);
      return NextResponse.json({ error: 'Failed to update maintenance record' }, { status: 500 });
    }
  };
}

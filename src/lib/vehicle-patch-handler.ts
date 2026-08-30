import { NextResponse } from 'next/server';
import type { prisma as prismaClient } from '@/lib/db';
import { isFounderEmail } from '@/lib/founder';
import { getTransmissionPatchCompanionFields, matchesVehicleRevision, resolveVehicleTransmissionUpdate } from '@/lib/transmission-options';
import { isPrismaWriteConflict } from '@/lib/prisma-conflict';
import { getLiveTwinForVehicle, normalizeTwinIdentityField } from '@/lib/twin-fulfillment';
import { getTwinByFulfillmentId, getTwinPaintOptions } from '@/lib/vehicle-twin-catalog';
import { parseVehiclePatch } from '@/lib/twin-route-contracts';
import { isMaintenanceMutationError, nextMonotonicRevision } from '@/lib/maintenance-mutation';

type Session = { user?: { id?: string | null; email?: string | null } } | null;
const IDENTITY_CAS_CONFLICT = 'IDENTITY_CAS_CONFLICT';
const SEMANTIC_IDENTITY_FIELDS = new Set(['year', 'make', 'model', 'trim', 'transmission']);

function isSemanticIdentityNoOp(
  existing: { year: number; make: string; model: string; trim: string | null; transmission: string | null },
  patch: Record<string, unknown>,
): boolean {
  const fields = Object.keys(patch).filter((key) => key !== 'expectedUpdatedAt');
  if (fields.length === 0 || fields.some((key) => !SEMANTIC_IDENTITY_FIELDS.has(key))) return false;
  return fields.every((key) => {
    const value = patch[key];
    if (key === 'year') return value === existing.year;
    if (key === 'transmission') return value === existing.transmission;
    if (key === 'trim') {
      if (value == null || existing.trim == null) return value == null && existing.trim == null;
      return normalizeTwinIdentityField(value as string) === normalizeTwinIdentityField(existing.trim);
    }
    return normalizeTwinIdentityField(value as string)
      === normalizeTwinIdentityField(existing[key as 'make' | 'model']);
  });
}

export function createVehiclePatchHandler(deps: {
  auth: () => Promise<Session>;
  prisma: typeof prismaClient;
  now?: () => Date;
}) {
  return async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
      const { id } = await params;
      const session = await deps.auth();
      if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      const userId = session.user.id;
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
      }
      const parsed = parseVehiclePatch(body);
      if (!parsed.success) return NextResponse.json({ error: 'Invalid vehicle data', details: parsed.error.issues }, { status: 400 });
      const existing = await deps.prisma.vehicle.findFirst({ where: { id, userId } });
      if (!existing) return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
      if (parsed.data.color !== undefined) {
        const definition = getLiveTwinForVehicle(existing);
        const catalog = definition ? getTwinByFulfillmentId(definition.id) : null;
        if (catalog && !getTwinPaintOptions(catalog, existing.trim).some((paint) => paint.name === parsed.data.color)) {
          return NextResponse.json({ error: 'Choose a reviewed factory color for this exact vehicle.' }, { status: 400 });
        }
      }
      const { isPrimary, currentMileage, annualMileage, transmission, expectedUpdatedAt, ...updateData } = parsed.data;
      if (transmission !== undefined && !isFounderEmail(session.user.email)) return NextResponse.json({ error: 'Only the founder fitment workflow can change this field' }, { status: 403 });
      const companions = getTransmissionPatchCompanionFields(parsed.data as Record<string, unknown>);
      if (companions.length) return NextResponse.json({ error: 'Save the transmission choice separately from other vehicle changes', fields: companions }, { status: 400 });
      const resolved = resolveVehicleTransmissionUpdate(existing, { ...updateData, ...(Object.prototype.hasOwnProperty.call(parsed.data, 'transmission') ? { transmission } : {}) });
      if (!resolved.ok) return NextResponse.json({ error: resolved.reason === 'unsupported-transmission-fitment' ? 'Automatic/manual is not a reviewed choice for this exact vehicle' : 'Invalid transmission choice' }, { status: 400 });
      if (isSemanticIdentityNoOp(existing, parsed.data as Record<string, unknown>)) {
        return NextResponse.json({ vehicle: existing });
      }
      const explicit = Object.prototype.hasOwnProperty.call(parsed.data, 'transmission');
      if (explicit) {
        if (!matchesVehicleRevision(expectedUpdatedAt, existing.updatedAt)) return NextResponse.json({ error: 'This vehicle changed while the transmission choice was open. Refresh and try again.' }, { status: 409 });
        const nextRevision = nextMonotonicRevision(existing.updatedAt, deps.now?.() ?? new Date());
        const guarded = await deps.prisma.$transaction(async (tx) => {
          const changed = await tx.vehicle.updateMany({ where: { id, userId, updatedAt: existing.updatedAt, year: existing.year, make: existing.make, model: existing.model, trim: existing.trim, transmission: existing.transmission }, data: { ...updateData, transmission: resolved.transmission, updatedAt: nextRevision } });
          if (changed.count !== 1) return null;
          return tx.vehicle.findUnique({ where: { id } });
        }, { isolationLevel: 'Serializable' });
        return guarded ? NextResponse.json({ vehicle: guarded }) : NextResponse.json({ error: 'This vehicle changed while the transmission choice was saving. Refresh and try again.' }, { status: 409 });
      }
      const vehicleUpdate: Record<string, unknown> = { ...updateData, isPrimary: isPrimary ?? existing.isPrimary };
      if (resolved.shouldWrite) vehicleUpdate.transmission = resolved.transmission;
      if (currentMileage !== undefined) {
        vehicleUpdate.currentMileage = currentMileage; vehicleUpdate.lastMileageUpdate = new Date();
      }
      if (annualMileage !== undefined) vehicleUpdate.annualMileage = annualMileage;
      if (resolved.shouldWrite) {
        vehicleUpdate.updatedAt = nextMonotonicRevision(existing.updatedAt, deps.now?.() ?? new Date());
        const guarded = await deps.prisma.$transaction(async (tx) => {
          if (isPrimary) await tx.vehicle.updateMany({ where: { userId, id: { not: id } }, data: { isPrimary: false } });
          const changed = await tx.vehicle.updateMany({
            where: {
              id, userId, updatedAt: existing.updatedAt, year: existing.year,
              make: existing.make, model: existing.model, trim: existing.trim,
              transmission: existing.transmission,
            },
            data: vehicleUpdate,
          });
          if (changed.count !== 1) throw new Error(IDENTITY_CAS_CONFLICT);
          if (currentMileage !== undefined && currentMileage !== null && currentMileage !== existing.currentMileage) {
            await tx.mileageLog.create({ data: { vehicleId: id, mileage: currentMileage, source: 'manual' } });
          }
          return tx.vehicle.findUnique({ where: { id } });
        }, { isolationLevel: 'Serializable' });
        return NextResponse.json({ vehicle: guarded });
      }
      if (isPrimary) await deps.prisma.vehicle.updateMany({ where: { userId, id: { not: id } }, data: { isPrimary: false } });
      if (currentMileage !== undefined && currentMileage !== null && currentMileage !== existing.currentMileage) {
        await deps.prisma.mileageLog.create({ data: { vehicleId: id, mileage: currentMileage, source: 'manual' } });
      }
      return NextResponse.json({ vehicle: await deps.prisma.vehicle.update({ where: { id }, data: vehicleUpdate }) });
    } catch (error) {
      if (error instanceof Error && error.message === IDENTITY_CAS_CONFLICT) return NextResponse.json({ error: 'This vehicle changed while the identity edit was saving. Refresh and try again.' }, { status: 409 });
      if (isMaintenanceMutationError(error)) return NextResponse.json({ error: error.message }, { status: error.status });
      if (isPrismaWriteConflict(error)) return NextResponse.json({ error: 'This vehicle changed while it was being saved. Refresh and try again.' }, { status: 409 });
      console.error('Error updating vehicle:', error);
      return NextResponse.json({ error: 'Failed to update vehicle' }, { status: 500 });
    }
  };
}

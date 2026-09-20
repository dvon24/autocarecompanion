import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { publicEnrollmentEnabled } from '@/lib/product-entitlements';
import { isAllowedSubscriptionRegion } from '@/lib/pricing/region';
import { VEHICLE_TWIN_CATALOG } from '@/lib/vehicle-twin-catalog';
import { getLiveTwinForVehicle, resolveTwinTransmissionBranch } from '@/lib/twin-fulfillment';
import { hasValidReviewedTransmissionState } from '@/lib/transmission-options';
import { lockServiceOwner, lockServiceVehicle } from '@/lib/maintenance-service-mutation';
import { nextMonotonicRevision } from '@/lib/maintenance-mutation';
import { isPrismaWriteConflict } from '@/lib/prisma-conflict';
class VehicleSetupConflict extends Error {}
const Body = z.object({ catalogId: z.string(), mileage: z.number().int().positive().max(2000000), transmission: z.enum(['automatic', 'manual']).optional() });
export async function POST(request: Request) {
  if (!publicEnrollmentEnabled()) return NextResponse.json({ error: 'enrollment_closed' }, { status: 410 });
  if (!isAllowedSubscriptionRegion(request.headers.get('x-vercel-ip-country'))) return NextResponse.json({ error: 'region_unavailable' }, { status: 403 });
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'sign_in_required' }, { status: 401 });
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'invalid_vehicle' }, { status: 400 });
  const catalog = VEHICLE_TWIN_CATALOG.find((entry) => entry.id === parsed.data.catalogId && entry.ownerReady);
  const twin = catalog && getLiveTwinForVehicle(catalog.identity);
  const branch = twin && catalog && resolveTwinTransmissionBranch(twin, parsed.data.transmission, catalog.identity);
  if (!catalog || !twin || !branch?.options.length || (branch.requiresChoice && !branch.branch)
    || (parsed.data.transmission !== undefined && !branch.options.includes(parsed.data.transmission))) return NextResponse.json({ error: 'owner_ready_fitment_required' }, { status: 400 });
  const transmission = branch.requiresChoice ? branch.branch : null;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const userId = session.user.id;
      await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtextextended(${userId}, 0))`;
      const account = await tx.user.findUnique({ where: { id: userId }, select: { emailVerified: true } });
      if (!account?.emailVerified) return null;
      const { year, make, model, trim } = catalog.identity;
      await lockServiceOwner(tx, userId);
      const existing = await tx.vehicle.findMany({ where: { userId, year, make, model, trim }, select: {
        id: true, transmission: true, currentMileage: true, reviewedEquipmentId: true, updatedAt: true,
      } });
      // Explicit mileage is an owner correction, not a request to replace saved
      // identity/equipment or synthesize completed service history.
      if (existing.length === 1
        && hasValidReviewedTransmissionState({ ...catalog.identity, transmission: existing[0].transmission })
        && resolveTwinTransmissionBranch(twin, existing[0].transmission, catalog.identity).branch === branch.branch
        && existing[0].currentMileage && existing[0].currentMileage > 0) {
        const saved = existing[0];
        if (saved.currentMileage !== parsed.data.mileage) {
          await lockServiceVehicle(tx, saved.id);
          const now = new Date();
          const changed = await tx.vehicle.updateMany({
            where: { id: saved.id, userId, year, make, model, trim, transmission: saved.transmission,
              currentMileage: saved.currentMileage, reviewedEquipmentId: saved.reviewedEquipmentId, updatedAt: saved.updatedAt },
            data: { currentMileage: parsed.data.mileage, lastMileageUpdate: now, updatedAt: nextMonotonicRevision(saved.updatedAt, now) },
          });
          if (changed.count !== 1) throw new VehicleSetupConflict();
          await tx.mileageLog.create({ data: { vehicleId: saved.id, mileage: parsed.data.mileage, source: 'manual' } });
        }
        return saved;
      }
      if (existing.length || await tx.vehicle.count({ where: { userId } }) >= 3) return null;
      return tx.vehicle.create({ data: { userId, year, make, model, trim, transmission,
        currentMileage: parsed.data.mileage, lastMileageUpdate: new Date() }, select: { id: true } });
    });
    return result ? NextResponse.json({ vehicleId: result.id }) : NextResponse.json({ error: 'verify_account_or_review_existing_vehicle' }, { status: 409 });
  } catch (error) {
    if (error instanceof VehicleSetupConflict || isPrismaWriteConflict(error)) {
      return NextResponse.json({ error: 'vehicle_changed', message: 'Your saved vehicle changed while mileage was being confirmed. Review its current details before retrying.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'vehicle_setup_unavailable' }, { status: 503 });
  }
}

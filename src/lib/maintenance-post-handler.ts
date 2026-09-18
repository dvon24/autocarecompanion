import { NextResponse } from 'next/server';
import type { prisma as prismaClient } from '@/lib/db';
import { isFounderEmail } from '@/lib/founder';
import { productEntitlements, entitlementSelect } from '@/lib/product-entitlements';
import { canUsePersonalVehicle } from '@/lib/vehicle-capabilities';
import { isLoggableMaintenanceType } from '@/lib/maintenance';
import { isPrismaWriteConflict } from '@/lib/prisma-conflict';
import { parseMaintenanceCreate } from '@/lib/twin-route-contracts';
import { isMaintenanceMutationError } from '@/lib/maintenance-mutation';
import { ServiceReviewSchema } from '@/lib/maintenance-service-review';
import { persistMaintenanceEntry, persistServiceReview, lockServiceOwner, lockServiceVehicle } from '@/lib/maintenance-service-mutation';

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
      const isReview = Boolean(body && typeof body === 'object' && 'requestId' in body);
      const review = isReview ? ServiceReviewSchema.safeParse(body) : null;
      if (review && !review.success) return NextResponse.json({ error: 'Check the reviewed service details.', details: review.error.issues }, { status: 400 });
      const parsed = parseMaintenanceCreate(review?.success ? {
        vehicleId: review.data.vehicleId, type: review.data.jobs[0].type, date: review.data.date, mileage: review.data.mileage,
      } : body, isLoggableMaintenanceType);
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
          select: entitlementSelect,
        });
        if (!productEntitlements(user).maintenance && !(user?.emailVerified && await canUsePersonalVehicle(userId, parsed.data.vehicleId, deps.prisma))) {
          return NextResponse.json({
            error: 'tier_required',
            message: 'Hub access is required to track personal service history.',
          }, { status: 403 });
        }
      }

      const { vehicleId } = parsed.data;
      const operationTime = deps.now?.() ?? new Date();
      const result = await deps.prisma.$transaction(async (tx) => {
        if (review?.success) {
          const saved = await persistServiceReview(tx, userId, review.data, operationTime);
          return { ok: true as const, record: saved.records[0], ...saved };
        }
        await lockServiceOwner(tx, userId);
        await lockServiceVehicle(tx, vehicleId);
        const vehicle = await tx.vehicle.findFirst({
          where: { id: vehicleId, userId },
        });
        if (!vehicle) return { ok: false as const, status: 404, error: 'Vehicle not found' };

        const record = await persistMaintenanceEntry(tx, vehicle, {
          type: parsed.data.type, mileage: parsed.data.mileage, date: parsed.data.date,
          cost: parsed.data.cost, description: parsed.data.description, shopName: parsed.data.shopName,
          notes: parsed.data.notes, receiptUrl: parsed.data.receiptUrl,
        }, operationTime);
        return { ok: true as const, record };
      }, { isolationLevel: 'Serializable' });

      if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
      return NextResponse.json({ record: result.record, ...('records' in result ? { records: result.records, replayed: result.replayed } : {}) }, { status: 201 });
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

import { z } from 'zod';
import { NextResponse } from 'next/server';
import type { prisma as prismaClient } from '@/lib/db';
import {
  getTwinDefinition,
  resolveTwinTransmissionBranch,
  transmissionSelectionFitsReviewedOptions,
  twinMatchesVehicle,
  TWIN_FULFILLMENT_STATUSES,
  type TwinFulfillmentStatus,
} from '@/lib/twin-fulfillment';
import { canEnterTwinReadyState } from '@/lib/twin-reservation-ready';
import { isTransmissionChoice } from '@/lib/transmission-options';

const AdminReservationUpdateSchema = z.object({
  id: z.string().trim().min(1),
  expectedUpdatedAt: z.string().datetime({ offset: true, precision: 3 }),
  status: z.string().trim().refine(
    (value): value is TwinFulfillmentStatus => TWIN_FULFILLMENT_STATUSES.includes(value as TwinFulfillmentStatus),
    { message: 'Invalid fulfillment status' },
  ).optional(),
  assignedTwin: z.string().trim().min(1).nullable().optional(),
  trialDays: z.union([z.literal(7), z.literal(30)]).nullable().optional(),
  transmission: z.enum(['automatic', 'manual']).nullable().optional(),
}).strict().superRefine((value, context) => {
  if (Object.keys(value).every((key) => key === 'id' || key === 'expectedUpdatedAt')) {
    context.addIssue({ code: 'custom', message: 'At least one reservation field must change' });
  }
});

const hasOwn = (value: object, key: string) => Object.prototype.hasOwnProperty.call(value, key);

export function createAdminReservationPostHandler(deps: {
  requireFounder: () => Promise<Response | null>;
  prisma: typeof prismaClient;
  now?: () => Date;
  resolveTwinDefinition?: typeof getTwinDefinition;
}) {
  return async function POST(request: Request) {
    const denied = await deps.requireFounder();
    if (denied) return denied;

    let unknownBody: unknown;
    try {
      unknownBody = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    const parsed = AdminReservationUpdateSchema.safeParse(unknownBody);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid reservation update', details: parsed.error.issues }, { status: 400 });
    }

    const body = parsed.data;
    const expectedUpdatedAt = new Date(body.expectedUpdatedAt);
    const reservation = await deps.prisma.reservation.findUnique({ where: { id: body.id } });
    if (!reservation) return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    if (reservation.twinStatus === 'claimed') {
      return NextResponse.json({ error: 'A claimed twin cannot be changed from the fulfillment queue.' }, { status: 409 });
    }
    if (reservation.updatedAt.getTime() !== expectedUpdatedAt.getTime()) {
      return NextResponse.json({ error: 'This reservation changed since the queue was loaded. Refresh before saving.' }, { status: 409 });
    }

    const status = (body.status ?? reservation.twinStatus) as TwinFulfillmentStatus;
    if (status === 'claimed') {
      return NextResponse.json({ error: 'Claimed is written by the future owner claim flow, not manually.' }, { status: 400 });
    }
    const assignedTwin = hasOwn(body, 'assignedTwin') ? body.assignedTwin ?? null : reservation.assignedTwin;
    const trialDays = hasOwn(body, 'trialDays') ? body.trialDays ?? null : reservation.trialDays;
    if (reservation.transmission != null && !isTransmissionChoice(reservation.transmission)) {
      return NextResponse.json({ error: 'The saved transmission selection is invalid' }, { status: 400 });
    }
    const requestedTransmission = hasOwn(body, 'transmission')
      ? body.transmission ?? null
      : hasOwn(body, 'assignedTwin') && assignedTwin === null
        ? null
        : reservation.transmission;

    const twin = (deps.resolveTwinDefinition ?? getTwinDefinition)(assignedTwin);
    if (assignedTwin && (!twin || !twin.live)) {
      return NextResponse.json({ error: 'That twin is not live and cannot be assigned' }, { status: 400 });
    }
    const reservationVehicle = reservation.year && reservation.make && reservation.model
      ? { year: reservation.year, make: reservation.make, model: reservation.model, trim: reservation.trim }
      : null;
    if (twin && (!reservationVehicle || !twinMatchesVehicle(twin, reservationVehicle))) {
      return NextResponse.json({ error: `The ${twin.label} twin does not match this reservation's vehicle` }, { status: 400 });
    }

    const transmissionFitment = reservationVehicle
      ? resolveTwinTransmissionBranch(twin, requestedTransmission, reservationVehicle)
      : { branch: null, requiresChoice: false, options: [] as const };
    if (!transmissionSelectionFitsReviewedOptions(transmissionFitment.options, requestedTransmission)) {
      return NextResponse.json({ error: 'The supplied transmission is not reviewed for this exact vehicle' }, { status: 400 });
    }
    const transmission = transmissionFitment.requiresChoice ? transmissionFitment.branch : null;

    if (status === 'ready' && !canEnterTwinReadyState({
      reservation,
      hasLiveMatchingTwin: !!twin,
      trialDays,
      transmissionOptionCount: transmissionFitment.options.length,
      transmissionOptions: transmissionFitment.options,
      transmission,
    })) {
      return NextResponse.json({
        error: 'Ready requires a verified vehicle and trim, matching live twin, transmission when applicable, and 7/30-day offer',
      }, { status: 400 });
    }

    const operationTime = deps.now?.() ?? new Date();
    const operationTimeMs = operationTime.getTime();
    if (!Number.isFinite(operationTimeMs)) {
      return NextResponse.json({ error: 'The reservation revision is invalid. Refresh before saving.' }, { status: 409 });
    }
    const nextUpdatedAt = new Date(Math.max(operationTimeMs, reservation.updatedAt.getTime() + 1));
    const updateData: Record<string, unknown> = { updatedAt: nextUpdatedAt };
    if (hasOwn(body, 'status')) {
      updateData.twinStatus = status;
      updateData.readyAt = status === 'ready'
        ? reservation.readyAt ?? operationTime
        : null;
    }
    if (hasOwn(body, 'assignedTwin')) updateData.assignedTwin = assignedTwin;
    if (hasOwn(body, 'trialDays')) updateData.trialDays = trialDays;
    if (hasOwn(body, 'transmission') || hasOwn(body, 'assignedTwin')) updateData.transmission = transmission;

    const write = await deps.prisma.reservation.updateMany({
      where: { id: body.id, updatedAt: expectedUpdatedAt, twinStatus: reservation.twinStatus },
      data: updateData,
    });
    if (write.count !== 1) {
      return NextResponse.json({ error: 'This twin was claimed while you were editing it; no changes were applied.' }, { status: 409 });
    }
    const updated = await deps.prisma.reservation.findUniqueOrThrow({ where: { id: body.id } });
    return NextResponse.json({
      reservation: {
        id: updated.id,
        twinStatus: updated.twinStatus,
        assignedTwin: updated.assignedTwin,
        trialDays: updated.trialDays,
        transmission: updated.transmission,
        readyAt: updated.readyAt?.toISOString() ?? null,
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  };
}

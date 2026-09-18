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
import { lockReservationEmail } from './reservation-email-lock';

const AdminReservationUpdateSchema = z.object({
  id: z.string().trim().min(1),
  expectedUpdatedAt: z.string().datetime({ offset: true, precision: 3 }),
  action: z.literal('cancel').optional(),
  confirm: z.literal(true).optional(),
  status: z.string().trim().refine(
    (value): value is TwinFulfillmentStatus => TWIN_FULFILLMENT_STATUSES.includes(value as TwinFulfillmentStatus),
    { message: 'Invalid fulfillment status' },
  ).optional(),
  assignedTwin: z.string().trim().min(1).nullable().optional(),
  trialDays: z.union([z.literal(7), z.literal(30)]).nullable().optional(),
  transmission: z.enum(['automatic', 'manual']).nullable().optional(),
}).strict().superRefine((value, context) => {
  if (value.action === 'cancel') {
    if (!value.confirm || ['status', 'assignedTwin', 'trialDays', 'transmission'].some(key => key in value)) {
      context.addIssue({ code: 'custom', message: 'Confirm cancellation without other changes' });
    }
    return;
  }
  if (value.confirm || value.status === 'canceled') context.addIssue({ code: 'custom', message: 'Use the confirmed cancellation action' });
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
    if (body.action === 'cancel') {
      if (request.headers.get('origin') !== new URL(request.url).origin) return NextResponse.json({ error: 'Same-origin request required' }, { status: 403 });
      return deps.prisma.$transaction(async tx => {
        await lockReservationEmail(tx, reservation.email);
        const current = await tx.reservation.findUnique({ where: { id: body.id } });
        if (!current) return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
        if (current.twinStatus === 'claimed' || current.claimedAt) return NextResponse.json({ error: 'This vehicle was already claimed. Cancellation cannot change its account or access.' }, { status: 409 });
        if (current.twinStatus === 'canceled') return NextResponse.json({ reservation: { id: current.id, twinStatus: current.twinStatus, updatedAt: current.updatedAt.toISOString() } });
        if (current.updatedAt.getTime() !== expectedUpdatedAt.getTime()) return NextResponse.json({ error: 'This reservation changed. Refresh before canceling.' }, { status: 409 });
        const now = deps.now?.() ?? new Date();
        if (!Number.isFinite(now.getTime())) return NextResponse.json({ error: 'Invalid cancellation time.' }, { status: 409 });
        const updatedAt = new Date(Math.max(now.getTime(), current.updatedAt.getTime() + 1));
        const canceled = await tx.reservation.updateMany({ where: { id: current.id, updatedAt: expectedUpdatedAt, twinStatus: current.twinStatus, claimedAt: null }, data: { twinStatus: 'canceled', updatedAt } });
        if (canceled.count !== 1) return NextResponse.json({ error: 'This reservation changed. Refresh before canceling.' }, { status: 409 });
        return NextResponse.json({ reservation: { id: current.id, twinStatus: 'canceled', updatedAt: updatedAt.toISOString() } });
      }, { isolationLevel: 'ReadCommitted' });
    }
    if (reservation.twinStatus === 'canceled') return NextResponse.json({ error: 'This request was canceled by the customer and cannot be changed or reactivated.' }, { status: 409 });
    if (await deps.prisma.twinInvitationDelivery.findUnique({where:{reservationId:reservation.id},select:{id:true}})) {
      return NextResponse.json({error:'This offer has an invitation sent or awaiting reconciliation. Its vehicle and trial cannot be changed from the queue.'},{status:409});
    }
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
    }).catch((error:unknown) => {
      if(error && typeof error==='object' && 'code' in error && error.code==='P2002')return null;
      throw error;
    });
    if(!write)return NextResponse.json({error:'Another reservation already has this exact vehicle and transmission. Neither offer was changed. Review both requests before changing this assignment.'},{status:409});
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

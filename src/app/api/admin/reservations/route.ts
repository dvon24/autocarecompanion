import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireFounder } from '@/lib/admin-guard';
import {
  getTwinDefinition,
  twinMatchesVehicle,
  TWIN_FULFILLMENT_STATUSES,
  type TwinFulfillmentStatus,
} from '@/lib/twin-fulfillment';
import { getTransmissionOptions, isTransmissionChoice } from '@/lib/transmission-options';

const TRIAL_OPTIONS = new Set([7, 30]);

export async function POST(request: NextRequest) {
  const denied = await requireFounder();
  if (denied) return denied;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const id = typeof body.id === 'string' ? body.id.trim() : '';
  const status = typeof body.status === 'string' ? body.status.trim() : '';
  const assignedTwin = typeof body.assignedTwin === 'string' && body.assignedTwin.trim()
    ? body.assignedTwin.trim()
    : null;
  const trialDays = typeof body.trialDays === 'number' ? body.trialDays : null;
  const requestedTransmission = isTransmissionChoice(body.transmission) ? body.transmission : null;
  const expectedUpdatedAt = typeof body.expectedUpdatedAt === 'string'
    ? new Date(body.expectedUpdatedAt)
    : null;

  if (!id || !TWIN_FULFILLMENT_STATUSES.includes(status as TwinFulfillmentStatus)) {
    return NextResponse.json({ error: 'Invalid reservation or status' }, { status: 400 });
  }
  if (!expectedUpdatedAt || Number.isNaN(expectedUpdatedAt.getTime())) {
    return NextResponse.json({ error: 'Refresh the queue before saving this reservation' }, { status: 409 });
  }
  if (status === 'claimed') {
    return NextResponse.json(
      { error: 'Claimed is written by the future owner claim flow, not manually.' },
      { status: 400 },
    );
  }
  if (trialDays !== null && !TRIAL_OPTIONS.has(trialDays)) {
    return NextResponse.json({ error: 'Trial offer must be 7 or 30 days' }, { status: 400 });
  }

  const reservation = await prisma.reservation.findUnique({ where: { id } });
  if (!reservation) {
    return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
  }
  if (reservation.twinStatus === 'claimed') {
    return NextResponse.json(
      { error: 'A claimed twin cannot be changed from the fulfillment queue.' },
      { status: 409 },
    );
  }
  if (reservation.updatedAt.getTime() !== expectedUpdatedAt.getTime()) {
    return NextResponse.json(
      { error: 'This reservation changed since the queue was loaded. Refresh before saving.' },
      { status: 409 },
    );
  }

  const twin = getTwinDefinition(assignedTwin);
  if (assignedTwin && (!twin || !twin.live)) {
    return NextResponse.json({ error: 'That twin is not live and cannot be assigned' }, { status: 400 });
  }
  const reservationVehicle = reservation.year && reservation.make && reservation.model
    ? {
      year: reservation.year,
      make: reservation.make,
      model: reservation.model,
      trim: reservation.trim,
    }
    : null;
  const transmissionOptions = reservationVehicle ? getTransmissionOptions(reservationVehicle) : [];
  const transmission = transmissionOptions.length > 1 ? requestedTransmission : null;
  if (twin && (!reservationVehicle || !twinMatchesVehicle(twin, reservationVehicle))) {
    return NextResponse.json(
      { error: `The ${twin.label} twin does not match this reservation's vehicle` },
      { status: 400 },
    );
  }
  if (
    status === 'ready'
    && (!reservation.vehicleVerified || !twin || !trialDays || (transmissionOptions.length > 1 && !transmission))
  ) {
    return NextResponse.json(
      { error: 'Ready requires a verified vehicle, matching live twin, transmission when applicable, and 7/30-day offer' },
      { status: 400 },
    );
  }

  const write = await prisma.reservation.updateMany({
    where: { id, updatedAt: expectedUpdatedAt, twinStatus: reservation.twinStatus },
    data: {
      twinStatus: status,
      assignedTwin,
      trialDays,
      transmission,
      readyAt: status === 'ready' ? (reservation.readyAt ?? new Date()) : null,
    },
  });
  if (write.count !== 1) {
    return NextResponse.json(
      { error: 'This twin was claimed while you were editing it; no changes were applied.' },
      { status: 409 },
    );
  }
  const updated = await prisma.reservation.findUniqueOrThrow({ where: { id } });

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
}

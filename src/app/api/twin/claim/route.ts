import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getTwinDefinition, twinMatchesVehicle } from '@/lib/twin-fulfillment';
import { vehicleSlug } from '@/lib/vehicle-slug';
import { getTransmissionOptions, isTransmissionChoice } from '@/lib/transmission-options';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: 'Sign in to accept this offer' }, { status: 401 });
  }

  const email = session.user.email.trim().toLowerCase();
  const reservation = await prisma.reservation.findUnique({ where: { email } });
  if (!reservation || !['ready', 'claimed'].includes(reservation.twinStatus)) {
    return NextResponse.json({ error: 'No ready twin offer was found for this account' }, { status: 404 });
  }
  if (reservation.twinStatus === 'claimed' && reservation.claimedAt && reservation.trialDays) {
    const expiresAt = new Date(reservation.claimedAt);
    expiresAt.setUTCDate(expiresAt.getUTCDate() + reservation.trialDays);
    if (expiresAt.getTime() <= Date.now()) {
      return NextResponse.json({ error: 'This beta access period has ended.' }, { status: 410 });
    }
  }
  if (!reservation.assignedTwin || ![7, 30].includes(reservation.trialDays ?? 0)) {
    return NextResponse.json({ error: 'This offer is not fully configured yet' }, { status: 409 });
  }

  const twin = getTwinDefinition(reservation.assignedTwin);
  if (!twin) {
    return NextResponse.json({ error: 'The assigned twin is not available' }, { status: 409 });
  }
  const reservationVehicle = reservation.year && reservation.make && reservation.model
    ? { year: reservation.year, make: reservation.make, model: reservation.model, trim: reservation.trim }
    : null;
  if (!reservationVehicle || !twinMatchesVehicle(twin, reservationVehicle)) {
    return NextResponse.json(
      { error: 'This twin no longer matches the reserved vehicle. Contact Au7o before activating it.' },
      { status: 409 },
    );
  }
  const transmissionOptions = getTransmissionOptions(reservationVehicle);
  if (transmissionOptions.length > 1 && !isTransmissionChoice(reservation.transmission)) {
    return NextResponse.json(
      { error: 'The automatic/manual fitment still needs to be confirmed before this twin can be activated.' },
      { status: 409 },
    );
  }

  const garageVehicles = await prisma.vehicle.findMany({
    where: { userId: session.user.id },
    select: { id: true, year: true, make: true, model: true, trim: true, currentMileage: true },
  });
  const matchingVehicles = garageVehicles.filter((candidate) => twinMatchesVehicle(twin, candidate));
  if (matchingVehicles.length === 0) {
    return NextResponse.json(
      { error: `Add the exact ${reservation.vehicle || twin.label} to your garage before claiming it.` },
      { status: 409 },
    );
  }
  if (matchingVehicles.length > 1) {
    return NextResponse.json(
      { error: `More than one exact ${reservation.vehicle || twin.label} is in this garage. Remove the duplicate or contact Au7o so the correct service history can be attached.` },
      { status: 409 },
    );
  }
  const vehicle = matchingVehicles[0];
  if (!vehicle.currentMileage || vehicle.currentMileage <= 0) {
    return NextResponse.json(
      { error: 'Add the current mileage to this garage vehicle before activating the trial. Your trial clock will not start yet.' },
      { status: 409 },
    );
  }

  if (reservation.twinStatus !== 'claimed') {
    const transition = await prisma.reservation.updateMany({
      where: {
        id: reservation.id,
        updatedAt: reservation.updatedAt,
        twinStatus: 'ready',
        assignedTwin: reservation.assignedTwin,
        trialDays: reservation.trialDays,
        transmission: reservation.transmission,
      },
      data: { twinStatus: 'claimed', claimedAt: new Date() },
    });
    if (transition.count !== 1) {
      return NextResponse.json(
        { error: 'This offer changed while it was being activated. Refresh to review the current offer.' },
        { status: 409 },
      );
    }
  }

  return NextResponse.json({
    success: true,
    href: `/vehicle/${vehicleSlug(vehicle.year, vehicle.make, vehicle.model, vehicle.trim)}`,
  });
}

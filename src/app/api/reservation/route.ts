import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/db';
import { getClientIp, rateLimitResponse, reservationLimiter } from '@/lib/rate-limit';
import { composeVehicle, parseReservationInput } from '@/lib/reservation';
import { verifyVehicle } from '@/lib/reservation-verify';
import { getTransmissionOptions, isTransmissionChoice } from '@/lib/transmission-options';

// Vehicle Twin beta reservation. Mirrors /api/interest (the lead-capture path
// that's proven in production) but writes a Reservation row — a demand signal,
// not an alert subscription.
//
// Re-reserving with the same address must never fail: people try the hero, then
// the demo, then reserve again. We upsert and keep the FIRST source/path (the
// place that actually earned the commitment) while letting later submissions
// fill in blanks they skipped the first time.
export async function POST(request: NextRequest) {
  const limit = reservationLimiter.check(getClientIp(request));
  if (!limit.success) return rateLimitResponse(limit.reset);

  try {
    const input = parseReservationInput(await request.json());
    if (!input) {
      return NextResponse.json({ error: 'Invalid reservation details' }, { status: 400 });
    }

    // Resolve what they claimed against the catalog before anything is stored.
    const { claimed, transmission: claimedTransmission, ...base } = input;
    const vehicle = verifyVehicle(claimed);
    const transmissionOptions = vehicle.vehicleVerified ? getTransmissionOptions(vehicle) : [];
    const requiresTransmission = transmissionOptions.length > 1;
    if (requiresTransmission && !isTransmissionChoice(claimedTransmission)) {
      return NextResponse.json(
        { error: 'Choose the automatic or manual transmission for this vehicle' },
        { status: 400 },
      );
    }
    // A caller cannot attach a gearbox to a vehicle outside the reviewed
    // dual-transmission allow-list. Null is the truthful value there.
    const transmission = requiresTransmission ? claimedTransmission : null;
    // Store the catalog's casing whenever verification succeeds. A direct API
    // caller can submit "nissan kicks" even though the browser picker emits
    // canonical labels; leaving the display string untouched would preserve
    // exactly the drift the structured picker is meant to eliminate.
    const acceptedDisplay = vehicle.vehicleVerified ? composeVehicle(vehicle) : base.vehicle;

    const unsubscribeToken = randomBytes(24).toString('base64url');
    const existing = await prisma.reservation.findUnique({
      where: { email: input.email },
      select: {
        id: true, updatedAt: true,
        vehicle: true, country: true, note: true, unsubscribedAt: true,
        vehicleVerified: true, trimVerified: true, trim: true,
        year: true, make: true, model: true, transmission: true,
        twinStatus: true,
      },
    });

    // A catalog-resolved pick always wins over an earlier free-text guess: it
    // is strictly better data, and it is the only form the maintenance schedule
    // can read. The reverse never happens — free text never downgrades a row
    // that already resolved against ymmt.json.
    const upgradesVehicle = vehicle.vehicleVerified && !existing?.vehicleVerified;
    const sameStoredVehicle = Boolean(
      vehicle.vehicleVerified
      && existing?.vehicleVerified
      && existing.year === vehicle.year
      && existing.make?.trim().toLowerCase() === vehicle.make?.trim().toLowerCase()
      && existing.model?.trim().toLowerCase() === vehicle.model?.trim().toLowerCase()
    );
    const sameStoredExactVehicle = Boolean(
      sameStoredVehicle
      && (existing?.trim ?? '').trim().toLowerCase() === (vehicle.trim ?? '').trim().toLowerCase()
    );
    const publicFitmentMutable = !existing || ['reserved', 'building'].includes(existing.twinStatus);
    // Trim can improve on its own, without the rest of the vehicle changing:
    // someone who reserved with no trim, or a typed one, can come back and
    // pick it off the list. That is a real upgrade for the schedule.
    const upgradesTrim = Boolean(
      vehicle.trim && (
        upgradesVehicle
        || (sameStoredVehicle && vehicle.trimVerified && !existing?.trimVerified)
        || (sameStoredVehicle && !existing?.trim && existing?.vehicleVerified)
      )
    );

    if (!existing) {
      const created = await prisma.reservation.createMany({
        data: [{
          ...base,
          vehicle: acceptedDisplay,
          ...vehicle,
          transmission,
          unsubscribeToken,
        }],
        skipDuplicates: true,
      });
      if (created.count !== 1) {
        return NextResponse.json(
          { error: 'This reservation changed while you were submitting it. Please try once more.' },
          { status: 409 },
        );
      }
      return NextResponse.json({ success: true });
    }

    const fitmentChanges = publicFitmentMutable && (upgradesVehicle || upgradesTrim);
    const transmissionChange = publicFitmentMutable
      && (upgradesVehicle || upgradesTrim || sameStoredExactVehicle);
    const write = await prisma.reservation.updateMany({
      where: {
        id: existing.id,
        updatedAt: existing.updatedAt,
        ...(fitmentChanges || transmissionChange
          ? { twinStatus: { in: ['reserved', 'building'] } }
          : {}),
      },
      data: {
        // Once an offer is ready or claimed, every field that identifies its
        // fitment is immutable from this public endpoint.
        vehicle: fitmentChanges ? acceptedDisplay : undefined,
        year: publicFitmentMutable && upgradesVehicle ? vehicle.year : undefined,
        make: publicFitmentMutable && upgradesVehicle ? vehicle.make : undefined,
        model: publicFitmentMutable && upgradesVehicle ? vehicle.model : undefined,
        vehicleVerified: publicFitmentMutable && upgradesVehicle ? true : undefined,
        trim: publicFitmentMutable && upgradesTrim ? vehicle.trim : undefined,
        trimVerified: publicFitmentMutable && upgradesTrim ? vehicle.trimVerified : undefined,
        transmission: transmissionChange ? transmission : undefined,
        country: existing.country ? undefined : base.country,
        note: existing.note ? undefined : (base.note ?? undefined),
        // A fresh form submission is an explicit re-opt-in.
        unsubscribedAt: existing.unsubscribedAt ? null : undefined,
        unsubscribeToken: existing.unsubscribedAt ? unsubscribeToken : undefined,
      },
    });
    if (write.count !== 1) {
      return NextResponse.json(
        { error: 'This reservation changed while you were submitting it. Refresh and try again.' },
        { status: 409 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving reservation:', error);
    return NextResponse.json({ error: 'Failed to save reservation' }, { status: 500 });
  }
}

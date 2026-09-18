import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import type { prisma as Database } from '@/lib/db';
import { isAllowedSubscriptionRegion } from '@/lib/pricing/region';
import { composeVehicle, parseReservationInput } from '@/lib/reservation';
import { verifyVehicle } from '@/lib/reservation-verify';
import { getTransmissionOptions, isTransmissionChoice } from '@/lib/transmission-options';
import { isUSReservationCountry, reservationRequestKey } from './reservation-identity';
import { lockReservationEmail, reservationEmailWhere } from './reservation-email-lock';
import { isPrismaWriteConflict } from './prisma-conflict';

export function createReservationHandler(deps: {
  prisma: Pick<typeof Database, '$transaction'>;
  rateLimit: (request: NextRequest) => Response | null;
  auth?: () => Promise<{ user?: { id?: string | null; email?: string | null } } | null>;
}) {
  return async function POST(request: NextRequest) {
    if (!isAllowedSubscriptionRegion(request.headers.get('x-vercel-ip-country'))) {
      return NextResponse.json({ error: 'region_unavailable', message: 'Hub reservations are available in the US only.' }, { status: 403 });
    }
    const denied = deps.rateLimit(request);
    if (denied) return denied;
    try {
      const input = parseReservationInput(await request.json());
      if (!input) return NextResponse.json({ error: 'Invalid reservation details' }, { status: 400 });
      if (!isUSReservationCountry(input.country)) return NextResponse.json({ error: 'region_unavailable' }, { status: 403 });
      if (input.source === 'hub-owner') {
        const session = await deps.auth?.();
        if (!session?.user?.id || session.user.email?.trim().toLowerCase() !== input.email) {
          return NextResponse.json({ error: 'Sign in and use your account email to request another vehicle.' }, { status: 401 });
        }
      }
      const { claimed, transmission: claimedTransmission, ...base } = input;
      const vehicle = verifyVehicle(claimed);
      const requiresTransmission = vehicle.vehicleVerified && getTransmissionOptions(vehicle).length > 1;
      if (requiresTransmission && !isTransmissionChoice(claimedTransmission)) {
        return NextResponse.json({ error: 'Choose the automatic or manual transmission for this vehicle' }, { status: 400 });
      }
      const accepted = {
        ...base, ...vehicle, country: 'US',
        vehicle: vehicle.vehicleVerified ? composeVehicle(vehicle) : base.vehicle,
        transmission: requiresTransmission ? claimedTransmission : null,
      };
      // Exact repeated requests are no-ops. A different trim, gearbox, or free-text
      // request never edits reviewed evidence, clocks, consent or attribution.
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const detailsConflict = await deps.prisma.$transaction(async tx => {
            await lockReservationEmail(tx, input.email);
            const rows = await tx.reservation.findMany({ where: await reservationEmailWhere(tx,input.email) });
            const duplicate = rows.find(row => reservationRequestKey(row) === reservationRequestKey(accepted));
            if (duplicate) {
              if (duplicate.twinStatus === 'canceled') return 'canceled';
              // The database's unique request key intentionally excludes notes. Never
              // claim newly supplied configuration details were saved when they were not.
              return input.source === 'hub-owner' && !accepted.vehicleVerified && Boolean(accepted.note)
                && (duplicate.note || '').trim() !== accepted.note;
            }
            const unsubscribedAt = rows.find(row => row.unsubscribedAt)?.unsubscribedAt ?? null;
            await tx.reservation.create({ data: { ...accepted, unsubscribedAt, unsubscribeToken: randomBytes(24).toString('base64url') } });
          }, { isolationLevel: 'ReadCommitted' });
          if (detailsConflict === 'canceled') return NextResponse.json({ error: 'reservation_canceled', message: 'This vehicle request was canceled. Contact support@au7o.io if you want to request it again. Your earlier request and account are unchanged.' }, { status: 409 });
          if (detailsConflict) return NextResponse.json({ error: 'configuration_details_conflict', message: 'A request for this vehicle already exists with different details. Add the distinguishing trim or configuration to the vehicle field, then submit again, or contact support@au7o.io. Your earlier request is unchanged; these new configuration details were not saved.' }, { status: 409 });
          return NextResponse.json({ success: true });
        } catch (error) {
          if (!isPrismaWriteConflict(error) || attempt === 2) throw error;
        }
      }
      return NextResponse.json({ error: 'Please try again.' }, { status: 409 });
    } catch (error) {
      if (isPrismaWriteConflict(error)) return NextResponse.json({ error: 'This reservation changed. Please try again.' }, { status: 409 });
      console.error('Error saving reservation:', error);
      return NextResponse.json({ error: 'Failed to save reservation' }, { status: 500 });
    }
  };
}

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/db';
import { getClientIp, rateLimitResponse, reservationLimiter } from '@/lib/rate-limit';
import { parseReservationInput } from '@/lib/reservation';

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

    const unsubscribeToken = randomBytes(24).toString('base64url');
    const existing = await prisma.reservation.findUnique({
      where: { email: input.email },
      select: { vehicle: true, country: true, note: true, unsubscribedAt: true },
    });

    await prisma.reservation.upsert({
      where: { email: input.email },
      create: {
        ...input,
        unsubscribeToken,
      },
      // Only fill gaps — never overwrite the original attribution.
      update: {
        vehicle: existing?.vehicle ? undefined : input.vehicle,
        country: existing?.country ? undefined : input.country,
        note: existing?.note ? undefined : (input.note ?? undefined),
        // A fresh form submission is an explicit re-opt-in.
        unsubscribedAt: existing?.unsubscribedAt ? null : undefined,
        unsubscribeToken: existing?.unsubscribedAt ? unsubscribeToken : undefined,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving reservation:', error);
    return NextResponse.json({ error: 'Failed to save reservation' }, { status: 500 });
  }
}

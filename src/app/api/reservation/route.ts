import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/db';

// Vehicle Twin beta reservation. Mirrors /api/interest (the lead-capture path
// that's proven in production) but writes a Reservation row — a demand signal,
// not an alert subscription.
//
// Re-reserving with the same address must never fail: people try the hero, then
// the demo, then reserve again. We upsert and keep the FIRST source/path (the
// place that actually earned the commitment) while letting later submissions
// fill in blanks they skipped the first time.
export async function POST(request: NextRequest) {
  try {
    const { email, vehicle, country, source, path, note } = await request.json();

    if (!email || typeof email !== 'string' || !email.includes('@') || email.length > 320) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const str = (v: unknown, max: number) =>
      typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null;

    const normalized = email.trim().toLowerCase();
    const unsubscribeToken = randomBytes(24).toString('base64url');

    await prisma.reservation.upsert({
      where: { email: normalized },
      create: {
        email: normalized,
        vehicle: str(vehicle, 120),
        country: str(country, 60),
        source: str(source, 60),
        path: str(path, 200),
        note: str(note, 1000),
        unsubscribeToken,
      },
      // Only fill gaps — never overwrite the original attribution.
      update: {
        vehicle: str(vehicle, 120) ?? undefined,
        country: str(country, 60) ?? undefined,
        note: str(note, 1000) ?? undefined,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving reservation:', error);
    return NextResponse.json({ error: 'Failed to save reservation' }, { status: 500 });
  }
}

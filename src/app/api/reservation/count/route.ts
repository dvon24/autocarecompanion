import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Public count behind the hero's "N reserved" line.
//
// The design ships a hard-coded 1,204. Printing that number while the table
// holds 0 is fabricated social proof, so this serves the REAL count — and the
// hero hides the line entirely below MIN_SHOW, because "3 reserved" reads worse
// than no counter at all. The number starts being persuasive, not embarrassing,
// somewhere around a few dozen.
const MIN_SHOW = 25;

export async function GET() {
  try {
    const count = await prisma.reservation.count({ where: { unsubscribedAt: null } });
    return NextResponse.json({ count, show: count >= MIN_SHOW });
  } catch (error) {
    console.error('Reservation count error:', error);
    // Fail closed: no number is better than a wrong one.
    return NextResponse.json({ count: 0, show: false });
  }
}

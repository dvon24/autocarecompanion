import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { isFounderEmail } from '@/lib/founder';
import { TWIN_DEFINITIONS } from '@/lib/twin-fulfillment';

export const dynamic = 'force-dynamic';

// Founder-only dump of captured leads + feedback for the admin dashboard.
// Previously: unauthenticated AND read from local files that don't exist
// on Vercel (2026-06-11 review finding — latent PII leak). Now founder-
// gated and backed by the InterestEmail/Feedback tables.
export async function GET() {
  const session = await auth();
  if (!isFounderEmail(session?.user?.email)) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  try {
    const [emailRows, feedbackRows, userRows, reservationRows] = await Promise.all([
      prisma.interestEmail.findMany({ orderBy: { createdAt: 'desc' }, take: 1000 }),
      prisma.feedback.findMany({
        where: { kind: { in: ['bug', 'feature', 'general'] } },
        orderBy: { createdAt: 'desc' },
        take: 1000,
      }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 1000,
        select: {
          id: true, email: true, name: true, createdAt: true,
          subscriptionStatus: true, subscriptionTier: true, passwordHash: true,
          accounts: { select: { provider: true } },
          _count: { select: { vehicles: true } },
        },
      }),
      prisma.reservation.findMany({ orderBy: { createdAt: 'desc' }, take: 1000 }),
    ]);

    const emails = emailRows.map((r) => ({
      id: r.id,
      timestamp: r.createdAt.toISOString(),
      email: r.email,
      context: r.context ?? null,
      lastNotifiedAt: r.lastNotifiedAt ? r.lastNotifiedAt.toISOString() : null,
      unsubscribedAt: r.unsubscribedAt ? r.unsubscribedAt.toISOString() : null,
    }));
    const feedback = feedbackRows.map((r) => ({
      id: r.id,
      timestamp: r.createdAt.toISOString(),
      type: r.kind,
      message: r.message,
      email: r.email,
    }));
    // The general Users tab stays bounded, but reservation-to-account matching
    // must not pretend an older account is absent merely because it fell
    // outside that page. Fetch exact reservation emails as a separate join.
    const reservationAccountRows = await prisma.user.findMany({
      where: reservationRows.length ? {
        OR: reservationRows.map((row) => ({
          email: { equals: row.email.trim(), mode: 'insensitive' as const },
        })),
      } : { id: '__no_reservation_accounts__' },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    const users = userRows.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name ?? null,
      createdAt: u.createdAt.toISOString(),
      provider: u.accounts[0]?.provider ?? (u.passwordHash ? 'email' : 'unknown'),
      tier: u.subscriptionTier ?? null,
      subscriptionStatus: u.subscriptionStatus ?? null,
      vehicleCount: u._count.vehicles,
    }));
    const accountByEmail = new Map(
      reservationAccountRows.map((user) => [user.email.trim().toLowerCase(), user]),
    );

    // Twin beta demand test. `source` is the point of the table: hero vs demo
    // tells us whether the promise converts or only the hands-on drive does.
    const reservations = reservationRows.map((r) => ({
      account: (() => {
        const account = accountByEmail.get(r.email.trim().toLowerCase());
        return account ? {
          id: account.id,
          email: account.email,
          name: account.name ?? null,
          createdAt: account.createdAt.toISOString(),
        } : null;
      })(),
      id: r.id,
      timestamp: r.createdAt.toISOString(),
      email: r.email,
      vehicle: r.vehicle ?? null,
      year: r.year ?? null,
      make: r.make ?? null,
      model: r.model ?? null,
      trim: r.trim ?? null,
      transmission: r.transmission === 'automatic' || r.transmission === 'manual' ? r.transmission : null,
      vehicleVerified: r.vehicleVerified,
      trimVerified: r.trimVerified,
      country: r.country ?? null,
      source: r.source ?? null,
      path: r.path ?? null,
      note: r.note ?? null,
      invitedAt: r.invitedAt ? r.invitedAt.toISOString() : null,
      twinStatus: r.twinStatus,
      assignedTwin: r.assignedTwin ?? null,
      trialDays: r.trialDays ?? null,
      readyAt: r.readyAt ? r.readyAt.toISOString() : null,
      claimedAt: r.claimedAt ? r.claimedAt.toISOString() : null,
      updatedAt: r.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      emails,
      feedback,
      users,
      reservations,
      twins: TWIN_DEFINITIONS.filter((twin) => twin.live),
    });
  } catch (error) {
    console.error('Admin data error:', error);
    return NextResponse.json(
      { error: 'Failed to read data' },
      { status: 500 }
    );
  }
}

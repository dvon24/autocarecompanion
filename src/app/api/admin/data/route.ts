import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { isFounderEmail } from '@/lib/founder';

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
    const [emailRows, feedbackRows] = await Promise.all([
      prisma.interestEmail.findMany({ orderBy: { createdAt: 'desc' }, take: 1000 }),
      prisma.feedback.findMany({
        where: { kind: { in: ['bug', 'feature', 'general'] } },
        orderBy: { createdAt: 'desc' },
        take: 1000,
      }),
    ]);

    const emails = emailRows.map((r) => ({ timestamp: r.createdAt.toISOString(), email: r.email, context: r.context ?? null }));
    const feedback = feedbackRows.map((r) => ({
      timestamp: r.createdAt.toISOString(),
      type: r.kind,
      message: r.message,
      email: r.email,
    }));

    return NextResponse.json({ emails, feedback });
  } catch (error) {
    console.error('Admin data error:', error);
    return NextResponse.json(
      { error: 'Failed to read data' },
      { status: 500 }
    );
  }
}

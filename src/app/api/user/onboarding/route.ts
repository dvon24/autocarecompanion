import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

export const runtime = 'nodejs';

/**
 * POST /api/user/onboarding — stamp the current user's
 * onboardingCompletedAt so the gate stops routing them through the
 * first-run flow.
 *
 * Idempotent — repeated calls just overwrite the timestamp. No body.
 * 401 if not signed in.
 */
export async function POST() {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { onboardingCompletedAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'persist_failed' }, { status: 500 });
  }
}

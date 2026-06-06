import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserTier } from '@/lib/pricing/limits';

export const runtime = 'nodejs';

/**
 * GET /api/user/tier — returns the current user's resolved tier.
 *
 * Anonymous users get { tier: 'free' } so the /subscribe page can still
 * render the "Current plan" tag on the free card if they're already
 * effectively on it. Always 200; this endpoint is harmless to leak.
 */
export async function GET() {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ tier: 'free', authenticated: false });
  }
  const tier = await getUserTier(session.user.id);
  return NextResponse.json({ tier, authenticated: true });
}

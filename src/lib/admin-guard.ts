import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isFounderEmail } from '@/lib/founder';

/**
 * Founder gate for /api/admin/* handlers. Returns a 403 response to send
 * back when the caller isn't a founder/ops account, or null when allowed.
 *
 *   const denied = await requireFounder();
 *   if (denied) return denied;
 *
 * Added after the 2026-06-11 review: every admin route except costs relied
 * on URL obscurity (guides allowed unauthenticated cache deletion,
 * recommendations/research triggered paid AI runs).
 */
export async function requireFounder(): Promise<NextResponse | null> {
  const session = await auth();
  if (!isFounderEmail(session?.user?.email)) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  return null;
}

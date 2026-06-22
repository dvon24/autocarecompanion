import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { isFounderEmail } from '@/lib/founder';

export const runtime = 'nodejs';

/**
 * POST /api/admin/interest/remove  { id }  — founder-only.
 *
 * Removes a lead from the active interest-email list by setting unsubscribedAt
 * (the same effect as the user clicking unsubscribe). We SUPPRESS rather than
 * hard-delete so the row stays as an audit/suppression record — they can't be
 * silently re-added and we can prove they were opted out. Use this to honor a
 * "take me off" request that comes to you directly.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!isFounderEmail(session?.user?.email)) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  let id: string | undefined;
  try { ({ id } = await request.json()); } catch { /* */ }
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'missing id' }, { status: 400 });
  }
  try {
    await prisma.interestEmail.update({ where: { id }, data: { unsubscribedAt: new Date() } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[admin/interest/remove]', e instanceof Error ? e.message : e);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}

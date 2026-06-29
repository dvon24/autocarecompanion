import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { isFounderEmail } from '@/lib/founder';

export const runtime = 'nodejs';

/**
 * POST /api/admin/feedback/remove  { id }  — founder-only.
 *
 * Hard-deletes a feedback row. Unlike interest leads (which we SUPPRESS so the
 * opt-out is provable), feedback is just a triage inbox — once you've read and
 * acted on an item, deleting it is the action. No audit obligation here.
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
    await prisma.feedback.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[admin/feedback/remove]', e instanceof Error ? e.message : e);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}

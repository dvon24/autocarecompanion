import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

export const runtime = 'nodejs';

/**
 * GET /api/hub-chat/session/[id]
 *
 * Returns the messages array for a ChatSession the current user owns.
 * Used by the "Recent" thread list in VehicleHub — clicking a thread
 * fires this endpoint to hydrate the chat UI with its full history,
 * then continued turns post back to /api/hub-chat with the same
 * sessionId so the conversation resumes server-side.
 *
 * Auth: required. We scope strictly by userId on the row so a user
 * can never read another user's chat by guessing/scraping IDs.
 *
 * Response: { sessionId, messages: [{role, content}, ...] }
 *           404 when the session doesn't exist OR isn't owned by the
 *           caller (same status both ways so we don't leak existence).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'bad_id' }, { status: 400 });
  }

  const row = await prisma.chatSession.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true, messages: true },
  });
  if (!row) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  // Preserve rich attachments (vision/schedule/issues/gate/route)
  // alongside role+content when they're present in the stored jsonb.
  // The diagnose-to-chat handoff seeds an assistant message with a
  // full vision attachment so VehicleHub can render it via
  // VisionResultCard — earlier this endpoint stripped to {role,
  // content} which silently dropped the card on the round-trip.
  const raw = (row.messages as unknown) as Array<Record<string, unknown>> | null;
  const messages = Array.isArray(raw)
    ? raw
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content as string,
          ...(m.vision ? { vision: m.vision } : {}),
          ...(m.schedule ? { schedule: m.schedule } : {}),
          ...(m.issues ? { issues: m.issues } : {}),
          ...(m.gate ? { gate: m.gate } : {}),
          ...(m.route ? { route: m.route } : {}),
        }))
    : [];

  return NextResponse.json({ sessionId: row.id, messages });
}

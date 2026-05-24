/**
 * Account preferences API
 *
 * GET — return current preferences
 * PATCH — update a subset of preferences
 *
 * Currently exposes:
 *   - aiProcessingOptOut (boolean) — GDPR Art. 21 right-to-object
 *
 * Future additions (email/push notification toggles already exist on
 * the User model but aren't wired through here yet — add them when
 * the corresponding UI lands).
 *
 * Auth: requires session. Returns 401 otherwise.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const PatchBody = z
  .object({
    aiProcessingOptOut: z.boolean().optional(),
  })
  .strict();

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { aiProcessingOptOut: true },
  });
  return NextResponse.json({
    aiProcessingOptOut: user?.aiProcessingOptOut ?? false,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }
  let body;
  try {
    body = PatchBody.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof z.ZodError
            ? err.issues[0]?.message || 'Invalid input'
            : 'Invalid request body',
      },
      { status: 400 },
    );
  }
  if (Object.keys(body).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: body,
    select: { aiProcessingOptOut: true },
  });

  // Log the opt-out toggle to server logs so we have a paper trail of
  // when consent for AI processing was withdrawn/restored — useful if
  // a user later disputes that they opted out.
  if (body.aiProcessingOptOut !== undefined) {
    console.log(
      `[ai-optout] userId=${session.user.id} email=${session.user.email} aiProcessingOptOut=${body.aiProcessingOptOut} at=${new Date().toISOString()}`,
    );
  }

  return NextResponse.json(updated);
}

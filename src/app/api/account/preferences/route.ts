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
    // Visual data flywheel (Phase 0) opt-IN. Separate from
    // aiProcessingOptOut. Flipping it true stamps visualDatasetConsentAt
    // server-side for provable consent timing.
    visualDatasetOptIn: z.boolean().optional(),
  })
  .strict();

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }
  // Read defensively: tolerate the window after a deploy but before the
  // visualDatasetOptIn column DDL is applied, so the pre-existing Art. 21
  // opt-out read never 500s if the new column isn't live yet.
  let user: { aiProcessingOptOut: boolean; visualDatasetOptIn?: boolean } | null = null;
  try {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { aiProcessingOptOut: true, visualDatasetOptIn: true },
    });
  } catch {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { aiProcessingOptOut: true },
    });
  }
  return NextResponse.json({
    aiProcessingOptOut: user?.aiProcessingOptOut ?? false,
    visualDatasetOptIn: user?.visualDatasetOptIn ?? false,
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

  // Stamp the consent timestamp when the visual-dataset opt-in flips
  // true (provable consent timing, GDPR Art. 7(1)). We leave the
  // timestamp in place on opt-out so the record of when consent was last
  // given survives.
  const data: {
    aiProcessingOptOut?: boolean;
    visualDatasetOptIn?: boolean;
    visualDatasetConsentAt?: Date;
  } = { ...body };
  if (body.visualDatasetOptIn === true) {
    data.visualDatasetConsentAt = new Date();
  }

  // Update defensively: if the visualDatasetOptIn column isn't live yet
  // (deploy window before the DDL apply), don't break the pre-existing
  // Art. 21 aiProcessingOptOut toggle — retry without the new column when
  // the caller only touched legacy prefs.
  let updated: { aiProcessingOptOut: boolean; visualDatasetOptIn?: boolean };
  try {
    updated = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: { aiProcessingOptOut: true, visualDatasetOptIn: true },
    });
  } catch (err) {
    if (body.visualDatasetOptIn === undefined) {
      updated = await prisma.user.update({
        where: { id: session.user.id },
        data: { aiProcessingOptOut: body.aiProcessingOptOut },
        select: { aiProcessingOptOut: true },
      });
    } else {
      throw err;
    }
  }

  // Log consent toggles to server logs so we have a paper trail of when
  // consent for AI processing / visual-dataset retention was
  // withdrawn/restored — useful if a user later disputes their choice.
  if (body.aiProcessingOptOut !== undefined) {
    console.log(
      `[ai-optout] userId=${session.user.id} email=${session.user.email} aiProcessingOptOut=${body.aiProcessingOptOut} at=${new Date().toISOString()}`,
    );
  }
  if (body.visualDatasetOptIn !== undefined) {
    console.log(
      `[visual-dataset-consent] userId=${session.user.id} email=${session.user.email} visualDatasetOptIn=${body.visualDatasetOptIn} at=${new Date().toISOString()}`,
    );
  }

  return NextResponse.json(updated);
}

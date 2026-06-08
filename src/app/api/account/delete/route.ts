/**
 * DELETE /api/account/delete
 *
 * GDPR Article 17 (right to erasure). Permanently removes the
 * signed-in user and all directly-identifiable personal data.
 *
 * What gets hard-deleted:
 *   - User row → cascades (per prisma/schema.prisma):
 *       Account, Session, PasswordResetToken,
 *       Vehicle → MaintenanceRecord, Modification, MileageLog,
 *       DiagnosisSample (visual data flywheel — onDelete: Cascade, so
 *         the metadata rows are erased automatically, NOT depersonalized)
 *
 *   PHASE 0.1 NOTE: once DiagnosisSample rows carry a storageKey (stored
 *   image crop), the blob objects must be purged from storage FIRST and
 *   verified, BEFORE prisma.user.delete cascades the rows away — Postgres
 *   cannot reach object storage, so a row cascaded before its blob is
 *   deleted would orphan an un-erasable image. Phase 0.0 stores no bytes,
 *   so the cascade alone is complete erasure.
 *   - ChatSession (manual — FK is SetNull, but messages contain
 *     user-entered content so we must purge, not anonymize)
 *   - ChatPromptInsight (manual — no FK relationship; the column
 *     stores the userId opportunistically)
 *   - NotificationLog (manual — no FK relationship on schema)
 *   - PushSubscription (manual — no FK relationship on schema)
 *   - UserIssueFix (manual — no FK relationship on schema)
 *
 * What stays (depersonalized):
 *   - VehicleInsight rows where userId becomes null via the SetNull
 *     cascade. These power aggregate "drivers like you also asked"
 *     trends; once userId is null they're no longer personal data
 *     under GDPR (Recital 26 — "data rendered anonymous in such a
 *     manner that the data subject is not or no longer identifiable").
 *   - AffiliateClick rows (no userId column at all — anonymous from
 *     creation).
 *
 * Auth: requires a session. Requires a confirmation header
 * `x-confirm-delete: true` so a misbehaving link/CSRF can't nuke an
 * account on a stray GET-style request. (NextAuth's CSRF cookie
 * covers form posts but explicit-confirm is defense in depth.)
 *
 * On success: returns 200 with the count of deleted ChatSessions etc.
 * The client must then call next-auth signOut() to clear the JWT
 * cookie — we can't kill the JWT from the server, only the DB session
 * tables (which JWT strategy doesn't use anyway).
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  if (req.headers.get('x-confirm-delete') !== 'true') {
    return NextResponse.json(
      { error: 'Missing x-confirm-delete: true header' },
      { status: 400 },
    );
  }

  const userId = session.user.id;
  const userEmail = session.user.email;

  // Order matters when there are no FK relationships from the side
  // we're deleting. We do the manual purges first, then cascade-delete
  // the User row. Each manual delete is independent so they run in
  // parallel; the user delete waits for them all to finish.
  const [chats, prompts, notifications, pushes, fixes] = await Promise.all([
    prisma.chatSession.deleteMany({ where: { userId } }),
    prisma.chatPromptInsight.deleteMany({ where: { userId } }),
    prisma.notificationLog.deleteMany({ where: { userId } }),
    prisma.pushSubscription.deleteMany({ where: { userId } }),
    prisma.userIssueFix.deleteMany({ where: { userId } }),
  ]);

  await prisma.user.delete({ where: { id: userId } });

  console.log(
    `[account-delete] userId=${userId} email=${userEmail} purged: chats=${chats.count} prompts=${prompts.count} notifications=${notifications.count} pushes=${pushes.count} fixes=${fixes.count}`,
  );

  return NextResponse.json({
    ok: true,
    deleted: {
      chatSessions: chats.count,
      chatPromptInsights: prompts.count,
      notifications: notifications.count,
      pushSubscriptions: pushes.count,
      issueFixes: fixes.count,
    },
  });
}

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
import { getStripe } from '@/lib/stripe';
import { deleteDiagnosisPhotos } from '@/lib/photo-storage';
import {
  deleteAllMaintenanceReceiptsForUser,
  isManagedMaintenanceReceipt,
  maintenanceReceiptStorageConfigured,
} from '@/lib/maintenance-receipt-storage';

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

  // Cancel any active Stripe subscription BEFORE erasing the user. Deleting
  // the row erases stripeCustomerId/subscriptionId, after which webhook
  // events can't be mapped to anyone and the user has no portal session
  // left to cancel from — Stripe would keep charging $9.99/mo forever.
  // Immediate cancel (not period-end): the customer is leaving entirely.
  // If Stripe is unreachable we ABORT the deletion rather than strand an
  // uncancellable subscription; the user can retry.
  const billing = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionId: true, subscriptionStatus: true },
  });
  if (billing?.subscriptionId) {
    try {
      const stripe = getStripe();
      await stripe.subscriptions.cancel(billing.subscriptionId);
      console.log(`[account-delete] canceled Stripe subscription ${billing.subscriptionId} for userId=${userId}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Stripe error';
      // "No such subscription" / already-canceled is fine to proceed past;
      // anything else must block the erase.
      const alreadyGone = /No such subscription|canceled/i.test(msg);
      if (!alreadyGone) {
        console.error(`[account-delete] Stripe cancel FAILED for userId=${userId}: ${msg} — aborting delete`);
        return NextResponse.json(
          { error: 'Could not cancel your subscription. Please cancel it from your account page first, then retry deletion.' },
          { status: 502 },
        );
      }
    }
  }

  // Phase 0.1: purge stored diagnosis photos from the private blob store
  // BEFORE anything else — once the User row cascades, the
  // DiagnosisSample rows (and their storageKeys) are gone and the blobs
  // would be orphaned and un-erasable (the exact failure mode the schema
  // comment warned about). A blob-purge failure ABORTS the deletion.
  const samplesWithImages = await prisma.diagnosisSample.findMany({
    where: { userId, imageStored: true, storageKey: { not: null } },
    select: { storageKey: true },
  });
  if (samplesWithImages.length > 0) {
    try {
      await deleteDiagnosisPhotos(samplesWithImages.map((s) => s.storageKey!));
      console.log(`[account-delete] purged ${samplesWithImages.length} stored diagnosis photo(s) for userId=${userId}`);
    } catch (err) {
      console.error(`[account-delete] blob purge FAILED for userId=${userId}:`, err);
      return NextResponse.json(
        { error: 'Could not erase your stored photos. Please try again in a moment — your account was NOT deleted.' },
        { status: 502 },
      );
    }
  }

  // Maintenance receipt bytes use the same private-store erasure invariant:
  // purge them before the Vehicle -> MaintenanceRecord cascade removes the
  // only database references to those blobs.
  const recordsWithReceipts = await prisma.maintenanceRecord.findMany({
    where: { vehicle: { userId }, receiptUrl: { not: null } },
    select: { receiptUrl: true },
  });
  const managedReceiptCount = recordsWithReceipts.filter((record) => (
    isManagedMaintenanceReceipt(record.receiptUrl)
  )).length;
  if (maintenanceReceiptStorageConfigured()) {
    try {
      const purged = await deleteAllMaintenanceReceiptsForUser(userId);
      console.log(`[account-delete] purged ${purged} stored maintenance receipt(s) for userId=${userId}`);
    } catch (err) {
      console.error(`[account-delete] maintenance receipt purge FAILED for userId=${userId}:`, err);
      return NextResponse.json(
        { error: 'Could not erase your stored maintenance receipts. Please try again in a moment — your account was NOT deleted.' },
        { status: 502 },
      );
    }
  } else if (managedReceiptCount > 0) {
    return NextResponse.json(
      { error: 'Could not access your stored maintenance receipts. Please try again in a moment — your account was NOT deleted.' },
      { status: 502 },
    );
  }

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

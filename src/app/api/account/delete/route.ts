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
import { objectId } from '@/lib/billing-policy';
import { deleteDiagnosisPhotos } from '@/lib/photo-storage';
import { lockServiceOwner } from '@/lib/maintenance-service-mutation';
import { queueReceiptCleanup } from '@/lib/maintenance-receipt-cleanup';

export const dynamic = 'force-dynamic';

class AccountDeleteError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}
const pendingBilling = () => new AccountDeleteError(
  'Billing is still pending or needs review. Resolve the existing checkout or billing operation before deleting your account.', 409,
);

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  if (req.headers.get('x-confirm-delete') !== 'true') {
    return NextResponse.json({ error: 'Missing x-confirm-delete: true header' }, { status: 400 });
  }
  const userId = session.user.id;
  try {
    const deleted = await prisma.$transaction(async tx => {
      // Same key/order as checkout, reconciliation and plan changes. Every billing
      // snapshot and final deletion is inside this lock, including provider work.
      await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtextextended(${userId}, 0))`;
      const account = await tx.user.findUnique({ where: { id: userId } });
      if (!account) throw new AccountDeleteError('Account not found.', 404);
      const email = account.email?.trim().toLowerCase() || null;
      if (email) {
        // Enrollment request reservation takes only this email lock, never the
        // billing lock. Acquire billing -> enrollment -> service-owner consistently.
        await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtextextended(${'enrollment:' + email}, 0))`;
        const emailOwners = await tx.user.findMany({ where: { email: { equals: email, mode: 'insensitive' } }, select: { id: true } });
        if (emailOwners.length !== 1 || emailOwners[0].id !== userId) {
          throw new AccountDeleteError('Account email ownership needs review before deletion.', 409);
        }
      }
      const attempt = await tx.billingAttempt.findUnique({ where: { userId } });
      // Never erase a durable dispatch/idempotency key while Checkout may still
      // charge. A local "complete" marker alone is not settlement evidence.
      if (attempt && (attempt.state !== 'complete' || !attempt.sessionId || !attempt.subscriptionId
        || !account.subscriptionId || attempt.subscriptionId !== account.subscriptionId
        || !account.stripeCustomerId || attempt.customerId !== account.stripeCustomerId)) throw pendingBilling();
      const pendingUpgrade = await tx.hubUpgradeAttempt.findFirst({
        where: { userId, dispatchStartedAt: { not: null }, completedAt: null }, select: { subscriptionId: true },
      });
      if (pendingUpgrade) throw pendingBilling();
      const reviews = await tx.billingEnrollmentReview.findMany({ where: { userId } });
      // Reviews survive replacement of Checkout attempts. Do not cascade away
      // unresolved policy/compensation scope or an unexamined other subscription.
      // Only the confirmed current binding can be settled by the provider checks below.
      if (reviews.some(review => review.state !== 'confirmed' || !review.initialVerified
        || review.subscriptionId !== account.subscriptionId || review.customerId !== account.stripeCustomerId)) throw pendingBilling();

      if (account.subscriptionId || attempt) {
        try {
          const stripe = getStripe();
          if (attempt) {
            const checkout = await stripe.checkout.sessions.retrieve(attempt.sessionId!);
            if (checkout.id !== attempt.sessionId || checkout.status !== 'complete'
              || !['paid', 'no_payment_required'].includes(checkout.payment_status)
              || checkout.client_reference_id !== userId || checkout.metadata?.attemptKey !== attempt.key
              || objectId(checkout.customer) !== account.stripeCustomerId
              || objectId(checkout.subscription) !== account.subscriptionId) throw pendingBilling();
          }
          const subscription = await stripe.subscriptions.retrieve(account.subscriptionId!);
          if (!account.stripeCustomerId || subscription.id !== account.subscriptionId
            || objectId(subscription.customer) !== account.stripeCustomerId) throw pendingBilling();
          if (subscription.pending_update || subscription.schedule) throw pendingBilling();
          if (!['canceled', 'incomplete_expired'].includes(subscription.status)) {
            // Immediate cancellation remains explicit account-deletion behavior.
            // Provider errors (including misleading "canceled" text) fail closed.
            const canceled = await stripe.subscriptions.cancel(subscription.id);
            if (canceled.id !== subscription.id || canceled.status !== 'canceled'
              || objectId(canceled.customer) !== account.stripeCustomerId) {
              throw new Error('Unconfirmed subscription cancellation');
            }
          }
        } catch (error) {
          if (error instanceof AccountDeleteError) throw error;
          throw new AccountDeleteError('Could not confirm subscription cancellation. Your account and billing records were not deleted; resolve billing before retrying.', 502);
        }
      }

      await lockServiceOwner(tx, userId);
      // Purge diagnosis blobs before their metadata cascades. Failure retains
      // account/journals; successful cancellation is safely re-read on a retry.
      const photos = await tx.diagnosisSample.findMany({
        where: { userId, imageStored: true, storageKey: { not: null } }, select: { storageKey: true },
      });
      try {
        if (photos.length) await deleteDiagnosisPhotos(photos.map(photo => photo.storageKey!));
      } catch {
        throw new AccountDeleteError('Could not erase stored photos. Your account was not deleted; please retry.', 502);
      }
      // This intent intentionally survives the owner cascade.
      await queueReceiptCleanup(tx, { userId });
      const [chats, prompts, notifications, pushes, fixes, attempts, enrollments] = await Promise.all([
        tx.chatSession.deleteMany({ where: { userId } }),
        tx.chatPromptInsight.deleteMany({ where: { userId } }),
        tx.notificationLog.deleteMany({ where: { userId } }),
        tx.pushSubscription.deleteMany({ where: { userId } }),
        tx.userIssueFix.deleteMany({ where: { userId } }),
        tx.billingAttempt.deleteMany({ where: { userId } }),
        // Use the locked database email, never a stale JWT email. No email means
        // there is no proven email-keyed enrollment scope to erase.
        email ? tx.accountEnrollment.deleteMany({ where: { email } }) : Promise.resolve({ count: 0 }),
      ]);
      await tx.user.delete({ where: { id: userId } });
      return { chatSessions: chats.count, chatPromptInsights: prompts.count, notifications: notifications.count,
        pushSubscriptions: pushes.count, issueFixes: fixes.count, billingAttempts: attempts.count, accountEnrollments: enrollments.count };
    }, { isolationLevel: 'ReadCommitted', timeout: 30000, maxWait: 10000 });
    return NextResponse.json({ ok: true, cleanupPending: true, deleted }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof AccountDeleteError ? error.message : 'Account deletion could not be confirmed. Your billing records have not been intentionally discarded; please retry or request review.' },
      { status: error instanceof AccountDeleteError ? error.status : 503, headers: { 'Cache-Control': 'private, no-store' } });
  }
}

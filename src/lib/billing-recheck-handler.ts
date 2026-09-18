import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import type { prisma as Database } from './db';
import { billingOrigin } from './billing-policy';
import { reconcileBillingSubscription } from './billing-reconcile';
import { getBillingEnrollmentReview } from './billing-enrollment-review';
import { entitlementSelect, productEntitlements } from './product-entitlements';

export function createBillingRecheckHandler(deps: {
  auth: () => Promise<{ user?: { id?: string } } | null>;
  prisma: Pick<typeof Database, '$transaction'>; getStripe: () => Stripe;
}) {
  return async function POST(request: Request) {
    const reply = (body: object, status = 200) => NextResponse.json(body, { status, headers: {
      'Cache-Control': 'private, no-store', ...(status === 429 ? { 'Retry-After': '10' } : {}),
    } });
    const busy = () => reply({ error: 'recheck_wait', message: 'Please wait 10 seconds before rechecking billing.' }, 429);
    if (request.headers.get('origin') !== billingOrigin()) return reply({ error: 'invalid_origin' }, 403);
    const session = await deps.auth();
    if (!session?.user?.id) return reply({ error: 'sign_in_required', message: 'Sign in again to recheck billing.' }, 401);
    const body = await request.json().catch(() => null);
    if (!body || Array.isArray(body) || typeof body !== 'object' || Object.keys(body).length) return reply({ error: 'invalid_request' }, 400);
    const userId = session.user.id;
    const options = { timeout: 30000, maxWait: 3000 };
    try {
      // Commit the shared cooldown BEFORE provider work so failures and separate
      // workers cannot bypass it. updatedAt also represents a review attempt.
      const claimed = await deps.prisma.$transaction(async tx => {
        const locks = await tx.$queryRaw<{ locked: boolean }[]>`SELECT pg_try_advisory_xact_lock(hashtextextended(${userId}, 0)) AS locked`;
        if (!locks[0]?.locked) return null;
        const account = await tx.user.findUniqueOrThrow({ where: { id: userId } });
        if (!account.subscriptionId) return false;
        const review = await getBillingEnrollmentReview(tx, userId, account.subscriptionId);
        if (!review) return false; // Preserved legacy accounts are never reclassified.
        const rows = await tx.$queryRaw<{ subscriptionId: string }[]>`UPDATE "BillingEnrollmentReview" SET "updatedAt" = CURRENT_TIMESTAMP WHERE "userId" = ${userId} AND "subscriptionId" = ${account.subscriptionId} AND "updatedAt" <= CURRENT_TIMESTAMP - INTERVAL '10 seconds' RETURNING "subscriptionId"`;
        return rows[0]?.subscriptionId || null;
      }, options);
      if (claimed === null) return busy();
      if (claimed === false) return reply({ error: 'no_billing_review', message: 'Open Account to review your current subscription.' }, 409);
      const result = await deps.prisma.$transaction(async tx => {
        const locks = await tx.$queryRaw<{ locked: boolean }[]>`SELECT pg_try_advisory_xact_lock(hashtextextended(${userId}, 0)) AS locked`;
        if (!locks[0]?.locked) return null;
        const account = await tx.user.findUniqueOrThrow({ where: { id: userId } });
        if (account.subscriptionId !== claimed) throw new Error('subscription_changed');
        await reconcileBillingSubscription(tx, deps.getStripe(), userId, claimed);
        const review = await getBillingEnrollmentReview(tx, userId, claimed);
        const current = await tx.user.findUnique({ where: { id: userId }, select: entitlementSelect });
        const reviewRequired = review?.state === 'review_required';
        return { reviewRequired, ready: !reviewRequired && productEntitlements(current).visual, destination: '/account',
          message: reviewRequired ? 'US billing still needs review. Update Billing & invoices or contact support; do not check out again.' : 'Billing rechecked. Open Account for your current access and subscription status.' };
      }, options);
      return result ? reply(result) : busy();
    } catch {
      return reply({ error: 'recheck_unavailable', message: 'Billing could not be rechecked. Please wait 10 seconds and try again. Your billing and support controls remain available.' }, 503);
    }
  };
}

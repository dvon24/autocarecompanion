/**
 * POST /api/account/cancel-subscription
 *
 * FTC Click-to-Cancel + state ARL (CA / NY / OR / VT / NC) compliance.
 * Cancellation must be "as easy as enrollment" — since users sign up
 * via a single click on /subscribe, they must be able to cancel with
 * a single click in their account.
 *
 * Strategy: cancel-at-period-end (NOT immediate). The user keeps
 * paid features until the end of the current billing period they
 * already paid for, then the subscription terminates. This is what
 * users expect from monthly subscriptions and matches what Stripe
 * does by default.
 *
 * Also supports reactivation: a user who clicked Cancel and changes
 * their mind before period-end can POST again with {reactivate:true}
 * to clear the cancel-at-period-end flag.
 *
 * Auth: requires session. Returns 401 otherwise. Returns 404 if the
 * user has no Stripe subscription on file.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getStripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }
  const userId = session.user.id;

  // Optional body — { reactivate: true } restores a cancel-at-period-end
  // subscription. Empty body / { reactivate: false } cancels.
  let reactivate = false;
  try {
    const body = await req.json().catch(() => ({}));
    reactivate = body?.reactivate === true;
  } catch {
    // empty body is fine
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionId: true, subscriptionStatus: true, email: true },
  });

  if (!user?.subscriptionId) {
    return NextResponse.json(
      { error: 'No active subscription on file' },
      { status: 404 },
    );
  }

  const stripe = getStripe();
  let updated;
  try {
    updated = await stripe.subscriptions.update(user.subscriptionId, {
      cancel_at_period_end: !reactivate,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Stripe error';
    console.error(`[cancel-sub] stripe update failed for userId=${userId}:`, msg);
    return NextResponse.json(
      { error: 'Subscription update failed', detail: msg },
      { status: 502 },
    );
  }

  // Stripe API 2025+ moved current_period_end onto each subscription
  // item (since a subscription can have items with different periods).
  // We always have one item, so reading items.data[0] is safe.
  const periodEnd = updated.items?.data?.[0]?.current_period_end ?? null;

  // Audit log — required under several state ARLs as proof that the
  // cancellation request was received and processed.
  console.log(
    `[cancel-sub] userId=${userId} email=${user.email} action=${reactivate ? 'reactivate' : 'cancel'} subId=${user.subscriptionId} status=${updated.status} cancel_at_period_end=${updated.cancel_at_period_end} period_end=${periodEnd} at=${new Date().toISOString()}`,
  );

  return NextResponse.json({
    ok: true,
    action: reactivate ? 'reactivated' : 'canceled',
    cancelAtPeriodEnd: updated.cancel_at_period_end,
    currentPeriodEnd: periodEnd,
    status: updated.status,
  });
}

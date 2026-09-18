import type Stripe from 'stripe';
import type { Prisma } from '@prisma/client';
import { authoritativeProduct, objectId } from './billing-policy';
import { verifyUsBilling } from './us-billing-eligibility';
import { getBillingEnrollmentReview, saveBillingEnrollmentReview } from './billing-enrollment-review';

/** Caller holds the shared account advisory lock. No root database operations,
 * financial provider writes, or synthetic webhook receipts belong here. */
export async function reconcileBillingSubscription(tx: Prisma.TransactionClient, stripe: Stripe, userId: string, subscriptionId: string, checkoutId: string | null = null) {
  const account = await tx.user.findUniqueOrThrow({ where: { id: userId } });
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const customerId = objectId(subscription.customer);
  if (subscription.id !== subscriptionId || !customerId || customerId !== account.stripeCustomerId) throw new Error('subscription identity mismatch');
  const alreadyBound = account.subscriptionId === subscription.id;
  // Revocation needs current subscription identity/status, never optional
  // Checkout, customer address or payment-method reads. Keep review scope intact.
  if (alreadyBound && !['active', 'trialing'].includes(subscription.status)) {
    await tx.user.update({ where: { id: userId }, data: { subscriptionStatus: subscription.status } });
    return true;
  }
  const attempt = await tx.billingAttempt.findUnique({ where: { userId } });
  const review = await getBillingEnrollmentReview(tx, userId, subscription.id);
  let boundCheckout: Stripe.Checkout.Session | null = null;
  let mayBind = alreadyBound;
  if (!mayBind && attempt?.customerId === customerId && attempt.sessionId) {
    const checkout = await stripe.checkout.sessions.retrieve(attempt.sessionId);
    mayBind = checkout.status === 'complete' && objectId(checkout.subscription) === subscription.id
      && objectId(checkout.customer) === customerId && checkout.client_reference_id === userId
      && checkout.metadata?.attemptKey === attempt.key && (!checkoutId || checkoutId === checkout.id);
    if (mayBind && account.subscriptionId) {
      const old = await stripe.subscriptions.retrieve(account.subscriptionId);
      if (!['canceled', 'incomplete_expired'].includes(old.status)) mayBind = false;
    }
    if (mayBind) boundCheckout = checkout;
  }
  if (!mayBind && attempt && subscription.metadata.attemptKey === attempt.key && !attempt.sessionId) throw new Error('checkout_binding_pending');
  if (!mayBind) return false;
  const product = authoritativeProduct(subscription);
  let initialVerified = review?.initialVerified === true;
  // Skipping eligibility for a non-granting first state is not verification.
  // Keep new scoped enrollment held through the gap before its next event.
  let billingReviewRequired = review?.state === 'review_required' || (!!(boundCheckout || review) && !initialVerified);
  if (boundCheckout || review) {
    const checkout = boundCheckout || await stripe.checkout.sessions.retrieve(review!.sessionId);
    const key = review?.attemptKey || attempt!.key;
    if (checkout.client_reference_id !== userId || checkout.metadata?.attemptKey !== key
      || objectId(checkout.customer) !== customerId || objectId(checkout.subscription) !== subscription.id
      || (review && review.customerId !== customerId)) throw new Error('billing_review_binding_mismatch');
    if (['active', 'trialing'].includes(subscription.status)) {
      billingReviewRequired = !await verifyUsBilling(stripe, subscription, checkout, initialVerified);
      if (!billingReviewRequired) initialVerified = true;
    }
    await saveBillingEnrollmentReview(tx, { subscriptionId: subscription.id, userId, customerId,
      sessionId: checkout.id, attemptKey: key, state: billingReviewRequired ? 'review_required' : 'confirmed', initialVerified });
  }
  const legacyPriceIds = (process.env.STRIPE_REVIEWED_LEGACY_PRICE_IDS || '').split(',').map(value => value.trim()).filter(Boolean);
  const legacy = alreadyBound && !!account.legacySubscriptionTier && subscription.items.data.length === 1 && legacyPriceIds.includes(subscription.items.data[0].price.id);
  await tx.user.update({ where: { id: userId }, data: {
    subscriptionId: subscription.id, subscriptionStatus: subscription.status,
    subscriptionTier: billingReviewRequired ? 'free' : product ?? (legacy ? account.legacySubscriptionTier : 'free'),
    ...(product ? { legacySubscriptionTier: null } : {}),
  } });
  if (attempt?.sessionId && (boundCheckout?.id === attempt.sessionId || review?.sessionId === attempt.sessionId)
    && attempt.key === (review?.attemptKey || boundCheckout?.metadata?.attemptKey)) {
    await tx.billingAttempt.update({ where: { userId }, data: { state: billingReviewRequired ? 'billing_review' : 'complete', subscriptionId: subscription.id } });
  }
  return true;
}

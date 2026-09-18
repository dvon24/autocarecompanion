import type { prisma as Database } from './db';
import { productEntitlements, type EntitlementAccount } from './product-entitlements';
import { visualReturnDestination } from './visual-return-destination';

// Stored only by token redemption that creates this user after explicit US
// confirmation. This is purchase intent, never billing evidence or entitlement.
// Consumed enrollment rows remain durable; expiresAt only limits token use.
export const confirmedEnrollmentIntent = (userId: string) => `checkout-us:${userId}`;
export const SELECTED_CHECKOUT_PATH = '/subscribe/continue';

type EnrollmentAccount = EntitlementAccount & { enrollmentProduct?: string | null };
export function needsEnrollmentCompletion(account: EnrollmentAccount | null, facts: {
  establishedHistory?: boolean; initialVerified?: boolean; hasReservationOffer?: boolean;
}) {
  if (!account || !account.emailVerified || !['visual', 'hub'].includes(account.enrollmentProduct || '')) return false;
  const access = productEntitlements(account);
  if (access.visual || access.hub || facts.hasReservationOffer || facts.establishedHistory || facts.initialVerified) return false;
  // A bound incomplete subscription is not proof this account ever subscribed.
  return !account.subscriptionId || facts.initialVerified === false || ['incomplete', 'incomplete_expired', 'unpaid'].includes(account.subscriptionStatus || '');
}

export async function hasCompletedEnrollmentHistory(db: Pick<typeof Database, '$queryRaw'>, userId: string) {
  const rows = await db.$queryRaw<{ subscriptionId: string }[]>`SELECT "subscriptionId" FROM "BillingEnrollmentReview" WHERE "userId" = ${userId} AND "initialVerified" = true LIMIT 1`;
  return rows.length > 0;
}

export async function getSelectedEnrollment(db: Pick<typeof Database, 'accountEnrollment' | 'billingAttempt'>, account: {
  id: string; email: string; createdAt: Date; enrollmentProduct: string | null; enrollmentVehicleId: string | null;
}) {
  if (!['visual', 'hub'].includes(account.enrollmentProduct || '')) return null;
  const product: 'visual' | 'hub' = account.enrollmentProduct === 'hub' ? 'hub' : 'visual';
  const [confirmed, attempt] = await Promise.all([
    db.accountEnrollment.findFirst({ where: { email: account.email, intent: confirmedEnrollmentIntent(account.id), usedAt: { not: null } }, orderBy: { createdAt: 'asc' } }),
    db.billingAttempt.findUnique({ where: { userId: account.id } }),
  ]);
  if (!confirmed && await db.accountEnrollment.findFirst({ where: {
    email: account.email, intent: 'reservation', usedAt: { not: null }, createdAt: { lte: account.createdAt },
  }, orderBy: { createdAt: 'desc' } })) return null;
  // Earlier accounts have no marker: use their original pre-account request for
  // navigation only, and ask for confirmation again. Later recovery requests
  // cannot replace their original selection or authorize automatic checkout.
  const original = confirmed || await db.accountEnrollment.findFirst({ where: {
    email: account.email, product, intent: null,
    usedAt: { not: null }, createdAt: { lte: account.createdAt },
  }, orderBy: { createdAt: 'desc' } });
  // A deliberate later selection already committed to this account's checkout
  // must survive cancellation. The original enrollment remains immutable.
  const effectiveProduct: 'visual' | 'hub' = attempt?.product === 'visual' || attempt?.product === 'hub' ? attempt.product : product;
  return {
    product: effectiveProduct,
    vehicleId: attempt?.product === effectiveProduct ? attempt.vehicleId : account.enrollmentVehicleId,
    returnTo: visualReturnDestination(attempt?.product === 'visual' ? attempt.returnTo : original?.returnTo),
    usConfirmed: !!confirmed,
    resumeKey: confirmed?.id || account.id,
    attemptState: attempt?.state ?? null,
  };
}

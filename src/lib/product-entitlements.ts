import { isFounderEmail } from './founder';

export type ProductId = 'visual' | 'hub';
export interface EntitlementAccount {
  email?: string | null;
  emailVerified?: Date | string | null;
  subscriptionId?: string | null;
  subscriptionStatus?: string | null;
  subscriptionTier?: string | null;
  legacySubscriptionTier?: string | null;
}

/** Database input only. Founders and audited legacy rights are independent
 * of enrollment. New purchases grant nothing until a verified account has
 * an authoritative active subscription. Beta access stays vehicle-scoped. */
export function productEntitlements(user: EntitlementAccount | null | undefined) {
  const founder = isFounderEmail(user?.email);
  const legacy = !!user?.subscriptionId && ['plus', 'pro'].includes(user?.legacySubscriptionTier ?? '')
    && (!user?.subscriptionTier || user.subscriptionTier === user.legacySubscriptionTier)
    && ['active', 'trialing'].includes(user?.subscriptionStatus ?? '');
  const paid = !!user?.emailVerified && !!user?.subscriptionId && user?.subscriptionStatus === 'active';
  const hubTrial = !!user?.emailVerified && !!user?.subscriptionId && user.subscriptionStatus === 'trialing' && user.subscriptionTier === 'hub';
  const hub = founder || legacy || hubTrial || (paid && user?.subscriptionTier === 'hub');
  const visual = hub || (paid && user?.subscriptionTier === 'visual');
  return { founder, hub, visual, personalAi: hub, maintenance: hub, garage: hub };
}

export const entitlementSelect = { email: true, emailVerified: true, subscriptionId: true, subscriptionStatus: true, subscriptionTier: true, legacySubscriptionTier: true } as const;

export function isProductId(value: unknown): value is ProductId {
  return value === 'visual' || value === 'hub';
}

export function publicEnrollmentEnabled() {
  return process.env.ACCOUNT_ENROLLMENT_ENABLED === 'true';
}

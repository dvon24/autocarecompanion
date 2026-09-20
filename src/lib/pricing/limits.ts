import { prisma } from '@/lib/db';
import { TIER_LIMITS, resolveTier, type TierId } from './tiers';
import { productEntitlements, entitlementSelect } from '../product-entitlements';

/**
 * Server-side tier resolver. Reads subscriptionStatus + subscriptionTier
 * off the User row and returns the effective tier. Defaults to 'free'
 * for missing users (callers should treat that as "no quota beyond
 * anonymous"). The status check folds canceled/past_due back to free —
 * keep payment failures from masquerading as paid usage.
 */
export async function getUserTier(userId: string): Promise<TierId> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: entitlementSelect,
  });
  if (!user) return 'free';
  const capabilities = productEntitlements(user);
  if (capabilities.founder) return 'pro';
  if (capabilities.hub) return user.legacySubscriptionTier === 'pro' ? 'pro' : 'hub';
  return capabilities.visual ? 'visual' : 'free';
}

/**
 * Check whether the user is allowed to add another vehicle to their
 * garage. Returns { allowed, current, limit, tier } so the UI can show
 * a helpful upgrade prompt instead of a generic 403.
 *
 * The limit is exclusive of pending adds — caller should call this
 * BEFORE creating the new vehicle.
 */
export async function checkVehicleLimit(userId: string): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  tier: TierId;
}> {
  const [tier, current] = await Promise.all([
    getUserTier(userId),
    prisma.vehicle.count({ where: { userId } }),
  ]);
  const limit = TIER_LIMITS[tier].vehicles;
  return { allowed: current < limit, current, limit, tier };
}

/**
 * Returns true if the user's tier includes unlimited photo/video
 * diagnoses. Per-week quota enforcement for free users is handled by
 * the existing ChatQuota table — this helper is just the "do we even
 * count?" gate.
 */
export async function hasUnlimitedDiagnoses(userId: string): Promise<boolean> {
  const tier = await getUserTier(userId);
  return TIER_LIMITS[tier].diagnosesPerWeek === Infinity;
}

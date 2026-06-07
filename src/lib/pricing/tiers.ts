/**
 * Au7o pricing tiers — single source of truth.
 *
 * Edit this file to change plan names, prices, features, or limits.
 * Server uses TIER_LIMITS for enforcement; UI consumes AU7O_TIERS for
 * the pricing grid + checkout summary.
 *
 * Source: design/au7o (2)/bmad-handoff2/screens/12-Pricing.jsx
 */

export type TierId = 'free' | 'plus' | 'pro';

export type TierFeature = { t: string; on: boolean };

export type TierCtaStyle = 'ghost' | 'primary' | 'dark';

export type Tier = {
  id: TierId;
  name: string;
  price: string;          // displayed monthly price, no $
  priceCents: number;     // for sanity checks against Stripe
  tagline: string;
  cta: string;
  ctaStyle: TierCtaStyle;
  popular?: boolean;
  features: TierFeature[];
};

export const AU7O_TIERS: readonly Tier[] = [
  {
    id: 'free',
    name: 'Free',
    price: '0',
    priceCents: 0,
    tagline: 'Browse and try it out.',
    cta: 'Current plan',
    ctaStyle: 'ghost',
    features: [
      { t: 'Browse all known issues', on: true },
      { t: '2 photo diagnoses / week', on: true },
      { t: '1 vehicle in your garage', on: true },
      { t: 'Maintenance tracking', on: false },
      { t: 'Recall & service alerts', on: false },
      { t: 'Priority AI + parts discounts', on: false },
    ],
  },
  {
    id: 'plus',
    name: 'Plus',
    price: '14.99',
    priceCents: 1499,
    tagline: 'For the hands-on owner.',
    popular: true,
    cta: 'Start Plus',
    ctaStyle: 'primary',
    features: [
      { t: 'Everything in Free', on: true },
      { t: 'Unlimited photo & video diagnosis', on: true },
      { t: 'Full known-issue matching · your trim', on: true },
      { t: 'Up to 3 vehicles', on: true },
      { t: 'Maintenance tracking + history', on: true },
      { t: 'Recall & service alerts', on: true },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '24.99',
    priceCents: 2499,
    tagline: 'For enthusiasts & small fleets.',
    cta: 'Start Pro',
    ctaStyle: 'dark',
    features: [
      { t: 'Everything in Plus', on: true },
      { t: 'Up to 10 vehicles', on: true },
      { t: 'Priority AI — fastest, most detailed', on: true },
      { t: 'Parts ordering discounts', on: true },
      { t: 'Family / shop sharing (5 seats)', on: true },
      { t: 'Export records & service logs', on: true },
    ],
  },
] as const;

/**
 * Enforcement limits. The UI advertises these in features[]; the server
 * reads them here. If the numbers diverge, this file wins — update the
 * features[] strings to match.
 */
export const TIER_LIMITS: Record<TierId, {
  vehicles: number;             // max vehicles in garage
  diagnosesPerWeek: number;     // photo/video diagnoses; Infinity = unlimited
  maintenanceTracking: boolean;
  alerts: boolean;
  prioritySupport: boolean;
}> = {
  free: {
    vehicles: 1,
    diagnosesPerWeek: 2,
    maintenanceTracking: false,
    alerts: false,
    prioritySupport: false,
  },
  plus: {
    vehicles: 3,
    diagnosesPerWeek: Infinity,
    maintenanceTracking: true,
    alerts: true,
    prioritySupport: false,
  },
  pro: {
    vehicles: 10,
    diagnosesPerWeek: Infinity,
    maintenanceTracking: true,
    alerts: true,
    prioritySupport: true,
  },
};

export function isPaidTier(tier: TierId): boolean {
  return tier !== 'free';
}

export function getTier(id: TierId | string | null | undefined): Tier {
  if (!id) return AU7O_TIERS[0];
  const t = AU7O_TIERS.find((x) => x.id === id);
  return t ?? AU7O_TIERS[0];
}

/**
 * Map a subscriptionStatus + subscriptionTier pair into a resolved TierId.
 * - canceled / past_due / null → free (downgrade)
 * - active + tier → that tier
 * - active + missing tier → 'plus' (grandfathered — old single-tier $9.99
 *   subscribers wrote no subscriptionTier; they keep the closest equivalent)
 */
export function resolveTier(
  status: string | null | undefined,
  tier: string | null | undefined,
): TierId {
  if (status === 'active' || status === 'trialing') {
    if (tier === 'plus' || tier === 'pro' || tier === 'free') return tier;
    return 'plus';
  }
  return 'free';
}

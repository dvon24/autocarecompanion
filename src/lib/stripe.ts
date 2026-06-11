import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    _stripe = new Stripe(secretKey, {
      apiVersion: '2026-01-28.clover',
      typescript: true,
    });
  }
  return _stripe;
}

// For backward compatibility
export const stripe = {
  get instance() {
    return getStripe();
  },
};

import type { TierId, BillingInterval } from './pricing/tiers';

/**
 * Single-tier legacy env var. Kept as the 'plus' price fallback so the
 * old STRIPE_PRICE_ID keeps working until both new env vars are set in
 * production.
 */
export const SUBSCRIPTION_PRICE_ID = process.env.STRIPE_PRICE_ID;

/**
 * Resolve the Stripe price ID for a given tier.
 *
 * Env vars expected:
 *   STRIPE_PRICE_ID_PLUS — $14.99/mo Plus plan
 *   STRIPE_PRICE_ID_PRO  — $24.99/mo Pro plan
 *
 * Backwards compat: if STRIPE_PRICE_ID_PLUS is unset, fall back to the
 * legacy STRIPE_PRICE_ID so existing deploys keep working through the
 * cutover window. Returns null if no price is configured for that tier
 * (callers must 500 — checkout cannot proceed without a price).
 */
export function getPriceIdForTier(tier: TierId, interval: BillingInterval = 'month'): string | null {
  if (interval === 'year') {
    // Annual plans (created by scripts/create-annual-prices.js):
    //   STRIPE_PRICE_ID_PLUS_ANNUAL — $99/yr
    //   STRIPE_PRICE_ID_PRO_ANNUAL  — $199/yr
    switch (tier) {
      case 'plus':
        return process.env.STRIPE_PRICE_ID_PLUS_ANNUAL || null;
      case 'pro':
        return process.env.STRIPE_PRICE_ID_PRO_ANNUAL || null;
      case 'free':
        return null;
    }
  }
  switch (tier) {
    case 'plus':
      return process.env.STRIPE_PRICE_ID_PLUS || process.env.STRIPE_PRICE_ID || null;
    case 'pro':
      return process.env.STRIPE_PRICE_ID_PRO || null;
    case 'free':
      return null;
  }
}

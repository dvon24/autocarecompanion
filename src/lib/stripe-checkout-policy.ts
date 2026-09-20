import type Stripe from 'stripe';
import { getTier, type BillingInterval, type TierId } from './pricing/tiers';

export const USD_CHECKOUT_OPTIONS = {
  currency: 'usd',
  adaptive_pricing: { enabled: false },
} satisfies Pick<Stripe.Checkout.SessionCreateParams, 'currency' | 'adaptive_pricing'>;

export class StripePriceConfigurationError extends Error {
  constructor() { super('Configured Stripe price does not match the active USD plan and billing interval.'); }
}

export function assertUsdPlanPrice(price: Stripe.Price, tier: TierId, interval: BillingInterval) {
  const plan = getTier(tier);
  const amount = interval === 'year' ? plan.priceAnnualCents : plan.priceCents;
  if (tier === 'free' || !price.active || price.currency !== 'usd'
    || price.type !== 'recurring' || price.unit_amount !== amount
    || price.billing_scheme !== 'per_unit' || price.transform_quantity != null
    || price.recurring?.interval !== interval || price.recurring.interval_count !== 1
    || price.recurring.usage_type !== 'licensed') {
    throw new StripePriceConfigurationError();
  }
}

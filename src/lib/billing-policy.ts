import type Stripe from 'stripe';
import { isProductId, type ProductId } from './product-entitlements';
import { getPriceIdForTier } from './stripe';
import { assertUsdPlanPrice } from './stripe-checkout-policy';

export function authoritativeProduct(subscription: Stripe.Subscription): ProductId | null {
  if (subscription.items.data.length !== 1) return null;
  const item = subscription.items.data[0];
  if (item.quantity !== 1) return null;
  for (const product of ['visual', 'hub'] as const) {
    if (item.price.id !== getPriceIdForTier(product)) continue;
    try { assertUsdPlanPrice(item.price, product, 'month'); return product; } catch { return null; }
  }
  return null;
}
export function objectId(value: string | { id: string } | null | undefined) { return typeof value === 'string' ? value : value?.id ?? null; }
export function billingProduct(value: unknown) { return isProductId(value) ? value : null; }
export function billingOrigin() {
  const url = new URL(process.env.APP_URL || process.env.NEXTAUTH_URL || 'https://au7o.io');
  if (url.protocol !== 'https:' && !(process.env.NODE_ENV !== 'production' && url.hostname === 'localhost')) throw new Error('Invalid billing origin');
  return url.origin;
}

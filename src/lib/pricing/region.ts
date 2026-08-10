/**
 * Subscription-region gate.
 *
 * Au7o sells Plus + Pro in the US only for now — VAT/GST registration
 * in EU/UK/AU and US-state sales-tax registration outside our home
 * state are separate workstreams. The free tier is global (no charge,
 * no tax obligation).
 *
 * Vercel injects the visitor's ISO-3166 alpha-2 country code into the
 * `x-vercel-ip-country` request header on every edge request. Both the
 * /subscribe page (server component) and /api/stripe/create-checkout
 * read it through this helper so the UI hint and the API gate stay in
 * sync. Local dev (no Vercel) is allow-all so the flow remains
 * testable without spoofing headers.
 */

import { isFounderEmail } from '@/lib/founder';
export { regionDisplayName } from './region-display';

export const SUBSCRIPTION_ALLOWED_COUNTRIES = ['US'] as const;

/** Re-export so existing call-sites that imported isBypassEmail keep
 *  working. Same allow-list as isFounderEmail — single source of truth
 *  lives in lib/founder. */
export const isBypassEmail = isFounderEmail;

export function isAllowedSubscriptionRegion(
  country: string | null | undefined,
  email?: string | null,
): boolean {
  // Founder + ops allow-list bypasses the country check entirely so
  // the subscription flow stays testable from anywhere. Done first so
  // the rest of the function never has to think about it.
  if (isFounderEmail(email)) return true;
  // Off-Vercel (local dev, custom hosting): allow everything so the
  // checkout flow stays testable. The gate only fires in real edge
  // requests, which is where the compliance risk actually lives.
  if (!process.env.VERCEL) return true;
  if (!country) return false; // fail closed if Vercel ever drops the header
  return (SUBSCRIPTION_ALLOWED_COUNTRIES as readonly string[]).includes(country);
}

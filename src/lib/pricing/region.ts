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

export const SUBSCRIPTION_ALLOWED_COUNTRIES = ['US'] as const;

/**
 * Email allow-list that bypasses the geo gate — used by the founder to
 * QA the subscription flow from outside the US (and any future ops
 * accounts that need the same access). Hardcoded defaults plus an
 * optional comma-separated env var so new emails can be added without
 * a code change.
 */
const FOUNDER_BYPASS_EMAILS = new Set(
  [
    'devonsroberson24@yahoo.com',
    'dvoninvestllc@yahoo.com',
    ...(process.env.SUBSCRIPTION_REGION_BYPASS_EMAILS ?? '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  ].map((s) => s.toLowerCase())
);

export function isBypassEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return FOUNDER_BYPASS_EMAILS.has(email.toLowerCase());
}

export function isAllowedSubscriptionRegion(
  country: string | null | undefined,
  email?: string | null,
): boolean {
  // Founder + ops allow-list bypasses the country check entirely so
  // the subscription flow stays testable from anywhere. Done first so
  // the rest of the function never has to think about it.
  if (isBypassEmail(email)) return true;
  // Off-Vercel (local dev, custom hosting): allow everything so the
  // checkout flow stays testable. The gate only fires in real edge
  // requests, which is where the compliance risk actually lives.
  if (!process.env.VERCEL) return true;
  if (!country) return false; // fail closed if Vercel ever drops the header
  return (SUBSCRIPTION_ALLOWED_COUNTRIES as readonly string[]).includes(country);
}

/**
 * Friendly display name for a country code, with a graceful fallback.
 * Used on the /subscribe "coming soon" screen so the message reads
 * "coming to Germany soon" instead of "coming to DE soon".
 */
export function regionDisplayName(country: string | null | undefined): string {
  if (!country) return 'your region';
  try {
    const dn = new Intl.DisplayNames(['en'], { type: 'region' });
    return dn.of(country) ?? country;
  } catch {
    return country;
  }
}

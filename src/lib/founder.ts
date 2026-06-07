/**
 * Founder / ops bypass — a single source of truth for which emails are
 * allowed to QA paywalled features without an active subscription.
 *
 * Hardcoded defaults cover Devon's login + secondary (already in region.ts
 * for the geo gate). The optional comma-separated env var
 * `SUBSCRIPTION_REGION_BYPASS_EMAILS` extends the list at runtime —
 * sharing one env var across the geo + tier bypass keeps ops configuration
 * to a single setting in Vercel.
 *
 * Used by:
 *   - src/lib/pricing/region.ts (geo gate on /subscribe + /account)
 *   - src/app/api/maintenance/route.ts (tier gate on Mark complete)
 *   - Anywhere else a paid-tier feature should be bypassable for the
 *     founder + ops accounts.
 */

const HARDCODED_FOUNDER_EMAILS = ['devonsroberson24@yahoo.com', 'dvoninvestllc@yahoo.com'];

let cached: Set<string> | null = null;

function getFounderSet(): Set<string> {
  if (cached) return cached;
  const extra = (process.env.SUBSCRIPTION_REGION_BYPASS_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  cached = new Set([...HARDCODED_FOUNDER_EMAILS.map((s) => s.toLowerCase()), ...extra]);
  return cached;
}

export function isFounderEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getFounderSet().has(email.toLowerCase());
}

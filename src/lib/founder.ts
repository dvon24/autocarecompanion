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

const OWNER_ACCOUNT_EMAILS = ['devonsroberson24@yahoo.com', 'dvoninvestllc@yahoo.com'];
const OWNER_ACCOUNT_EMAIL_SET = new Set(OWNER_ACCOUNT_EMAILS.map((email) => email.toLowerCase()));

let cached: Set<string> | null = null;

function getFounderSet(): Set<string> {
  if (cached) return cached;
  const extra = (process.env.SUBSCRIPTION_REGION_BYPASS_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  cached = new Set([...OWNER_ACCOUNT_EMAIL_SET, ...extra]);
  return cached;
}

/**
 * Account authentication is intentionally narrower than the founder/ops
 * bypass. Runtime bypass emails may QA regional pricing, but only Devon's two
 * established owner identities may create an Au7o session while public
 * accounts are closed.
 */
export function isAccountAccessEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return OWNER_ACCOUNT_EMAIL_SET.has(email.trim().toLowerCase());
}

export function isFounderEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getFounderSet().has(email.toLowerCase());
}

/** Shared US enrollment gate. Only Vercel's deployment-provided geography is
 * trusted; missing/malformed country and other hosting fail closed. Account
 * authorization, existing account management and free demos remain separate.
 */

export { regionDisplayName } from './region-display';

export const SUBSCRIPTION_ALLOWED_COUNTRIES = ['US'] as const;

export function subscriptionRegionStatus(country: string | null | undefined): 'allowed' | 'unavailable' | 'unknown' {
  if (process.env.VERCEL !== '1' || !country || !/^[A-Z]{2}$/.test(country) || ['XX', 'ZZ', 'T1'].includes(country)) return 'unknown';
  return country === 'US' ? 'allowed' : 'unavailable';
}

export function enrollmentRegionMessage(country: string | null | undefined): string | null {
  const region = subscriptionRegionStatus(country);
  return region === 'allowed' ? null : region === 'unavailable'
    ? 'Au7o subscriptions and new accounts are currently available only in the United States. Existing members can sign in to manage their account.'
    : 'We could not confirm that you are in the United States. Please retry, or contact support@au7o.io for help. Existing members can sign in to manage their account.';
}

export function isAllowedSubscriptionRegion(
  country: string | null | undefined,
  // Source compatibility only: owner emails never override geography.
  _email?: string | null,
): boolean {
  void _email;
  return process.env.VERCEL === '1' && country === 'US';
}

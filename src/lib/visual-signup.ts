export const VISUAL_PRODUCT = 'visual-known-issues-all-models' as const;

export function parseVisualSignup(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const body = value as Record<string, unknown>;
  if (body.consent !== true || body.country !== 'US') return null;
  if (typeof body.email !== 'string' || body.email.length > 254) return null;
  const email = body.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  // The entry model is attribution, never an entitlement or a Hub reservation.
  return { email, product: VISUAL_PRODUCT, country: 'US', source: 'cadillac-xt6-pilot' };
}

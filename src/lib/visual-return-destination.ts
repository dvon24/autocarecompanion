// Navigation only, never an entitlement. Keep this small enough for client use.
// Exact prepared Known Issues visuals; catalog parity is checked in tests so
// client navigation does not import the server/Twin catalog.
const supportedPaths = new Set([
  '/known-issues/lincoln-nautilus',
  '/known-issues/nissan-murano',
  '/known-issues/cadillac-xt6',
  '/known-issues/nissan-kicks',
  '/known-issues/acura-mdx',
  '/known-issues/lincoln-aviator',
]);
export function visualReturnDestination(value: unknown): string {
  if (typeof value !== 'string' || value.length > 1000 || !value.startsWith('/') || value.startsWith('//') || /[\\\s\x00-\x1f]/.test(value)) return '/visual';
  try {
    const url = new URL(value, 'https://au7o.invalid');
    if (url.origin !== 'https://au7o.invalid' || !supportedPaths.has(url.pathname)) return '/visual';
    const query = new URLSearchParams();
    for (const key of ['year', 'trim', 'engine']) {
      const item = url.searchParams.get(key);
      if (item && item.length <= 100 && !/[\\\x00-\x1f]/.test(item) && (key !== 'year' || /^20\d{2}$/.test(item))) query.set(key, item);
    }
    query.set('twinPilot', '1');
    const hash = /^#[a-z0-9-]{1,200}$/.test(url.hash) ? url.hash : '';
    return `${url.pathname}?${query}${hash}`;
  } catch { return '/visual'; }
}

export function enrollmentContinuation(product: string, vehicleId?: string | null, returnTo?: unknown) {
  const params = new URLSearchParams({ product: product === 'hub' ? 'hub' : 'visual' });
  if (vehicleId) params.set('vehicleId', vehicleId);
  const destination = visualReturnDestination(returnTo);
  if (product !== 'hub' && destination !== '/visual') params.set('returnTo', destination);
  return `/subscribe?${params}`;
}

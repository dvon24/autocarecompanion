/**
 * Return an absolute public HTTP(S) URL or null.
 *
 * Catalog history includes string sentinels such as "undefined" in citation
 * URL fields. React otherwise renders those as relative links on au7o.io,
 * creating crawlable broken paths. Invalid citations still render as plain text;
 * they simply do not become anchors until the underlying source is repaired.
 */
export function externalHttpUrl(value: unknown): string | null {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw || /^(?:undefined|null|n\/?a|none)$/i.test(raw)) return null;

  try {
    const url = new URL(raw);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    if (url.username || url.password || !url.hostname) return null;
    const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
    // Citation URLs are user-facing navigation, so raw IPs, single-label hosts
    // and local-only DNS suffixes are never valid sources. This prevents a
    // database value from sending a reader to their own router/LAN/loopback.
    if (
      !hostname.includes('.')
      || hostname.includes(':')
      || /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)
      || /\.(?:local|localhost|internal|lan|home)$/.test(hostname)
    ) return null;
    return url.toString();
  } catch {
    return null;
  }
}

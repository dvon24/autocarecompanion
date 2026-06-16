/**
 * Vendor deep-link validator — the "never send a user to a 404" safety net
 * for the photo/video diagnose feature.
 *
 * The resolver (vendor-resolver.ts) constructs retailer URLs from AI-supplied
 * part numbers + fitment. Part-number PDP links (Mopar/GM Parts Giant
 * /parts/{num}.html, RockAuto partsearch) and the Tire Rack fitment URL are
 * GUESSED from model output, so a wrong OEM number lands on a hard 404. This
 * module HEAD-checks the deep links before they reach the client and, on a
 * DEFINITIVE not-found, swaps the link to that vendor's always-valid search
 * tier so the vendor still appears — just routed to a search instead of a
 * dead page.
 *
 * Design choices that keep this strictly helpful, never harmful:
 *   - Only `linkType: 'deep'` links are checked. Search/Google template URLs
 *     resolve by construction and never 404 — skipping them keeps it fast.
 *   - ONLY a 404/410 downgrades a link. 403/429/5xx/timeout/network-error =
 *     "unknown" and the link is KEPT — retailers routinely bot-wall datacenter
 *     IPs with 403/429, and we must not strip a good link on our own false
 *     negative.
 *   - Per-URL in-memory TTL cache (recurring OEM numbers validate once).
 *   - Tight per-request timeout; all checks run in parallel.
 *   - Never throws; the caller falls back to unvalidated links on any error.
 *   - Kill switch: set VENDOR_LINK_VALIDATION=off to disable without a deploy.
 *
 * Not yet covered (future): soft-404 detection (sites that 200 a "no results"
 * page), and a cross-request persistent cache (Supabase) — the in-memory cache
 * is per-warm-instance only.
 */

import type { IdentifiedPart, VendorLink } from '@/types/vision';
import { searchFallbackUrl } from '@/lib/vendor-resolver';

type Verdict = 'ok' | 'dead' | 'unknown';

const CACHE = new Map<string, { status: 'ok' | 'dead'; ts: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1h
const PER_REQ_TIMEOUT_MS = 1800;
const UA = 'Mozilla/5.0 (compatible; Au7oLinkCheck/1.0; +https://au7o.io)';

async function checkUrl(url: string): Promise<Verdict> {
  const cached = CACHE.get(url);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) return cached.status;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), PER_REQ_TIMEOUT_MS);
  try {
    let res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: ctrl.signal,
      headers: { 'User-Agent': UA },
    });
    // Some servers don't implement HEAD — retry with a 1-byte ranged GET.
    if (res.status === 405 || res.status === 501) {
      res = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: ctrl.signal,
        headers: { 'User-Agent': UA, Range: 'bytes=0-0' },
      });
    }
    // Only a DEFINITIVE not-found downgrades the link.
    if (res.status === 404 || res.status === 410) {
      CACHE.set(url, { status: 'dead', ts: Date.now() });
      return 'dead';
    }
    if (res.status < 400) {
      CACHE.set(url, { status: 'ok', ts: Date.now() });
      return 'ok';
    }
    // 4xx (other than 404/410), 5xx, bot-wall → don't trust as "dead".
    return 'unknown';
  } catch {
    // Timeout / network error → keep the link (fail-open).
    return 'unknown';
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Validate every part's DEEP vendor links and replace any that return a hard
 * 404 with the vendor's search-tier URL. Returns a new parts array; never
 * mutates the input and never throws.
 */
export async function validateAndFixVendorLinks(parts: IdentifiedPart[]): Promise<IdentifiedPart[]> {
  if (process.env.VENDOR_LINK_VALIDATION === 'off') return parts;

  // Collect the unique deep-link URLs to check (dedupe across parts).
  const toCheck = new Set<string>();
  for (const p of parts) {
    for (const l of p.vendorLinks) {
      if (l.linkType === 'deep') toCheck.add(l.url);
    }
  }
  if (toCheck.size === 0) return parts;

  const verdicts = new Map<string, Verdict>();
  await Promise.allSettled(
    [...toCheck].map(async (url) => {
      verdicts.set(url, await checkUrl(url));
    }),
  );

  // Nothing confirmed dead → return input untouched.
  if (![...verdicts.values()].includes('dead')) return parts;

  return parts.map((p) => ({
    ...p,
    vendorLinks: p.vendorLinks.flatMap((l): VendorLink[] => {
      if (l.linkType !== 'deep' || verdicts.get(l.url) !== 'dead') return [l];
      const fallback = searchFallbackUrl(l.vendor, {
        category: p.category,
        name: p.name,
        brand: p.brand,
        oemPartNumbers: p.oemPartNumbers,
        spec: p.spec,
        searchQuery: l.searchQuery,
      });
      // No safe fallback → drop the dead link entirely.
      if (!fallback) return [];
      return [{
        ...l,
        url: fallback,
        linkType: 'search',
        rationale: l.rationale
          ? `${l.rationale} · search (exact page unavailable)`
          : 'Search — exact product page was unavailable',
      }];
    }),
  }));
}

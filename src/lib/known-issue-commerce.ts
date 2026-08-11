import type { KnownIssue } from '@/schemas/knownIssue.schema';
import { ebayAffiliate } from '@/lib/ebay-affiliate';
import { isPublicWebHostname } from '@/lib/external-http-url';

export type KnownIssueFixPart = NonNullable<KnownIssue['fixParts']>[number];

export interface OwnerGuidance {
  type: 'tip' | 'warning';
  content: string;
}

type Marketplace = 'amazon' | 'ebay' | 'direct';

function marketplaceForProductUrl(value: string): Marketplace | null {
  if (!isKnownIssueProductUrl(value)) return null;
  const host = new URL(value).hostname.toLowerCase().replace(/^www\./, '');
  if (host === 'amazon.com' || host.endsWith('.amazon.com')) return 'amazon';
  if (host === 'ebay.com' || host.endsWith('.ebay.com')) return 'ebay';
  return 'direct';
}

function vendorMatchesProductUrl(vendor: string, value: string): boolean {
  const marketplace = marketplaceForProductUrl(value);
  if (!marketplace) return false;
  const normalizedVendor = vendor.trim().toLowerCase();
  if (marketplace === 'amazon') return /^(amazon|amazon\.com)$/i.test(normalizedVendor);
  if (marketplace === 'ebay') return /^(ebay|ebay\.com)$/i.test(normalizedVendor);
  if (/(amazon|ebay|rockauto)/i.test(normalizedVendor)) return false;

  // A verified flag alone must not let an unrelated retailer label point at
  // another domain. Be conservative: a false negative hides a CTA, while a
  // false positive can send an owner to the wrong product or merchant.
  const vendorIdentity = normalizedVendor.replace(/[^a-z0-9]/g, '');
  const hostLabels = new URL(value).hostname.toLowerCase().replace(/^www\./, '').split('.');
  return vendorIdentity.length >= 3
    && hostLabels.some((label) => label === vendorIdentity);
}

/** Add owned affiliate attribution only after the destination passes the guard. */
export function knownIssueAffiliateUrl(value: string, customId?: string): string {
  const marketplace = marketplaceForProductUrl(value);
  if (marketplace === 'ebay') return ebayAffiliate(value, customId);
  if (marketplace !== 'amazon') return value;

  const url = new URL(value);
  url.searchParams.set('tag', 'au7o-20');
  return url.toString();
}

/**
 * Structural last-line defense for public Known Issue commerce.
 *
 * Research still has to prove repair role and fitment. This guard only stops
 * known search/category URL shapes from leaking onto the page while that
 * catalog-wide review is in progress.
 */
export function isKnownIssueProductUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }

  if (url.protocol !== 'https:' || url.username || url.password) return false;

  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  if (!isPublicWebHostname(host)) return false;
  let path = url.pathname;
  try {
    for (let pass = 0; pass < 2; pass += 1) {
      const decoded = decodeURIComponent(path);
      if (decoded === path) break;
      path = decoded;
    }
  } catch {
    return false;
  }
  path = path.toLowerCase().replace(/\/+$/, '') || '/';
  if (/[\u0000-\u001f\u007f]/.test(path)) return false;
  const hostLabels = host.split('.');

  if (
    hostLabels.length < 2 ||
    host === 'localhost' ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host) ||
    host.startsWith('[')
  ) return false;

  if (host === 'amazon.com' || host.endsWith('.amazon.com')) {
    return /\/(?:dp|gp\/product)\/[a-z0-9]{10}(?:\/|$)/i.test(path);
  }

  if (host === 'ebay.com' || host.endsWith('.ebay.com')) {
    return /\/itm\/(?:[^/]+\/)?\d{9,15}(?:\/|$)/i.test(path);
  }

  // RockAuto's public partsearch/catalog URLs are search results, not a stable
  // offer for one exact product. Keep them out of Known Issue repair CTAs.
  if (host === 'rockauto.com' || host.endsWith('.rockauto.com')) return false;

  // Do not let lookalike marketplace domains fall through to the generic
  // direct-retailer rule below.
  if (hostLabels.some((label) => ['amazon', 'ebay', 'rockauto'].includes(label))) return false;

  if (
    /\/(?:search|search-results|partsearch|parts-search|category|categories|catalog|collections?|sch|s)(?:\/|$)/i.test(path)
  ) return false;

  const searchKeys = new Set([
    'q', 'query', 'search', 'keyword', 'keywords', '_nkw', 'k', 's', 'term',
    'filter', 'filters', 'searchterm', 'search_query',
  ]);
  for (const [key] of url.searchParams) {
    if (searchKeys.has(key.toLowerCase())) return false;
  }

  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0) return false;

  const genericRoots = new Set(['part', 'parts', 'product', 'products', 'shop', 'store', 'catalog']);
  if (segments.length === 1 && genericRoots.has(segments[0])) return false;

  // Direct-retailer URLs need a product-shaped path. This is deliberately
  // conservative: false negatives hide a CTA; false positives can sell the
  // wrong thing. Most stable retailer detail pages use a product/part/item
  // segment followed by a descriptive SKU slug, or end in a SKU-like token.
  const detailMatch = path.match(/\/(?:product|products|part|parts|item|items|sku|p)\/([^/]+)(?:\/|$)/i);
  if (detailMatch) {
    const slug = detailMatch[1];
    if (/\d{3,}/.test(slug) || (slug.length >= 12 && /[-_.]/.test(slug))) return true;
  }

  return matchesVerifiedHostPattern(host, path);
}

/**
 * Named retailers whose product URLs do not fit the generic pattern above.
 *
 * WHY AN ALLOWLIST RATHER THAN A LOOSER GENERIC RULE
 * --------------------------------------------------
 * The generic rule wants a /product|part|item|sku|p/ segment. Several genuine
 * retailers do not use one — they put the product slug at the root, or behind a
 * category path — so real detail pages were being rejected. Measured over a
 * link-audit run, 2 of 14 parts (~14%) were lost for that reason alone,
 * including Denso 477-0771: a real part with three live product pages, one of
 * them on DENSO'S OWN SITE, and no link on our page as a result.
 *
 * Each entry below was confirmed by fetching a real URL on that host and seeing
 * the part number in the page. Loosening the generic rule instead would admit
 * every unknown host with a similar path shape, which is the trade this
 * deliberately refuses: a false negative hides a CTA, a false positive sells
 * the wrong thing.
 *
 * The per-host patterns still have to identify ONE product. Category and
 * search paths on these same hosts fall through to the rejections above, which
 * run first.
 */
const VERIFIED_RETAILER_PATTERNS: Array<[RegExp, RegExp]> = [
  // partshawk.com/delphi-ss10867-abs-wheel-speed-sensor.html
  [/^partshawk\.com$/, /^\/[a-z0-9-]*\d[a-z0-9-]*\.html$/i],
  // densoproducts.com/denso-477-0771-ac-condenser — the manufacturer's own page
  [/^densoproducts\.com$/, /^\/denso-[a-z0-9-]*\d[a-z0-9-]*$/i],
  // zoro.com/denso-ac-condenser-477-0771-477-0771/i/G5915145/
  [/^zoro\.com$/, /\/i\/[a-z0-9]+\/?$/i],
  // partcatalog.com/walker-235-1456-engine-crankshaft-position-sensor.html
  [/^partcatalog\.com$/, /^\/[a-z0-9-]*\d[a-z0-9-]*\.html$/i],
  // summitracing.com/parts/mah-vs50109 — note these render the part number in
  // JavaScript, so they still have to clear the separate identity check that
  // the link auditor applies before a URL is stored.
  [/^summitracing\.com$/, /^\/parts\/(?=[a-z0-9-]*\d)[a-z0-9][a-z0-9-]+$/i],
  // raybestospowertrain.com/steel-clutch-packs/000601 — the manufacturer's own
  // product page. Trade-channel transmission parts are largely absent from
  // consumer retail, so the maker's page is often the only real destination.
  [/^raybestospowertrain\.com$/, /^\/[a-z0-9-]+\/\d{4,}$/i],
  // transpartswarehouse.com was a candidate here and is deliberately NOT listed:
  // its product URL did not survive a live fetch. The bar for this list is a
  // page we actually retrieved, not one that merely looks right.
];

function matchesVerifiedHostPattern(host: string, path: string): boolean {
  return VERIFIED_RETAILER_PATTERNS.some(([hostRe, pathRe]) => hostRe.test(host) && pathRe.test(path));
}

/**
 * Return the one public commerce model for a Known Issue.
 *
 * - Shopping links can originate only from fixParts.buyLinks.
 * - Search/category links are removed before rendering.
 * - Community `part` records are hidden until the audit either promotes them
 *   into a verified fixPart or removes them.
 * - Community tips/warnings survive as plain text with all commerce metadata
 *   deliberately discarded.
 */
export function getKnownIssueCommerce(
  issue: Pick<KnownIssue, 'fixParts' | 'communityRecommendations'>,
): {
  fixParts: KnownIssueFixPart[];
  ownerGuidance: OwnerGuidance[];
  suppressedCommunityPartCount: number;
} {
  const allParts = issue.fixParts || [];
  const verifiedParts = allParts.filter((part) => part.verified === true);
  // Recall coverage is an issue-level safety gate, not a reward for completing
  // commerce verification. Even an otherwise unverified recall marker must
  // suppress every retail link until the owner checks the VIN.
  const recallFirst = allParts.some((part) => part.recallFirst);
  const fixParts = verifiedParts
    .map((part) => {
      const seen = new Set<string>();
      const buyLinks = recallFirst
        ? []
        : (part.buyLinks || []).filter((link) => {
            if (link.verified !== true || !vendorMatchesProductUrl(link.vendor, link.url)) return false;
            const canonicalUrl = new URL(link.url).toString();
            if (seen.has(canonicalUrl)) return false;
            seen.add(canonicalUrl);
            return true;
          });
      return { ...part, buyLinks };
    });

  const recommendations = issue.communityRecommendations || [];
  const ownerGuidance = recommendations
    .filter((recommendation) => recommendation.type === 'tip' || recommendation.type === 'warning')
    .map((recommendation) => ({
      type: recommendation.type === 'warning' ? 'warning' as const : 'tip' as const,
      content: recommendation.content.trim(),
    }))
    .filter((recommendation) => recommendation.content.length > 0);

  return {
    fixParts,
    ownerGuidance,
    suppressedCommunityPartCount: recommendations.filter((recommendation) => recommendation.type === 'part').length,
  };
}

export function hasKnownIssueCommerce(parts: KnownIssueFixPart[]): boolean {
  return parts.some((part) => (part.buyLinks || []).length > 0);
}

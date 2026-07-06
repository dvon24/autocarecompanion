/**
 * eBay Browse API resolver — the "verified part number + real buy link" layer
 * for the vision identify flow (the WHICH stage's fact source).
 *
 * The vision model classifies (part name + vehicle); it must NEVER emit a part
 * number as truth (it confidently hallucinates them — e.g. GM 84080606 for the
 * Camaro ZL1 hood insert when the real number is 84243751). This module turns
 * the model's classification into FACTS by querying live eBay listings, whose
 * structured item specifics (localizedAspects) carry the real OEM/MPN number.
 * We only surface a number when ≥3 independent listings agree on it — the
 * fabrication gate. Buy links come from eBay, not the model's imagination.
 *
 * Ships DARK like sam.ts / google-vision.ts: inert unless EBAY_APP_ID +
 * EBAY_CERT_ID are set. Always fail-soft (any error/non-200/timeout → null);
 * never blocks or meaningfully slows the identify round-trip.
 *
 * Setup (Devon, one-time — eBay account approval takes ~1 business day):
 *   1. developer.ebay.com → create account → create a Production app keyset.
 *   2. Set EBAY_APP_ID (Client ID) + EBAY_CERT_ID (Cert ID / Client Secret).
 *   3. eBay Partner Network (separate signup) → set EBAY_CAMPAIGN_ID so buy
 *      links come back affiliate-tagged (revenue from day one). Optional but
 *      recommended — body-panel/OEM traffic routes eBay-primary.
 *   4. Redeploy. Free tier = 5,000 Browse calls/day (plenty w/ session cache).
 */

const APP_ID = process.env.EBAY_APP_ID;
const CERT_ID = process.env.EBAY_CERT_ID;
const CAMPAIGN_ID = process.env.EBAY_CAMPAIGN_ID; // eBay Partner Network (EPN)
const MARKETPLACE = process.env.EBAY_MARKETPLACE_ID || 'EBAY_US';
const OAUTH_URL = 'https://api.ebay.com/identity/v1/oauth2/token';
const BROWSE_URL = 'https://api.ebay.com/buy/browse/v1';
const EBAY_TIMEOUT_MS = Number(process.env.EBAY_TIMEOUT_MS || 7000);
// Motors → Parts & Accessories. Scopes the search so we don't match whole cars.
const PARTS_CATEGORY = '6028';
// How many top listings to inspect for part-number agreement, and the minimum
// that must agree before we call a number "verified" (acceptance test #4).
const INSPECT_N = 6;
const AGREE_MIN = 3;

/** Categories where eBay is the PRIMARY source (used-OEM body/trim/OEM-specific
 *  parts live on eBay with real part numbers; Amazon returns knockoffs). Small
 *  consumables stay Amazon-primary and skip this resolver. */
const EBAY_PRIMARY_CATEGORIES = new Set([
  'body_panel', 'trim', 'badge', 'emblem', 'oem_specific', 'bracket',
  'caliper', 'suspension', 'interior', 'accessory', 'alternator', 'starter',
]);

export function ebayEnabled(): boolean {
  return !!(APP_ID && CERT_ID);
}

export function ebayIsPrimaryFor(category?: string): boolean {
  return !!category && EBAY_PRIMARY_CATEGORIES.has(category);
}

export interface EbayListing {
  title: string;
  price: number | null;
  currency: string;
  condition: string;
  /** Affiliate-tagged (EPN) when EBAY_CAMPAIGN_ID is set, else the plain item URL. */
  url: string;
}

export interface EbayResolution {
  /** Part numbers found in listing item-specifics, ordered by how many listings
   *  agreed. `verified` = the top number cleared the ≥AGREE_MIN gate. */
  partNumbers: Array<{ value: string; count: number; verified: boolean }>;
  /** The single best verified OEM part number, or null if none cleared the gate. */
  verifiedPartNumber: string | null;
  /** Top listings for buy links (affiliate-tagged when EPN is configured). */
  listings: EbayListing[];
}

// ── OAuth (client credentials). Cached in-module until ~5 min before expiry. ──
let cachedToken: { token: string; expMs: number } | null = null;

async function getToken(): Promise<string | null> {
  if (!APP_ID || !CERT_ID) return null;
  if (cachedToken && cachedToken.expMs > nowMs() + 300_000) return cachedToken.token;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), EBAY_TIMEOUT_MS);
  try {
    const basic = Buffer.from(`${APP_ID}:${CERT_ID}`).toString('base64');
    const res = await fetch(OAUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Basic ${basic}` },
      body: 'grant_type=client_credentials&scope=' + encodeURIComponent('https://api.ebay.com/oauth/api_scope'),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const j = (await res.json()) as { access_token?: string; expires_in?: number };
    if (!j.access_token) return null;
    cachedToken = { token: j.access_token, expMs: nowMs() + (j.expires_in || 7200) * 1000 };
    return cachedToken.token;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function browseHeaders(token: string): Record<string, string> {
  const h: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'X-EBAY-C-MARKETPLACE-ID': MARKETPLACE,
  };
  // EPN affiliate attribution → eBay returns itemAffiliateWebUrl on each item.
  if (CAMPAIGN_ID) h['X-EBAY-C-ENDUSERCTX'] = `affiliateCampaignId=${CAMPAIGN_ID}`;
  return h;
}

// ── item-specifics part-number extraction ──
const PN_ASPECT_RE = /(manufacturer\s*part\s*number|oe\/?oem\s*(part\s*)?number|oem\s*number|mpn|part\s*number|superseded\s*part\s*number|interchange\s*part\s*number)/i;
// A plausible auto part number: 5-15 chars, letters+digits, not a pure year etc.
const PN_VALUE_RE = /^[A-Z0-9][A-Z0-9\- ]{3,18}$/i;

function normPN(s: string): string {
  return String(s || '').toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9-]/g, '').trim();
}

interface BrowseSummary { itemId?: string; title?: string; itemWebUrl?: string; itemAffiliateWebUrl?: string; condition?: string; price?: { value?: string; currency?: string } }
interface BrowseItemDetail { localizedAspects?: Array<{ type?: string; name?: string; value?: string }> }

async function fetchDetailPNs(token: string, itemId: string): Promise<string[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), EBAY_TIMEOUT_MS);
  try {
    const res = await fetch(`${BROWSE_URL}/item/${encodeURIComponent(itemId)}?fieldgroups=PRODUCT`, {
      headers: browseHeaders(token),
      signal: controller.signal,
    });
    if (!res.ok) return [];
    const d = (await res.json()) as BrowseItemDetail;
    const out: string[] = [];
    for (const a of d.localizedAspects || []) {
      if (a.name && a.value && PN_ASPECT_RE.test(a.name)) {
        // an aspect value can be a comma/slash list of numbers
        for (const raw of String(a.value).split(/[,/;]/)) {
          const v = normPN(raw);
          if (v && PN_VALUE_RE.test(v.replace(/-/g, ''))) out.push(v);
        }
      }
    }
    return out;
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Resolve a classified part to verified part numbers + real buy links.
 * @param q free-text query, e.g. "Chevrolet Camaro ZL1 1LE hood insert carbon"
 * Returns null when eBay is disabled, errors, or finds nothing.
 */
export async function resolveEbay(q: string, modelHintPN?: string): Promise<EbayResolution | null> {
  const token = await getToken();
  if (!token) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), EBAY_TIMEOUT_MS);
  let summaries: BrowseSummary[] = [];
  try {
    const url = `${BROWSE_URL}/item_summary/search?q=${encodeURIComponent(q)}&category_ids=${PARTS_CATEGORY}&limit=${INSPECT_N}`;
    const res = await fetch(url, { headers: browseHeaders(token), signal: controller.signal });
    if (!res.ok) return null;
    const j = (await res.json()) as { itemSummaries?: BrowseSummary[] };
    summaries = j.itemSummaries || [];
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
  if (summaries.length === 0) return null;

  const listings: EbayListing[] = summaries.slice(0, INSPECT_N).map((s) => ({
    title: String(s.title || '').slice(0, 140),
    price: s.price?.value ? Number(s.price.value) : null,
    currency: s.price?.currency || 'USD',
    condition: String(s.condition || '').slice(0, 40),
    url: s.itemAffiliateWebUrl || s.itemWebUrl || '',
  })).filter((l) => l.url);

  // Pull item-specifics part numbers from the top listings in parallel.
  const ids = summaries.map((s) => s.itemId).filter((x): x is string => !!x).slice(0, INSPECT_N);
  const pnLists = await Promise.all(ids.map((id) => fetchDetailPNs(token, id)));

  // Count agreement across listings (one vote per listing per distinct PN).
  const counts = new Map<string, number>();
  for (const pns of pnLists) {
    for (const pn of new Set(pns)) counts.set(pn, (counts.get(pn) || 0) + 1);
  }
  // Fold in the model's hint PN as ONE corroborating vote (never enough alone).
  const hint = modelHintPN ? normPN(modelHintPN) : '';
  if (hint && PN_VALUE_RE.test(hint.replace(/-/g, ''))) counts.set(hint, (counts.get(hint) || 0) + 1);

  const partNumbers = [...counts.entries()]
    .map(([value, count]) => ({ value, count, verified: count >= AGREE_MIN }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const top = partNumbers[0];
  const verifiedPartNumber = top && top.verified ? top.value : null;

  if (partNumbers.length === 0 && listings.length === 0) return null;
  return { partNumbers, verifiedPartNumber, listings };
}

function nowMs(): number {
  // Date.now is fine at runtime (this module never runs inside a workflow VM).
  return Date.now();
}

/**
 * Founder-only health probe: reports whether OAuth mints, the Browse search
 * HTTP status (a 403 here = Buy API production access not granted), how many
 * listings came back, and whether the ≥3-listing gate found a verified PN.
 */
export async function ebayHealthProbe(query = 'Chevrolet Camaro ZL1 1LE hood insert carbon fiber'): Promise<{
  enabled: boolean; tokenOk: boolean; searchStatus: number | null; listings: number; verifiedPartNumber: string | null; campaignTagged: boolean; error?: string;
}> {
  if (!APP_ID || !CERT_ID) return { enabled: false, tokenOk: false, searchStatus: null, listings: 0, verifiedPartNumber: null, campaignTagged: false };
  // Direct mint so we can surface eBay's EXACT rejection (invalid_client, etc.).
  let token: string | null = null;
  try {
    const basic = Buffer.from(`${APP_ID.trim()}:${CERT_ID.trim()}`).toString('base64');
    const res = await fetch(OAUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Basic ${basic}` },
      body: 'grant_type=client_credentials&scope=' + encodeURIComponent('https://api.ebay.com/oauth/api_scope'),
      signal: AbortSignal.timeout(EBAY_TIMEOUT_MS),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      return { enabled: true, tokenOk: false, searchStatus: null, listings: 0, verifiedPartNumber: null, campaignTagged: !!CAMPAIGN_ID, error: `oauth_${res.status}: ${t.slice(0, 220)}`, appIdPrefix: APP_ID.slice(0, 10), certIdLen: CERT_ID.length } as never;
    }
    const j = (await res.json()) as { access_token?: string };
    token = j.access_token || null;
  } catch {
    return { enabled: true, tokenOk: false, searchStatus: null, listings: 0, verifiedPartNumber: null, campaignTagged: !!CAMPAIGN_ID, error: 'oauth_network_or_timeout' };
  }
  if (!token) return { enabled: true, tokenOk: false, searchStatus: null, listings: 0, verifiedPartNumber: null, campaignTagged: !!CAMPAIGN_ID, error: 'oauth_no_token_in_response' };
  try {
    const url = `${BROWSE_URL}/item_summary/search?q=${encodeURIComponent(query)}&category_ids=${PARTS_CATEGORY}&limit=3`;
    const res = await fetch(url, { headers: browseHeaders(token), signal: AbortSignal.timeout(EBAY_TIMEOUT_MS) });
    const searchStatus = res.status;
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      return { enabled: true, tokenOk: true, searchStatus, listings: 0, verifiedPartNumber: null, campaignTagged: !!CAMPAIGN_ID, error: `search_${searchStatus}: ${txt.slice(0, 160)}` };
    }
    const j = (await res.json()) as { itemSummaries?: BrowseSummary[] };
    const summaries = j.itemSummaries || [];
    const listings = summaries.length;
    const campaignTagged = !!CAMPAIGN_ID && !!summaries[0]?.itemAffiliateWebUrl;
    const r = await resolveEbay(query, '');
    return { enabled: true, tokenOk: true, searchStatus, listings, verifiedPartNumber: r?.verifiedPartNumber ?? null, campaignTagged };
  } catch {
    return { enabled: true, tokenOk: true, searchStatus: null, listings: 0, verifiedPartNumber: null, campaignTagged: !!CAMPAIGN_ID, error: 'network' };
  }
}

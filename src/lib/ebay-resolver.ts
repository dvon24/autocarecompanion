/**
 * eBay Browse API resolver — the "verified part number + real buy link" layer
 * for the vision identify flow (the WHICH stage's fact source).
 *
 * The vision model classifies (part name + vehicle); it must NEVER emit a part
 * number as truth (it confidently hallucinates them — e.g. GM 84080606 for the
 * Camaro ZL1 hood insert when the real number is 84243751). This module turns
 * the model's classification into FACTS by querying live eBay listings, whose
 * structured item specifics (localizedAspects) carry the real OEM/MPN number.
 * TWO-TIER, SELLER-DEDUPED gate (independence does the trust work, not raw
 * count — two listings from the same parts-out seller are one opinion posted
 * twice): a number needs ≥3 DISTINCT SELLERS to be "verified", ≥2 distinct to
 * be "reported" (surfaced with a softer badge so sparse-listing parts still show
 * a number instead of nothing). Buy links come from eBay, not the model.
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

const APP_ID = process.env.EBAY_APP_ID?.trim();
const CERT_ID = process.env.EBAY_CERT_ID?.trim();
const CAMPAIGN_ID = process.env.EBAY_CAMPAIGN_ID?.trim(); // eBay Partner Network (EPN)
const MARKETPLACE = process.env.EBAY_MARKETPLACE_ID || 'EBAY_US';
const OAUTH_URL = 'https://api.ebay.com/identity/v1/oauth2/token';
const BROWSE_URL = 'https://api.ebay.com/buy/browse/v1';
const EBAY_TIMEOUT_MS = Number(process.env.EBAY_TIMEOUT_MS || 7000);
// Motors → Parts & Accessories. Scopes the search so we don't match whole cars.
const PARTS_CATEGORY = '6028';
// How many top listings to inspect for part-number agreement. Bumped from 8 →
// 12 so the seller-distinct gate has a real chance to see 3 independent sellers.
const INSPECT_N = 12;
// Two-tier gate, counted by DISTINCT SELLER (not listing — one seller relisting
// the same part in 3 conditions is one opinion, not three): ≥3 distinct sellers
// → VERIFIED (strong badge), ≥2 distinct → REPORTED (softer badge, still shown).
const VERIFY_SELLERS = 3;
const REPORT_SELLERS = 2;

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
  /** Stable item identifier from the exact product URL returned by Browse. */
  itemId: string;
  title: string;
  price: number | null;
  currency: string;
  condition: string;
  /** Affiliate-tagged (EPN) when EBAY_CAMPAIGN_ID is set, else the plain item URL. */
  url: string;
  /** Exact part numbers observed on this listing's title or item specifics. */
  matchedPartNumbers: string[];
}

export interface EbayResolution {
  /** Part numbers found in listing item-specifics / titles, ordered by DISTINCT
   *  SELLER agreement. verified = ≥3 distinct sellers; reported = ≥2 distinct. */
  partNumbers: Array<{ value: string; sellerCount: number; verified: boolean; reported: boolean }>;
  /** Best number with ≥3 distinct sellers (strong "verified" badge), else null. */
  verifiedPartNumber: string | null;
  /** Best number with ≥2 distinct sellers (softer "reported" badge), else null.
   *  Equals verifiedPartNumber when that number also cleared the ≥3 tier. */
  reportedPartNumber: string | null;
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

// Extract candidate OEM part numbers from a free-text listing title. Noisy by
// design — the ≥AGREE_MIN cross-listing gate downstream keeps only tokens that
// recur across independent listings, which junk (years, tire sizes) won't.
function extractTitlePNs(title: string): string[] {
  const out: string[] = [];
  for (const raw of String(title).toUpperCase().split(/[^A-Z0-9-]+/)) {
    const v = raw.replace(/^-+|-+$/g, '');
    if (!v) continue;
    if (/^(19|20)\d{2}-(19|20)\d{2}$/.test(v)) continue;   // year RANGE (e.g. 2017-2023)
    const bare = v.replace(/-/g, '');
    if (bare.length < 6 || bare.length > 17) continue;
    if (!/[0-9]/.test(bare)) continue;              // must contain a digit
    if (/^(19|20)\d{2}$/.test(bare)) continue;       // a year
    if (/^(19|20)\d{2}(19|20)\d{2}$/.test(bare)) continue; // two years concatenated
    // A GM-style pure-numeric PN is ≥7 digits BUT must not read as year-ish; a
    // real one (84243751) won't start with 19/20. Mopar/Ford have letters.
    if (!/[A-Z]/.test(bare)) {
      if (bare.length < 7) continue;
      if (/^(19|20)/.test(bare)) continue;           // numeric starting like a year → skip
    }
    out.push(v);
  }
  return out;
}

interface BrowseSummary { itemId?: string; title?: string; itemWebUrl?: string; itemAffiliateWebUrl?: string; condition?: string; price?: { value?: string; currency?: string }; seller?: { username?: string } }
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
          // Real auto part numbers contain a digit — require one so marketing
          // phrases in mislabeled aspect fields ("FRONTWINDOWWIPERS", "CLEANWINDOW")
          // don't masquerade as candidate PNs.
          if (v && /\d/.test(v) && PN_VALUE_RE.test(v.replace(/-/g, ''))) out.push(v);
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
export async function resolveEbay(
  q: string,
  modelHintPN?: string,
  opts?: { category?: string; make?: string; model?: string; trim?: string },
): Promise<EbayResolution | null> {
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

  // TRIM-AWARE FITMENT GUARD. Agreement proves a number is REAL, not that it
  // FITS. For performance trims on system-sensitive parts (brakes/cooling/
  // suspension), a listing must POSITIVELY name the trim/package (SRT / 392 /
  // Brembo…) — a generic multi-platform set that merely fails to exclude the car
  // is the classic wrong-part hit (an SRT 392 runs 390mm Brembos; a
  // "Challenger/Charger/Magnum/300" rotor set does not fit it). If nothing
  // positively matches, we drop eBay entirely so the caller's trim-in-query
  // marketplace search handles the buy — never surface a wrong-fit part.
  const perfTokens = opts && PERF_SYSTEM_CATEGORIES.has(String(opts.category))
    ? perfFitmentTokens(opts.trim, opts.model)
    : null;
  if (perfTokens) {
    summaries = summaries.filter((s) => {
      const t = String(s.title || '').toUpperCase();
      return perfTokens.some((tok) => t.includes(tok));
    });
    if (summaries.length === 0) {
      return { partNumbers: [], verifiedPartNumber: null, reportedPartNumber: null, listings: [] };
    }
  }

  // Pull item-specifics part numbers from the top listings in parallel.
  const ids = summaries.map((s) => s.itemId).filter((x): x is string => !!x).slice(0, INSPECT_N);
  const pnLists = await Promise.all(ids.map((id) => fetchDetailPNs(token, id)));
  const idPNs = new Map<string, string[]>();
  ids.forEach((id, k) => idPNs.set(id, pnLists[k] || []));
  const listings: EbayListing[] = summaries.slice(0, INSPECT_N).flatMap((s) => {
    const url = s.itemAffiliateWebUrl || s.itemWebUrl || '';
    if (!url) return [];
    return [{
      itemId: String(s.itemId || ''),
      title: String(s.title || '').slice(0, 140),
      price: s.price?.value ? Number(s.price.value) : null,
      currency: s.price?.currency || 'USD',
      condition: String(s.condition || '').slice(0, 40),
      url,
      matchedPartNumbers: [...new Set([
        ...extractTitlePNs(s.title || ''),
        ...(s.itemId ? idPNs.get(s.itemId) || [] : []),
      ])],
    }];
  });

  // Count DISTINCT SELLERS per PN — pulled from BOTH structured item-specifics
  // AND the title (sellers routinely put "OEM 84243751" right in the title).
  // Independence is the trust signal: 3 listings from one parts-out seller is
  // one opinion posted thrice, so we dedupe by seller before counting. A missing
  // seller username falls back to the itemId (still counts as its own source).
  const pnSellers = new Map<string, Set<string>>();
  for (const s of summaries.slice(0, INSPECT_N)) {
    const seller = (s.seller?.username || s.itemId || Math.random().toString()).toLowerCase();
    const set = new Set<string>();
    for (const pn of extractTitlePNs(s.title || '')) set.add(pn);
    const dp = s.itemId ? idPNs.get(s.itemId) : null;
    if (dp) for (const pn of dp) set.add(pn);
    for (const pn of set) {
      if (!pnSellers.has(pn)) pnSellers.set(pn, new Set());
      pnSellers.get(pn)!.add(seller);
    }
  }
  const partNumbers = [...pnSellers.entries()]
    .map(([value, sellers]) => {
      const sellerCount = sellers.size;
      return { value, sellerCount, verified: sellerCount >= VERIFY_SELLERS, reported: sellerCount >= REPORT_SELLERS };
    })
    .sort((a, b) => b.sellerCount - a.sellerCount)
    .slice(0, 5);
  const verifiedPartNumber = partNumbers.find((p) => p.verified)?.value || null;
  const reportedPartNumber = partNumbers.find((p) => p.reported)?.value || null;
  void modelHintPN; // the model's PN stays the "reported" fallback upstream — never a vote

  if (partNumbers.length === 0 && listings.length === 0) return null;
  return { partNumbers, verifiedPartNumber, reportedPartNumber, listings };
}

function nowMs(): number {
  // Date.now is fine at runtime (this module never runs inside a workflow VM).
  return Date.now();
}

// Categories where the performance PACKAGE changes the physical part (brakes,
// cooling, suspension) — a base-trim part with the same model name won't fit.
const PERF_SYSTEM_CATEGORIES = new Set(['rotor', 'brake_pad', 'caliper', 'suspension', 'hose']);

/**
 * Positive-match tokens a listing title MUST contain to be trusted as fitting a
 * performance trim (any-of). Returns null for non-performance trims (no filter
 * applied — a base LX/SXT rotor is a normal multi-brand wear part). Heuristic +
 * extensible; seeded with the domestic-muscle + common import performance trims.
 */
function perfFitmentTokens(trim?: string, model?: string): string[] | null {
  const t = `${trim || ''} ${model || ''}`.toUpperCase();
  const out = new Set<string>();
  // Mopar: SRT / 392 / Scat Pack / Hellcat / Redeye / Demon / TRX all run Brembo.
  if (/\bSRT-?8?\b|\b392\b|HELLCAT|SCAT ?PACK|REDEYE|\bTRX\b|DEMON/.test(t)) {
    ['SRT', '392', 'HELLCAT', 'SCAT PACK', 'SCAT', 'REDEYE', 'BREMBO', 'SRT8', 'TRX', 'DEMON'].forEach((x) => out.add(x));
  }
  // GM: ZL1 / Z06 / ZR1 (SS omitted — too generic a token to match safely).
  if (/\bZL1\b|\bZ06\b|\bZR1\b/.test(t)) ['ZL1', 'Z06', 'ZR1', 'BREMBO'].forEach((x) => out.add(x));
  // Ford: Shelby GT350/GT500, Raptor.
  if (/GT350|GT500|SHELBY|RAPTOR/.test(t)) ['GT350', 'GT500', 'SHELBY', 'RAPTOR', 'BREMBO'].forEach((x) => out.add(x));
  // Import performance.
  if (/\bAMG\b/.test(t)) out.add('AMG');
  if (/TYPE ?-? ?R\b/.test(t)) { out.add('TYPE R'); out.add('TYPE-R'); }
  if (/\bM[2345]\b/.test(t)) ['M2', 'M3', 'M4', 'M5'].forEach((x) => out.add(x));
  if (/\bSTI\b/.test(t)) out.add('STI');
  if (/NISMO/.test(t)) out.add('NISMO');
  return out.size ? [...out] : null;
}

/**
 * Founder-only health probe / Path-B eval harness: reports whether OAuth mints,
 * the Browse search HTTP status (a 403 here = Buy API production access not
 * granted), how many listings came back, and the FULL seller-distinct tier
 * breakdown (partNumbers[] with sellerCount + verified/reported) so a query like
 * "2015 Dodge Challenger 392 front brake rotor" doubles as an eval fixture.
 */
export async function ebayHealthProbe(
  query = 'Chevrolet Camaro ZL1 1LE hood insert carbon fiber',
  opts?: { category?: string; make?: string; model?: string; trim?: string },
): Promise<{
  enabled: boolean; tokenOk: boolean; searchStatus: number | null; listings: number; verifiedPartNumber: string | null; reportedPartNumber?: string | null; partNumbers?: Array<{ value: string; sellerCount: number; verified: boolean; reported: boolean }>; sampleListings?: Array<{ title: string; price: number | null }>; campaignTagged: boolean; error?: string;
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
    const r = await resolveEbay(query, '', opts);
    return {
      enabled: true, tokenOk: true, searchStatus, listings,
      verifiedPartNumber: r?.verifiedPartNumber ?? null,
      reportedPartNumber: r?.reportedPartNumber ?? null,
      partNumbers: r?.partNumbers ?? [],
      sampleListings: (r?.listings ?? []).slice(0, 3).map((l) => ({ title: l.title, price: l.price })),
      campaignTagged,
    };
  } catch {
    return { enabled: true, tokenOk: true, searchStatus: null, listings: 0, verifiedPartNumber: null, campaignTagged: !!CAMPAIGN_ID, error: 'network' };
  }
}

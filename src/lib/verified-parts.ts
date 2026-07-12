/**
 * verified-parts — the bridge that lets the LIVE surfaces (hub chat, vision)
 * reuse the SAME web-search-verified deep links the parts pipeline already
 * produces, instead of emitting descriptive/search links.
 *
 * The record store is `VehiclePartLookup` (the parts pipeline persists verified
 * parts there, keyed by vehicle + task). This module:
 *   - getCachedVerifiedPart(): reads that store and returns a VERIFIED DEEP LINK
 *     (a real retailer product page the web verifier confirmed) for a part name,
 *     plus OEM PN and aftermarket cross-references — instant, no AI call.
 *   - warmVerifiedPart(): on a cache MISS, runs the existing freetext pipeline
 *     (Anthropic web_search) for that ONE part and upserts the result under a
 *     `part:<name>` key, so the next lookup is an instant verified hit. Meant to
 *     be called from Next's after() so it never blocks the response.
 *
 * Key rule (Devon): OEM part numbers are NOT aftermarket part numbers — you can't
 * map OEM→aftermarket by number. The pipeline's crossReferences come from web
 * search by APPLICATION/fitment, which is why we surface both lanes from it.
 */

import Anthropic from '@anthropic-ai/sdk';
import prisma from './db';
import type { PipelinePart, WebVerificationLog } from './parts-pipeline';
import { ebayAffiliate } from './ebay-affiliate';
import { checkLinkLive } from './vendor-link-validator';
import { getVehicleSpecs } from './maintenance';
import { canonicalSlug } from './part-vocabulary';

/** The authoritative factory spec string for a part (fluids especially), from
 *  the spec DB — passed to the verifier so it matches the RIGHT product (e.g.
 *  75W-140, not a discontinued 75W-85). Null when we have no spec for it. */
function specForPart(
  vehicle: { year: number; make: string; model: string; trim: string },
  partName: string,
): string | undefined {
  let specs: Record<string, unknown> | null = null;
  try { specs = getVehicleSpecs({ year: vehicle.year, make: vehicle.make, model: vehicle.model, trim: vehicle.trim }) as unknown as Record<string, unknown>; } catch { return undefined; }
  if (!specs) return undefined;
  const n = partName.toLowerCase();
  const fmt = (v: unknown) => (v && typeof v === 'object' ? JSON.stringify(v) : String(v));
  let key: string | undefined;
  if (/differential/.test(n)) key = 'differentials';
  else if (/brake fluid/.test(n)) key = 'brakeFluid';
  else if (/coolant/.test(n)) key = 'coolant';
  else if (/transmission fluid/.test(n)) key = 'transmission';
  else if (/power steering/.test(n)) key = 'powerSteeringFluid';
  else if (/engine oil\b|motor oil/.test(n)) key = 'oil';
  else if (/spark plug/.test(n)) key = 'sparkPlugs';
  if (!key || !specs[key]) return undefined;
  // Conditional fluids (e.g. RAM axle fluid varies SRW vs DRW / by gear ratio):
  // render the STRUCTURED variants as an explicit by-condition hint, never a
  // prose "varies" string the verifier can't gate on. Matches the verifier's
  // dual-spec handling (surface a product for one variant, name the conditions).
  if (key === 'differentials') {
    const rear = (specs.differentials as { rear?: { variants?: Array<{ spec: string; capacity?: string; condition: string; partNumber?: string }> } } | undefined)?.rear;
    const variants = rear?.variants;
    if (Array.isArray(variants) && variants.length) {
      const lines = variants.map((x) => `${x.spec}${x.capacity ? ` (~${x.capacity.replace(/^~/, '')})` : ''}${x.partNumber ? ` [${x.partNumber}]` : ''} — ${x.condition}`);
      return `rear differential fluid VARIES BY AXLE/BUILD (confirm by VIN): ${lines.join(' | ')}. Match the product to ONE variant and name the conditions in the caveat.`;
    }
  }
  return fmt(specs[key]);
}

export interface VerifiedPartHit {
  name: string;
  partNumber?: string;
  oemBrand?: string;
  /** The PRIMARY verified retailer PRODUCT page (never a search page). */
  buyUrl?: string;
  buyVendor?: string;
  /** Gate 4 (multi-vendor): a verified live product page per store, so the user
   *  gets price choice. buyUrl is buyLinks[0]. */
  buyLinks?: Array<{ vendor: string; url: string }>;
  /** Aftermarket equivalents found by application (not by PN cross-map). */
  aftermarket: Array<{ brand: string; partNumber: string }>;
  /** Honest fitment caveat (e.g. axle/build-dependent spec — verify by VIN). */
  caveat?: string;
  sourceTask: string;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const partKey = (name: string) => `part:${norm(name)}`;

// Only these are real parts RETAILERS — a "verified" buy link must land on one
// of them (a page on edmunds.com / carsandbids.com / a dealer blog is NOT a buy
// link, even though it mentions the PN).
const RETAILER_HOST = /(^|\.)(amazon\.[a-z.]+|rockauto\.com|ebay\.[a-z.]+|autozone\.com|oreillyauto\.com|napaonline\.com|summitracing\.com|partsgeek\.com|1aauto\.com|carid\.com|walmart\.com|moparpartsgiant\.com|gmpartsgiant\.com|mopar\.com|advanceautoparts\.com|americanmuscle\.com|tirerack\.com|simpleautoparts\.com|rockauto\.ca)$/i;

/** A real retailer PRODUCT page — on an allowlisted store, NOT a search results
 *  page, and NOT a bare category/landing page. We require a product SIGNAL:
 *  the part number appears in the URL, or the path matches a known product-page
 *  pattern (/dp/, /itm/, /moreinfo, /product/, …). A live category page like
 *  moparpartsgiant.com/oem-dodge-challenger-differential.html is NOT the part. */
function isRetailerProductUrl(u: string, partNumber?: string): boolean {
  if (!/^https?:\/\//i.test(u)) return false;
  let host = '', path = '';
  try { const url = new URL(u); host = url.hostname; path = url.pathname.toLowerCase(); } catch { return false; }
  if (!RETAILER_HOST.test(host)) return false;
  // reject search-result pages (amazon /s?k=, ebay /sch/, generic ?q=/?search=)
  if (/[?&](k|q|_nkw|searchstring|search|keyword|text|searchterm)=/i.test(u)) return false;
  if (/\/search(\/|\?|$)|\/s\?|\/sch\//i.test(u)) return false;
  // product SIGNAL: the exact PN in the URL...
  const pn = (partNumber || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (pn.length >= 5 && u.toLowerCase().replace(/[^a-z0-9]/g, '').includes(pn)) return true;
  // ...or a real product-page path (not a bare category .html landing page).
  // `oem-parts` = the OEM-store product path (store.mopar.com / moparpartsgiant /
  // gmpartsgiant use /oem-parts/<name>-<pn>) — a real product page even when the
  // model's claimed PN is the superseded one and doesn't literally match the URL.
  if (/\/(dp|gp\/product|itm|ipd|moreinfo|product|products|oem-parts)\//i.test(path)) return true;
  if (/rockauto\.com/i.test(host) && /partnum=/i.test(u)) return true;
  return false;
}

/** Force OUR affiliate identity onto a retailer URL — strip any foreign tag a
 *  web-found link carried (e.g. someone else's Amazon SiteStripe tag) and apply
 *  ours. Correctness first, but never send commission to a competitor. */
function ownAffiliate(u: string): string {
  try {
    const url = new URL(u);
    if (/amazon\./i.test(url.hostname)) {
      // drop any foreign associate params, set ours
      for (const p of ['tag', 'linkCode', 'ascsubtag', 'ref_', 'linkId']) url.searchParams.delete(p);
      url.searchParams.set('tag', 'au7o-20');
      return url.toString();
    }
    if (/ebay\./i.test(url.hostname)) return ebayAffiliate(u);
    return u;
  } catch {
    return u;
  }
}

const VENDOR_LABELS: Array<[RegExp, string]> = [
  [/rockauto\.com/i, 'RockAuto'],
  [/amazon\./i, 'Amazon'],
  [/ebay\./i, 'eBay'],
  [/autozone\.com/i, 'AutoZone'],
  [/oreillyauto\.com/i, "O'Reilly"],
  [/napaonline\.com/i, 'NAPA'],
  [/summitracing\.com/i, 'Summit Racing'],
  [/moparpartsgiant\.com|mopar/i, 'Mopar'],
  [/gmpartsgiant\.com|gmparts/i, 'GM Parts'],
  [/parts\.|partsgiant/i, 'OEM Parts'],
];
function vendorFromUrl(u: string): string {
  for (const [re, label] of VENDOR_LABELS) if (re.test(u)) return label;
  try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return 'Buy'; }
}

/** How well a cached part name matches the requested part (0..1). Uses JACCARD
 *  (intersection / union) so a mismatched distinguishing token is PENALIZED —
 *  "engine oil filter" vs "engine air filter" = 2/4 = 0.5 (air ≠ oil), while
 *  vs "oil filter" = 2/3 = 0.67, so the right record wins. Plain overlap tied
 *  them and let the air filter hijack "oil filter". */
function nameScore(target: string, candidate: string): number {
  const at = norm(target).split(' ').filter((w) => w.length > 2);
  const bt = norm(candidate).split(' ').filter((w) => w.length > 2);
  const a = new Set(at);
  const b = new Set(bt);
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const w of a) if (b.has(w)) inter++;
  const union = a.size + b.size - inter;
  let score = union ? inter / union : 0;
  // Head-noun bonus: the last significant word is the part TYPE ("engine oil
  // FILTER" is a filter, not oil). Reward a candidate that shares it, so
  // "engine oil filter" prefers "oil filter" over "engine oil" (both tie on Jaccard).
  const ah = at[at.length - 1], bh = bt[bt.length - 1];
  if (ah && bh && ah === bh) score += 0.2;
  else if (ah && bh && ah !== bh && (a.has(bh) || b.has(ah))) score -= 0.1; // head mismatch on shared token
  return Math.max(0, Math.min(1, score));
}

/**
 * Read the record store for a verified deep link matching this part name for
 * this vehicle. Scans every web-confirmed lookup row for the vehicle (task and
 * freetext alike) and returns the best name match that has a real deep link.
 */
export async function getCachedVerifiedPart(
  vehicle: { year?: number | string; make?: string; model?: string; trim?: string },
  partName: string,
): Promise<VerifiedPartHit | null> {
  const make = vehicle.make?.trim();
  const model = vehicle.model?.trim();
  const year = Number(vehicle.year) || undefined;
  if (!make || !model || !partName?.trim()) return null;

  let rows;
  try {
    rows = await prisma.vehiclePartLookup.findMany({
      where: {
        make: { equals: make, mode: 'insensitive' },
        model: { equals: model, mode: 'insensitive' },
        ...(year ? { year } : {}),
        webSearchConfirmed: true,
      },
      take: 60,
      orderBy: { updatedAt: 'desc' },
    });
  } catch {
    return null;
  }

  let best: VerifiedPartHit | null = null;
  let bestScore = 0.5; // require a real overlap

  // Canonical-key contract: the requested part's canonical slug (null for free
  // text outside the vocabulary). An EXACT slug match is authoritative (score 1)
  // and can't collide the way fuzzy nameScore did ("oil filter" ~ "air filter").
  // Free text with no slug falls through to the fuzzy lane, so nothing regresses.
  const reqSlug = canonicalSlug(partName);

  for (const row of rows) {
    const parts = (row.parts as unknown as PipelinePart[]) || [];
    const vlog = (row.verificationLog as unknown as WebVerificationLog[]) || [];
    for (const p of parts) {
      const pSlug = (p as unknown as { canonicalKey?: string }).canonicalKey || canonicalSlug(p.name);
      // Exact canonical hit → 1. Both have slugs but they DIFFER → this is the
      // wrong part, skip the fuzzy lane entirely (a mismatched slug is a veto,
      // not a low score — that's what stops the air-filter hijack). Otherwise
      // (one side has no slug) fall back to fuzzy overlap.
      let score: number;
      if (reqSlug && pSlug) score = pSlug === reqSlug ? 1 : 0;
      else score = nameScore(partName, p.name);
      if (score <= bestScore) continue;

      // Find a verified deep source URL for this part (matched by PN, else any).
      const logs = vlog.filter((v) => v.found && Array.isArray(v.sourceUrls) && v.sourceUrls.length);
      const mine = p.partNumber ? logs.find((v) => v.partNumber === p.partNumber) : undefined;
      // Gate 4: build a verified link PER vendor from the stored product URLs.
      const allUrls = [mine, ...logs].filter(Boolean).flatMap((v) => v!.sourceUrls).filter((u) => isRetailerProductUrl(u, p.partNumber));
      const byVendor = new Map<string, string>();
      for (const u of allUrls) { const vd = vendorFromUrl(u); if (!byVendor.has(vd)) byVendor.set(vd, ownAffiliate(u)); }
      const buyLinks = [...byVendor.entries()].map(([vendor, url]) => ({ vendor, url }));

      best = {
        name: p.name,
        partNumber: p.partNumber,
        oemBrand: p.oemBrand,
        buyUrl: buyLinks[0]?.url,
        buyVendor: buyLinks[0]?.vendor,
        buyLinks,
        aftermarket: (p.crossReferences || []).map((c) => ({ brand: c.brand, partNumber: c.partNumber })),
        caveat: ((p as unknown as { displayCaveat?: string }).displayCaveat || '').trim() || undefined,
        sourceTask: row.task,
      };
      bestScore = score;
    }
  }
  return best;
}

const RECENT_MS = 1000 * 60 * 60 * 24 * 30; // don't re-warm the same part within 30d

/**
 * A-STANDARD single-part verify — the known-issues audit's Gate-4 discipline
 * applied to one part: web-search, the PN must come FROM a real product page (not
 * memory), return the deepest URL VERIFIED to resolve to the exact product, drop
 * if it can't confirm the component's own PN + a real product page. This inverts
 * B's "propose PN from memory then loosely confirm" (the 5013457AA fabrication).
 */
async function runAStandardVerify(
  year: number, make: string, model: string, trim: string, partName: string, specHint?: string,
): Promise<VerifiedPartHit | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const vehicle = `${year} ${make} ${model} ${trim}`.replace(/\s+/g, ' ').trim();
  const specLine = specHint
    ? `\nDOCUMENTED FACTORY SPEC (from Au7o's spec DB): ${specHint}\nSPEC ACCEPTANCE (strict — ambiguity must be EVIDENCED in your search, never asserted):\n- Accept the product's spec ONLY if that exact spec is documented for THIS vehicle in a source you actually found during this search.\n- If TWO specs are both documented in your sources for this vehicle (genuine axle/build split, e.g. 75W-85 vs 75W-140), surface a product matching one and set "caveat" to name both.\n- If the product's spec matches NEITHER documented option, REJECT — do not accept a near-miss by claiming ambiguity you didn't find evidence for.`
    : '';
  const prompt = `You are an OEM parts auditor for au7o. USE WEB SEARCH — never answer from memory. Find the buyable part for ONE component on ONE vehicle, to a strict standard.

Vehicle: ${vehicle}
Component: ${partName}${specLine}

RULES (a wrong-fitment or wrong-spec deep link converts then refunds — correctness is the product):
- COMPONENT FIDELITY: find the correct OEM part number for THIS EXACT component. Verify the part TYPE matches (a drain plug is not a fluid; a seal is not a plug; a fill plug is not a drain plug). NEVER borrow a sibling/related part's number.
- STANDARD CONFIGURATION, NOT AN OPTIONAL UPGRADE PACKAGE: default to the part for the STANDARD factory configuration. This matters most for AIR FILTERS: return the standard air-BOX PANEL filter, NOT a cold-air-intake / performance-intake / open-element filter tied to an optional package (e.g. a Mopar T/A, Shaker CAI, or Scat-Pack cold-air element) — those are a DIFFERENT part for intake hardware most owners don't have, and they dominate search results. Only return the package/intake filter if the request explicitly names that intake. Same principle for any part with a base-vs-package split (brakes, wheels, exhaust): base unless asked.
- SPEC MATCH: FIRST determine the correct factory specification for this component on THIS exact vehicle (e.g. the exact gear-oil viscosity — 75W-140 vs 75W-85 is NOT interchangeable). The product you link MUST match that spec. A product with a different viscosity/grade/type is WRONG — reject it.
- AVAILABILITY: the product must be CURRENTLY AVAILABLE for sale. Do NOT link a discontinued/out-of-stock page.
- SUPERSESSION IS NORMAL, NOT A REASON TO DROP: OEM part numbers get superseded constantly. If the spec'd PN is superseded/obsolete BUT a correct-spec product IS for sale (under the superseding PN, or as the same fluid/part sold by brand — e.g. a "Mopar 75W-85 gear oil" listing), you MUST verify with THAT available product and note the supersession in "caveat". Only "drop" if NO correct-spec product exists for sale at ANY retailer. Finding a live, in-stock, correct-spec product page and still returning "drop" because the original PN is obsolete is a BUG — surface the available product.
- The part number MUST come FROM a real product page you actually opened via search — NOT from memory.
- DEEP LINKS (multi-vendor): find a verified product page on AS MANY stores as you can actually confirm — Amazon, RockAuto, eBay, the OEM catalog (Mopar eStore / MoparPartsGiant / GM Parts Giant), AutoZone, etc. EACH url must be a real, in-stock, correct-spec PRODUCT page for THIS exact part (same standard). Include ONLY vendors you actually verified; omit any you couldn't. NEVER a search-results url, category/landing page, or homepage.
- If you CANNOT find this component's own part number AND at least one real, in-stock, correct-spec product page, return status "drop" with empty fields. Do NOT substitute a different part's number or a search link.
- aftermarket: up to 2 equivalents (brand + their OWN part number), found by APPLICATION/fitment — not by converting the OEM number.

Return ONLY JSON, no prose:
{"status":"verified"|"drop","partNumber":"<from the product page, or empty>","oemBrand":"<brand or empty>","buyLinks":[{"vendor":"<store>","url":"<deep product page url>"}],"aftermarket":[{"brand":"","partNumber":""}],"caveat":"<one short fitment note or empty>"}`;

  let msg;
  try {
    msg = await client.messages.create({
      // Sonnet, not Haiku: verification runs in the background/batch where latency
      // doesn't matter, and Haiku's variance under the web-search bound was
      // false-dropping legitimate parts (spark plugs + diff both dropped once then
      // verified on retry). A dropped deep link costs far more in conversions than
      // the token delta on a few thousand verifications.
      model: 'claude-sonnet-4-6',
      max_tokens: 1200,
      tools: [{ type: 'web_search_20250305' as unknown as 'web_search_20250305', name: 'web_search', max_uses: 4 } as never],
      messages: [{ role: 'user', content: prompt }],
    });
  } catch { return null; }

  let text = '';
  const searchUrls: string[] = [];
  for (const b of msg.content as unknown as Array<Record<string, unknown>>) {
    if (b.type === 'text' && typeof b.text === 'string') text += b.text;
    if (b.type === 'web_search_tool_result' && Array.isArray(b.content)) {
      for (const r of b.content as unknown as Array<Record<string, unknown>>) {
        if (r.type === 'web_search_result' && typeof r.url === 'string') searchUrls.push(r.url);
      }
    }
  }
  const m = text.replace(/```json/g, '').replace(/```/g, '').match(/\{[\s\S]*\}/);
  if (!m) return null;
  let j: { status?: string; partNumber?: string; oemBrand?: string; buyLinks?: Array<{ vendor?: string; url?: string }>; aftermarket?: Array<{ brand?: string; partNumber?: string }>; caveat?: string };
  try { j = JSON.parse(m[0]); } catch { return null; }
  if (j.status !== 'verified') return null;

  // Candidates: the model's claimed buyLinks + retailer product pages from the
  // actual search results. Shape-gate, dedupe by vendor, then liveness-check ALL
  // in parallel (Gate 4 = a verified product page per store).
  const pn = (j.partNumber || '').trim();
  const claimed = Array.isArray(j.buyLinks) ? j.buyLinks.map((b) => b?.url).filter(Boolean) as string[] : [];
  const cands = [...claimed, ...searchUrls]
    .filter((u): u is string => typeof u === 'string' && u.length > 0)
    .filter((u) => isRetailerProductUrl(u, pn));
  const byVendor = new Map<string, string>();
  for (const u of cands) { const v = vendorFromUrl(u); if (!byVendor.has(v)) byVendor.set(v, u); if (byVendor.size >= 6) break; }
  const checked = await Promise.all([...byVendor.entries()].map(async ([vendor, url]) => ({ vendor, url, live: (await checkLinkLive(url)) !== 'dead' })));
  const liveLinks = checked.filter((c) => c.live).map((c) => ({ vendor: c.vendor, url: ownAffiliate(c.url) }));
  if (!liveLinks.length) return null; // no verified LIVE product page → not verified

  // STRUCTURAL PN gate: only claim a part number if it appears in one of the
  // live product URLs. Kills fabricate-then-rationalize.
  const pnNorm = pn.toLowerCase().replace(/[^a-z0-9]/g, '');
  const pnInUrl = pnNorm.length >= 5 && liveLinks.some((l) => l.url.toLowerCase().replace(/[^a-z0-9]/g, '').includes(pnNorm));
  const aftermarket = Array.isArray(j.aftermarket)
    ? j.aftermarket.filter((a) => a && a.brand && a.partNumber).map((a) => ({ brand: String(a.brand), partNumber: String(a.partNumber) })).slice(0, 2)
    : [];
  return {
    name: partName,
    partNumber: pnInUrl ? pn : undefined,
    oemBrand: j.oemBrand || undefined,
    buyUrl: liveLinks[0].url,
    buyVendor: liveLinks[0].vendor,
    buyLinks: liveLinks,
    aftermarket,
    caveat: (j.caveat || '').trim() || undefined,
    sourceTask: partKey(partName),
  };
}

/** Create-or-update a VehiclePartLookup row WITHOUT upsert — the PrismaPg driver
 *  adapter doesn't support upsert/transactions (silent empty error). Sequential
 *  findUnique → update/create instead. */
async function saveLookup(
  key: { year: number; make: string; model: string; trim: string; task: string },
  data: Record<string, unknown>,
): Promise<void> {
  const existing = await prisma.vehiclePartLookup.findUnique({
    where: { year_make_model_trim_task: key },
  }).catch(() => null);
  if (existing) {
    await prisma.vehiclePartLookup.update({ where: { year_make_model_trim_task: key }, data }).catch(() => {});
  } else {
    await prisma.vehiclePartLookup.create({ data: { ...key, ...data } as never }).catch(() => {});
  }
}

/** Run the A-standard verify for ONE part and persist under a `part:<name>` key
 *  (record-store format the readers already understand). Returns the hit or null. */
async function runAndPersist(
  year: number, make: string, model: string, trim: string, partName: string,
): Promise<VerifiedPartHit | null> {
  const task = partKey(partName);
  const canonicalKey = canonicalSlug(partName) || undefined; // canonical-key contract: exact-match lane
  const specHint = specForPart({ year, make, model, trim }, partName);
  // Asymmetric verification: verified-once is verified, but dropped-once is NOT
  // cached as a drop — a single drop is usually search variance, so require a
  // SECOND confirming run before we persist `failed` (and cool it down 6h). The
  // failure modes are asymmetric, so the retry policy is too.
  let hit = await runAStandardVerify(year, make, model, trim, partName, specHint);
  if (!hit?.buyUrl) hit = await runAStandardVerify(year, make, model, trim, partName, specHint);
  const confirmed = !!hit?.buyUrl;
  // Store in the PipelinePart-shaped format getCachedVerifiedPart reads, stamped
  // with the canonical slug so future lookups hit the exact-match lane.
  const parts = hit
    ? [{ name: partName, canonicalKey, partNumber: hit.partNumber, oemBrand: hit.oemBrand, crossReferences: hit.aftermarket, displayCaveat: hit.caveat || '', searchQuery: partName, spec: '', confidence: 'oem-verified' }]
    : [];
  const verificationLog = hit?.buyLinks?.length
    ? [{ partNumber: hit.partNumber || '', searchQuery: partName, found: true, retailers: hit.buyLinks.map((l) => l.vendor), sourceUrls: hit.buyLinks.map((l) => l.url), retried: false }]
    : [];
  await saveLookup({ year, make, model, trim, task }, {
    parts: parts as unknown as object,
    verificationLog: verificationLog as unknown as object,
    source: 'pipeline-freetext',
    status: confirmed ? 'verified' : 'failed',
    webSearchConfirmed: confirmed,
    verifiedAt: new Date(),
  });
  return hit;
}

/**
 * FIRST-ASK inline verify: run the web-search pipeline NOW and return a verified
 * deep link within `timeoutMs`. On timeout the pipeline keeps running in the
 * background and still persists (so the next lookup is an instant hit), but this
 * call returns null so the caller can fall back to honest descriptive links.
 */
export async function verifyPartNow(
  vehicle: { year?: number | string; make?: string; model?: string; trim?: string },
  partName: string,
  timeoutMs = 12000,
): Promise<VerifiedPartHit | null> {
  try {
    const make = vehicle.make?.trim();
    const model = vehicle.model?.trim();
    const year = Number(vehicle.year);
    const trim = (vehicle.trim || '').trim() || 'Base';
    if (!make || !model || !year || !partName?.trim() || !process.env.ANTHROPIC_API_KEY) return null;

    const run = runAndPersist(year, make, model, trim, partName).catch(() => null);
    const timed = new Promise<null>((res) => setTimeout(() => res(null), timeoutMs));
    return await Promise.race([run, timed]);
  } catch {
    return null;
  }
}

/**
 * Fire-and-forget cache warm for ONE part (background, from after()). Skips if
 * a fresh/verified record already exists so we don't re-run the pipeline.
 */
export async function warmVerifiedPart(
  vehicle: { year?: number | string; make?: string; model?: string; trim?: string },
  partName: string,
): Promise<void> {
  try {
    const make = vehicle.make?.trim();
    const model = vehicle.model?.trim();
    const year = Number(vehicle.year);
    const trim = (vehicle.trim || '').trim() || 'Base';
    if (!make || !model || !year || !partName?.trim() || !process.env.ANTHROPIC_API_KEY) return;

    const task = partKey(partName);
    const existing = await prisma.vehiclePartLookup.findUnique({
      where: { year_make_model_trim_task: { year, make, model, trim, task } },
    }).catch(() => null);
    if (existing) {
      const age = Date.now() - existing.updatedAt.getTime();
      // Verified → keep 30d. `pending` (in-flight) → skip 5m. But a `failed`/
      // `partial` record (e.g. the pre-seed dropped it without spec grounding)
      // is retry-able — the runtime injects the DB spec and may now find the
      // correct in-stock product, so only cool down 6h before trying again.
      if (existing.webSearchConfirmed) return;
      if (existing.status === 'pending' && age < 5 * 60 * 1000) return;
      if ((existing.status === 'failed' || existing.status === 'partial') && age < 6 * 60 * 60 * 1000) return;
    }

    await runAndPersist(year, make, model, trim, partName);
  } catch {
    /* background best-effort — never surfaces */
  }
}

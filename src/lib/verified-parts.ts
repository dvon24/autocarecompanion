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

import prisma from './db';
import { runFreetextPipeline, type PipelinePart, type WebVerificationLog } from './parts-pipeline';
import { ebayAffiliate } from './ebay-affiliate';
import { checkLinkLive } from './vendor-link-validator';

export interface VerifiedPartHit {
  name: string;
  partNumber?: string;
  oemBrand?: string;
  /** A verified retailer PRODUCT/LISTING page (never a search page). */
  buyUrl?: string;
  buyVendor?: string;
  /** Aftermarket equivalents found by application (not by PN cross-map). */
  aftermarket: Array<{ brand: string; partNumber: string }>;
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
  // ...or a real product-page path (not a bare category .html landing page)
  if (/\/(dp|gp\/product|itm|ipd|moreinfo|product|products)\//i.test(path)) return true;
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

/** How well a cached part name matches the requested part (0..1 token overlap). */
function nameScore(target: string, candidate: string): number {
  const a = new Set(norm(target).split(' ').filter((w) => w.length > 2));
  const b = new Set(norm(candidate).split(' ').filter((w) => w.length > 2));
  if (!a.size || !b.size) return 0;
  let hit = 0;
  for (const w of a) if (b.has(w)) hit++;
  return hit / a.size;
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

  for (const row of rows) {
    const parts = (row.parts as unknown as PipelinePart[]) || [];
    const vlog = (row.verificationLog as unknown as WebVerificationLog[]) || [];
    for (const p of parts) {
      const score = nameScore(partName, p.name);
      if (score <= bestScore) continue;

      // Find a verified deep source URL for this part (matched by PN, else any).
      const logs = vlog.filter((v) => v.found && Array.isArray(v.sourceUrls) && v.sourceUrls.length);
      const mine = p.partNumber ? logs.find((v) => v.partNumber === p.partNumber) : undefined;
      const rawDeep = [mine, ...logs]
        .filter(Boolean)
        .flatMap((v) => v!.sourceUrls)
        .find((u) => isRetailerProductUrl(u, p.partNumber));
      const deep = rawDeep ? ownAffiliate(rawDeep) : undefined;

      best = {
        name: p.name,
        partNumber: p.partNumber,
        oemBrand: p.oemBrand,
        buyUrl: deep,
        buyVendor: deep ? vendorFromUrl(deep) : undefined,
        aftermarket: (p.crossReferences || []).map((c) => ({ brand: c.brand, partNumber: c.partNumber })),
        sourceTask: row.task,
      };
      bestScore = score;
    }
  }
  return best;
}

const RECENT_MS = 1000 * 60 * 60 * 24 * 30; // don't re-warm the same part within 30d

/** Best-matching pipeline part for the requested name. */
function bestPart(parts: PipelinePart[], partName: string): PipelinePart | null {
  let best: PipelinePart | null = null;
  let bs = 0.3;
  for (const p of parts || []) {
    const s = nameScore(partName, p.name);
    if (s > bs) { bs = s; best = p; }
  }
  return best || parts?.[0] || null;
}

/** Turn a fresh pipeline result into a VerifiedPartHit (or null if no real,
 *  LIVE retailer product link was confirmed — we never surface a search page or
 *  a dead link as "verified"). */
async function hitFromResult(result: Awaited<ReturnType<typeof runFreetextPipeline>>, partName: string): Promise<VerifiedPartHit | null> {
  const p = bestPart(result.parts || [], partName);
  if (!p) return null;
  const logs = (result.verificationLog || []).filter((v) => v.found && Array.isArray(v.sourceUrls) && v.sourceUrls.length);
  const mine = p.partNumber ? logs.find((v) => v.partNumber === p.partNumber) : undefined;
  // Retailer product candidates (part-matched first), then confirm each RESOLVES
  // (HEAD check, 404/410 dropped) — never present a link we didn't verify is live.
  const candidates = [mine, ...logs].filter(Boolean).flatMap((v) => v!.sourceUrls).filter((u) => isRetailerProductUrl(u, p.partNumber)).slice(0, 5);
  let live: string | undefined;
  for (const c of candidates) {
    if ((await checkLinkLive(c)) !== 'dead') { live = c; break; }
  }
  if (!live) return null;
  const deep = ownAffiliate(live);
  return {
    name: p.name,
    partNumber: p.partNumber,
    oemBrand: p.oemBrand,
    buyUrl: deep,
    buyVendor: vendorFromUrl(deep),
    aftermarket: (p.crossReferences || []).map((c) => ({ brand: c.brand, partNumber: c.partNumber })),
    sourceTask: partKey(partName),
  };
}

/** Run the web-search pipeline for ONE part and persist under a `part:<name>`
 *  key. Returns the verified hit (deep link + PN + aftermarket) or null. */
async function runAndPersist(
  year: number, make: string, model: string, trim: string, partName: string,
): Promise<VerifiedPartHit | null> {
  const task = partKey(partName);
  // Claim the slot so concurrent asks don't double-run the pipeline.
  await prisma.vehiclePartLookup.upsert({
    where: { year_make_model_trim_task: { year, make, model, trim, task } },
    create: { year, make, model, trim, task, parts: [], source: 'pipeline-freetext', status: 'pending' },
    update: { updatedAt: new Date() },
  }).catch(() => {});

  const result = await runFreetextPipeline(year, make, model, trim, partName);
  const confirmed = (result.verificationLog || []).some((v) => v.found);
  await prisma.vehiclePartLookup.update({
    where: { year_make_model_trim_task: { year, make, model, trim, task } },
    data: {
      parts: result.parts as unknown as object,
      unverifiedParts: result.unverifiedParts as unknown as object,
      verificationLog: result.verificationLog as unknown as object,
      source: 'pipeline-freetext',
      status: confirmed ? 'verified' : 'partial',
      webSearchConfirmed: confirmed,
      verifiedAt: new Date(),
    },
  }).catch(() => {});
  return await hitFromResult(result, partName);
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
      // Verified/partial → don't re-run for 30d. A `pending` row means an inline
      // verify claimed the slot; only skip it briefly (5m) so a cut-off inline
      // (function ended mid-pipeline) still gets retried instead of stuck 30d.
      if (existing.webSearchConfirmed) return;
      if (existing.status !== 'pending' && age < RECENT_MS) return;
      if (existing.status === 'pending' && age < 5 * 60 * 1000) return;
    }

    await runAndPersist(year, make, model, trim, partName);
  } catch {
    /* background best-effort — never surfaces */
  }
}

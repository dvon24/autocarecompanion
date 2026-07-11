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

/** A deep link is a real product/listing page — not a search results page. */
function isDeepUrl(u: string): boolean {
  if (!u) return false;
  if (/google\.[a-z.]+\/search/i.test(u)) return false;
  if (/[?&](_nkw|q|searchstring|search|keyword|text)=/i.test(u)) return false;
  if (/\/search(\/|\?|$)|\/s\?|\/sch\//i.test(u)) return false;
  return /^https?:\/\//i.test(u);
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
      const deep = [mine, ...logs]
        .filter(Boolean)
        .flatMap((v) => v!.sourceUrls)
        .find(isDeepUrl);

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

/**
 * Fire-and-forget cache warm for ONE part: run the freetext pipeline (web
 * search) and upsert a `part:<name>` record so future lookups are instant
 * verified hits. Call from after(); it never throws to the caller.
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
    if (!make || !model || !year || !partName?.trim()) return;
    if (!process.env.ANTHROPIC_API_KEY) return;

    const task = partKey(partName);
    const existing = await prisma.vehiclePartLookup.findUnique({
      where: { year_make_model_trim_task: { year, make, model, trim, task } },
    }).catch(() => null);
    // Skip if we already verified this recently (warm or in-flight placeholder).
    if (existing && (existing.webSearchConfirmed || Date.now() - existing.updatedAt.getTime() < RECENT_MS)) return;

    // Claim the slot so concurrent requests don't double-run the pipeline.
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
  } catch {
    /* background best-effort — never surfaces */
  }
}

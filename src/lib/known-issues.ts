import { KnownIssue } from '@/schemas/knownIssue.schema';
import prisma from '@/lib/db';
import { categoryConfig } from '@/lib/issue-categories';

// --- DB row to KnownIssue shape ---

// The research/persist pipeline historically wrote categories from a wider
// list than the UI's categoryConfig (fuel-system, electronics, ignition,
// wheels-tires) and severity 'critical'. An unknown category crashes the
// article page server-side (categoryConfig[cat].icon TypeError) — the page
// streams its shell then dies, rendering zero issues. Normalize at the read
// boundary so bad rows degrade to the nearest valid value instead.
const CATEGORY_ALIASES: Record<string, string> = {
  'fuel-system': 'fuel',
  fuel_system: 'fuel',
  electronics: 'electrical',
  ignition: 'engine',
  'wheels-tires': 'suspension',
};

function toUiCategory(cat: string | null | undefined): string {
  const lower = (cat || '').toLowerCase();
  if (lower in categoryConfig) return lower;
  return CATEGORY_ALIASES[lower] ?? 'other';
}

function dbRowToKnownIssue(row: any): KnownIssue {
  return {
    id: row.id,
    vehicleMatch: {
      years: row.years,
      make: row.make,
      model: row.model,
      ...(row.trims.length > 0 ? { trims: row.trims } : {}),
      ...(row.engines.length > 0 ? { engines: row.engines } : {}),
    },
    category: toUiCategory(row.category),
    title: row.title,
    description: row.description,
    solution: row.solution,
    severity: normalizeSeverity(row.severity),
    confidence: row.confidence,
    symptoms: row.symptoms,
    affectedSystems: row.affectedSystems,
    estimatedCost: row.estimatedCostLow != null
      ? { low: row.estimatedCostLow, high: row.estimatedCostHigh }
      : undefined,
    typicalMileage: row.typicalMileageLow != null
      ? { low: row.typicalMileageLow, high: row.typicalMileageHigh }
      : undefined,
    citations: row.citations as any[],
    communityRecommendations: row.communityRecommendations as any[],
    humanApproved: row.humanApproved,
    lastReportedByOwners: row.lastReportedByOwners,
    reviewedOn: row.reviewedOn,
    reportCount: row.reportCount,
    source: row.source || 'ai-researched',
    status: row.status,
    dtcCodes: row.dtcCodes,
    // Pre-computed semantic neighbors (KnownIssue.relatedIssueIds, populated
    // by scripts/compute-issue-embeddings.js). Kept on the runtime object so
    // findRelatedVehiclesForIssues can union it with DTC + engine matches.
    relatedIssueIds: row.relatedIssueIds || [],
    engines: row.engines || [],
  } as KnownIssue;
}

// --- Slug utilities ---

/**
 * Build the /known-issues/{slug} URL slug for a (make, model) pair.
 *
 * Uses NFD-normalize + diacritic-strip so accented characters
 * transliterate to their base form rather than becoming dashes:
 * "Citroën Berlingo" → "citroen-berlingo", NOT "citro-n-berlingo".
 * The earlier dash-stripping version produced broken slugs Google
 * marked as "Crawled — currently not indexed" in GSC. See the 301
 * redirect in next.config.ts that catches the old citro-n-* URLs.
 */
export function makeSlug(make: string, model: string): string {
  return `${make} ${model}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Parse a slug back to {make, model}. Returns null if not found. */
export async function parseSlug(slug: string): Promise<{ make: string; model: string } | null> {
  const all = await getAllKnownIssueSlugs();
  return all.find(s => s.slug === slug) || null;
}

/** Get all unique slugs for static generation. */
export async function getAllKnownIssueSlugs(): Promise<{ slug: string; make: string; model: string }[]> {
  const distinct = await prisma.knownIssue.findMany({
    where: { status: 'published' },
    distinct: ['make', 'model'],
    select: { make: true, model: true },
  });
  return distinct.map(({ make, model }) => ({
    slug: makeSlug(make, model),
    make,
    model,
  }));
}

// --- Article / sitemap dates ---

/**
 * When the article LAYOUT/RENDERING was last meaningfully revised. Bump this
 * any time we ship a structural change (SSR-expanded cards, YMMT prefixes,
 * cross-vehicle links, etc.) so the sitemap + JSON-LD `dateModified` push
 * out a fresh signal that prompts Google to re-crawl. Without this, articles
 * whose underlying issue rows haven't changed look "stale" to the crawler
 * — the page is brand new HTML but `dateModified` reflects last data edit.
 *
 * Format: YYYY-MM-DD. Update on every meaningful render/SEO refactor.
 */
export const LAYOUT_LAST_REVISED = '2026-06-07';

function maxDateString(...dates: string[]): string {
  // Each input is already YYYY-MM-DD; lexicographic max == chronological max.
  return dates.filter(Boolean).reduce((a, b) => (a > b ? a : b), '');
}

/** Get the earliest createdAt and latest updatedAt for a make+model's published issues. */
export async function getArticleDates(make: string, model: string): Promise<{ published: string; modified: string }> {
  const result = await prisma.knownIssue.aggregate({
    where: {
      make: { equals: make, mode: 'insensitive' },
      model: { equals: model, mode: 'insensitive' },
      status: 'published',
    },
    _min: { createdAt: true },
    _max: { updatedAt: true },
  });
  const dataModified = (result._max.updatedAt || new Date()).toISOString().split('T')[0];
  return {
    published: (result._min.createdAt || new Date()).toISOString().split('T')[0],
    // dateModified = max(last data edit, last layout revision). Layout
    // changes signal "refresh the rendered page" to crawlers even when the
    // underlying data hasn't changed.
    modified: maxDateString(dataModified, LAYOUT_LAST_REVISED),
  };
}

/** Same shape as getArticleDates but scoped to a category — used by the
 *  /known-issues/category/[category] landing pages so their JSON-LD +
 *  sitemap entries advertise fresh dateModified. */
export async function getCategoryDates(category: string): Promise<{ published: string; modified: string }> {
  const result = await prisma.knownIssue.aggregate({
    where: { status: 'published', category },
    _min: { createdAt: true },
    _max: { updatedAt: true },
  });
  const dataModified = (result._max.updatedAt || new Date()).toISOString().split('T')[0];
  return {
    published: (result._min.createdAt || new Date()).toISOString().split('T')[0],
    modified: maxDateString(dataModified, LAYOUT_LAST_REVISED),
  };
}

/** Same shape as getArticleDates but scoped to a make — used by the
 *  /known-issues/make/[make] landing pages. */
export async function getMakeDates(make: string): Promise<{ published: string; modified: string }> {
  const result = await prisma.knownIssue.aggregate({
    where: { status: 'published', make: { equals: make, mode: 'insensitive' } },
    _min: { createdAt: true },
    _max: { updatedAt: true },
  });
  const dataModified = (result._max.updatedAt || new Date()).toISOString().split('T')[0];
  return {
    published: (result._min.createdAt || new Date()).toISOString().split('T')[0],
    modified: maxDateString(dataModified, LAYOUT_LAST_REVISED),
  };
}

/** Get all slugs with their latest updatedAt date (for sitemap). */
export async function getAllKnownIssueSlugsWithDates(): Promise<{ slug: string; make: string; model: string; lastModified: Date }[]> {
  const rows = await prisma.knownIssue.findMany({
    where: { status: 'published' },
    select: { make: true, model: true, updatedAt: true },
  });

  const map = new Map<string, { make: string; model: string; lastModified: Date }>();
  for (const row of rows) {
    const slug = makeSlug(row.make, row.model);
    const existing = map.get(slug);
    if (!existing || row.updatedAt > existing.lastModified) {
      map.set(slug, { make: row.make, model: row.model, lastModified: row.updatedAt });
    }
  }

  // Bump every slug's lastModified to LAYOUT_LAST_REVISED when our render
  // layer was revised more recently than the data — same logic as
  // getArticleDates. Forces sitemap to advertise fresh URLs after a
  // structural fix even when issue rows haven't been touched.
  const layoutDate = new Date(LAYOUT_LAST_REVISED + 'T00:00:00Z');
  return Array.from(map.entries()).map(([slug, data]) => ({
    slug,
    ...data,
    lastModified: data.lastModified > layoutDate ? data.lastModified : layoutDate,
  }));
}

// --- Article data loading ---

const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

/** Get all published issues for a make+model across ALL years. */
export async function getKnownIssuesForArticle(make: string, model: string): Promise<KnownIssue[]> {
  const rows = await prisma.knownIssue.findMany({
    where: {
      make: { equals: make, mode: 'insensitive' },
      model: { equals: model, mode: 'insensitive' },
      status: 'published',
    },
  });

  const issues = rows.map(dbRowToKnownIssue);

  issues.sort((a, b) => {
    const sevDiff = (severityOrder[a.severity] ?? 2) - (severityOrder[b.severity] ?? 2);
    if (sevDiff !== 0) return sevDiff;
    return b.reportCount - a.reportCount;
  });

  return issues;
}

/** Get the full year range covered by issues for a make+model. */
export function getYearRange(issues: KnownIssue[]): { min: number; max: number } | null {
  if (issues.length === 0) return null;
  let min = Infinity;
  let max = -Infinity;
  for (const issue of issues) {
    for (const year of issue.vehicleMatch.years) {
      if (year < min) min = year;
      if (year > max) max = year;
    }
  }
  return { min, max };
}

// --- Related vehicles (for internal cross-linking) ---

export async function getRelatedVehicles(make: string, model: string, limit = 6): Promise<{ slug: string; make: string; model: string; issueCount: number }[]> {
  // Get same-make vehicles (siblings)
  const sameMake = await prisma.knownIssue.findMany({
    where: {
      make: { equals: make, mode: 'insensitive' },
      NOT: { model: { equals: model, mode: 'insensitive' } },
      status: 'published',
    },
    select: { make: true, model: true },
  });

  // Group by model and count
  const modelCounts: Record<string, { make: string; model: string; count: number }> = {};
  for (const row of sameMake) {
    const key = `${row.make}|${row.model}`;
    if (!modelCounts[key]) modelCounts[key] = { make: row.make, model: row.model, count: 0 };
    modelCounts[key].count++;
  }

  const siblings = Object.values(modelCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(v => ({
      slug: makeSlug(v.make, v.model),
      make: v.make,
      model: v.model,
      issueCount: v.count,
    }));

  return siblings;
}

// --- Cross-issue related vehicles (Gemini's "hub-and-spoke" recommendation) ---

export interface RelatedIssueVehicle {
  slug: string;
  make: string;
  model: string;
  issueId: string;
  title: string;
}

/**
 * For each issue on the current page, find up to N OTHER vehicles whose
 * own KnownIssue records share EITHER a DTC code OR a canonical engine
 * code with it. This creates the "this issue also affects: [Dodge Journey,
 * Chrysler Town & Country]" cross-link block — the hub-and-spoke effect
 * Gemini flagged for Google's near-duplicate detector.
 *
 * Why both DTC and engine? Many shared-platform defects have NO standard
 * SAE code (HEMI MDS lifter failure, B58 timing chain rattle, EA888
 * tensioner) but they're the same issue across 4-5 vehicles. Matching
 * on engines extends cross-link coverage from ~47% (DTC-only) to ~85%+
 * once `engines` is backfilled by scripts/extract-issue-metadata.js.
 *
 * Engine matching is case-insensitive exact-string. Variant noise
 * ("5.7 HEMI" vs "5.7L HEMI") would lose matches; the extraction prompt
 * canonicalizes to short form, but the data isn't strictly normalized.
 * If matching feels weak in practice, v3 can add fuzzy/regex.
 *
 * Single batched Prisma query — OR-merges every DTC + engine across the
 * page's issues, fetches matching rows, then groups in JS. No N+1.
 */
export async function findRelatedVehiclesForIssues(
  issues: KnownIssue[],
  excludeMake: string,
  excludeModel: string,
  perIssueLimit = 3,
): Promise<Map<string, RelatedIssueVehicle[]>> {
  const result = new Map<string, RelatedIssueVehicle[]>();
  for (const i of issues) result.set(i.id, []);

  // Collect DTCs (upper-case), engines (lower-case), and pre-computed
  // semantic neighbor ids across all issues. The semantic neighbor list
  // is populated offline by scripts/compute-issue-embeddings.js — it
  // captures content overlap that engine/DTC matching alone misses
  // (e.g., "valvetrain tick" ↔ "lifter failure" when both vehicles
  // share an engine family AND the embedding similarity passes
  // threshold).
  const allDtcs = new Set<string>();
  const allEngines = new Set<string>();
  const allSemanticIds = new Set<string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const i of issues as any[]) {
    if (Array.isArray(i.dtcCodes)) {
      for (const d of i.dtcCodes) {
        if (typeof d === 'string' && d.length > 0) allDtcs.add(d.toUpperCase());
      }
    }
    if (Array.isArray(i.engines)) {
      for (const e of i.engines) {
        if (typeof e === 'string' && e.length > 0) allEngines.add(e.toLowerCase());
      }
    }
    if (Array.isArray(i.relatedIssueIds)) {
      for (const id of i.relatedIssueIds) {
        if (typeof id === 'string' && id.length > 0) allSemanticIds.add(id);
      }
    }
  }
  if (allDtcs.size === 0 && allEngines.size === 0 && allSemanticIds.size === 0) return result;

  // Fetch candidates that share a DTC OR an engine. Postgres `hasSome`
  // is case-sensitive, so we'll filter case-insensitively in JS after.
  const orClauses: Array<Record<string, unknown>> = [];
  if (allDtcs.size > 0) orClauses.push({ dtcCodes: { hasSome: [...allDtcs] } });
  if (allEngines.size > 0) {
    // engines field stored as-is — pass both lower and original-case
    // variations so we don't miss "HEMI" vs "Hemi". Cheap to widen the
    // hasSome list; the JS filter below tightens it.
    const engVariants = new Set<string>();
    for (const e of allEngines) {
      engVariants.add(e);
      engVariants.add(e.toUpperCase());
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const titleCase = e.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      engVariants.add(titleCase);
    }
    orClauses.push({ engines: { hasSome: [...engVariants] } });
  }

  // Add semantic-neighbor ids to the OR clause too — pre-computed by
  // the embeddings script with a structural pre-filter, so anything in
  // here is already validated as both content-similar AND structurally
  // related.
  if (allSemanticIds.size > 0) {
    orClauses.push({ id: { in: [...allSemanticIds] } });
  }

  const candidates = await prisma.knownIssue.findMany({
    where: {
      OR: orClauses,
      NOT: {
        AND: [
          { make: { equals: excludeMake, mode: 'insensitive' } },
          { model: { equals: excludeModel, mode: 'insensitive' } },
        ],
      },
      status: 'published',
    },
    select: {
      id: true,
      make: true,
      model: true,
      title: true,
      dtcCodes: true,
      engines: true,
      severity: true,
    },
    take: 400,
  });

  for (const issue of issues) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const issueDtcs = new Set(((issue as any).dtcCodes || []).map((d: string) => d.toUpperCase()));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const issueEngs = new Set(((issue as any).engines || []).map((e: string) => e.toLowerCase()));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const issueSemanticIds = new Set(((issue as any).relatedIssueIds || []) as string[]);
    if (issueDtcs.size === 0 && issueEngs.size === 0 && issueSemanticIds.size === 0) continue;

    const matched = candidates.filter((c) => {
      if (c.dtcCodes.some((d) => issueDtcs.has(d.toUpperCase()))) return true;
      if (c.engines.some((e) => issueEngs.has(e.toLowerCase()))) return true;
      if (issueSemanticIds.has(c.id)) return true;
      return false;
    });

    matched.sort((a, b) => {
      const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      return (order[a.severity] ?? 4) - (order[b.severity] ?? 4);
    });

    const seen = new Set<string>();
    const related: RelatedIssueVehicle[] = [];
    for (const c of matched) {
      const key = `${c.make.toLowerCase()}|${c.model.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      related.push({
        slug: makeSlug(c.make, c.model),
        make: c.make,
        model: c.model,
        issueId: c.id,
        title: c.title,
      });
      if (related.length >= perIssueLimit) break;
    }
    result.set(issue.id, related);
  }

  return result;
}

// --- Normalization (kept for seed script and API compatibility) ---

const validCategories = ['engine','transmission','drivetrain','electrical','brakes','suspension','cooling','fuel','interior','exterior','body','safety','other'];
const categoryMap: Record<string, string> = {
  'steering': 'suspension', 'Steering': 'suspension',
  'hvac': 'cooling', 'Climate Control': 'cooling',
  'fuel_system': 'fuel', 'Fuel System': 'fuel',
  'exhaust': 'engine', 'emissions': 'engine',
};

export function normalizeCategory(cat: string | undefined): string {
  if (!cat) return 'other';
  const lower = cat.toLowerCase();
  if (validCategories.includes(lower)) return lower;
  if (categoryMap[cat]) return categoryMap[cat];
  return 'other';
}

export function normalizeSeverity(sev: string | undefined): 'high' | 'medium' | 'low' {
  if (!sev) return 'medium';
  const lower = sev.toLowerCase();
  if (lower === 'critical' || lower === 'high') return 'high';
  if (lower === 'moderate' || lower === 'medium') return 'medium';
  if (lower === 'low') return 'low';
  return 'medium';
}

export function normalizeConfidence(conf: any): 'high' | 'medium' | 'low' {
  if (!conf) return 'medium';
  if (typeof conf === 'number') {
    if (conf >= 85) return 'high';
    if (conf >= 60) return 'medium';
    return 'low';
  }
  const lower = String(conf).toLowerCase();
  if (lower === 'high') return 'high';
  if (lower === 'low') return 'low';
  return 'medium';
}

export function normalizeStatus(s: string | undefined): string {
  if (!s || s === 'active') return 'published';
  return s;
}

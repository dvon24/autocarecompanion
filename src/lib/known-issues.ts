import { KnownIssue } from '@/schemas/knownIssue.schema';
import prisma from '@/lib/db';

// --- DB row to KnownIssue shape ---

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
    category: row.category,
    title: row.title,
    description: row.description,
    solution: row.solution,
    severity: row.severity,
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
  } as KnownIssue;
}

// --- Slug utilities ---

export function makeSlug(make: string, model: string): string {
  return `${make} ${model}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
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
  return {
    published: (result._min.createdAt || new Date()).toISOString().split('T')[0],
    modified: (result._max.updatedAt || new Date()).toISOString().split('T')[0],
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

  return Array.from(map.entries()).map(([slug, data]) => ({
    slug,
    ...data,
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
 * own KnownIssue records share a DTC code with it. This creates the
 * "this issue also affects: [Dodge Journey, Chrysler Town & Country]"
 * cross-link block that Gemini flagged as a way to push Google past
 * "Discovered, not indexed" — the hub-and-spoke effect tells crawlers
 * that the same engineering defect is documented across multiple
 * pages, so each page is genuinely about something specific.
 *
 * Single batched Prisma query — we OR-merge every DTC across the
 * current page's issues, fetch matching rows, then group in JS. Avoids
 * N+1 per issue. Returns Map<issueId, RelatedIssueVehicle[]>.
 *
 * Issues without DTC codes get an empty array (graceful degradation).
 * v2 could supplement with title-token matching (B58, LT4, 62TE) but
 * that needs a precomputed token index to stay cheap.
 */
export async function findRelatedVehiclesForIssues(
  issues: KnownIssue[],
  excludeMake: string,
  excludeModel: string,
  perIssueLimit = 3,
): Promise<Map<string, RelatedIssueVehicle[]>> {
  const result = new Map<string, RelatedIssueVehicle[]>();
  for (const i of issues) result.set(i.id, []);

  // Collect all DTC codes across current issues, normalized to upper-case.
  const allDtcs = new Set<string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const i of issues as any[]) {
    if (Array.isArray(i.dtcCodes)) {
      for (const d of i.dtcCodes) {
        if (typeof d === 'string' && d.length > 0) allDtcs.add(d.toUpperCase());
      }
    }
  }
  if (allDtcs.size === 0) return result;

  const candidates = await prisma.knownIssue.findMany({
    where: {
      dtcCodes: { hasSome: [...allDtcs] },
      NOT: {
        AND: [
          { make: { equals: excludeMake, mode: 'insensitive' } },
          { model: { equals: excludeModel, mode: 'insensitive' } },
        ],
      },
      status: 'published',
    },
    select: { id: true, make: true, model: true, title: true, dtcCodes: true, severity: true },
    take: 300,
  });

  // For each current issue, pick its candidates: those sharing at least
  // one DTC. Dedupe by make+model so we link to one card per vehicle even
  // if that vehicle has multiple matching issues.
  for (const issue of issues) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const issueDtcs = new Set(((issue as any).dtcCodes || []).map((d: string) => d.toUpperCase()));
    if (issueDtcs.size === 0) continue;

    const matched = candidates.filter((c) =>
      c.dtcCodes.some((d) => issueDtcs.has(d.toUpperCase())),
    );

    // Sort: prefer high-severity matches first (more likely to be the
    // SAME root cause, not just a coincidental code overlap).
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

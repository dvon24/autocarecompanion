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
    citations: row.citations as any[],
    communityRecommendations: row.communityRecommendations as any[],
    humanApproved: row.humanApproved,
    lastReportedByOwners: row.lastReportedByOwners,
    reviewedOn: row.reviewedOn,
    reportCount: row.reportCount,
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

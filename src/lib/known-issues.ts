import { KnownIssue } from '@/schemas/knownIssue.schema';
import knownIssuesData from '@/data/known-issues.json';

// --- Normalization (shared with API route) ---

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

export function normalizeIssue(issue: any): KnownIssue {
  const ec = issue.estimatedCost;
  const normalizedCost = ec
    ? { low: ec.low ?? ec.min ?? 0, high: ec.high ?? ec.max ?? 0 }
    : undefined;

  // Already in legacy format
  if (issue.vehicleMatch) {
    return {
      ...issue,
      category: normalizeCategory(issue.category),
      severity: normalizeSeverity(issue.severity),
      estimatedCost: normalizedCost,
      symptoms: issue.symptoms || [],
      citations: issue.citations || [],
      solution: issue.solution || '',
      confidence: normalizeConfidence(issue.confidence),
      reportCount: issue.reportCount || 0,
      status: normalizeStatus(issue.status),
      dtcCodes: issue.dtcCodes || [],
    } as KnownIssue;
  }

  // Convert new format to legacy format
  const years = issue.years as { start: number; end: number };
  const yearArray: number[] = [];
  for (let y = years.start; y <= years.end; y++) {
    yearArray.push(y);
  }

  return {
    id: issue.id,
    vehicleMatch: {
      years: yearArray,
      make: issue.make,
      model: issue.model,
      ...(issue.trims ? { trims: issue.trims } : {}),
    },
    category: normalizeCategory(issue.category),
    title: issue.title,
    description: issue.description,
    solution: issue.solution || '',
    severity: normalizeSeverity(issue.severity),
    confidence: issue.confidence || 'medium',
    symptoms: issue.symptoms || [],
    affectedSystems: issue.affectedSystems,
    estimatedCost: normalizedCost,
    citations: issue.citations || [],
    communityRecommendations: issue.communityRecommendations,
    humanApproved: issue.humanApproved ?? false,
    lastReportedByOwners: issue.lastReportedByOwners || issue.reviewedOn || '',
    reviewedOn: issue.reviewedOn || '',
    reportCount: issue.reportCount || 0,
    status: normalizeStatus(issue.status),
    dtcCodes: issue.dtcCodes || [],
  } as KnownIssue;
}

// --- Slug utilities ---

function makeSlug(make: string, model: string): string {
  return `${make} ${model}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/** Lazy-built lookup map from slug to {make, model} */
let slugMap: Map<string, { make: string; model: string }> | null = null;

function buildSlugMap(): Map<string, { make: string; model: string }> {
  if (slugMap) return slugMap;
  slugMap = new Map();
  for (const issue of (knownIssuesData.issues as any[])) {
    const issueMake = issue.vehicleMatch?.make || issue.make;
    const issueModel = issue.vehicleMatch?.model || issue.model;
    if (!issueMake || !issueModel) continue;
    const slug = makeSlug(issueMake, issueModel);
    if (!slugMap.has(slug)) {
      slugMap.set(slug, { make: issueMake, model: issueModel });
    }
  }
  return slugMap;
}

/** Parse a slug back to {make, model}. Returns null if not found. */
export function parseSlug(slug: string): { make: string; model: string } | null {
  return buildSlugMap().get(slug) || null;
}

/** Get all unique slugs for static generation. */
export function getAllKnownIssueSlugs(): { slug: string; make: string; model: string }[] {
  const map = buildSlugMap();
  return Array.from(map.entries()).map(([slug, { make, model }]) => ({ slug, make, model }));
}

// --- Article data loading ---

function issueMatchesMakeModel(issue: any, make: string, model: string): boolean {
  // New format
  if (!issue.vehicleMatch && issue.make && issue.model) {
    if (issue.make.toLowerCase() !== make.toLowerCase()) return false;
    const mLow = model.toLowerCase();
    const iLow = (issue.model as string).toLowerCase();
    return mLow.includes(iLow) || iLow.includes(mLow);
  }
  // Legacy format
  const match = issue.vehicleMatch;
  if (!match) return false;
  if (match.make.toLowerCase() !== make.toLowerCase()) return false;
  const mLow = model.toLowerCase();
  const matchLow = match.model.toLowerCase();
  return mLow.includes(matchLow) || matchLow.includes(mLow);
}

const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

/** Get all published issues for a make+model across ALL years. */
export function getKnownIssuesForArticle(make: string, model: string): KnownIssue[] {
  return (knownIssuesData.issues as any[])
    .filter(issue => issueMatchesMakeModel(issue, make, model))
    .map(normalizeIssue)
    .filter(issue => issue.status === 'published')
    .sort((a, b) => {
      const sevDiff = (severityOrder[a.severity] ?? 2) - (severityOrder[b.severity] ?? 2);
      if (sevDiff !== 0) return sevDiff;
      return b.reportCount - a.reportCount;
    });
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

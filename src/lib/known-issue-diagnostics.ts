import type { DiagnosticStep, KnownIssue } from '@/schemas/knownIssue.schema';
import { fixPartSchema, communityRecommendationSchema } from '@/schemas/knownIssue.schema';
import type { DtcTriage, DtcTriageBranch } from '@/lib/dtc-codes';
import { externalHttpUrl } from '@/lib/external-http-url';

export const diagVisible = (status: string | null | undefined) =>
  status === 'published';

const record = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

/** Withhold malformed commerce lists as a whole, including their recall gate;
 * dropping just one broken recall marker could expose the remaining offers. */
export function readFixParts(value: unknown): NonNullable<KnownIssue['fixParts']> {
  const result = fixPartSchema.array().safeParse(value);
  return result.success ? result.data : [];
}

export function readCommunityRecommendations(value: unknown): NonNullable<KnownIssue['communityRecommendations']> {
  if (!Array.isArray(value)) return [];
  return value.flatMap(row => {
    if (!record(row)) return [];
    // Only these text fields reach public owner guidance. Legacy ancillary
    // fields must not erase usable advice or its valid neighboring entries.
    if ((row.type === 'tip' || row.type === 'warning') && typeof row.content === 'string') {
      return [{ type: row.type, content: row.content, upvotes: 0 }];
    }
    const result = communityRecommendationSchema.safeParse(row);
    return result.success && result.data.type === 'part' ? [result.data] : [];
  });
}

function timestamp(value: unknown): number | null {
  if (!(value instanceof Date) && !text(value)) return null;
  const result = new Date(value as string).getTime();
  return Number.isFinite(result) ? result : null;
}

/** Reject a malformed procedure as a whole: removing an intermediate check
 * could change the meaning of the remaining instructions. Sources are optional
 * navigation, so an unsafe source is omitted while its instruction stays text. */
export function readDiagnosticSteps(value: unknown): DiagnosticStep[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const steps: DiagnosticStep[] = [];
  for (const row of value) {
    if (!record(row) || !Number.isInteger(row.step) || (row.step as number) < 1 || !text(row.action)) return undefined;
    const step = row.step as number;
    if (step !== steps.length + 1) return undefined;
    const result: DiagnosticStep = { step, action: row.action.trim() };
    for (const key of ['tool', 'expect', 'ifFail'] as const) {
      if (row[key] !== undefined && row[key] !== null && typeof row[key] !== 'string') return undefined;
      if (text(row[key])) result[key] = row[key].trim();
    }
    const source = externalHttpUrl(row.sourceUrl);
    if (source) result.sourceUrl = source;
    steps.push(result);
  }
  return steps;
}

/** Legacy triage is usable only when its complete branch set still points to
 * displayed, published issues. Holding the entire row also withholds stale
 * introduction/FAQ claims when even one branch has disappeared. */
export function readDtcTriage(value: unknown, code: string, make: string, displayedIssues: readonly (KnownIssue & { updatedAt?: unknown })[]): DtcTriage | null {
  if (!record(value) || !text(value.code) || !text(value.make)
    || value.code.toUpperCase() !== code.toUpperCase() || value.make.toLowerCase() !== make.toLowerCase()
    || !text(value.intro) || !text(value.firstCheck) || !Array.isArray(value.branches) || value.branches.length === 0
    || (value.scanToolNotes !== undefined && value.scanToolNotes !== null && typeof value.scanToolNotes !== 'string')) return null;
  const available = new Set(displayedIssues.filter(issue => issue.status === 'published'
    && issue.vehicleMatch.make.toLowerCase() === make.toLowerCase()
    && issue.dtcCodes?.some(item => item.toUpperCase() === code.toUpperCase())).map(issue => issue.id));
  // Intro and first-check guidance may use source rows that have no branch.
  // Hold the complete triage if any part of that provenance is stale or absent.
  if (!Array.isArray(value.sourceIssueIds) || value.sourceIssueIds.length === 0
    || value.sourceIssueIds.some(id => !text(id) || !available.has(id))) return null;
  const sourceIds = new Set(value.sourceIssueIds);
  const reviewedAt = timestamp(value.updatedAt);
  if (reviewedAt === null || displayedIssues.some(issue => {
    if (!sourceIds.has(issue.id)) return false;
    const changedAt = timestamp(issue.updatedAt);
    return changedAt === null || changedAt > reviewedAt;
  })) return null;
  const branches: DtcTriageBranch[] = [];
  const seen = new Set<string>();
  for (const branch of value.branches) {
    if (!record(branch) || !text(branch.issueId) || !text(branch.issueTitle) || !text(branch.condition) || !text(branch.why)
      || !available.has(branch.issueId) || !sourceIds.has(branch.issueId) || seen.has(branch.issueId)) return null;
    seen.add(branch.issueId);
    branches.push({ issueId: branch.issueId, issueTitle: branch.issueTitle.trim(), condition: branch.condition.trim(), why: branch.why.trim() });
  }
  const updatedAt = new Date(reviewedAt);
  return { code: value.code, make: value.make, intro: value.intro.trim(), firstCheck: value.firstCheck.trim(), branches,
    scanToolNotes: typeof value.scanToolNotes === 'string' ? value.scanToolNotes.trim() : '', updatedAt };
}

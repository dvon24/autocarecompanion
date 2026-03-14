import dtcData from '@/data/dtc-codes.json';
import knownIssuesData from '@/data/known-issues.json';
import { normalizeIssue } from './known-issues';
import { KnownIssue } from '@/schemas/knownIssue.schema';

export interface DTCCodeInfo {
  code: string;
  name: string;
  system: string;
  description: string;
  commonCauses: string[];
  severity: string;
}

export interface DTCWithIssues extends DTCCodeInfo {
  issues: (KnownIssue & { slug: string })[];
  vehicleCount: number;
  makes: string[];
}

const dtcRef = dtcData as Record<string, Omit<DTCCodeInfo, 'code'>>;

function makeSlug(make: string, model: string): string {
  return `${make} ${model}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/** Get info for a single DTC code. Returns null if code isn't in our reference. */
export function getDTCInfo(code: string): DTCCodeInfo | null {
  const upper = code.toUpperCase();
  const info = dtcRef[upper];
  if (!info) return null;
  return { code: upper, ...info };
}

/** Get all DTC codes that appear in our known issues data. */
export function getAllDTCCodes(): string[] {
  const codes = new Set<string>();
  for (const issue of (knownIssuesData.issues as any[])) {
    for (const code of (issue.dtcCodes || [])) {
      codes.add(code.toUpperCase());
    }
  }
  return Array.from(codes).sort();
}

/** Get all DTC codes that have reference data (for static generation). */
export function getAllDTCSlugs(): { code: string }[] {
  const codesInIssues = getAllDTCCodes();
  return codesInIssues
    .filter(code => dtcRef[code])
    .map(code => ({ code: code.toLowerCase() }));
}

/** Get full DTC data including all related vehicle issues. */
export function getDTCWithIssues(code: string): DTCWithIssues | null {
  const upper = code.toUpperCase();
  const info = dtcRef[upper];
  if (!info) return null;

  const matchingIssues: (KnownIssue & { slug: string })[] = [];
  const makeSet = new Set<string>();

  for (const raw of (knownIssuesData.issues as any[])) {
    if (!raw.dtcCodes || !raw.dtcCodes.includes(upper)) continue;
    const issue = normalizeIssue(raw);
    if (issue.status !== 'published') continue;
    const make = issue.vehicleMatch.make;
    const model = issue.vehicleMatch.model;
    makeSet.add(make);
    matchingIssues.push({ ...issue, slug: makeSlug(make, model) });
  }

  // Sort by report count descending
  matchingIssues.sort((a, b) => b.reportCount - a.reportCount);

  // Count unique vehicle models
  const vehicleSet = new Set(matchingIssues.map(i => `${i.vehicleMatch.make}|${i.vehicleMatch.model}`));

  return {
    code: upper,
    ...info,
    issues: matchingIssues,
    vehicleCount: vehicleSet.size,
    makes: Array.from(makeSet).sort(),
  };
}

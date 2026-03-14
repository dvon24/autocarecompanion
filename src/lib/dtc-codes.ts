import prisma from '@/lib/db';
import { KnownIssue } from '@/schemas/knownIssue.schema';
import { makeSlug } from './known-issues';

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

/** Get info for a single DTC code. Returns null if code isn't in our reference. */
export async function getDTCInfo(code: string): Promise<DTCCodeInfo | null> {
  const row = await prisma.dTCCode.findUnique({
    where: { code: code.toUpperCase() },
  });
  if (!row) return null;
  return {
    code: row.code,
    name: row.name,
    system: row.system,
    description: row.description,
    commonCauses: row.commonCauses,
    severity: row.severity,
  };
}

/** Get all DTC codes that appear in our known issues data. */
export async function getAllDTCCodes(): Promise<string[]> {
  const rows = await prisma.knownIssue.findMany({
    where: { status: 'published' },
    select: { dtcCodes: true },
  });
  const codes = new Set<string>();
  for (const row of rows) {
    for (const code of row.dtcCodes) {
      codes.add(code.toUpperCase());
    }
  }
  return Array.from(codes).sort();
}

/** Get all DTC codes that have reference data (for static generation). */
export async function getAllDTCSlugs(): Promise<{ code: string }[]> {
  const codesInIssues = await getAllDTCCodes();

  const existingDTCs = await prisma.dTCCode.findMany({
    where: { code: { in: codesInIssues } },
    select: { code: true },
  });

  return existingDTCs
    .map(d => ({ code: d.code.toLowerCase() }))
    .sort((a, b) => a.code.localeCompare(b.code));
}

/** Get full DTC data including all related vehicle issues. */
export async function getDTCWithIssues(code: string): Promise<DTCWithIssues | null> {
  const upper = code.toUpperCase();
  const dtc = await prisma.dTCCode.findUnique({ where: { code: upper } });
  if (!dtc) return null;

  const rows = await prisma.knownIssue.findMany({
    where: {
      dtcCodes: { has: upper },
      status: 'published',
    },
    orderBy: { reportCount: 'desc' },
  });

  const issues = rows.map(r => ({
    ...dbRowToKnownIssue(r),
    slug: makeSlug(r.make, r.model),
  }));

  const makeSet = new Set(rows.map(r => r.make));
  const vehicleSet = new Set(rows.map(r => `${r.make}|${r.model}`));

  return {
    code: upper,
    name: dtc.name,
    system: dtc.system,
    description: dtc.description,
    commonCauses: dtc.commonCauses,
    severity: dtc.severity,
    issues,
    vehicleCount: vehicleSet.size,
    makes: Array.from(makeSet).sort(),
  };
}

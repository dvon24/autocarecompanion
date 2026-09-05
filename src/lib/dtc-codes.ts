import prisma from '@/lib/db';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { KnownIssue } from '@/schemas/knownIssue.schema';
import { makeSlug, LAYOUT_LAST_REVISED } from './known-issues';
import { filterableKnownIssueTrims } from './known-issue-trim-filter';

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
  const trims = filterableKnownIssueTrims(row.trims);
  return {
    id: row.id,
    vehicleMatch: {
      years: row.years,
      make: row.make,
      model: row.model,
      ...(trims.length > 0 ? { trims } : {}),
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
    fixParts: (row.fixParts as KnownIssue['fixParts']) || [],
    source: row.source || 'ai-researched',
    humanApproved: row.humanApproved,
    lastReportedByOwners: row.lastReportedByOwners,
    reviewedOn: row.reviewedOn,
    contentUpdatedOn: row.contentUpdatedOn || '',
    contentUpdateSummary: row.contentUpdateSummary || '',
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

// vehicleType: 'car' on every read below — the DTC surface is OBD-II, i.e. automotive. Motorcycle
// rows carry maker-specific FI codes (Suzuki C41, Honda FI-7) that never match the library, but a
// bike tagged with a real P-code (a Harley stator issue on P0562) would otherwise mint itself onto
// the car code page and into the car sitemap. See KnownIssue.vehicleType.
const CAR = { vehicleType: 'car' } as const;

/** Get all DTC codes that appear in our known issues data. */
export async function getAllDTCCodes(): Promise<string[]> {
  const rows = await prisma.knownIssue.findMany({
    where: { status: 'published', ...CAR },
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

/**
 * Lowercase codes that have a real /known-issues/dtc/[code] page (i.e. a
 * DTCCode reference row exists). Issue-card DTC chips must only LINK codes
 * in this list — ~70 codes cited by issues have no reference row, and
 * linking them creates internal links to 404s from thousands of article
 * pages (a chunk of the GSC "Crawled — currently not indexed" report).
 * Cached 1h; React cache() dedupes within a single render pass.
 */
export const getLinkableDtcCodes = cache(
  unstable_cache(
    async (): Promise<string[]> => {
      const slugs = await getAllDTCSlugs();
      return slugs.map((s) => s.code);
    },
    ['linkable-dtc-codes'],
    { revalidate: 3600 },
  ),
);

/**
 * Minimum vehicle-specific word count for a /known-issues/dtc/[code] page to
 * be worth indexing.
 *
 * "Unique" means the words WE wrote about real vehicles — issue title,
 * description, solution and symptoms. It excludes the DTC reference block
 * (name/description/commonCauses), which is the generic text every other DTC
 * site also publishes and is not a reason for Google to rank us.
 *
 * A 2026-09-04 audit (scripts/_audit-dtc-thin.cjs) found 552 of 1,168
 * rendering pages backed by a single issue, median 185 unique words, and a
 * floor of ~73-word pages wrapped in 137 words of boilerplate. GSC filed a
 * sample of those as soft 404s — correctly. Below this bar we keep the page
 * live and crawlable but tell Google not to index it, rather than asking it
 * to rank something we would not defend.
 *
 * Self-healing by design: the bar is evaluated from live data, so a page
 * starts indexing itself as soon as a research wave adds a second vehicle.
 * Raising the bar is a one-line change; see the audit script for the counts
 * at each threshold.
 */
export const DTC_MIN_UNIQUE_WORDS = 150;

/**
 * Codes whose page falls below DTC_MIN_UNIQUE_WORDS. Computed in Postgres —
 * summing word counts over every published issue's text in Node would drag
 * ~10k rows of prose across the wire on a surface we already had to tune for
 * Supabase CPU. Cached hourly and shared by the page's robots meta and the
 * sitemap so the two can never disagree (advertising a noindex URL in the
 * sitemap is a contradiction Google reports as its own error).
 *
 * Splits on the POSIX class rather than \s: Prisma's tagged-template escaping
 * strips the backslash, so '\s+' reaches Postgres as 's+' and silently splits
 * on the letter "s" — which undercounts every page by ~3x and would have
 * noindexed 716 pages instead of 112.
 */
export const getThinDtcCodes = cache(
  unstable_cache(
    async (): Promise<string[]> => {
      const rows = await prisma.$queryRaw<{ code: string }[]>`
        SELECT c.code
        FROM "KnownIssue" k, unnest(k."dtcCodes") AS c(code)
        WHERE k.status = 'published' AND k."vehicleType" = 'car'
        GROUP BY c.code
        HAVING SUM(
          COALESCE(array_length(regexp_split_to_array(
            trim(
              COALESCE(k.title, '') || ' ' ||
              COALESCE(k.description, '') || ' ' ||
              COALESCE(k.solution, '') || ' ' ||
              COALESCE(array_to_string(k.symptoms, ' '), '')
            ), '[[:space:]]+'), 1), 0)
        ) < ${DTC_MIN_UNIQUE_WORDS}
      `;
      return rows.map((r) => r.code.toUpperCase());
    },
    ['thin-dtc-codes'],
    { revalidate: 3600 },
  ),
);

export interface DTCDirectoryEntry {
  code: string;
  name: string;
  system: string;
  severity: string;
}

/**
 * Directory of every DTC code that has a real page — i.e. codes that have
 * reference data AND appear in at least one published KnownIssue (the
 * /known-issues/dtc/[code] route 404s codes with no linked issues, so we
 * only list ones that won't dead-end). Powers the /known-issues/dtc index.
 */
export async function getDTCDirectory(): Promise<DTCDirectoryEntry[]> {
  const codesInIssues = await getAllDTCCodes(); // codes in published issues
  if (codesInIssues.length === 0) return [];
  const rows = await prisma.dTCCode.findMany({
    where: { code: { in: codesInIssues } },
    select: { code: true, name: true, system: true, severity: true },
    orderBy: { code: 'asc' },
  });
  return rows;
}

/** Get the createdAt/updatedAt dates for a single DTC code (for JSON-LD). */
export async function getDTCDates(code: string): Promise<{ published: string; modified: string }> {
  const dtc = await prisma.dTCCode.findUnique({
    where: { code: code.toUpperCase() },
    select: { createdAt: true, updatedAt: true },
  });
  const dataModified = (dtc?.updatedAt || new Date()).toISOString().split('T')[0];
  // Mirror getArticleDates: bump dateModified to LAYOUT_LAST_REVISED when
  // the render layer was touched more recently than the data, so Google
  // sees a fresh signal and re-crawls. Same logic, different route.
  const modified = dataModified > LAYOUT_LAST_REVISED ? dataModified : LAYOUT_LAST_REVISED;
  return {
    published: (dtc?.createdAt || new Date()).toISOString().split('T')[0],
    modified,
  };
}

/** Get all DTC slugs with their updatedAt date (for sitemap). */
export async function getAllDTCSlugsWithDates(): Promise<{ code: string; lastModified: Date }[]> {
  const [codesInIssues, thin] = await Promise.all([getAllDTCCodes(), getThinDtcCodes()]);

  // Never advertise a URL we serve with robots noindex — Google reports that
  // contradiction as its own error and it wastes crawl budget we would rather
  // spend on the 1,000+ pages that are worth ranking. Same predicate the page
  // uses, so the two surfaces cannot drift apart.
  const thinSet = new Set(thin);
  const indexable = codesInIssues.filter(c => !thinSet.has(c));

  const existingDTCs = await prisma.dTCCode.findMany({
    where: { code: { in: indexable } },
    select: { code: true, updatedAt: true },
  });

  // Same dateModified bump as the vehicle pages — every DTC URL in
  // /sitemap.xml advertises today's lastmod after a layout revision.
  const layoutDate = new Date(LAYOUT_LAST_REVISED + 'T00:00:00Z');
  return existingDTCs
    .map(d => ({
      code: d.code.toLowerCase(),
      lastModified: d.updatedAt > layoutDate ? d.updatedAt : layoutDate,
    }))
    .sort((a, b) => a.code.localeCompare(b.code));
}

/**
 * Get related DTC codes for cross-linking (same series + same system).
 *
 * IMPORTANT: only codes that have a page. The DTC library holds 3,320 codes
 * but /known-issues/dtc/[code] 404s any code with no published issue behind
 * it (1,168 qualify). Drawing "Related Codes" from the raw library therefore
 * sprayed dead internal links across the catalog: a 2026-09-04 audit
 * (scripts/_audit-dtc-related-links.cjs) measured 2,312 of 8,894 rendered
 * links (26%) pointing at a 404, on 634 of 1,168 pages. Google crawled them
 * and filed the targets as soft 404s. Gate both strategies on the linkable
 * set — it's the cached codes-with-pages list, so this costs no extra query.
 */
export async function getRelatedDTCCodes(code: string, limit = 8): Promise<{ code: string; name: string; system: string }[]> {
  const upper = code.toUpperCase();

  // Get the current code's info for system matching
  const current = await prisma.dTCCode.findUnique({ where: { code: upper }, select: { system: true } });
  if (!current) return [];

  const linkable = (await getLinkableDtcCodes()).map(c => c.toUpperCase());
  if (linkable.length === 0) return [];

  // Strategy 1: Same prefix codes (e.g., P030x for P0300)
  const prefix = upper.slice(0, 4); // e.g., "P030"
  const sameSeries = await prisma.dTCCode.findMany({
    where: {
      code: { startsWith: prefix, not: upper, in: linkable },
    },
    select: { code: true, name: true, system: true },
    take: 4,
  });

  // Strategy 2: Same system, different series
  const sameSystem = await prisma.dTCCode.findMany({
    where: {
      system: current.system,
      code: { in: linkable },
      NOT: [
        { code: upper },
        { code: { startsWith: prefix } },
      ],
    },
    select: { code: true, name: true, system: true },
    take: limit - sameSeries.length,
  });

  // Combine, deduplicate, and limit
  const seen = new Set<string>([upper]);
  const results: { code: string; name: string; system: string }[] = [];

  for (const item of [...sameSeries, ...sameSystem]) {
    if (!seen.has(item.code) && results.length < limit) {
      seen.add(item.code);
      results.push(item);
    }
  }

  return results;
}

/** Get full DTC data including all related vehicle issues. */
async function getDTCWithIssuesImpl(code: string): Promise<DTCWithIssues | null> {
  const upper = code.toUpperCase();
  const dtc = await prisma.dTCCode.findUnique({ where: { code: upper } });
  if (!dtc) return null;

  const rows = await prisma.knownIssue.findMany({
    where: {
      dtcCodes: { has: upper },
      status: 'published',
      ...CAR,
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

/**
 * Per-make variant of getDTCWithIssues. Returns only the issues from the
 * specified make. Used for /known-issues/dtc/[code]/[make] pages which
 * target queries like "ford p0a09" or "honda p0420" (where the user wants
 * make-specific context, not a generic DTC reference).
 *
 * Returns null if the DTC doesn't exist OR if no published KnownIssue links
 * that DTC to that make (avoids generating empty pages).
 */
async function getDTCWithIssuesForMakeImpl(
  code: string,
  make: string,
): Promise<DTCWithIssues | null> {
  const upper = code.toUpperCase();
  const dtc = await prisma.dTCCode.findUnique({ where: { code: upper } });
  if (!dtc) return null;

  const rows = await prisma.knownIssue.findMany({
    where: {
      dtcCodes: { has: upper },
      status: 'published',
      make: { equals: make, mode: 'insensitive' },
      ...CAR,
    },
    orderBy: { reportCount: 'desc' },
  });

  if (rows.length === 0) return null;

  const issues = rows.map(r => ({
    ...dbRowToKnownIssue(r),
    slug: makeSlug(r.make, r.model),
  }));

  // Use the make name from actual data (correctly cased) instead of the
  // URL slug to avoid "FORD" vs "Ford" mismatches in titles.
  const actualMake = rows[0].make;
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
    makes: [actualMake],
  };
}

/**
 * Get all unique (DTC code, make) pairs that have at least one published
 * KnownIssue linking them. Used by generateStaticParams() on the per-make-
 * DTC route to produce only pages that have real content (filters the
 * combinatorial explosion to ~2,000 real pages).
 */
export async function getAllDTCMakeSlugs(): Promise<{ code: string; make: string }[]> {
  const rows = await prisma.$queryRaw<{ make: string; dtc: string }[]>`
    SELECT DISTINCT make, dtc
    FROM (
      SELECT make, unnest("dtcCodes") as dtc
      FROM "KnownIssue"
      WHERE status = 'published'
        AND "vehicleType" = 'car'
        AND "dtcCodes" IS NOT NULL
        AND array_length("dtcCodes", 1) > 0
    ) sub
    WHERE dtc ~ '^[CPUB]?[0-9A-F]{4,5}$'
    ORDER BY make, dtc
  `;

  // The shape regex above says a code LOOKS like a DTC, not that we have one.
  // /dtc/[code]/[make] 404s any code missing from the library, so without this
  // the sitemap advertised make pages for codes that can never render. Also
  // drop the pairs below the content bar, for the same reason the code-level
  // sitemap does.
  const [library, thin] = await Promise.all([
    prisma.dTCCode.findMany({ select: { code: true } }),
    getThinDtcMakeKeys(),
  ]);
  const known = new Set(library.map(d => d.code));
  const thinSet = new Set(thin);

  return rows
    .filter(r => known.has(r.dtc.toUpperCase()))
    .map(r => ({ code: r.dtc.toLowerCase(), make: makeToSlug(r.make) }))
    .filter(r => !thinSet.has(`${r.code.toUpperCase()}|${r.make}`));
}

/**
 * `CODE|make-slug` keys for per-make DTC pages below DTC_MIN_UNIQUE_WORDS.
 * The make page shows a subset of its parent code page's issues, so it is
 * always the thinner of the two: 638 of 3,829 fall under the bar even though
 * only 112 of 1,168 code pages do. Same treatment, same reason.
 */
export const getThinDtcMakeKeys = cache(
  unstable_cache(
    async (): Promise<string[]> => {
      const rows = await prisma.$queryRaw<{ code: string; make: string }[]>`
        SELECT c.code, k.make
        FROM "KnownIssue" k, unnest(k."dtcCodes") AS c(code)
        WHERE k.status = 'published' AND k."vehicleType" = 'car'
        GROUP BY c.code, k.make
        HAVING SUM(
          COALESCE(array_length(regexp_split_to_array(
            trim(
              COALESCE(k.title, '') || ' ' ||
              COALESCE(k.description, '') || ' ' ||
              COALESCE(k.solution, '') || ' ' ||
              COALESCE(array_to_string(k.symptoms, ' '), '')
            ), '[[:space:]]+'), 1), 0)
        ) < ${DTC_MIN_UNIQUE_WORDS}
      `;
      return rows.map(r => `${r.code.toUpperCase()}|${makeToSlug(r.make)}`);
    },
    ['thin-dtc-make-keys'],
    { revalidate: 3600 },
  ),
);

/** Convert a make name to a URL-safe slug. */
export function makeToSlug(make: string): string {
  return make.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/** Convert a make slug back to a display name (looks up the actual case). */
export async function slugToMake(slug: string): Promise<string | null> {
  const rows = await prisma.knownIssue.findMany({
    where: { status: 'published', ...CAR },
    select: { make: true },
    distinct: ['make'],
  });
  const match = rows.find(r => makeToSlug(r.make) === slug);
  return match?.make ?? null;
}

// Request-scoped memoization: generateMetadata and the page component
// each called getDTCWithIssues for the same params, doubling DB load on every
// render/build (2026-06-12 review finding).
export const getDTCWithIssues = cache(getDTCWithIssuesImpl);

// Request-scoped memoization: generateMetadata and the page component
// each called getDTCWithIssuesForMake for the same params, doubling DB load on every
// render/build (2026-06-12 review finding).
export const getDTCWithIssuesForMake = cache(getDTCWithIssuesForMakeImpl);

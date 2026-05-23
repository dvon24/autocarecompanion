/**
 * Source-attribution copy helpers.
 *
 * Earlier versions of our known-issues pages hardcoded "X+ owner reports"
 * everywhere, which read as "0+ owner reports" for any vehicle where we
 * don't have aggregated user-reported data (everything we research
 * directly via AI + WebSearch + NHTSA — including all 2026 EU/EV
 * additions). Misrepresents the source and erodes credibility.
 *
 * These helpers return honest copy depending on whether we actually
 * have owner-report aggregation for that vehicle.
 */

/**
 * Inline data-source label for "X model years · LABEL · Updated Y".
 * Used in article header/subheader strips.
 */
export function sourceLabel(reportCount: number): string {
  if (reportCount > 0) {
    return `${reportCount.toLocaleString()}+ owner reports`;
  }
  return 'NHTSA recalls, manufacturer TSBs, and owner forum reports';
}

/**
 * Full sentence framing for the GEO/AI-summary blockquote.
 * Subject of "According to..." style sentences.
 */
export function analysisAttribution(reportCount: number): string {
  if (reportCount > 0) {
    return `Au7o's analysis of ${reportCount.toLocaleString()}+ owner reports`;
  }
  return `Au7o's research across NHTSA recalls, manufacturer TSBs, and owner forum reports`;
}

/**
 * Footer/sidebar sourcing footnote.
 */
export function sourceFootnote(reportCount: number): string {
  if (reportCount > 0) {
    return `Data sourced from ${reportCount.toLocaleString()}+ owner reports, NHTSA recalls, TSBs, and automotive forums.`;
  }
  return 'Data compiled from NHTSA recalls, manufacturer TSBs, automotive forums, and AI-assisted research. No aggregated owner-report counts available for this vehicle yet.';
}

/**
 * Meta-description-friendly source tail ("and solutions from ..." segment).
 */
export function metaSourceTail(reportCount: number): string {
  if (reportCount > 0) {
    return `solutions from ${reportCount.toLocaleString()}+ owner reports`;
  }
  return 'solutions compiled from NHTSA recalls, TSBs, and owner forums';
}

/**
 * Format an ISO date string (or Date) as a human-readable "Updated"
 * label, e.g. "Updated May 2026". Replaces hardcoded "Updated April 2026"
 * which was misleading on freshly-edited content.
 */
export function formatUpdatedLabel(input: string | Date | null | undefined): string {
  if (!input) return '';
  const d = typeof input === 'string' ? new Date(input) : input;
  if (isNaN(d.getTime())) return '';
  const month = d.toLocaleString('en-US', { month: 'long' });
  return `Updated ${month} ${d.getFullYear()}`;
}

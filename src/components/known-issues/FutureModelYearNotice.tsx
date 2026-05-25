import Link from 'next/link';

interface Props {
  requestedYear: number;
  vehicleName: string;
  yearRange: { min: number; max: number };
  slug: string;
}

/**
 * Banner shown when a user lands on /known-issues/{slug}?year=YYYY
 * for a year that has no documented issues yet — typically a brand-new
 * model year (2026/2027) where owner reports haven't accumulated, or
 * an outlier year that wasn't covered in our research.
 *
 * The page falls back to showing all-year content in that case (since
 * a 404 would lose the impression entirely), but without this banner
 * the fallback is silent — users see "2026 Outlander Problems" in the
 * SERP, click, land on content for 2022-2024 outlanders, and bounce
 * because nothing on the page says "we don't have 2026 data yet."
 *
 * The banner is honest about the gap, explains what they're seeing
 * instead (carryover issues from prior generation), and acknowledges
 * the tracking effort. This is the closest we can get to "real 2026
 * data" without fabricating issues for cars that haven't been on the
 * road long enough to break.
 *
 * Why this matters for SEO: pages currently get 50-130 impressions
 * per week on future-year variants (Ford Maverick 2025, Audi Q5
 * Sportback 2026, Mitsubishi Outlander 2026) with near-zero clicks
 * because the page-to-query mismatch is invisible. This banner makes
 * the mismatch visible AND useful — users who came for "what to
 * watch for if I buy a 2026" still get value from prior-gen issues.
 */
export default function FutureModelYearNotice({
  requestedYear,
  vehicleName,
  yearRange,
  slug,
}: Props) {
  const isNewerThanData = requestedYear > yearRange.max;
  const isOlderThanData = requestedYear < yearRange.min;
  const gen = `${yearRange.min}–${yearRange.max}`;

  // Two distinct framings depending on whether the requested year is
  // ahead of our coverage (typical) or behind (rare — usually a 1990s
  // model we haven't researched yet).
  const headline = isNewerThanData
    ? `${requestedYear} ${vehicleName}: tracking in progress`
    : isOlderThanData
      ? `${requestedYear} ${vehicleName}: limited data`
      : `${vehicleName}: showing all years`;

  const body = isNewerThanData ? (
    <>
      The {requestedYear} {vehicleName} is new enough that early-production
      reliability data hasn&apos;t yet emerged. We&apos;re actively tracking
      owner reports as they come in. In the meantime, the most common
      issues reported on the <strong>{gen}</strong> generation are shown
      below — many of these typically carry over to the next year before
      being addressed in mid-cycle refreshes.
    </>
  ) : isOlderThanData ? (
    <>
      We don&apos;t yet have {requestedYear}-specific data for the {vehicleName}.
      Showing the <strong>{gen}</strong> generation we&apos;ve researched. Most
      mechanical issues reported on later years also appeared in earlier
      production runs — use the issues below as a starting point and
      verify against your vehicle&apos;s service manual.
    </>
  ) : (
    <>
      Showing all model years <strong>({gen})</strong> for the {vehicleName}.
    </>
  );

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 mb-6">
      <div className="flex items-start gap-3">
        <svg
          className="flex-shrink-0 w-5 h-5 text-amber-600 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-amber-900 text-sm mb-1">{headline}</p>
          <p className="text-sm text-amber-800 leading-relaxed">{body}</p>
          {isNewerThanData && (
            <p className="text-xs text-amber-700/80 mt-2">
              Already own a {requestedYear} {vehicleName}?{' '}
              <Link
                href={`/known-issues/${slug}#report`}
                className="underline font-medium hover:text-amber-900"
              >
                Share your experience
              </Link>{' '}
              and help us track this generation.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

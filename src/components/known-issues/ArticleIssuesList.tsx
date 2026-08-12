'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useVehicleContext } from '@/contexts/AppContext';
import { KnownIssue, IssueCategory } from '@/schemas/knownIssue.schema';
import { CategorySection } from './CategorySection';
import { SeverityFilter } from './SeverityFilter';
import { AdSlot } from '@/components/ads/AdSlot';
import { filterableKnownIssueTrims, knownIssueMatchesTrim } from '@/lib/known-issue-trim-filter';
import { getVehicleSpecs } from '@/lib/maintenance';

export interface RelatedIssueVehicle {
  slug: string;
  make: string;
  model: string;
  issueId: string;
  title: string;
}

interface ArticleIssuesListProps {
  issues: KnownIssue[];
  make: string;
  model: string;
  initialYear?: number;
  /** All years that have at least one issue across this make/model BEFORE
   *  per-year filtering. Drives the year-nav rail so Google can crawl every
   *  ?year=YYYY variant via real <a href> links — earlier the year picker was
   *  a <select> that depended on JS hydration to navigate, which left the
   *  per-year variants orphaned in the link graph. */
  allYears: number[];
  /** Per-issue cross-vehicle links (keyed by issue.id). Server pre-computes
   *  this from shared DTC codes — see findRelatedVehiclesForIssues. */
  relatedByIssueId?: Record<string, RelatedIssueVehicle[]>;
  /** See KnownIssueCard.linkableDtcCodes — pass-through. */
  linkableDtcCodes?: string[];
}

export function ArticleIssuesList({ issues, make, model, initialYear, allYears, relatedByIssueId, linkableDtcCodes }: ArticleIssuesListProps) {
  const { selectedVehicle } = useVehicleContext();
  const pathname = usePathname();
  const [severityFilter, setSeverityFilter] = useState<('high' | 'medium' | 'low')[]>(['high', 'medium', 'low']);
  // Year changes are URL/server state, not an independent client selection.
  // Deriving the value keeps same-route ?year= navigation synchronized
  // without a stale useState initializer or an extra effect render.
  const yearFilter = initialYear ?? null;

  // A garage selection may scope commerce only on its own make/model page.
  // Keeping the identity check here prevents a selected Charger from silently
  // supplying its R/T trim to a Challenger article.
  const selectedArticleVehicle = useMemo(() => {
    if (!selectedVehicle) return null;
    if (selectedVehicle.make.toLowerCase() !== make.toLowerCase()) return null;
    if (selectedVehicle.model.toLowerCase() !== model.toLowerCase()) return null;
    return selectedVehicle;
  }, [selectedVehicle, make, model]);
  const userTrim = selectedArticleVehicle?.trim || null;

  // Auto-set year filter from user's vehicle selection
  useMemo(() => {
    if (selectedVehicle && !initialYear &&
        selectedVehicle.make.toLowerCase() === make.toLowerCase() &&
        selectedVehicle.model.toLowerCase() === model.toLowerCase()) {
      // Only set if not already set
      if (yearFilter === null) {
        // Don't call setState in useMemo — handled by initialYear prop or user interaction
      }
    }
  }, [selectedVehicle, make, model, initialYear, yearFilter]);

  // Get unique trims from issues for the trim filter
  const availableTrims = useMemo(() => {
    const trims = new Set<string>();
    for (const issue of issues) {
      for (const trim of filterableKnownIssueTrims(issue.vehicleMatch.trims)) {
        trims.add(trim);
      }
    }
    return [...trims].sort();
  }, [issues]);

  const [trimFilter, setTrimFilter] = useState<string | null>(userTrim);

  // AppContext restores after hydration, so the matching selected trim can
  // arrive after the initial useState value was chosen.
  useEffect(() => {
    setTrimFilter(userTrim);
  }, [userTrim]);

  // Back-to-top arrow that rides the right edge of the cards (Devon wanted it
  // on the cards, not pinned to the window corner). Shown once you've scrolled
  // into the sea of cards.
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const filteredIssues = useMemo(() =>
    issues.filter(i => {
      if (severityFilter.includes(i.severity) === false) return false;
      if (yearFilter !== null && i.vehicleMatch.years.includes(yearFilter) === false) return false;
      if (!knownIssueMatchesTrim(i.vehicleMatch.trims, trimFilter)) return false;
      return true;
    }),
    [issues, severityFilter, yearFilter, trimFilter]
  );

  const groupedIssues = useMemo(() => {
    if (filteredIssues.length === 0) return [];
    const groups: Partial<Record<IssueCategory, KnownIssue[]>> = {};
    for (const issue of filteredIssues) {
      const cat = issue.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat]!.push(issue);
    }
    // Sort categories by number of high severity issues, then total count
    const sortedCategories = (Object.keys(groups) as IssueCategory[]).sort((a, b) => {
      const aHigh = groups[a]!.filter(i => i.severity === 'high').length;
      const bHigh = groups[b]!.filter(i => i.severity === 'high').length;
      if (aHigh !== bHigh) return bHigh - aHigh;
      return groups[b]!.length - groups[a]!.length;
    });
    return sortedCategories.map(cat => ({ category: cat, issues: groups[cat]! }));
  }, [filteredIssues]);

  // Build the exact commerce vehicle. A URL year wins; otherwise a matching
  // selected garage vehicle supplies its year. We intentionally do not use the
  // article's maximum year as a pretend selection. Engine is derived only when
  // both year and trim are known; an unresolved dimension must hide scoped
  // links rather than borrowing the first engine in the specs table.
  const vehicleInfo = useMemo(() => {
    const year = yearFilter ?? selectedArticleVehicle?.year ?? null;
    const trim = trimFilter || undefined;
    const engine = year !== null && trim
      ? getVehicleSpecs({ year, make, model, trim })?.engine
      : undefined;
    return { year, make, model, trim, engine };
  }, [make, model, selectedArticleVehicle, trimFilter, yearFilter]);

  return (
    <>
      <div
        className="sticky top-0 z-10 border-b border-[#E3DFD4] px-4 py-3 -mx-4 sm:-mx-6 sm:px-6"
        style={{
          background: 'rgba(247,246,242,0.85)',
          backdropFilter: 'blur(20px) saturate(140%)',
          WebkitBackdropFilter: 'blur(20px) saturate(140%)',
        }}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <SeverityFilter selected={severityFilter} onChange={setSeverityFilter} />
          {availableTrims.length > 0 && (
            <select
              value={trimFilter ?? ''}
              onChange={e => setTrimFilter(e.target.value || null)}
              className="w-full min-w-0 max-w-full px-3 py-1.5 text-sm border border-[#E3DFD4] rounded-lg bg-white text-[#475569] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:w-auto"
            >
              <option value="">All Trims</option>
              {availableTrims.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}
        </div>

        {/* Year nav rail — every year is a real <a href>. Google crawls each
            ?year=YYYY variant from this list, which fixes the orphaning
            problem the earlier <select>-based picker created (Googlebot
            can't interact with selects, so the per-year canonical pages
            had no inbound link signal beyond the sitemap). Native browser
            navigation also makes the year picker work even if React fails
            to hydrate — the dropdown was silently broken on some ISR-
            cached pages because of that hydration dependency. */}
        {allYears.length > 0 && (
          <nav aria-label="Filter by year" className="mt-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
              <Link
                href={pathname}
                className={`flex-shrink-0 px-3 py-1 text-xs font-mono font-semibold rounded-full transition ${
                  yearFilter === null
                    ? 'bg-[#0B1220] text-white'
                    : 'bg-white border border-[#E3DFD4] text-[#475569] hover:bg-[#EFEDE6]'
                }`}
                scroll={false}
                prefetch={false}
              >
                ALL YEARS
              </Link>
              {allYears.map(y => (
                <Link
                  key={y}
                  href={`${pathname}?year=${y}`}
                  className={`flex-shrink-0 px-3 py-1 text-xs font-mono font-semibold rounded-full transition ${
                    yearFilter === y
                      ? 'bg-[#0B1220] text-white'
                      : 'bg-white border border-[#E3DFD4] text-[#475569] hover:bg-[#EFEDE6]'
                  }`}
                  scroll={false}
                  prefetch={false}
                >
                  {y}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>

      {/* Mileage Timeline — shows when issues typically appear */}
      {(() => {
        const withMileage = filteredIssues.filter(i => i.typicalMileage);
        if (withMileage.length < 3) return null;
        const maxMileage = Math.max(...withMileage.map(i => i.typicalMileage!.high));
        const scale = Math.ceil(maxMileage / 50000) * 50000; // Round up to nearest 50K
        const severityColors = { high: 'bg-[#3C313D]', medium: 'bg-[#756A73]', low: 'bg-[#B8AE9B]' };
        return (
          <div className="mt-4 mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">When Issues Typically Appear</h3>
            <div className="space-y-1.5">
              {withMileage
                .sort((a, b) => a.typicalMileage!.low - b.typicalMileage!.low)
                .slice(0, 12)
                .map(issue => {
                  const left = (issue.typicalMileage!.low / scale) * 100;
                  const width = ((issue.typicalMileage!.high - issue.typicalMileage!.low) / scale) * 100;
                  return (
                    <div key={issue.id} className="flex items-center gap-2">
                      <div className="w-32 sm:w-48 text-xs text-gray-600 truncate flex-shrink-0" title={issue.title}>
                        {issue.title}
                      </div>
                      <div className="flex-1 h-4 bg-gray-100 rounded-full relative overflow-hidden">
                        <div
                          className={`absolute h-full rounded-full ${severityColors[issue.severity]} opacity-80`}
                          style={{ left: `${left}%`, width: `${Math.max(width, 2)}%` }}
                          title={`${(issue.typicalMileage!.low / 1000).toFixed(0)}K - ${(issue.typicalMileage!.high / 1000).toFixed(0)}K miles`}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 w-20 text-right flex-shrink-0">
                        {(issue.typicalMileage!.low / 1000).toFixed(0)}K-{(issue.typicalMileage!.high / 1000).toFixed(0)}K
                      </span>
                    </div>
                  );
                })}
            </div>
            {/* Axis labels */}
            <div className="flex items-center gap-2 mt-2">
              <div className="w-32 sm:w-48 flex-shrink-0" />
              <div className="flex-1 flex justify-between text-[10px] text-gray-400">
                <span>0</span>
                <span>{(scale / 4000).toFixed(0)}K</span>
                <span>{(scale / 2000).toFixed(0)}K</span>
                <span>{(scale * 3 / 4000).toFixed(0)}K</span>
                <span>{(scale / 1000).toFixed(0)}K mi</span>
              </div>
              <div className="w-20 flex-shrink-0" />
            </div>
          </div>
        );
      })()}

      <div className="space-y-4 mt-4 relative">
        {/* Back-to-top arrow — sticky on the RIGHT side of the cards column so
            it's always within reach in a long list, without covering content. */}
        <div className="sticky bottom-4 z-20 flex justify-end pr-1 pointer-events-none h-0 -mb-2">
          <button
            type="button"
            aria-label="Back to top"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`pointer-events-auto -translate-y-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#0B1220] text-white shadow-lg ring-1 ring-black/10 transition-opacity duration-200 hover:bg-[#1e293b] ${showTop ? 'opacity-90' : 'opacity-0'}`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
        {groupedIssues.length === 0 ? (
          <div className="text-center py-8 text-[#64748B]">
            <p>No issues match your selected filters.</p>
            <p className="text-sm mt-1">Try selecting different severity levels above.</p>
          </div>
        ) : (
          groupedIssues.map(({ category, issues: catIssues }, index) => (
            <div key={category}>
              <div id={category} className="scroll-mt-16">
                <CategorySection
                  category={category}
                  issues={catIssues}
                  // Categories stay open, while each child card starts
                  // collapsed. Card bodies remain in the server markup via
                  // the HTML `hidden` attribute.
                  defaultExpanded={true}
                  defaultCardExpanded={false}
                  vehicleInfo={vehicleInfo}
                  relatedByIssueId={relatedByIssueId}
                  linkableDtcCodes={linkableDtcCodes}
                />
              </div>
              {/* Mid-content ad slot — uses Auto Ads (no hand-coded slot id). */}
              {index === 2 && groupedIssues.length > 3 && (
                <AdSlot slotId="auto" format="rectangle" className="my-6 flex justify-center" />
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}

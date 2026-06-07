'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useVehicleContext } from '@/contexts/AppContext';
import { KnownIssue, IssueCategory } from '@/schemas/knownIssue.schema';
import { CategorySection } from './CategorySection';
import { SeverityFilter } from './SeverityFilter';
import { AdSlot } from '@/components/ads/AdSlot';

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
}

export function ArticleIssuesList({ issues, make, model, initialYear, allYears, relatedByIssueId }: ArticleIssuesListProps) {
  const { selectedVehicle } = useVehicleContext();
  const pathname = usePathname();
  const [severityFilter, setSeverityFilter] = useState<('high' | 'medium' | 'low')[]>(['high', 'medium', 'low']);
  const [yearFilter, setYearFilter] = useState<number | null>(initialYear ?? null);

  // Get user's selected trim if it matches this article's make/model
  const userTrim = useMemo(() => {
    if (!selectedVehicle) return null;
    if (selectedVehicle.make.toLowerCase() !== make.toLowerCase()) return null;
    if (selectedVehicle.model.toLowerCase() !== model.toLowerCase()) return null;
    return selectedVehicle.trim || null;
  }, [selectedVehicle, make, model]);

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

  // Get all unique years from issues, sorted descending
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    for (const issue of issues) {
      for (const y of issue.vehicleMatch.years) {
        years.add(y);
      }
    }
    return [...years].sort((a, b) => b - a);
  }, [issues]);

  // Get unique trims from issues for the trim filter
  const availableTrims = useMemo(() => {
    const trims = new Set<string>();
    for (const issue of issues) {
      if (issue.vehicleMatch.trims) {
        for (const t of issue.vehicleMatch.trims) {
          trims.add(t);
        }
      }
    }
    return [...trims].sort();
  }, [issues]);

  const [trimFilter, setTrimFilter] = useState<string | null>(userTrim);

  const filteredIssues = useMemo(() =>
    issues.filter(i => {
      if (severityFilter.includes(i.severity) === false) return false;
      if (yearFilter !== null && i.vehicleMatch.years.includes(yearFilter) === false) return false;
      // Trim filter: show issue if it has no trims (applies to all) OR if it includes the selected trim
      if (trimFilter !== null && i.vehicleMatch.trims && i.vehicleMatch.trims.length > 0) {
        // Issue is trim-specific — check if user's trim matches
        const matchesTrim = i.vehicleMatch.trims.some(t =>
          t.toLowerCase().includes(trimFilter.toLowerCase()) ||
          trimFilter.toLowerCase().includes(t.toLowerCase())
        );
        if (!matchesTrim) return false;
      }
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

  // Build vehicleInfo using selected year or max year
  const vehicleInfo = useMemo(() => {
    const year = yearFilter ?? Math.max(...issues.flatMap(i => i.vehicleMatch.years));
    return { year, make, model };
  }, [issues, make, model, yearFilter]);

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
              className="px-3 py-1.5 text-sm border border-[#E3DFD4] rounded-lg bg-white text-[#475569] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
        const severityColors = { high: 'bg-red-400', medium: 'bg-yellow-400', low: 'bg-gray-300' };
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

      <div className="space-y-4 mt-4">
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
                  // Default expanded so the SSR HTML contains every issue
                  // card's content. Googlebot can't see content that's
                  // conditionally rendered (`{expanded && ...}`) when the
                  // initial state is collapsed — that's why ~900 of these
                  // pages were "Discovered, not indexed". Users can still
                  // collapse manually after page load.
                  defaultExpanded={true}
                  defaultCardExpanded={true}
                  vehicleInfo={vehicleInfo}
                  relatedByIssueId={relatedByIssueId}
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

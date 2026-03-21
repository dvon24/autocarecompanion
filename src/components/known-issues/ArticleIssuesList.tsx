'use client';

import { useState, useMemo } from 'react';
import { KnownIssue, IssueCategory } from '@/schemas/knownIssue.schema';
import { CategorySection } from './CategorySection';
import { SeverityFilter } from './SeverityFilter';
import { AdSlot } from '@/components/ads/AdSlot';

interface ArticleIssuesListProps {
  issues: KnownIssue[];
  make: string;
  model: string;
  initialYear?: number;
}

export function ArticleIssuesList({ issues, make, model, initialYear }: ArticleIssuesListProps) {
  const [severityFilter, setSeverityFilter] = useState<('high' | 'medium' | 'low')[]>(['high', 'medium', 'low']);
  const [yearFilter, setYearFilter] = useState<number | null>(initialYear ?? null);

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

  const filteredIssues = useMemo(() =>
    issues.filter(i => {
      if (severityFilter.includes(i.severity) === false) return false;
      if (yearFilter !== null && i.vehicleMatch.years.includes(yearFilter) === false) return false;
      return true;
    }),
    [issues, severityFilter, yearFilter]
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
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 -mx-4 sm:-mx-6 sm:px-6">
        <div className="flex items-center gap-3 flex-wrap">
          <SeverityFilter selected={severityFilter} onChange={setSeverityFilter} />
          <select
            value={yearFilter ?? ''}
            onChange={e => setYearFilter(e.target.value ? parseInt(e.target.value, 10) : null)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Years ({issues.length})</option>
            {availableYears.map(y => (
              <option key={y} value={y}>
                {y} ({issues.filter(i => i.vehicleMatch.years.includes(y)).length})
              </option>
            ))}
          </select>
        </div>
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
          <div className="text-center py-8 text-gray-500">
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
                  defaultExpanded={true}
                  defaultCardExpanded={false}
                  vehicleInfo={vehicleInfo}
                />
              </div>
              {/* Mid-content ad after 3rd category when there are 4+ categories */}
              {index === 2 && groupedIssues.length > 3 && (
                <AdSlot slotId="1234567890" format="rectangle" className="my-6 flex justify-center" />
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}

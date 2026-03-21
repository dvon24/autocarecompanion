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

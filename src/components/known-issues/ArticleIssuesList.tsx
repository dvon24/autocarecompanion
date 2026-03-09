'use client';

import { useState, useMemo } from 'react';
import { KnownIssue, IssueCategory } from '@/schemas/knownIssue.schema';
import { CategorySection } from './CategorySection';
import { SeverityFilter } from './SeverityFilter';

interface ArticleIssuesListProps {
  issues: KnownIssue[];
  make: string;
  model: string;
}

export function ArticleIssuesList({ issues, make, model }: ArticleIssuesListProps) {
  const [severityFilter, setSeverityFilter] = useState<('high' | 'medium' | 'low')[]>(['high', 'medium', 'low']);

  const filteredIssues = useMemo(() =>
    issues.filter(i => severityFilter.includes(i.severity)),
    [issues, severityFilter]
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

  // Build vehicleInfo using the first issue's year range midpoint for display
  const vehicleInfo = useMemo(() => {
    const years = issues.flatMap(i => i.vehicleMatch.years);
    const maxYear = Math.max(...years);
    return { year: maxYear, make, model };
  }, [issues, make, model]);

  return (
    <>
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 -mx-4 sm:-mx-6 sm:px-6">
        <SeverityFilter selected={severityFilter} onChange={setSeverityFilter} />
      </div>

      <div className="space-y-4 mt-4">
        {groupedIssues.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No issues match your selected filters.</p>
            <p className="text-sm mt-1">Try selecting different severity levels above.</p>
          </div>
        ) : (
          groupedIssues.map(({ category, issues: catIssues }) => (
            <div key={category} id={category} className="scroll-mt-16">
              <CategorySection
                category={category}
                issues={catIssues}
                defaultExpanded={true}
                defaultCardExpanded={false}
                vehicleInfo={vehicleInfo}
              />
            </div>
          ))
        )}
      </div>
    </>
  );
}

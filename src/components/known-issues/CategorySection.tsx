'use client';

import { useState, useEffect } from 'react';
import { KnownIssueCard } from './KnownIssueCard';
import { triggerHaptic } from '@/hooks/useHaptic';
import { KnownIssue, IssueCategory } from '@/schemas/knownIssue.schema';
import { categoryConfig } from '@/lib/issue-categories';

export { categoryConfig };

interface RelatedIssueVehicle {
  slug: string;
  make: string;
  model: string;
  issueId: string;
  title: string;
}

interface CategorySectionProps {
  category: IssueCategory;
  issues: KnownIssue[];
  defaultExpanded?: boolean;
  defaultCardExpanded?: boolean;
  vehicleInfo?: {
    year: number;
    make: string;
    model: string;
    trim?: string;
  };
  relatedByIssueId?: Record<string, RelatedIssueVehicle[]>;
}

export function CategorySection({ category, issues, defaultExpanded = false, defaultCardExpanded = false, vehicleInfo, relatedByIssueId }: CategorySectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  // Auto-expand when navigating to this category or a child issue via hash anchor
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkHash = () => {
      const hash = window.location.hash.slice(1);
      if (!hash) return;
      // Expand if hash matches category name
      if (hash === category) {
        setExpanded(true);
        return;
      }
      // Expand if hash matches any child issue ID
      if (issues.some(i => i.id === hash)) {
        setExpanded(true);
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, [category, issues]);
  const config = categoryConfig[category];
  const highCount = issues.filter(i => i.severity === 'high').length;

  const handleToggle = () => {
    triggerHaptic('light');
    setExpanded(!expanded);
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={handleToggle}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center gap-3"
      >
        <span className="text-lg">{config.icon}</span>
        <span className="font-medium text-gray-900 flex-1 text-left">{config.label}</span>
        <span className="text-sm text-gray-500">{issues.length} issue{issues.length !== 1 ? 's' : ''}</span>
        {highCount > 0 && (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
            {highCount} critical
          </span>
        )}
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="p-3 space-y-2 bg-white">
          {issues.map(issue => (
            <KnownIssueCard
              key={issue.id}
              issue={issue}
              vehicleInfo={vehicleInfo}
              defaultExpanded={defaultCardExpanded}
              relatedVehicles={relatedByIssueId?.[issue.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

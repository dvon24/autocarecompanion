'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { KnownIssueCard } from './KnownIssueCard';
import { triggerHaptic } from '@/hooks/useHaptic';
import { KnownIssue } from '@/schemas/knownIssue.schema';
import { currentKnownIssueAnchor, subscribeKnownIssueNavigation } from '@/lib/known-issue-navigation';

/**
 * One model's issues on a /known-issues/dtc/[code]/[make] page, rendered in
 * the same collapsible-section + full-card style as the make/model article
 * pages (CategorySection + KnownIssueCard). The DTC pages used to show a
 * title and a two-line description clamp per issue while the symptoms,
 * "How to Fix", diagnostic tools, parts, cost and sources sat unused on the
 * same rows — the reader had to click through to the article to see any of
 * it. Sep 2026 GSC: DTC pages were the largest impression source at
 * 0.2-0.5% CTR against 1.5-2.5% for article pages; this is the render half
 * of closing that gap.
 *
 * Cards in the first `expandFirst` positions render expanded so the
 * diagnose-and-fix text is in the SSR HTML (what Google and AI answers read);
 * the rest initially collapse to keep long model lists manageable.
 */

interface DtcModelSectionProps {
  make: string;
  model: string;
  /** Article slug for "see all <model> issues" and card permalinks. */
  articleSlug: string;
  issues: KnownIssue[];
  dtcCode: string;
  defaultExpanded?: boolean;
  /** How many leading cards render expanded (fix text in SSR). */
  expandFirst?: number;
  linkableDtcCodes?: string[];
}

function yearSpan(issues: KnownIssue[]): string {
  const years = issues.flatMap((i) => i.vehicleMatch.years || []);
  if (years.length === 0) return '';
  const min = Math.min(...years);
  const max = Math.max(...years);
  return min === max ? `${min}` : `${min}-${max}`;
}

export function DtcModelSection({
  make,
  model,
  articleSlug,
  issues,
  dtcCode,
  defaultExpanded = true,
  expandFirst = 0,
  linkableDtcCodes,
}: DtcModelSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const anchor = `model-${model.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  // Expand when a deep link targets this section or one of its cards.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const check = () => {
      const hash = currentKnownIssueAnchor();
      if (!hash) return;
      if (hash === anchor || issues.some((i) => i.id === hash)) setExpanded(true);
    };
    check();
    return subscribeKnownIssueNavigation(check);
  }, [anchor, issues]);

  const highCount = issues.filter((i) => i.severity === 'high').length;
  const span = yearSpan(issues);

  const handleToggle = () => {
    triggerHaptic('light');
    setExpanded(!expanded);
  };

  return (
    <div id={anchor} className="scroll-mt-16 border border-[#E3DFD4] rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={expanded}
        aria-controls={`${anchor}-issues`}
        className="w-full px-4 py-3 bg-[#EFEDE6] hover:bg-[#E3DFD4] transition-colors flex items-center gap-3"
      >
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[#D8D1C3] bg-[#FBFAF6] text-[#3C313D] font-mono text-[10px] font-semibold">
          {dtcCode.slice(0, 5)}
        </span>
        <span className="font-medium text-[#0B1220] flex-1 text-left">
          {span && <span className="font-mono text-xs text-[#64748B] mr-2">{span}</span>}
          {make} {model}
        </span>
        <span className="text-sm text-[#64748B]">
          {issues.length} issue{issues.length !== 1 ? 's' : ''}
        </span>
        {highCount > 0 && (
          <span className="text-xs border border-[#C9C0B1] bg-[#F7F4EC] text-[#3C313D] px-2 py-0.5 rounded-full">
            {highCount} critical
          </span>
        )}
        <svg
          className={`w-5 h-5 text-[#94A3B8] transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div id={`${anchor}-issues`} className="p-3 space-y-2 bg-white">
          {issues.map((issue, index) => (
            <KnownIssueCard
              key={issue.id}
              issue={issue}
              defaultExpanded={index < expandFirst}
              linkableDtcCodes={linkableDtcCodes}
              basePath="/known-issues"
            />
          ))}
          <div className="pt-1 text-right">
            <Link
              href={`/known-issues/${articleSlug}`}
              className="text-sm font-medium text-[#3B82F6] hover:text-[#2563EB]"
            >
              All {make} {model} known issues →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

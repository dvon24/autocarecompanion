'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatOwnerReportCount } from '@/lib/owner-report-count';

interface DTCIssue {
  id: string;
  slug: string;
  title: string;
  severity: 'high' | 'medium' | 'low';
  reportCount: number;
  estimatedCost?: { low: number; high: number } | null;
  vehicleMatch: {
    make: string;
    model: string;
    years: number[];
  };
}

interface CollapsibleMakeSectionProps {
  make: string;
  issues: DTCIssue[];
  dtcCode: string;
  /** Link to the per-make DTC page (/known-issues/dtc/[code]/[make]).
      Those ~2,400 pages were crawl-orphans — zero internal links anywhere —
      so this header link is their primary discovery path (2026-06-12
      review finding). */
  makeHref?: string;
}

export function CollapsibleMakeSection({ make, issues, dtcCode, makeHref }: CollapsibleMakeSectionProps) {
  // Default expanded so the SSR HTML contains the actual per-vehicle
  // issue list under each make. With useState(false) the issues were
  // conditionally rendered (`{expanded && ...}`) and the DTC page's
  // indexable content was just a wall of make names — Googlebot couldn't
  // see "P0300 affects 2008 Honda Civic with K20 head gasket failure",
  // only "Honda". Same bug as the vehicle-page cards had before today.
  const [expanded, setExpanded] = useState(true);

  return (
    <div
      id={`dtc-${make.toLowerCase().replace(/\s+/g, '-')}`}
      className="scroll-mt-16 border border-[#E3DFD4] rounded-lg overflow-hidden"
    >
      <div className="flex items-center bg-[#EFEDE6]">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-label={`${expanded ? 'Collapse' : 'Expand'} ${make} issues`}
          className="flex-1 flex items-center justify-between p-4 hover:bg-[#E3DFD4] transition-colors text-left min-w-0"
        >
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-[#0B1220]">{make}</h3>
            <span className="text-sm text-[#64748B]">
              {issues.length} {issues.length === 1 ? 'issue' : 'issues'}
            </span>
          </div>
          <svg
            className={`w-5 h-5 text-[#94A3B8] transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {makeHref && (
          <Link
            href={makeHref}
            className="flex-shrink-0 px-4 py-2 mr-2 text-xs font-semibold text-blue-700 hover:text-blue-900 whitespace-nowrap"
            aria-label={`All ${make} ${dtcCode} issues`}
          >
            {make} {dtcCode} page →
          </Link>
        )}
      </div>

      {expanded && (
        <div className="p-4 space-y-3 bg-white">
          {issues.map((issue) => {
            const yearRange = issue.vehicleMatch.years;
            const minYear = Math.min(...yearRange);
            const maxYear = Math.max(...yearRange);
            const ownerReportCountLabel = formatOwnerReportCount(issue.reportCount);
            const severityColor = issue.severity === 'high'
              ? 'bg-red-100 text-red-700'
              : issue.severity === 'medium'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-[#EFEDE6] text-[#334155]';
            const severityLabel = issue.severity === 'high'
              ? 'Critical'
              : issue.severity === 'medium'
              ? 'Moderate'
              : 'Minor';
            const severityIcon = issue.severity === 'high'
              ? (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )
              : issue.severity === 'medium'
              ? (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )
              : (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              );

            return (
              <Link
                key={issue.id}
                href={`/known-issues/${issue.slug}#${issue.id}`}
                className="group flex items-center justify-between p-4 rounded-lg border border-[#E3DFD4] hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-[#0B1220] group-hover:text-blue-700 transition-colors">
                      {issue.vehicleMatch.model}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded ${severityColor}`} title={`${severityLabel} severity`}>
                      {severityIcon}
                      {severityLabel}
                    </span>
                  </div>
                  <p className="text-sm text-[#475569] truncate">{issue.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[#64748B]">
                    <span>{minYear === maxYear ? minYear : `${minYear}-${maxYear}`}</span>
                    {issue.estimatedCost && (
                      <span>${issue.estimatedCost.low.toLocaleString()}-${issue.estimatedCost.high.toLocaleString()}</span>
                    )}
                    {ownerReportCountLabel && (
                      <span>{ownerReportCountLabel}</span>
                    )}
                  </div>
                </div>
                <svg className="w-5 h-5 text-[#CBD5E1] group-hover:text-blue-500 transition-colors flex-shrink-0 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

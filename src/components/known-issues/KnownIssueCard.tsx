'use client';

import { useState, useEffect } from 'react';
import { KnownIssue } from '@/schemas/knownIssue.schema';
import { ConfidenceBadge } from './ConfidenceBadge';
import { VerificationBadge } from './VerificationBadge';
import { ReportIssueModal } from './ReportIssueModal';
import { FixIssueModal } from './FixIssueModal';
import Link from 'next/link';
import { triggerHaptic } from '@/hooks/useHaptic';
import { IssueFix } from '@/hooks/useIssueFixes';
import { trackAffiliateClick } from '@/lib/analytics';

interface RelatedIssueVehicle {
  slug: string;
  make: string;
  model: string;
  issueId: string;
  title: string;
}

interface KnownIssueCardProps {
  issue: KnownIssue;
  vehicleInfo?: {
    year: number;
    make: string;
    model: string;
    trim?: string;
  };
  vehicleId?: string;
  userFix?: IssueFix;
  onFixUpdated?: () => void;
  defaultExpanded?: boolean;
  /** Other vehicles documented to share this issue (matched by DTC code).
   *  Server-pre-computed in page.tsx via findRelatedVehiclesForIssues. */
  relatedVehicles?: RelatedIssueVehicle[];
}

export function KnownIssueCard({ issue, vehicleInfo, vehicleId, userFix, onFixUpdated, defaultExpanded = false, relatedVehicles }: KnownIssueCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showFixModal, setShowFixModal] = useState(false);

  // Auto-expand when navigating to this issue via hash anchor (e.g. from DTC page)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === `#${issue.id}`) {
      setExpanded(true);
    }
  }, [issue.id]);

  const severityConfig = {
    high: {
      label: 'Critical',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-200',
      icon: (
        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
    },
    medium: {
      label: 'Moderate',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-200',
      icon: (
        <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
    },
    low: {
      label: 'Minor',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200',
      icon: (
        <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      ),
    },
  };

  const config = severityConfig[issue.severity] || severityConfig.medium;

  // Determine if this is a highly community-reported issue (50+ reports)
  const isCommunityReported = issue.reportCount >= 50;
  const hasPartRecommendations = issue.communityRecommendations?.some(rec => rec.type === 'part');

  const handleToggle = () => {
    triggerHaptic('light');
    const next = !expanded;
    setExpanded(next);
    // Update the URL hash on expand so the user can copy/share a deep
    // link to this specific card without having to find the "#" permalink.
    // Use replaceState so the back button isn't filled with hash
    // entries every time someone clicks around.
    if (typeof window !== 'undefined') {
      try {
        if (next) {
          window.history.replaceState(null, '', `#${issue.id}`);
        } else if (window.location.hash === `#${issue.id}`) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      } catch { /* old browsers — silent */ }
    }
  };

  return (
    <div id={issue.id} className={`border rounded-lg overflow-hidden transition-all scroll-mt-20 ${config.borderColor}`}>
      {/* User Fix Status Banner - shows when user has reported fixing this */}
      {userFix && (
        <div className={`px-4 py-2 flex items-center justify-between ${
          userFix.status === 'fixed'
            ? 'bg-gradient-to-r from-green-600 to-emerald-600'
            : userFix.status === 'in_progress'
            ? 'bg-gradient-to-r from-blue-600 to-cyan-600'
            : 'bg-gradient-to-r from-gray-500 to-gray-600'
        }`}>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {userFix.status === 'fixed' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              ) : userFix.status === 'in_progress' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              )}
            </svg>
            <span className="text-white text-xs font-semibold">
              {userFix.status === 'fixed' ? 'You fixed this' :
               userFix.status === 'in_progress' ? 'Working on it' :
               'Living with it'}
            </span>
          </div>
          {userFix.cost && (
            <span className="text-white/90 text-xs">
              ${userFix.cost.toLocaleString()}
            </span>
          )}
        </div>
      )}

      {/* Community Reported Banner - shows for highly reported issues */}
      {isCommunityReported && !userFix && (
        <div className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            <span className="text-white text-xs font-semibold">Community Reported</span>
          </div>
          <span className="text-white/90 text-xs">
            {issue.reportCount.toLocaleString()} owners
          </span>
        </div>
      )}

      {/* Header - always visible */}
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={expanded}
        aria-label={`${expanded ? 'Collapse' : 'Expand'} details for ${issue.title}`}
        className={`w-full p-4 text-left flex items-start gap-3 ${config.bgColor} hover:opacity-90 transition-opacity`}
      >
        {config.icon}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${config.bgColor} ${config.textColor}`}>
              {config.label}
            </span>
            {hasPartRecommendations && (
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                Upgrades Available
              </span>
            )}
          </div>
          {/* H3 prefixes the year range + make + model so each page's card
              titles read uniquely across the site. Year range matters because
              people search "2008-2014 Dodge Avenger problems" — without the
              years, generations of the same model can look duplicated to
              Google. Combined with the make/model prefix this satisfies
              Gemini's "Generation-Specific Anchors" recommendation for
              SEO uniqueness. */}
          <h3 className={`font-medium ${config.textColor} flex items-center gap-2 group/heading`}>
            <span>
              {(() => {
                const years = issue.vehicleMatch?.years || [];
                const yearLabel = years.length === 0
                  ? ''
                  : years.length === 1
                    ? `${years[0]} `
                    : `${years[0]}-${years[years.length - 1]} `;
                const ymm = vehicleInfo ? `${yearLabel}${vehicleInfo.make} ${vehicleInfo.model}: ` : '';
                return `${ymm}${issue.title}`;
              })()}
            </span>
            {/* Hover-visible permalink — gives users (and Google) a clear,
                shareable URL for THIS specific card. Same pattern as MDN /
                GitHub heading anchors. Updates the URL hash without
                scrolling away (location set via history.replaceState
                inside an inline handler that lives below the JSX). */}
            <a
              href={`#${issue.id}`}
              aria-label="Permalink to this issue"
              title="Copy link to this issue"
              className="opacity-0 group-hover/heading:opacity-60 hover:opacity-100 text-xs text-gray-400 hover:text-blue-600 transition-opacity flex-shrink-0"
              onClick={(e) => {
                // Stop the parent button's expand-toggle from firing when
                // the user just wants to copy the permalink.
                e.stopPropagation();
              }}
            >
              #
            </a>
          </h3>
          {/* Year range and applicable trims */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
            <span className="text-xs text-gray-500">
              {issue.vehicleMatch.years.length === 1
                ? issue.vehicleMatch.years[0]
                : `${issue.vehicleMatch.years[0]}–${issue.vehicleMatch.years[issue.vehicleMatch.years.length - 1]}`}
            </span>
            {issue.vehicleMatch.trims && issue.vehicleMatch.trims.length > 0 && (
              <span className="text-xs text-gray-500">
                {issue.vehicleMatch.trims.join(', ')}
              </span>
            )}
            {(!issue.vehicleMatch.trims || issue.vehicleMatch.trims.length === 0) && (
              <span className="text-xs text-gray-500">All trims</span>
            )}
            {/* DTC codes in header */}
            {(issue as any).dtcCodes && (issue as any).dtcCodes.length > 0 && (
              <span className="inline-flex items-center gap-1 flex-wrap">
                <span className="text-[10px] text-gray-500 font-medium">Error Codes:</span>
                {(issue as any).dtcCodes.map((code: string) => (
                  <Link
                    key={code}
                    href={`/known-issues/dtc/${code.toLowerCase()}`}
                    className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium bg-gray-200/70 text-gray-600 rounded hover:bg-blue-100 hover:text-blue-700 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {code}
                  </Link>
                ))}
              </span>
            )}
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="p-4 bg-white space-y-4">
          {/* Description with YMMT-prefixed first sentence. The prefix
              ("On the 2008-2014 Dodge Avenger, ...") makes every page's
              first paragraph measurably different from sibling-make pages
              that share the same underlying defect — Gemini's "boilerplate
              trap" fix at the prose layer instead of just the title. We
              lowercase the first letter of the description so the prefix
              flows as one sentence. */}
          <p className="text-gray-700 text-sm leading-relaxed">
            {vehicleInfo && (() => {
              const years = issue.vehicleMatch?.years || [];
              const yearLabel = years.length === 0
                ? ''
                : years.length === 1
                  ? `${years[0]} `
                  : `${years[0]}-${years[years.length - 1]} `;
              // Inject engine into the prefix when EXACTLY ONE engine is
              // tagged. Multi-engine issues skip the qualifier (would read
              // awkwardly like "On the 2008-2014 Avenger 5.7 HEMI, 6.4
              // HEMI, the..."). This covers Gemini's "Generation
              // Differentiator" recommendation for the common case.
              const engines = issue.vehicleMatch?.engines || [];
              const engineLabel = engines.length === 1 ? ` ${engines[0]}` : '';
              return <>On the {yearLabel}{vehicleInfo.make} {vehicleInfo.model}{engineLabel}, </>;
            })()}
            {vehicleInfo && issue.description
              ? issue.description.charAt(0).toLowerCase() + issue.description.slice(1)
              : issue.description}
          </p>

          {/* Cross-vehicle hub-and-spoke links — shown when this issue
              shares a DTC code with another vehicle's documented issue.
              Tells Google these pages are part of one connected library
              about a shared engineering defect, not 900 isolated pages. */}
          {relatedVehicles && relatedVehicles.length > 0 && (
            <div className="text-xs text-gray-600 leading-relaxed border-l-2 border-blue-200 pl-3 py-1 bg-blue-50/40">
              <span className="font-medium text-gray-700">This issue also affects:</span>{' '}
              {relatedVehicles.map((rv, i) => (
                <span key={rv.issueId}>
                  <Link
                    href={`/known-issues/${rv.slug}#${rv.issueId}`}
                    className="text-blue-700 hover:underline"
                  >
                    {rv.make} {rv.model}
                  </Link>
                  {i < relatedVehicles.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          )}

          {/* Symptoms */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Common Symptoms</h4>
            <ul className="space-y-1">
              {issue.symptoms.map((symptom, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  {symptom}
                </li>
              ))}
            </ul>
          </div>

          {/* Solution/Fix */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
              </svg>
              How to Fix
            </h4>
            <p className="text-sm text-green-700 leading-relaxed">{issue.solution}</p>
          </div>

          {/* Common Fixes & Upgrades */}
          {issue.communityRecommendations && issue.communityRecommendations.length > 0 && (
            <div className={`rounded-lg p-3 ${hasPartRecommendations ? 'bg-purple-50 border border-purple-200' : 'bg-blue-50 border border-blue-200'}`}>
              <h4 className={`text-sm font-medium mb-2 flex items-center gap-2 ${hasPartRecommendations ? 'text-purple-800' : 'text-blue-800'}`}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                What Owners Are Using
              </h4>
              <p className={`text-xs mb-2 ${hasPartRecommendations ? 'text-purple-600' : 'text-blue-600'}`}>
                Parts and tips from {issue.reportCount.toLocaleString()}+ owners who fixed this issue
              </p>
              <ul className="space-y-2">
                {issue.communityRecommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-blue-700">
                    <div className="flex items-start gap-2">
                      <span className={`flex-shrink-0 px-1.5 py-0.5 text-xs font-medium rounded ${
                        rec.type === 'part' ? 'bg-purple-100 text-purple-700' :
                        rec.type === 'warning' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {rec.type === 'part' ? 'Upgrade' : rec.type === 'warning' ? 'Note' : 'Tip'}
                      </span>
                      <span className="flex-1">
                        {rec.content}
                        {rec.partBrand && (rec.partNumber || rec.partName) && (
                          rec.affiliateUrl ? (
                            <a
                              href={rec.affiliateUrl}
                              target="_blank"
                              rel="noopener noreferrer sponsored"
                              className="font-medium text-purple-700 hover:text-purple-900 underline decoration-purple-300 hover:decoration-purple-500 transition-colors"
                              onClick={() => trackAffiliateClick({
                                issueId: issue.id,
                                partBrand: rec.partBrand,
                                partName: rec.partName,
                                partNumber: rec.partNumber,
                                linkUrl: rec.affiliateUrl!,
                                recommendationIndex: index,
                                vehicleMake: issue.vehicleMatch.make,
                                vehicleModel: issue.vehicleMatch.model,
                              })}
                            >
                              {' '}({rec.partBrand} {rec.partNumber ? `#${rec.partNumber}` : rec.partName})
                            </a>
                          ) : (
                            <span className="font-medium text-purple-700">
                              {' '}({rec.partBrand} {rec.partNumber ? `#${rec.partNumber}` : rec.partName})
                            </span>
                          )
                        )}
                      </span>
                    </div>
                    {/* Affiliate links for parts */}
                    {rec.affiliateUrl && (
                      <div className="ml-6 mt-1">
                        <a
                          href={rec.affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="inline-flex items-center gap-1 text-xs bg-purple-600 text-white px-2 py-1 rounded-md hover:bg-purple-700 transition-colors"
                          onClick={() => trackAffiliateClick({
                            issueId: issue.id,
                            partBrand: rec.partBrand,
                            partName: rec.partName,
                            partNumber: rec.partNumber,
                            linkUrl: rec.affiliateUrl!,
                            recommendationIndex: index,
                            vehicleMake: issue.vehicleMatch.make,
                            vehicleModel: issue.vehicleMatch.model,
                          })}
                        >
                          View on Amazon
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Estimated cost */}
          {issue.estimatedCost && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Typical repair cost:</span>
              <span className="font-medium text-gray-900">
                ${issue.estimatedCost.low.toLocaleString()} - ${issue.estimatedCost.high.toLocaleString()}
              </span>
            </div>
          )}

          {/* Citations & Search */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">Research This Issue</h4>
            <p className="text-xs text-gray-500 mb-2">
              {issue.reportCount.toLocaleString()}+ owners have reported this issue
            </p>
            <div className="grid grid-cols-2 gap-2">
              {/* Google search */}
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(issue.title + ' ' + issue.vehicleMatch.make + ' ' + issue.vehicleMatch.model)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-xs font-medium text-gray-700">Google</span>
              </a>
              {/* Reddit search */}
              <a
                href={`https://www.reddit.com/search/?q=${encodeURIComponent(issue.vehicleMatch.make + ' ' + issue.vehicleMatch.model + ' ' + issue.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="#FF4500" viewBox="0 0 24 24">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                </svg>
                <span className="text-xs font-medium text-gray-700">Reddit</span>
              </a>
              {/* YouTube search */}
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(issue.vehicleMatch.make + ' ' + issue.vehicleMatch.model + ' ' + issue.title + ' repair')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="#FF0000" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span className="text-xs font-medium text-gray-700">YouTube</span>
              </a>
              {/* NHTSA */}
              <a
                href={`https://www.nhtsa.gov/vehicle/${issue.vehicleMatch.years[0]}/${issue.vehicleMatch.make.toUpperCase()}/${issue.vehicleMatch.model.toUpperCase().replace(/ /g, '%20')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <svg className="w-4 h-4 flex-shrink-0 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-xs font-medium text-red-700">NHTSA</span>
              </a>
            </div>
          </div>

          {/* User's Fix Details - show if user has submitted a fix */}
          {userFix && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Your Fix
              </h4>
              {userFix.solution && (
                <p className="text-sm text-green-700 leading-relaxed mb-2">{userFix.solution}</p>
              )}
              <div className="flex flex-wrap gap-3 text-xs text-green-600">
                {userFix.cost && (
                  <span className="flex items-center gap-1">
                    <span className="font-medium">Cost:</span> ${userFix.cost.toLocaleString()}
                  </span>
                )}
                {userFix.difficultyRating && (
                  <span className="flex items-center gap-1">
                    <span className="font-medium">Difficulty:</span> {userFix.difficultyRating}/5
                  </span>
                )}
                {userFix.shopUsed && (
                  <span className="flex items-center gap-1">
                    <span className="font-medium">Shop:</span> {userFix.shopUsed}
                  </span>
                )}
              </div>
              {userFix.partsUsed && (
                <p className="text-xs text-green-600 mt-2">
                  <span className="font-medium">Parts:</span> {userFix.partsUsed}
                </p>
              )}
              {userFix.tips && (
                <p className="text-xs text-green-600 mt-2 italic">
                  <span className="font-medium">Tip:</span> {userFix.tips}
                </p>
              )}
            </div>
          )}

          {/* Trust indicators */}
          <div className="pt-2 border-t border-gray-100 flex items-center gap-2 flex-wrap">
            <VerificationBadge source={issue.source} />
            <ConfidenceBadge
              confidence={issue.confidence}
              humanApproved={issue.humanApproved}
              lastReportedByOwners={issue.lastReportedByOwners}
              reviewedOn={issue.reviewedOn}
              reportCount={issue.reportCount}
            />
          </div>

          {/* Action buttons */}
          {vehicleInfo && (
            <div className="flex gap-2 mt-3">
              {!userFix && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setShowReportModal(true);
                  }}
                  className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  I have this
                </button>
              )}
              {vehicleId && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setShowFixModal(true);
                  }}
                  className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    userFix
                      ? 'border border-green-300 text-green-700 hover:bg-green-50'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {userFix ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    )}
                  </svg>
                  {userFix ? 'Edit my fix' : 'I fixed this'}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && vehicleInfo && (
        <ReportIssueModal
          vehicleInfo={vehicleInfo}
          existingIssueId={issue.id}
          existingIssueTitle={issue.title}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {/* Fix Modal */}
      {showFixModal && vehicleId && (
        <FixIssueModal
          issueId={issue.id}
          issueTitle={issue.title}
          vehicleId={vehicleId}
          existingFix={userFix}
          onClose={() => setShowFixModal(false)}
          onSuccess={onFixUpdated}
        />
      )}
    </div>
  );
}

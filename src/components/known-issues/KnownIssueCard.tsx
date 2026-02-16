'use client';

import { useState } from 'react';
import { KnownIssue } from '@/schemas/knownIssue.schema';
import { ConfidenceBadge } from './ConfidenceBadge';
import { triggerHaptic } from '@/hooks/useHaptic';

interface KnownIssueCardProps {
  issue: KnownIssue;
}

export function KnownIssueCard({ issue }: KnownIssueCardProps) {
  const [expanded, setExpanded] = useState(false);

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

  const config = severityConfig[issue.severity];

  // Determine if this is a highly community-reported issue (50+ reports)
  const isCommunityReported = issue.reportCount >= 50;
  const hasPartRecommendations = issue.communityRecommendations?.some(rec => rec.type === 'part');

  const handleToggle = () => {
    triggerHaptic('light');
    setExpanded(!expanded);
  };

  return (
    <div className={`border rounded-lg overflow-hidden transition-all ${config.borderColor}`}>
      {/* Community Reported Banner - shows for highly reported issues */}
      {isCommunityReported && (
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
          <h3 className={`font-medium ${config.textColor}`}>{issue.title}</h3>
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
          {/* Description */}
          <p className="text-gray-700 text-sm leading-relaxed">{issue.description}</p>

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
                  <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                    <span className={`flex-shrink-0 px-1.5 py-0.5 text-xs font-medium rounded ${
                      rec.type === 'part' ? 'bg-purple-100 text-purple-700' :
                      rec.type === 'warning' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {rec.type === 'part' ? 'Upgrade' : rec.type === 'warning' ? 'Note' : 'Tip'}
                    </span>
                    <span>
                      {rec.content}
                      {rec.partBrand && rec.partNumber && (
                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent(rec.partBrand + ' ' + (rec.partNumber || rec.partName || ''))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-purple-600 hover:underline"
                        >
                          {' '}({rec.partBrand} {rec.partNumber ? `#${rec.partNumber}` : rec.partName})
                        </a>
                      )}
                    </span>
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
            <h4 className="text-sm font-medium text-gray-900 mb-2">Research This Issue</h4>
            <div className="space-y-1">
              {/* Google search link - always show */}
              <div className="flex items-center gap-2 text-sm">
                <span className="px-1.5 py-0.5 rounded text-xs font-medium uppercase bg-gray-100 text-gray-600">
                  search
                </span>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(issue.title + ' ' + issue.vehicleMatch.make + ' ' + issue.vehicleMatch.model)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Search Google for more info
                </a>
              </div>
              {/* Forum search */}
              <div className="flex items-center gap-2 text-sm">
                <span className="px-1.5 py-0.5 rounded text-xs font-medium uppercase bg-gray-100 text-gray-600">
                  forums
                </span>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(issue.title + ' ' + issue.vehicleMatch.make + ' ' + issue.vehicleMatch.model + ' forum')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Search owner forums
                </a>
              </div>
              {/* NHTSA complaints search */}
              <div className="flex items-center gap-2 text-sm">
                <span className="px-1.5 py-0.5 rounded text-xs font-medium uppercase bg-red-100 text-red-700">
                  nhtsa
                </span>
                <a
                  href={`https://www.nhtsa.gov/vehicle/${issue.vehicleMatch.years[0]}/${issue.vehicleMatch.make.toUpperCase()}/${issue.vehicleMatch.model.toUpperCase()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Check NHTSA complaints & recalls
                </a>
              </div>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="pt-2 border-t border-gray-100">
            <ConfidenceBadge
              confidence={issue.confidence}
              humanApproved={issue.humanApproved}
              lastReviewedAt={issue.lastReviewedAt}
              reportCount={issue.reportCount}
            />
          </div>
        </div>
      )}
    </div>
  );
}

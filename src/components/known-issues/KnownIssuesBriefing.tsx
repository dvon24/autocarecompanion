'use client';

import { useState, useMemo } from 'react';
import { useKnownIssues } from '@/hooks/useKnownIssues';
import { SeverityFilter } from './SeverityFilter';
import { CategorySection } from './CategorySection';
import { triggerHaptic } from '@/hooks/useHaptic';
import { KnownIssue, IssueCategory } from '@/schemas/knownIssue.schema';

interface KnownIssuesBriefingProps {
  vehicle: {
    year: number;
    make: string;
    model: string;
    trim?: string;
  };
  onDismiss: () => void;
  onContinue: () => void;
}

export function KnownIssuesBriefing({
  vehicle,
  onDismiss,
  onContinue,
}: KnownIssuesBriefingProps) {
  const {
    issues,
    allIssues,
    loading,
    error,
    severityFilter,
    setSeverityFilter,
  } = useKnownIssues({
    year: vehicle.year,
    make: vehicle.make,
    model: vehicle.model,
    trim: vehicle.trim,
  });

  // Group issues by category - must be before any early returns (Rules of Hooks)
  const groupedIssues = useMemo(() => {
    if (!issues || issues.length === 0) return [];
    const groups: Partial<Record<IssueCategory, KnownIssue[]>> = {};
    for (const issue of issues) {
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
  }, [issues]);

  const highSeverityCount = useMemo(() =>
    issues.filter(i => i.severity === 'high').length,
    [issues]
  );

  const handleContinue = () => {
    triggerHaptic('medium');
    // Store acknowledged known issues in sessionStorage for symptom chat to reference
    if (issues.length > 0) {
      sessionStorage.setItem('acknowledgedKnownIssues', JSON.stringify(issues));
    }
    onContinue();
  };

  const handleClose = () => {
    triggerHaptic('light');
    onDismiss();
  };

  const vehicleDisplay = `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''}`;

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-lg w-full p-6 text-center relative">
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Checking known issues for your vehicle...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-lg w-full p-6 relative">
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <p className="text-red-600 mb-4">Unable to load known issues. You can still continue.</p>
          <button
            type="button"
            onClick={handleContinue}
            className="w-full py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // No issues found for this vehicle at all
  if (allIssues.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-lg w-full p-6 relative">
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Known Issues Found
            </h2>
            <p className="text-gray-600">
              Great news! We don&apos;t have any documented known issues for your {vehicleDisplay}.
            </p>
          </div>
          <button
            type="button"
            onClick={handleContinue}
            className="w-full py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Continue to Symptom Chat
          </button>
        </div>
      </div>
    );
  }

  // Issues found - show briefing
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                Known Issues for Your Vehicle
              </h2>
              <p className="text-gray-600 mt-1">
                {vehicleDisplay}
              </p>
              {highSeverityCount > 0 && (
                <p className="text-red-600 text-sm mt-2 font-medium">
                  {highSeverityCount} critical issue{highSeverityCount > 1 ? 's' : ''} documented
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close and select different vehicle"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
          <SeverityFilter
            selected={severityFilter}
            onChange={setSeverityFilter}
          />
        </div>

        {/* Issues list - grouped by category */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {groupedIssues.length === 0 && issues.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No issues match your selected filters.</p>
              <p className="text-sm mt-1">Try selecting different severity levels above.</p>
            </div>
          ) : (
            groupedIssues.map(({ category, issues: catIssues }, index) => (
              <CategorySection
                key={category}
                category={category}
                issues={catIssues}
                defaultExpanded={index === 0}
                vehicleInfo={vehicle}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <button
            type="button"
            onClick={handleContinue}
            className="w-full py-3 px-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Continue to Symptom Chat
          </button>
          <p className="text-xs text-gray-500 text-center mt-3">
            These issues are documented by the community and verified where possible.
            Always consult a professional mechanic for diagnosis.
          </p>
        </div>
      </div>
    </div>
  );
}

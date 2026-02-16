'use client';

import { useState, useMemo } from 'react';
import { useKnownIssues } from '@/hooks/useKnownIssues';
import { KnownIssueCard } from './KnownIssueCard';
import { SeverityFilter } from './SeverityFilter';
import { triggerHaptic } from '@/hooks/useHaptic';
import { KnownIssue, IssueCategory } from '@/schemas/knownIssue.schema';

// Category display config
const categoryConfig: Record<IssueCategory, { label: string; icon: string }> = {
  engine: { label: 'Engine', icon: '⚙️' },
  transmission: { label: 'Transmission', icon: '🔄' },
  drivetrain: { label: 'Drivetrain', icon: '🔗' },
  electrical: { label: 'Electrical', icon: '⚡' },
  brakes: { label: 'Brakes', icon: '🛑' },
  suspension: { label: 'Suspension', icon: '🔧' },
  cooling: { label: 'Cooling', icon: '❄️' },
  fuel: { label: 'Fuel System', icon: '⛽' },
  interior: { label: 'Interior', icon: '🪑' },
  exterior: { label: 'Exterior', icon: '🚗' },
  other: { label: 'Other', icon: '📋' },
};

interface CategorySectionProps {
  category: IssueCategory;
  issues: KnownIssue[];
  defaultExpanded?: boolean;
  vehicleInfo?: {
    year: number;
    make: string;
    model: string;
    trim?: string;
  };
}

function CategorySection({ category, issues, defaultExpanded = false, vehicleInfo }: CategorySectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
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
            <KnownIssueCard key={issue.id} issue={issue} vehicleInfo={vehicleInfo} />
          ))}
        </div>
      )}
    </div>
  );
}

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

  const handleSkip = () => {
    triggerHaptic('light');
    onDismiss();
  };

  const vehicleDisplay = `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''}`;

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-lg w-full p-6 text-center">
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
        <div className="bg-white rounded-xl max-w-lg w-full p-6">
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
        <div className="bg-white rounded-xl max-w-lg w-full p-6">
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
            <div>
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
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSkip}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-white transition-colors"
            >
              Skip for Now
            </button>
            <button
              type="button"
              onClick={handleContinue}
              className="flex-1 py-3 px-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Continue to Symptom Chat
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-3">
            These issues are documented by the community and verified where possible.
            Always consult a professional mechanic for diagnosis.
          </p>
        </div>
      </div>
    </div>
  );
}

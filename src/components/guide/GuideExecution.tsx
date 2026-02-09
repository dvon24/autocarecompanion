'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { type Guide } from '@/schemas/guide.schema';
import { useGuideProgress } from '@/hooks/useGuideProgress';
import { useGuideCache } from '@/hooks/useGuideCache';
import { OfflineBadge } from '@/components/offline/OfflineIndicator';
import { CacheStatusBadge } from '@/components/offline/CacheStatusBadge';
import { InlineHelpChat } from '@/components/guide/InlineHelpChat';

/**
 * GuideExecution - Modern accordion-style guide execution interface
 *
 * Story 1.8: Guide Execution Interface
 * Story 2.4: Offline Guide Access
 * Story 2.6: localStorage Persistence
 * Story 3.1: Time Estimates Display
 *
 * Displays all steps stacked with expandable details.
 * Modern design matching landing page aesthetics.
 * Progress persists across sessions for offline use.
 *
 * Follows Architecture patterns:
 * - Touch targets 56x56px for greasy finger use case
 * - Large readable text (18px minimum per Story 1.8)
 * - Accessible with proper ARIA attributes
 */

/**
 * Format minutes into human-readable time string
 * Examples: "5 min", "1 hr 30 min", "2+ hrs"
 */
function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return hours === 1 ? '1 hr' : `${hours} hrs`;
  }
  return hours === 1 ? `1 hr ${remainingMinutes} min` : `${hours} hrs ${remainingMinutes} min`;
}

type GuideExecutionProps = {
  guide: Guide;
  onComplete: () => void;
  onExit: () => void;
};

/**
 * Generate a short title from the instruction
 * Takes first ~6-8 words or up to first period/comma
 */
function getStepTitle(instruction: string): string {
  const beforePunctuation = instruction.split(/[.,]/)[0];
  if (beforePunctuation.length <= 50) {
    return beforePunctuation;
  }
  const words = instruction.split(' ').slice(0, 8);
  const title = words.join(' ');
  return title.length < instruction.length ? `${title}...` : title;
}

export function GuideExecution({
  guide,
  onComplete,
  onExit,
}: GuideExecutionProps) {
  const totalSteps = guide.steps.length;

  // Persistent progress using localStorage (Story 2.6)
  const {
    completedSteps: completedStepsArray,
    toggleStepComplete: persistToggle,
    resetProgress,
    progressPercent,
    isLoaded,
  } = useGuideProgress({
    guideId: guide.id,
    guideTitle: guide.title,
    vehicleInfo: `${guide.vehicle.year} ${guide.vehicle.make} ${guide.vehicle.model}`,
    totalSteps,
  });

  // Guide caching for offline use (Story 2.1, 2.2)
  const { cacheGuide, isGuideCached } = useGuideCache();

  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([0]));
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [resumeStepIndex, setResumeStepIndex] = useState<number | null>(null);
  const [showStepNav, setShowStepNav] = useState(false);

  // Convert array to Set for efficient lookup
  const completedSteps = new Set(completedStepsArray);
  const completedCount = completedSteps.size;
  const allStepsComplete = completedCount === totalSteps;

  // Calculate time estimates (Story 3.1)
  const timeEstimates = useMemo(() => {
    let totalMinutes = 0;
    let completedMinutes = 0;
    let hasEstimates = false;

    guide.steps.forEach((step) => {
      if (step.estimatedMinutes) {
        hasEstimates = true;
        totalMinutes += step.estimatedMinutes;
        if (completedSteps.has(step.number)) {
          completedMinutes += step.estimatedMinutes;
        }
      }
    });

    const remainingMinutes = totalMinutes - completedMinutes;

    return {
      total: totalMinutes,
      completed: completedMinutes,
      remaining: remainingMinutes,
      hasEstimates,
    };
  }, [guide.steps, completedSteps]);

  // Collect all high-severity warnings for summary (Story 3.5)
  const criticalWarnings = useMemo(() => {
    const warnings: { stepNumber: number; message: string }[] = [];
    guide.steps.forEach((step) => {
      step.safetyWarnings
        .filter((w) => w.severity === 'high')
        .forEach((w) => {
          warnings.push({ stepNumber: step.number, message: w.message });
        });
    });
    return warnings;
  }, [guide.steps]);

  const [dismissedSafetySummary, setDismissedSafetySummary] = useState(false);

  // Cache guide on first load for offline use
  useEffect(() => {
    if (!isGuideCached(guide.id)) {
      cacheGuide(guide);
    }
  }, [guide, isGuideCached, cacheGuide]);

  // "Where was I?" recovery - detect returning user with progress (Story 3.2)
  useEffect(() => {
    if (!isLoaded) return;

    // If user has some progress but not complete, find next incomplete step
    if (completedStepsArray.length > 0 && completedStepsArray.length < totalSteps) {
      // Find the first incomplete step
      const nextStepIndex = guide.steps.findIndex(
        (step) => !completedSteps.has(step.number)
      );

      if (nextStepIndex > 0) {
        setResumeStepIndex(nextStepIndex);
        setShowResumePrompt(true);
      }
    }
  }, [isLoaded]); // Only run once when progress loads

  const toggleStepComplete = useCallback((index: number) => {
    const stepNumber = guide.steps[index].number;
    const wasComplete = completedSteps.has(stepNumber);
    persistToggle(stepNumber);

    // Auto-expand next step when completing current
    if (!wasComplete && index < totalSteps - 1) {
      setExpandedSteps((prevExpanded) => new Set([...prevExpanded, index + 1]));
    }
  }, [guide.steps, persistToggle, completedSteps, totalSteps]);

  const toggleStepExpanded = useCallback((index: number) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    resetProgress();
    setExpandedSteps(new Set([0]));
    setShowResumePrompt(false);
    setResumeStepIndex(null);
  }, [resetProgress]);

  // Handle resuming from where user left off
  const handleResume = useCallback(() => {
    if (resumeStepIndex !== null) {
      setExpandedSteps(new Set([resumeStepIndex]));
      setShowResumePrompt(false);

      // Scroll to the step after a brief delay for UI to update
      setTimeout(() => {
        const stepElement = document.getElementById(`step-${resumeStepIndex}`);
        stepElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [resumeStepIndex]);

  const dismissResumePrompt = useCallback(() => {
    setShowResumePrompt(false);
  }, []);

  // Jump to a specific step (Story 3.3)
  const jumpToStep = useCallback((index: number) => {
    setExpandedSteps(new Set([index]));
    setShowStepNav(false);

    setTimeout(() => {
      const stepElement = document.getElementById(`step-${index}`);
      stepElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }, []);

  // Show loading state while progress loads from localStorage
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Loading progress...</div>
      </div>
    );
  }

  // Completion screen
  if (allStepsComplete) {
    return (
      <div className="min-h-screen bg-white font-[system-ui,sans-serif] relative overflow-hidden">
        {/* Gradient blobs */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
            transform: 'translate(20%, -30%)',
            opacity: 0.5,
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.12) 0%, transparent 70%)',
            filter: 'blur(60px)',
            transform: 'translate(-30%, 30%)',
            opacity: 0.5,
          }}
        />

        {/* Header */}
        <header className="relative px-6 py-4 border-b border-gray-100">
          <div className="max-w-3xl mx-auto flex items-center justify-center gap-3">
            <span className="text-2xl font-bold text-gray-900 tracking-tight">
              Au<span className="text-blue-600">7</span>o
            </span>
          </div>
        </header>

        {/* Completion Content */}
        <div className="relative flex-1 flex items-center justify-center px-6 py-20">
          <div className="text-center max-w-md">
            {/* Success Icon */}
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight mb-4">
              Great job!
            </h1>
            <p className="text-lg text-gray-500 mb-10 leading-relaxed">
              You&apos;ve completed all {totalSteps} steps of the {guide.title} guide.
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={onComplete}
                className="w-full inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-200 text-lg hover:scale-[1.02] hover:shadow-lg"
              >
                Return Home
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="w-full inline-flex items-center justify-center px-8 py-4 border border-gray-200 text-gray-700 font-medium rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 text-lg hover:scale-[1.02]"
              >
                Start Over
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-[system-ui,sans-serif] relative overflow-hidden">
      {/* Gradient blobs */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          transform: 'translate(20%, -30%)',
          opacity: 0.4,
        }}
      />
      <div
        className="absolute top-1/3 left-0 w-[400px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
          transform: 'translate(-50%, 0%)',
          opacity: 0.4,
        }}
      />

      {/* Header */}
      <header className="relative sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={onExit}
                className="p-2 -ml-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                aria-label="Exit guide"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <span className="text-2xl font-bold text-gray-900 tracking-tight">
                Au<span className="text-blue-600">7</span>o
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <OfflineBadge />
              <CacheStatusBadge isCached={isGuideCached(guide.id)} />
              <span className="text-sm font-medium text-gray-500">
                {completedCount}/{totalSteps}
              </span>
              {timeEstimates.hasEstimates && (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-full text-sm text-blue-600 font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatTime(timeEstimates.remaining)} left
                </span>
              )}
              <span className="hidden sm:inline-flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600 font-medium">
                {progressPercent}%
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* "Where was I?" Resume Prompt (Story 3.2) */}
        {showResumePrompt && resumeStepIndex !== null && (
          <div className="border-t border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="max-w-3xl mx-auto px-6 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Welcome back!</p>
                    <p className="text-xs text-gray-600">
                      You completed {completedCount} of {totalSteps} steps. Continue from step {resumeStepIndex + 1}?
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={dismissResumePrompt}
                    className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Start from top
                  </button>
                  <button
                    type="button"
                    onClick={handleResume}
                    className="px-4 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Resume
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Guide Title Section */}
      <div className="relative bg-gray-50/50 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight mb-2">
                {guide.title}
              </h1>
              {guide.description && (
                <p className="text-gray-500 leading-relaxed">{guide.description}</p>
              )}
            </div>

            {/* Step Navigation Toggle (Story 3.3) */}
            <button
              type="button"
              onClick={() => setShowStepNav(!showStepNav)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showStepNav
                  ? 'bg-gray-900 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
              aria-expanded={showStepNav}
              aria-label="Toggle step navigation"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span className="hidden sm:inline">Jump to</span>
            </button>
          </div>

          {/* Time Overview Bar */}
          {timeEstimates.hasEstimates && (
            <div className="mt-4 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Total: <span className="font-medium">{formatTime(timeEstimates.total)}</span></span>
              </div>
              {completedCount > 0 && (
                <>
                  <span className="text-gray-300">|</span>
                  <div className="flex items-center gap-2 text-green-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Done: <span className="font-medium">{formatTime(timeEstimates.completed)}</span></span>
                  </div>
                  <span className="text-gray-300">|</span>
                  <div className="flex items-center gap-2 text-blue-600">
                    <span>Remaining: <span className="font-medium">{formatTime(timeEstimates.remaining)}</span></span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step Navigation Panel (Story 3.3) */}
          {showStepNav && (
            <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900 text-sm">All Steps</h3>
                <button
                  type="button"
                  onClick={() => setShowStepNav(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close step navigation"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {guide.steps.map((step, index) => {
                  const isComplete = completedSteps.has(step.number);
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => jumpToStep(index)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        isComplete
                          ? 'bg-green-50 hover:bg-green-100'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className={`
                        w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0
                        ${isComplete
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                        }
                      `}>
                        {isComplete ? (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          step.number
                        )}
                      </span>
                      <span className={`text-sm truncate flex-1 ${
                        isComplete ? 'text-green-800' : 'text-gray-700'
                      }`}>
                        {getStepTitle(step.instruction)}
                      </span>
                      {step.estimatedMinutes && (
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {step.estimatedMinutes}m
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Critical Safety Summary (Story 3.5) */}
      {criticalWarnings.length > 0 && !dismissedSafetySummary && (
        <div className="relative bg-gradient-to-r from-red-50 to-red-100/50 border-b border-red-200">
          <div className="max-w-3xl mx-auto px-6 py-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 animate-pulse">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 text-sm flex items-center gap-2">
                  Safety Warnings for This Guide
                  <span className="px-2 py-0.5 bg-red-200 text-red-800 rounded-full text-xs">
                    {criticalWarnings.length}
                  </span>
                </h3>
                <ul className="mt-2 space-y-1">
                  {criticalWarnings.slice(0, 3).map((warning, i) => (
                    <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                      <span className="text-red-400 flex-shrink-0">Step {warning.stepNumber}:</span>
                      <span>{warning.message}</span>
                    </li>
                  ))}
                  {criticalWarnings.length > 3 && (
                    <li className="text-xs text-red-600 mt-1">
                      +{criticalWarnings.length - 3} more warnings in later steps
                    </li>
                  )}
                </ul>
              </div>
              <button
                type="button"
                onClick={() => setDismissedSafetySummary(true)}
                className="p-1 text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                aria-label="Dismiss safety summary"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Steps List */}
      <div className="relative flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-4">
          {guide.steps.map((step, index) => {
            // Use step.number for persistence (step numbers, not indices)
            const isComplete = completedSteps.has(step.number);
            const isExpanded = expandedSteps.has(index);
            const stepTitle = getStepTitle(step.instruction);

            return (
              <div
                key={index}
                id={`step-${index}`}
                className={`
                  rounded-xl border transition-all duration-300
                  ${isComplete
                    ? 'border-green-200 bg-gradient-to-br from-green-50/80 to-white shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }
                `}
              >
                {/* Step Header */}
                <div className="flex items-center gap-4 p-4">
                  {/* Large Checkbox - 56px touch target */}
                  <button
                    type="button"
                    onClick={() => toggleStepComplete(index)}
                    className={`
                      flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center
                      transition-all duration-300 touch-manipulation
                      ${isComplete
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/30 scale-105'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:scale-105 active:scale-95'
                      }
                    `}
                    aria-label={isComplete ? `Mark step ${index + 1} incomplete` : `Mark step ${index + 1} complete`}
                  >
                    {isComplete ? (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-xl font-bold">{step.number}</span>
                    )}
                  </button>

                  {/* Step Title */}
                  <button
                    type="button"
                    onClick={() => toggleStepExpanded(index)}
                    className="flex-1 text-left py-2 min-h-[56px] flex items-center"
                    aria-expanded={isExpanded}
                  >
                    <div className="flex-1">
                      <p className={`
                        text-[16px] font-medium leading-snug tracking-tight
                        ${isComplete ? 'text-green-800' : 'text-gray-900'}
                      `}>
                        {stepTitle}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {step.estimatedMinutes && (
                          <span className="text-sm text-gray-400">
                            ~{step.estimatedMinutes} min
                          </span>
                        )}
                        {/* Safety indicator on collapsed steps (Story 3.5) */}
                        {!isExpanded && step.safetyWarnings.some(w => w.severity === 'high') && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Warning
                          </span>
                        )}
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform duration-300 mr-2 ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                    {/* Full Instruction */}
                    <p className="text-[17px] leading-relaxed text-gray-600 mb-5">
                      {step.instruction}
                    </p>

                    {/* Safety Warnings (Story 3.5 - Enhanced Visibility) */}
                    {step.safetyWarnings.length > 0 && (
                      <div className="space-y-3 mb-5">
                        {step.safetyWarnings.map((warning) => (
                          <div
                            key={warning.id}
                            className={`
                              rounded-xl border transition-all
                              ${warning.severity === 'high'
                                ? 'p-5 bg-gradient-to-r from-red-50 to-red-100/50 border-red-300 shadow-sm shadow-red-100'
                                : warning.severity === 'medium'
                                ? 'p-4 bg-amber-50 border-amber-200'
                                : 'p-4 bg-blue-50 border-blue-200'
                              }
                            `}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`
                                flex items-center justify-center flex-shrink-0 rounded-lg
                                ${warning.severity === 'high'
                                  ? 'w-10 h-10 bg-red-100 animate-pulse'
                                  : warning.severity === 'medium'
                                  ? 'w-8 h-8 bg-amber-100'
                                  : 'w-8 h-8 bg-blue-100'
                                }
                              `}>
                                <svg className={`${
                                  warning.severity === 'high' ? 'w-6 h-6 text-red-600' :
                                  warning.severity === 'medium' ? 'w-5 h-5 text-amber-600' : 'w-5 h-5 text-blue-600'
                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <p className={`font-semibold ${
                                  warning.severity === 'high' ? 'text-red-800 text-base' :
                                  warning.severity === 'medium' ? 'text-amber-800 text-sm' : 'text-blue-800 text-sm'
                                }`}>
                                  {warning.severity === 'high' ? 'SAFETY WARNING' : warning.severity === 'medium' ? 'Caution' : 'Note'}
                                </p>
                                <p className={`mt-1 ${
                                  warning.severity === 'high' ? 'text-red-700 text-[15px] leading-relaxed' :
                                  warning.severity === 'medium' ? 'text-amber-700 text-sm' : 'text-blue-700 text-sm'
                                }`}>
                                  {warning.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tips */}
                    {step.tips.length > 0 && (
                      <div className="space-y-3">
                        {step.tips.map((tip) => (
                          <div
                            key={tip.id}
                            className="flex items-start gap-3 p-4 bg-gradient-to-br from-amber-50 to-yellow-50/50 rounded-xl border border-amber-100"
                          >
                            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-sm text-amber-800">Tip</p>
                              <p className="text-sm text-amber-700 mt-1">{tip.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Inline Help Chat (Story 3.4) */}
                    <div className="mt-5 pt-5 border-t border-gray-100">
                      <InlineHelpChat
                        guideTitle={guide.title}
                        stepNumber={step.number}
                        stepInstruction={step.instruction}
                        vehicle={guide.vehicle}
                        toolsRequired={guide.tools?.map(t => t.name)}
                        safetyWarnings={step.safetyWarnings?.map(w => w.message)}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Action */}
      <div className="relative sticky bottom-0 border-t border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-6 py-4">
          {completedCount === totalSteps - 1 ? (
            <button
              type="button"
              onClick={() => {
                for (let i = 0; i < totalSteps; i++) {
                  if (!completedSteps.has(i)) {
                    toggleStepComplete(i);
                    break;
                  }
                }
              }}
              className="w-full inline-flex items-center justify-center px-8 py-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-all duration-200 text-lg hover:scale-[1.02] hover:shadow-lg"
            >
              Complete Final Step
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          ) : (
            <p className="text-center text-gray-400 text-sm">
              Tap the checkbox on each step to mark it complete
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

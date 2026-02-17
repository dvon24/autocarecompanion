'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { type Guide, type Part, type Tool } from '@/schemas/guide.schema';
import { useGuideProgress } from '@/hooks/useGuideProgress';
import { useGuideCache } from '@/hooks/useGuideCache';
import { trackEvent } from '@/components/analytics/GoogleAnalytics';
import { OfflineBadge } from '@/components/offline/OfflineIndicator';
import { CacheStatusBadge } from '@/components/offline/CacheStatusBadge';
import { OfflineFeatureGuard } from '@/components/offline/OfflineFeatureGuard';
import { InlineHelpChat } from '@/components/guide/InlineHelpChat';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { triggerHaptic } from '@/hooks/useHaptic';
import partDictionary from '@/data/part-dictionary.json';

/**
 * Detect user's region based on browser locale/timezone
 * Returns: 'US' | 'CA' | 'UK' | 'EU' | 'AU' | 'Global'
 */
function detectUserRegion(): string {
  if (typeof window === 'undefined') return 'US';

  try {
    // Try to get country from timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Map common timezones to regions
    if (timezone.startsWith('America/')) {
      // Check for Canadian cities
      const canadianTimezones = ['Toronto', 'Vancouver', 'Montreal', 'Edmonton', 'Calgary', 'Winnipeg', 'Halifax'];
      if (canadianTimezones.some(city => timezone.includes(city))) return 'CA';
      return 'US';
    }
    if (timezone.startsWith('Australia/')) return 'AU';
    if (timezone.startsWith('Europe/London') || timezone === 'GB') return 'UK';
    if (timezone.startsWith('Europe/')) return 'EU';

    // Fallback to navigator.language
    const lang = navigator.language.toLowerCase();
    if (lang.includes('-ca') || lang.includes('en-ca')) return 'CA';
    if (lang.includes('-au') || lang.includes('en-au')) return 'AU';
    if (lang.includes('-gb') || lang.includes('en-gb')) return 'UK';
    if (lang.includes('-de') || lang.includes('-fr') || lang.includes('-es') || lang.includes('-it')) return 'EU';

    return 'US';
  } catch {
    return 'US';
  }
}

/**
 * Sort retailers by region priority
 * User's region retailers first, then Global, then others
 */
function sortRetailersByRegion<T extends { region?: string }>(retailers: T[], userRegion: string): T[] {
  const regionPriority: Record<string, number> = {
    [userRegion]: 0,
    'Global': 1,
  };

  // EU/UK are related regions
  if (userRegion === 'UK') regionPriority['EU/UK'] = 0;
  if (userRegion === 'EU') regionPriority['EU/UK'] = 0;

  return [...retailers].sort((a, b) => {
    const priorityA = regionPriority[a.region || 'Global'] ?? 2;
    const priorityB = regionPriority[b.region || 'Global'] ?? 2;
    return priorityA - priorityB;
  });
}

/**
 * GuideExecution - Unified guide interface with integrated pre-flight checklist
 *
 * Story 1.7: Pre-Flight Modal (now integrated at top of page)
 * Story 1.8: Guide Execution Interface
 * Story 2.4: Offline Guide Access
 * Story 2.6: localStorage Persistence
 * Story 3.1: Time Estimates Display
 *
 * Expert UX recommendations (Gemini/Copilot):
 * - Parts/tools on SAME page, not in a modal
 * - Pre-flight checklist at top with checkboxes
 * - BMAD animated background
 * - Large touch targets (56x56px)
 * - No interrupting modals
 */

/**
 * Format minutes into human-readable time string
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
  onNextTask?: (taskName: string) => void;
};

/**
 * Generate a short title from the instruction
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

/**
 * Part Dictionary Entry Type
 */
type PartDictionaryEntry = {
  canonical: string;
  searchTerm: string;
  aliases: string[];
  stripModifiers: string[];
};

/**
 * Find a matching part in the dictionary by checking name against canonical names and aliases
 */
function findPartInDictionary(partName: string): PartDictionaryEntry | null {
  const lowerName = partName.toLowerCase();
  const parts = partDictionary.parts as Record<string, PartDictionaryEntry>;

  for (const entry of Object.values(parts)) {
    // Check canonical name
    if (lowerName.includes(entry.canonical.toLowerCase())) {
      return entry;
    }
    // Check aliases
    for (const alias of entry.aliases) {
      if (lowerName.includes(alias.toLowerCase())) {
        return entry;
      }
    }
  }
  return null;
}

/**
 * Strip location and size modifiers from a part name for better search results
 * e.g., "Driver side front brake pads ceramic" → "Brake Pads"
 */
function normalizePartName(partName: string, dictEntry: PartDictionaryEntry | null): string {
  let normalized = partName;

  // Common modifiers to always strip (location, side, position)
  const commonModifiers = [
    'driver', 'passenger', 'front', 'rear', 'left', 'right', 'side',
    'upper', 'lower', 'inner', 'outer', 'top', 'bottom',
    'oem', 'aftermarket', 'new', 'replacement', 'premium', 'economy',
    'for', 'the', 'vehicle', 'car', 'automotive'
  ];

  // Strip common modifiers
  for (const mod of commonModifiers) {
    normalized = normalized.replace(new RegExp(`\\b${mod}\\b`, 'gi'), '');
  }

  // If we found a dictionary entry, use its search term and strip its specific modifiers
  if (dictEntry) {
    // Strip part-specific modifiers (e.g., "ceramic" for brake pads, "26 inch" for wipers)
    for (const mod of dictEntry.stripModifiers) {
      normalized = normalized.replace(new RegExp(`\\b${mod}\\b`, 'gi'), '');
    }
    // Use the optimized search term from dictionary
    return dictEntry.searchTerm;
  }

  // Clean up whitespace
  return normalized.replace(/\s+/g, ' ').trim();
}

/**
 * Build a clean, universal search query for automotive parts
 * Uses part dictionary for optimal search terms and strips location modifiers
 * Format: {year} {make} {model} {trim} {optimizedPartName}
 */
function buildCleanPartQuery(part: Part, vehicle: { year: number; make: string; model: string; trim?: string }): string {
  const queryParts = [
    vehicle.year.toString(),
    vehicle.make,
    vehicle.model,
  ];

  // Add trim if available and not generic
  if (vehicle.trim && !['Base', 'Standard'].includes(vehicle.trim)) {
    queryParts.push(vehicle.trim);
  }

  // Find matching dictionary entry and normalize the part name
  const dictEntry = findPartInDictionary(part.name);
  const optimizedPartName = normalizePartName(part.name, dictEntry);

  queryParts.push(optimizedPartName);

  return queryParts.join(' ');
}

/**
 * Generate search URLs for a part across multiple auto parts retailers
 * Uses region-aware retailers for global compatibility
 *
 * Regions supported:
 * - US: Amazon, AutoZone, O'Reilly, RockAuto, Advance Auto Parts
 * - CA: Canadian Tire, PartSource
 * - UK/EU: AutoDoc
 * - AU: SuperCheap Auto, Repco
 * - Global: eBay
 */
function getPartSearchUrls(part: Part, vehicle: { year: number; make: string; model: string; trim?: string }): {
  name: string;
  url: string;
  color: string;
  region?: string;
}[] {
  const query = buildCleanPartQuery(part, vehicle);
  const encodedQuery = encodeURIComponent(query);

  // RockAuto search via Google site search (most reliable)
  const rockAutoQuery = encodeURIComponent(`site:rockauto.com ${query}`);

  return [
    // Primary retailers (most reliable)
    {
      name: 'RockAuto',
      url: `https://www.google.com/search?q=${rockAutoQuery}`,
      color: 'bg-yellow-600 hover:bg-yellow-700',
      region: 'Global',
    },
    {
      name: 'Amazon',
      url: `https://www.amazon.com/s?k=${encodedQuery}`,
      color: 'bg-orange-500 hover:bg-orange-600',
      region: 'Global',
    },
    {
      name: 'eBay',
      url: `https://www.ebay.com/sch/i.html?_nkw=${encodedQuery}`,
      color: 'bg-purple-600 hover:bg-purple-700',
      region: 'Global',
    },
    // Video tutorials
    {
      name: 'YouTube',
      url: `https://www.youtube.com/results?search_query=${encodedQuery}+review`,
      color: 'bg-red-500 hover:bg-red-600',
      region: 'Global',
    },
    // Fallback search
    {
      name: 'Google',
      url: `https://www.google.com/search?q=${encodedQuery}+buy`,
      color: 'bg-blue-500 hover:bg-blue-600',
      region: 'Global',
    },
  ];
}

/**
 * Generate search URLs for a tool
 */
function getToolSearchUrls(tool: Tool): {
  name: string;
  url: string;
  color: string;
  region?: string;
}[] {
  // Clean tool name - no filler words
  const cleanToolName = tool.name
    .replace(/\b(automotive|car|vehicle|tool|set)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  const encodedQuery = encodeURIComponent(cleanToolName + ' automotive tool');

  return [
    {
      name: 'Amazon',
      url: `https://www.amazon.com/s?k=${encodedQuery}`,
      color: 'bg-orange-500 hover:bg-orange-600',
    },
    {
      name: 'eBay',
      url: `https://www.ebay.com/sch/i.html?_nkw=${encodedQuery}`,
      color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      name: 'Google',
      url: `https://www.google.com/search?q=${encodedQuery}+buy`,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
  ];
}

/**
 * Pre-flight item card with checkbox and retailer links
 */
function PreFlightItem({
  name,
  detail,
  isChecked,
  onToggle,
  searchUrls,
  type,
  isRequired = true,
}: {
  name: string;
  detail?: string;
  isChecked: boolean;
  onToggle: () => void;
  searchUrls: { name: string; url: string; color: string; region?: string }[];
  type: 'part' | 'tool';
  isRequired?: boolean;
}) {
  const [showLinks, setShowLinks] = useState(false);

  // Sort retailers by user's detected region (memoized to avoid re-sorting on every render)
  const sortedUrls = useMemo(() => {
    const userRegion = detectUserRegion();
    return sortRetailersByRegion(searchUrls, userRegion);
  }, [searchUrls]);

  return (
    <div
      className={`
        relative rounded-xl border-2 p-4 transition-all duration-300
        ${isChecked
          ? 'border-green-400 bg-green-50/50'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        }
      `}
    >
      <div className="flex items-start gap-3">
        {/* Large Checkbox - 48px touch target */}
        <button
          type="button"
          onClick={onToggle}
          className={`
            flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center
            transition-all duration-200 touch-manipulation
            ${isChecked
              ? 'bg-green-500 text-white shadow-md shadow-green-500/30'
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }
          `}
          aria-label={isChecked ? `Uncheck ${name}` : `Check ${name}`}
        >
          {isChecked ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {type === 'part' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              )}
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={`font-medium ${isChecked ? 'text-green-800' : 'text-gray-900'}`}>
              {name}
            </h4>
            {!isRequired && (
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">Optional</span>
            )}
          </div>
          {detail && (
            <p className="text-sm text-gray-500 mt-0.5">{detail}</p>
          )}

          {/* Shop Links Toggle */}
          <button
            type="button"
            onClick={() => setShowLinks(!showLinks)}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {showLinks ? 'Hide shops' : 'Find this part'}
            <svg className={`w-3 h-3 transition-transform ${showLinks ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Retailer Links - sorted by user's region */}
          {showLinks && (
            <div className="mt-3 flex flex-wrap gap-2">
              {sortedUrls.map((retailer) => (
                <a
                  key={retailer.name}
                  href={retailer.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('affiliate_click', {
                    retailer: retailer.name,
                    item_type: type,
                    item_name: name,
                  })}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-medium rounded-lg transition-colors ${retailer.color}`}
                >
                  {retailer.name}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function GuideExecution({
  guide,
  onComplete,
  onExit,
  onNextTask,
}: GuideExecutionProps) {
  const totalSteps = guide.steps.length;
  const stepsRef = useRef<HTMLDivElement>(null);

  // Pre-flight checklist state
  const [checkedParts, setCheckedParts] = useState<Set<string>>(new Set());
  const [checkedTools, setCheckedTools] = useState<Set<string>>(new Set());
  const [showPreFlight, setShowPreFlight] = useState(true);

  // Calculate pre-flight completion
  const requiredPartsCount = guide.parts.length;
  const requiredToolsCount = guide.tools.filter(t => t.required !== false).length;
  const checkedPartsCount = checkedParts.size;
  const checkedToolsCount = [...checkedTools].filter(id =>
    guide.tools.find(t => t.id === id)?.required !== false
  ).length;
  const preFlightComplete = checkedPartsCount >= requiredPartsCount && checkedToolsCount >= requiredToolsCount;

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
    vehicleInfo: `${guide.vehicle.year} ${guide.vehicle.make} ${guide.vehicle.model}${guide.vehicle.trim ? ` ${guide.vehicle.trim}` : ''}`,
    totalSteps,
  });

  // Guide caching for offline use (Story 2.1, 2.2)
  const { cacheGuide, isGuideCached } = useGuideCache();

  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([0]));
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [resumeStepIndex, setResumeStepIndex] = useState<number | null>(null);

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
      const nextStepIndex = guide.steps.findIndex(
        (step) => !completedSteps.has(step.number)
      );

      if (nextStepIndex > 0) {
        setResumeStepIndex(nextStepIndex);
        setShowResumePrompt(true);
        setShowPreFlight(false); // Skip pre-flight for returning users
      }
    }

    // If user has progress, skip pre-flight
    if (completedStepsArray.length > 0) {
      setShowPreFlight(false);
    }
  }, [isLoaded]); // Only run once when progress loads

  const toggleStepComplete = useCallback((index: number) => {
    const stepNumber = guide.steps[index].number;
    const wasComplete = completedSteps.has(stepNumber);

    // Haptic feedback
    triggerHaptic(wasComplete ? 'light' : 'medium');

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
    setShowPreFlight(true);
    setCheckedParts(new Set());
    setCheckedTools(new Set());
  }, [resetProgress]);

  // Handle resuming from where user left off
  const handleResume = useCallback(() => {
    if (resumeStepIndex !== null) {
      setExpandedSteps(new Set([resumeStepIndex]));
      setShowResumePrompt(false);

      setTimeout(() => {
        const stepElement = document.getElementById(`step-${resumeStepIndex}`);
        stepElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [resumeStepIndex]);

  const dismissResumePrompt = useCallback(() => {
    setShowResumePrompt(false);
  }, []);

  // Scroll to steps section
  const scrollToSteps = useCallback(() => {
    setShowPreFlight(false);
    setTimeout(() => {
      stepsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  // Toggle part checked
  const togglePartChecked = useCallback((partId: string) => {
    setCheckedParts(prev => {
      const next = new Set(prev);
      if (next.has(partId)) {
        next.delete(partId);
      } else {
        next.add(partId);
      }
      return next;
    });
  }, []);

  // Toggle tool checked
  const toggleToolChecked = useCallback((toolId: string) => {
    setCheckedTools(prev => {
      const next = new Set(prev);
      if (next.has(toolId)) {
        next.delete(toolId);
      } else {
        next.add(toolId);
      }
      return next;
    });
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
        {/* Animated Background */}
        <AnimatedBackground />

        {/* Gradient blobs */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%)',
            filter: 'blur(80px)',
            transform: 'translate(20%, -30%)',
            zIndex: 1,
          }}
        />

        {/* Header */}
        <header className="relative px-6 py-4 border-b border-gray-100" style={{ zIndex: 2 }}>
          <div className="max-w-3xl mx-auto flex items-center justify-center gap-2">
            <Image
              src="/og-image.png"
              alt="Au7o mascot"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-2xl font-bold text-gray-900 tracking-tight">
              Au<span className="text-blue-600">7</span>o
            </span>
          </div>
        </header>

        {/* Completion Content */}
        <div className="relative flex-1 flex items-center justify-center px-6 py-20" style={{ zIndex: 2 }}>
          <div className="text-center max-w-md">
            <ScrollReveal delay={0} duration={800}>
              <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100} duration={800}>
              <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight mb-4">
                Great job!
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={200} duration={800}>
              <p className="text-lg text-gray-500 mb-10 leading-relaxed">
                You&apos;ve completed all {totalSteps} steps of the {guide.title} guide.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={300} duration={800}>
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
            </ScrollReveal>

            {/* What's Next Section */}
            {onNextTask && (
              <ScrollReveal delay={400} duration={800}>
                <div className="mt-10 pt-8 border-t border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">What&apos;s next?</h2>
                  <p className="text-sm text-gray-500 mb-4 text-center">
                    Keep your {guide.vehicle.year} {guide.vehicle.make} {guide.vehicle.model} running great
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: 'Oil change', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
                      { name: 'Tire rotation', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
                      { name: 'Air filter replacement', icon: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z' },
                      { name: 'Battery check', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                    ]
                      .filter(task => task.name.toLowerCase() !== guide.title.toLowerCase())
                      .slice(0, 4)
                      .map((task) => (
                        <button
                          key={task.name}
                          type="button"
                          onClick={() => onNextTask(task.name)}
                          className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 hover:border-gray-300 transition-all hover:scale-[1.02]"
                        >
                          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={task.icon} />
                          </svg>
                          <span className="text-sm font-medium text-gray-700 text-center">{task.name}</span>
                        </button>
                      ))}
                  </div>
                </div>
              </ScrollReveal>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Safety config
  const safetyConfig = {
    'diy-safe': { label: 'DIY Safe', color: 'green' },
    'diy-safe-with-care': { label: 'DIY Safe with Care', color: 'amber' },
    'requires-mechanic': { label: 'Professional Recommended', color: 'red' },
  };
  const safety = safetyConfig[guide.safetyLevel];

  return (
    <div className="min-h-screen bg-white font-[system-ui,sans-serif] relative overflow-hidden">
      {/* Animated Engine Background */}
      <AnimatedBackground />

      {/* Gradient blobs */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
          filter: 'blur(80px)',
          transform: 'translate(20%, -30%)',
          zIndex: 1,
        }}
      />

      {/* Header */}
      <header className="relative sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4">
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
              <Image
                src="/og-image.png"
                alt="Au7o mascot"
                width={28}
                height={28}
                className="rounded-lg"
              />
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

        {/* Resume Prompt */}
        {showResumePrompt && resumeStepIndex !== null && (
          <div className="border-t border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="max-w-4xl mx-auto px-6 py-3">
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
                    Resume
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="relative" style={{ zIndex: 2 }}>
        {/* Guide Title Section */}
        <div className="bg-gray-50/80 backdrop-blur-sm border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <ScrollReveal delay={0} duration={600}>
              <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                <span>{guide.vehicle.year} {guide.vehicle.make} {guide.vehicle.model}{guide.vehicle.trim && ` ${guide.vehicle.trim}`}</span>
                <span className="text-gray-300">•</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  safety.color === 'green' ? 'bg-green-100 text-green-700' :
                  safety.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {safety.label}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight mb-2">
                {guide.title}
              </h1>
              {guide.description && (
                <p className="text-gray-500 leading-relaxed">{guide.description}</p>
              )}
            </ScrollReveal>

            {/* Quick Stats */}
            <ScrollReveal delay={100} duration={600}>
              <div className="flex flex-wrap gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{guide.timeEstimate}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>{totalSteps} steps</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-gray-500">Difficulty:</span>
                  <span className="text-yellow-500">{'★'.repeat(guide.difficulty)}{'☆'.repeat(5 - guide.difficulty)}</span>
                </div>
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${guide.vehicle.year} ${guide.vehicle.make} ${guide.vehicle.model}${guide.vehicle.trim ? ` ${guide.vehicle.trim}` : ''} ${guide.title} tutorial`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span className="text-sm font-medium">Watch Tutorial</span>
                </a>
              </div>
            </ScrollReveal>

            {/* AI Disclaimer & Owner's Manual Reference */}
            <ScrollReveal delay={150} duration={600}>
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-amber-800">
                    <p className="font-medium">Important</p>
                    <p className="mt-1">
                      This guide is AI-generated. Always consult your <strong>owner&apos;s manual</strong> for
                      vehicle-specific specifications. Torque specs, fluid capacities, and procedures may vary.
                      By using this guide, you accept responsibility for your repairs.{' '}
                      <a href="/terms" className="underline hover:text-amber-900">See terms</a>.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

          </div>
        </div>

        {/* Pre-Flight Checklist Section */}
        {showPreFlight && (guide.parts.length > 0 || guide.tools.length > 0) && (
          <div className="bg-white border-b border-gray-100">
            <div className="max-w-4xl mx-auto px-6 py-8">
              <ScrollReveal delay={0} duration={600}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Before You Start</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Check off items or skip if you already have everything
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      preFlightComplete ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {checkedPartsCount + checkedToolsCount} / {requiredPartsCount + requiredToolsCount}
                    </span>
                  </div>
                </div>

                {/* Skip Button */}
                <button
                  type="button"
                  onClick={scrollToSteps}
                  className="w-full mb-6 py-3 px-4 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                  I have everything - Skip to guide
                </button>
              </ScrollReveal>

              {/* Parts Grid */}
              {guide.parts.length > 0 && (
                <div className="mb-8">
                  <ScrollReveal delay={100} duration={600}>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      Parts ({guide.parts.length})
                    </h3>
                  </ScrollReveal>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {guide.parts.map((part, index) => (
                      <ScrollReveal key={part.id} delay={150 + index * 50} duration={500}>
                        <PreFlightItem
                          name={part.name}
                          detail={part.partNumber ? `Part #: ${part.partNumber}` : undefined}
                          isChecked={checkedParts.has(part.id)}
                          onToggle={() => togglePartChecked(part.id)}
                          searchUrls={getPartSearchUrls(part, guide.vehicle)}
                          type="part"
                        />
                      </ScrollReveal>
                    ))}
                  </div>
                </div>
              )}

              {/* Tools Grid */}
              {guide.tools.length > 0 && (
                <div className="mb-8">
                  <ScrollReveal delay={200} duration={600}>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Tools ({guide.tools.length})
                    </h3>
                  </ScrollReveal>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {guide.tools.map((tool, index) => (
                      <ScrollReveal key={tool.id} delay={250 + index * 50} duration={500}>
                        <PreFlightItem
                          name={tool.name}
                          detail={tool.purpose}
                          isChecked={checkedTools.has(tool.id)}
                          onToggle={() => toggleToolChecked(tool.id)}
                          searchUrls={getToolSearchUrls(tool)}
                          type="tool"
                          isRequired={tool.required !== false}
                        />
                      </ScrollReveal>
                    ))}
                  </div>
                </div>
              )}

              {/* Start Button */}
              <ScrollReveal delay={300} duration={600}>
                <button
                  type="button"
                  onClick={scrollToSteps}
                  className="w-full py-4 px-6 rounded-xl font-medium text-lg transition-all duration-200 bg-gray-900 text-white hover:bg-gray-800 hover:scale-[1.02] hover:shadow-lg"
                >
                  {preFlightComplete ? (
                    <>
                      All Ready - Start Guide
                      <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  ) : (
                    <>
                      Start Guide
                      <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </>
                  )}
                </button>
              </ScrollReveal>
            </div>
          </div>
        )}

        {/* Critical Safety Summary */}
        {criticalWarnings.length > 0 && !dismissedSafetySummary && !showPreFlight && (
          <div className="bg-gradient-to-r from-red-50 to-red-100/50 border-b border-red-200">
            <div className="max-w-4xl mx-auto px-6 py-4">
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
        <div ref={stepsRef} className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-6 space-y-4">
            {guide.steps.map((step, index) => {
              const isComplete = completedSteps.has(step.number);
              const isExpanded = expandedSteps.has(index);
              const stepTitle = getStepTitle(step.instruction);

              return (
                <ScrollReveal key={index} delay={index * 80} duration={500}>
                  <div
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
                        <p className="text-[17px] leading-relaxed text-gray-600 mb-5">
                          {step.instruction}
                        </p>

                        {/* Safety Warnings */}
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

                        {/* Inline Help Chat - Disabled when offline (Story 2.5) */}
                        <div className="mt-5 pt-5 border-t border-gray-100">
                          <OfflineFeatureGuard
                            featureName="AI Help"
                            offlineAlternative="Review the tips above or check YouTube tutorials"
                            showDisabled
                          >
                            <InlineHelpChat
                              guideTitle={guide.title}
                              stepNumber={step.number}
                              stepInstruction={step.instruction}
                              vehicle={guide.vehicle}
                              toolsRequired={guide.tools?.map(t => t.name)}
                              safetyWarnings={step.safetyWarnings?.map(w => w.message)}
                            />
                          </OfflineFeatureGuard>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>

        {/* Bottom Action */}
        <div className="sticky bottom-0 border-t border-gray-100 bg-white/80 backdrop-blur-md">
          <div className="max-w-4xl mx-auto px-6 py-4">
            {completedCount === totalSteps - 1 ? (
              <button
                type="button"
                onClick={() => {
                  for (let i = 0; i < totalSteps; i++) {
                    if (!completedSteps.has(guide.steps[i].number)) {
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
    </div>
  );
}

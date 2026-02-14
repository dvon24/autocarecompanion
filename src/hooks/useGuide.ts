'use client';

import { useState, useCallback } from 'react';
import { type Guide } from '@/schemas/guide.schema';
import { type Vehicle } from '@/schemas/vehicle.schema';
import { type Diagnosis } from '@/schemas/chat.schema';
import { trackEvent } from '@/components/analytics/GoogleAnalytics';

/**
 * useGuide Hook - Guide Generation & State Management
 *
 * Manages the guide generation and state.
 *
 * Story 1.6: Guide Generation via AI
 * Follows Architecture patterns:
 * - Async function naming: generateGuide (async API call)
 * - Immutable state updates
 */

type GuideStatus = 'idle' | 'generating' | 'success' | 'error';

type UseGuideReturn = {
  // Guide state
  guide: Guide | null;
  status: GuideStatus;
  error: string | null;

  // Computed
  isGenerating: boolean;
  hasGuide: boolean;

  // Actions
  generateGuide: (vehicle: Vehicle, diagnosis: Diagnosis) => Promise<void>;
  clearGuide: () => void;
};

export function useGuide(): UseGuideReturn {
  const [guide, setGuide] = useState<Guide | null>(null);
  const [status, setStatus] = useState<GuideStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const generateGuide = useCallback(async (vehicle: Vehicle, diagnosis: Diagnosis) => {
    if (status === 'generating') return;

    setStatus('generating');
    setError(null);

    try {
      const response = await fetch('/api/guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle: {
            year: vehicle.year,
            make: vehicle.make,
            model: vehicle.model,
            trim: vehicle.trim,
          },
          diagnosis: {
            id: diagnosis.id,
            title: diagnosis.title,
            description: diagnosis.description,
            confidence: diagnosis.confidence,
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to generate guide');
      }

      const data = await response.json();
      setGuide(data.guide);
      setStatus('success');

      // Track guide generation in analytics
      trackEvent('guide_generated', {
        vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        diagnosis: diagnosis.title,
        difficulty: data.guide?.difficulty || 0,
      });
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }, [status]);

  const clearGuide = useCallback(() => {
    setGuide(null);
    setStatus('idle');
    setError(null);
  }, []);

  return {
    // State
    guide,
    status,
    error,

    // Computed
    isGenerating: status === 'generating',
    hasGuide: guide !== null,

    // Actions
    generateGuide,
    clearGuide,
  };
}

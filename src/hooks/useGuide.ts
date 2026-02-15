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

  const generateGuide = useCallback(async (vehicle: Vehicle, diagnosis: Diagnosis, retryCount = 0) => {
    if (status === 'generating') return;

    setStatus('generating');
    setError(null);

    // AbortController with 65 second timeout (slightly longer than server's 60s)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 65000);

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
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        // Auto-retry once for timeout errors
        if (response.status === 504 && retryCount < 1) {
          console.log('[useGuide] Retrying after timeout...');
          setStatus('idle');
          return generateGuide(vehicle, diagnosis, retryCount + 1);
        }

        throw new Error(data.error || 'Failed to generate guide');
      }

      const data = await response.json();
      setGuide(data.guide);
      setStatus('success');

      // Track guide generation in analytics
      trackEvent('guide_generated', {
        vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''}`,
        diagnosis: diagnosis.title,
        difficulty: data.guide?.difficulty || 0,
      });
    } catch (err) {
      clearTimeout(timeoutId);
      setStatus('error');

      if (err instanceof Error && err.name === 'AbortError') {
        setError('Guide generation timed out. Please try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
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

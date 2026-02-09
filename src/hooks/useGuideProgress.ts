'use client';

import { useState, useCallback, useEffect } from 'react';

/**
 * useGuideProgress - Hook for persisting guide execution progress
 *
 * Story 2.6: localStorage Persistence
 *
 * Features:
 * - Save completed steps to localStorage
 * - Restore progress on page reload
 * - Works offline
 * - 90+ day persistence
 * - Survives browser close, device restart, airplane mode
 */

const PROGRESS_KEY_PREFIX = 'au7o_progress_';
const PROGRESS_INDEX_KEY = 'au7o_guide_progress_index';
const PROGRESS_VALIDITY_DAYS = 90;

type GuideProgress = {
  guideId: string;
  completedSteps: number[];
  startedAt: number;
  updatedAt: number;
  expiresAt: number;
};

type ProgressIndexEntry = {
  guideId: string;
  guideTitle: string;
  vehicleInfo: string;
  completedSteps: number;
  totalSteps: number;
  updatedAt: number;
};

type UseGuideProgressOptions = {
  guideId: string;
  guideTitle?: string;
  vehicleInfo?: string;
  totalSteps?: number;
};

type UseGuideProgressReturn = {
  /** Currently completed step numbers */
  completedSteps: number[];
  /** Mark a step as complete */
  markStepComplete: (stepNumber: number) => void;
  /** Mark a step as incomplete */
  markStepIncomplete: (stepNumber: number) => void;
  /** Toggle step completion */
  toggleStepComplete: (stepNumber: number) => void;
  /** Check if a step is complete */
  isStepComplete: (stepNumber: number) => boolean;
  /** Reset all progress for this guide */
  resetProgress: () => void;
  /** Progress percentage (0-100) */
  progressPercent: number;
  /** Is progress loaded from storage */
  isLoaded: boolean;
};

/**
 * Get the progress key for a guide
 */
function getProgressKey(guideId: string): string {
  return `${PROGRESS_KEY_PREFIX}${guideId}`;
}

export function useGuideProgress(options: UseGuideProgressOptions): UseGuideProgressReturn {
  const { guideId, guideTitle = '', vehicleInfo = '', totalSteps = 0 } = options;

  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load progress from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const progressJson = localStorage.getItem(getProgressKey(guideId));
      if (progressJson) {
        const progress: GuideProgress = JSON.parse(progressJson);

        // Check if expired
        if (Date.now() > progress.expiresAt) {
          localStorage.removeItem(getProgressKey(guideId));
          setCompletedSteps([]);
        } else {
          setCompletedSteps(progress.completedSteps || []);
        }
      }
    } catch (error) {
      console.error('Error loading guide progress:', error);
    }

    setIsLoaded(true);
  }, [guideId]);

  // Save progress to localStorage
  const saveProgress = useCallback((steps: number[]) => {
    if (typeof window === 'undefined') return;

    try {
      const now = Date.now();
      const progress: GuideProgress = {
        guideId,
        completedSteps: steps,
        startedAt: now,
        updatedAt: now,
        expiresAt: now + (PROGRESS_VALIDITY_DAYS * 24 * 60 * 60 * 1000),
      };

      localStorage.setItem(getProgressKey(guideId), JSON.stringify(progress));

      // Update the progress index for listing active guides
      updateProgressIndex(guideId, guideTitle, vehicleInfo, steps.length, totalSteps);
    } catch (error) {
      console.error('Error saving guide progress:', error);
    }
  }, [guideId, guideTitle, vehicleInfo, totalSteps]);

  // Update the progress index
  const updateProgressIndex = useCallback((
    id: string,
    title: string,
    vehicle: string,
    completed: number,
    total: number
  ) => {
    try {
      const indexJson = localStorage.getItem(PROGRESS_INDEX_KEY);
      const index: ProgressIndexEntry[] = indexJson ? JSON.parse(indexJson) : [];

      // Update or add entry
      const existingIndex = index.findIndex(e => e.guideId === id);
      const entry: ProgressIndexEntry = {
        guideId: id,
        guideTitle: title,
        vehicleInfo: vehicle,
        completedSteps: completed,
        totalSteps: total,
        updatedAt: Date.now(),
      };

      if (existingIndex >= 0) {
        index[existingIndex] = entry;
      } else {
        index.push(entry);
      }

      localStorage.setItem(PROGRESS_INDEX_KEY, JSON.stringify(index));
    } catch (error) {
      console.error('Error updating progress index:', error);
    }
  }, []);

  // Mark a step as complete
  const markStepComplete = useCallback((stepNumber: number) => {
    setCompletedSteps(prev => {
      if (prev.includes(stepNumber)) return prev;
      const updated = [...prev, stepNumber].sort((a, b) => a - b);
      saveProgress(updated);
      return updated;
    });
  }, [saveProgress]);

  // Mark a step as incomplete
  const markStepIncomplete = useCallback((stepNumber: number) => {
    setCompletedSteps(prev => {
      if (!prev.includes(stepNumber)) return prev;
      const updated = prev.filter(n => n !== stepNumber);
      saveProgress(updated);
      return updated;
    });
  }, [saveProgress]);

  // Toggle step completion
  const toggleStepComplete = useCallback((stepNumber: number) => {
    setCompletedSteps(prev => {
      const updated = prev.includes(stepNumber)
        ? prev.filter(n => n !== stepNumber)
        : [...prev, stepNumber].sort((a, b) => a - b);
      saveProgress(updated);
      return updated;
    });
  }, [saveProgress]);

  // Check if a step is complete
  const isStepComplete = useCallback((stepNumber: number): boolean => {
    return completedSteps.includes(stepNumber);
  }, [completedSteps]);

  // Reset all progress for this guide
  const resetProgress = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(getProgressKey(guideId));

      // Update the index
      const indexJson = localStorage.getItem(PROGRESS_INDEX_KEY);
      if (indexJson) {
        const index: ProgressIndexEntry[] = JSON.parse(indexJson);
        const filtered = index.filter(e => e.guideId !== guideId);
        localStorage.setItem(PROGRESS_INDEX_KEY, JSON.stringify(filtered));
      }

      setCompletedSteps([]);
    } catch (error) {
      console.error('Error resetting progress:', error);
    }
  }, [guideId]);

  // Calculate progress percentage
  const progressPercent = totalSteps > 0
    ? Math.round((completedSteps.length / totalSteps) * 100)
    : 0;

  return {
    completedSteps,
    markStepComplete,
    markStepIncomplete,
    toggleStepComplete,
    isStepComplete,
    resetProgress,
    progressPercent,
    isLoaded,
  };
}

/**
 * Get all guides with saved progress
 */
export function getAllGuideProgress(): ProgressIndexEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const indexJson = localStorage.getItem(PROGRESS_INDEX_KEY);
    if (!indexJson) return [];

    return JSON.parse(indexJson) as ProgressIndexEntry[];
  } catch (error) {
    console.error('Error getting all guide progress:', error);
    return [];
  }
}

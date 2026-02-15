'use client';

/**
 * useHaptic - Haptic feedback for mobile interactions
 *
 * Provides tactile feedback on button presses and interactions.
 * Uses the Vibration API where available.
 */

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error';

const patterns: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [10, 50, 10],
  error: [50, 30, 50],
};

/**
 * Trigger haptic feedback
 */
export function triggerHaptic(pattern: HapticPattern = 'light'): void {
  if (typeof navigator === 'undefined') return;

  // Check if Vibration API is available
  if (!('vibrate' in navigator)) return;

  try {
    navigator.vibrate(patterns[pattern]);
  } catch {
    // Silently fail if vibration not supported
  }
}

/**
 * Hook for haptic feedback
 */
export function useHaptic() {
  return {
    light: () => triggerHaptic('light'),
    medium: () => triggerHaptic('medium'),
    heavy: () => triggerHaptic('heavy'),
    success: () => triggerHaptic('success'),
    error: () => triggerHaptic('error'),
    trigger: triggerHaptic,
  };
}

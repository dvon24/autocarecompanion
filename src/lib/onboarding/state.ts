/**
 * Onboarding state — derived from URL query param + persistence flag.
 *
 * URL drives the step (so refresh + back-button work) and the
 * persistence flag (user.onboardingCompletedAt) drives whether we
 * route a user back through it.
 *
 * Mobile flow: 3 steps (welcome / how-it-works / add-car).
 * Desktop flow: single modal — no step state, only present/dismissed.
 */

export type OnboardingStep = 1 | 2 | 3;

export const ONBOARDING_TOTAL_STEPS = 3;

export function parseStep(raw: string | null): OnboardingStep {
  const n = Number(raw);
  if (n === 1 || n === 2 || n === 3) return n;
  return 1;
}

export function nextStep(step: OnboardingStep): OnboardingStep {
  return (step < ONBOARDING_TOTAL_STEPS ? step + 1 : step) as OnboardingStep;
}

export function prevStep(step: OnboardingStep): OnboardingStep {
  return (step > 1 ? step - 1 : step) as OnboardingStep;
}

/** Hardcoded landing destinations so every "skip / browse / done" path
 *  has a single source of truth. */
export const ONBOARDING_DESTINATIONS = {
  /** Where the user lands when they finish all 3 steps (no vehicle yet). */
  finishedNoVehicle: '/garage',
  /** Where the user lands after they add a vehicle in step 3. */
  finishedWithVehicle: (slug: string) => `/vehicle/${slug}`,
  /** "Just let me browse" escape hatch from any step. */
  justBrowse: '/known-issues',
} as const;

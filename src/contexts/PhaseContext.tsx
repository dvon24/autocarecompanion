'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { type Phase } from '@/lib/design-tokens';

/**
 * Phase Context for Two-Phase Design Language
 *
 * Provides application-wide phase state management for switching between:
 * - Discovery: Calm, exploratory UI for vehicle selection and symptom input
 * - Execution: High-contrast AAA UI for garage conditions
 */

type PhaseContextValue = {
  phase: Phase;
  setPhase: (phase: Phase) => void;
  togglePhase: () => void;
  isDiscovery: boolean;
  isExecution: boolean;
};

const PhaseContext = createContext<PhaseContextValue | null>(null);

type PhaseProviderProps = {
  children: ReactNode;
  defaultPhase?: Phase;
};

export function PhaseProvider({ children, defaultPhase = 'discovery' }: PhaseProviderProps) {
  const [phase, setPhaseState] = useState<Phase>(defaultPhase);

  const setPhase = useCallback((newPhase: Phase) => {
    setPhaseState(newPhase);
  }, []);

  const togglePhase = useCallback(() => {
    setPhaseState((current) => (current === 'discovery' ? 'execution' : 'discovery'));
  }, []);

  const value: PhaseContextValue = {
    phase,
    setPhase,
    togglePhase,
    isDiscovery: phase === 'discovery',
    isExecution: phase === 'execution',
  };

  return <PhaseContext.Provider value={value}>{children}</PhaseContext.Provider>;
}

export function usePhase(): PhaseContextValue {
  const context = useContext(PhaseContext);

  if (context === null) {
    throw new Error('usePhase must be used within a PhaseProvider');
  }

  return context;
}

/**
 * Helper hook to get phase-specific CSS class
 * @param discoveryClass - Class to apply in discovery phase
 * @param executionClass - Class to apply in execution phase
 * @returns The appropriate class based on current phase
 */
export function usePhaseClass(discoveryClass: string, executionClass: string): string {
  const { phase } = usePhase();
  return phase === 'discovery' ? discoveryClass : executionClass;
}

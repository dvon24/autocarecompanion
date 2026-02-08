'use client';

import { useEffect, useState, type ReactNode } from 'react';

/**
 * PageTransition - Enhanced fade-in wrapper with "The Breath" animation
 *
 * UX Spec: "The Breath" phase transition creates a distinctive, memorable
 * UX moment that communicates "now we're getting serious"
 *
 * Variants:
 * - 'fade': Simple fade-in (default, 300ms)
 * - 'breath': "The Breath" transition for phase changes (400ms with scale)
 */

type TransitionVariant = 'fade' | 'breath';

type PageTransitionProps = {
  children: ReactNode;
  variant?: TransitionVariant;
  duration?: number;
};

export function PageTransition({
  children,
  variant = 'fade',
  duration,
}: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Duration defaults based on variant (UX Spec: 400ms for breath)
  const transitionDuration = duration ?? (variant === 'breath' ? 400 : 300);

  useEffect(() => {
    // Small delay to ensure CSS transition triggers
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  // "The Breath" uses scale + opacity for premium feel
  const breathStyle = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'scale(1)' : 'scale(0.995)',
    transitionProperty: 'opacity, transform',
    transitionDuration: `${transitionDuration}ms`,
    transitionTimingFunction: 'ease-out',
  };

  // Simple fade uses opacity only
  const fadeStyle = {
    opacity: isVisible ? 1 : 0,
    transitionProperty: 'opacity',
    transitionDuration: `${transitionDuration}ms`,
    transitionTimingFunction: 'ease-out',
  };

  return (
    <div style={variant === 'breath' ? breathStyle : fadeStyle}>
      {children}
    </div>
  );
}

/**
 * PhaseTransition - Wrapper specifically for Discovery→Execution transitions
 * Uses "The Breath" animation pattern from UX spec
 */
export function PhaseTransition({ children }: { children: ReactNode }) {
  return (
    <PageTransition variant="breath" duration={400}>
      {children}
    </PageTransition>
  );
}

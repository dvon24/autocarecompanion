'use client';

import { useEffect, useState, type ReactNode } from 'react';

/**
 * PageTransition - Simple fade-in wrapper for page content
 *
 * Provides a smooth fade-in animation when pages mount.
 * Per AC #5: "screen fades into the AI symptom chat interface"
 */

type PageTransitionProps = {
  children: ReactNode;
  duration?: number; // Duration in milliseconds (default 300ms per story)
};

export function PageTransition({ children, duration = 300 }: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to ensure CSS transition triggers
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="transition-opacity ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

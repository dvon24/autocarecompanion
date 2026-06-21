'use client';

import { useEffect, useState } from 'react';

/**
 * Floating "back to top" button for the long known-issues pages — a model can
 * carry dozens of issue cards, and Devon wanted a way out of "the sea of known
 * issues." Appears after the user has scrolled past the fold, smooth-scrolls to
 * the top, and sits clear of any sticky bottom CTA.
 */
export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-24 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-[#0B1220] text-white shadow-lg ring-1 ring-black/10 transition-opacity hover:bg-[#1e293b] sm:bottom-6"
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
}

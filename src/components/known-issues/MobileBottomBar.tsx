'use client';

import Link from 'next/link';

/**
 * Sticky bottom bar on mobile /known-issues/[slug] pages.
 *
 * Mirrors the desktop Known Issues conversion CTA so the label and
 * destination stay consistent across breakpoints.
 */
export function MobileBottomBar() {
  return (
    <div
      className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-3 pt-2 z-50 flex gap-2 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]"
      // Clear the iPhone home indicator in installed-PWA mode (requires
      // viewport-fit=cover, set in the root layout viewport export).
      style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
    >
      <Link
        href="/get-started"
        className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white bg-[#3B82F6] rounded-lg active:bg-[#2563EB] transition-colors min-h-[44px]"
        aria-label="Get started with Au7o"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        Get Started
      </Link>
    </div>
  );
}

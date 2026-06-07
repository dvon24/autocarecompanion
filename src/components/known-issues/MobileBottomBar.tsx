'use client';

import Link from 'next/link';
import { vehicleSlug } from '@/lib/vehicle-slug';

interface MobileBottomBarProps {
  make: string;
  model: string;
  /** Year to ground the vehicle-hub deep link. Pass the requested ?year=YYYY
   *  if valid, otherwise the most recent documented year from the article. */
  hubYear: number;
}

/**
 * Sticky bottom bar on mobile /known-issues/[slug] pages.
 *
 * Two-button layout (primary + secondary) is the standard mobile CTA
 * pattern. Primary = "Open Vehicle Hub" because that's the rich
 * conversational surface where users actually solve problems; secondary
 * = "Chat" as a fallback for users who just want quick symptom Q&A.
 *
 * Single-button bottom bars waste real estate on mobile where this is
 * the user's most reliable navigation surface. 67% of traffic is
 * mobile — this bar is the conversion lever.
 */
export function MobileBottomBar({ make, model, hubYear }: MobileBottomBarProps) {
  const hubSlug = vehicleSlug(hubYear, make, model);
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-3 py-2 z-50 flex gap-2 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
      <Link
        href={`/vehicle/${hubSlug}`}
        className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg active:bg-blue-700 transition-colors min-h-[44px]"
        aria-label={`Open ${hubYear} ${make} ${model} vehicle hub`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        Open Vehicle Hub
      </Link>
      {/* Secondary "Chat" button removed — it routed to the legacy
          /symptom-chat surface. The primary "Open Vehicle Hub" already
          covers the conversational entry point. */}
    </div>
  );
}

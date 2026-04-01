'use client';

import Link from 'next/link';

interface MobileBottomBarProps {
  make: string;
  model: string;
}

export function MobileBottomBar({ make, model }: MobileBottomBarProps) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50 flex gap-2">
      <Link
        href={`/symptom-chat?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`}
        className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        Chat
      </Link>
      <Link
        href="/get-started"
        className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-emerald-600 border border-emerald-200 rounded-lg"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        Parts
      </Link>
    </div>
  );
}

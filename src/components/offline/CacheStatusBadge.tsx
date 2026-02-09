'use client';

import { useState } from 'react';

/**
 * CacheStatusBadge - Shows if a guide is cached for offline use
 *
 * Story 2.2: Cache Status Badge & Proactive Caching
 *
 * Features:
 * - Shows "Cached for offline" when cached
 * - Shows "Cache for offline" button when not cached
 * - Loading state during caching
 */

type CacheStatusBadgeProps = {
  isCached: boolean;
  onCache?: () => Promise<void>;
  variant?: 'badge' | 'button';
  className?: string;
};

export function CacheStatusBadge({
  isCached,
  onCache,
  variant = 'badge',
  className = '',
}: CacheStatusBadgeProps) {
  const [isCaching, setIsCaching] = useState(false);

  const handleCache = async () => {
    if (isCached || isCaching || !onCache) return;

    setIsCaching(true);
    try {
      await onCache();
    } finally {
      setIsCaching(false);
    }
  };

  if (isCached) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium ${className}`}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Cached for offline
      </span>
    );
  }

  if (variant === 'button' && onCache) {
    return (
      <button
        type="button"
        onClick={handleCache}
        disabled={isCaching}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
          isCaching
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
        } ${className}`}
      >
        {isCaching ? (
          <>
            <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Caching...
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Save for offline
          </>
        )}
      </button>
    );
  }

  // Badge variant without cache action
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium ${className}`}
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
      </svg>
      Online only
    </span>
  );
}

/**
 * Cached guides list component
 */
type CachedGuide = {
  id: string;
  title: string;
  vehicleInfo: string;
  cachedAt: number;
};

type CachedGuidesListProps = {
  guides: CachedGuide[];
  onSelect?: (guideId: string) => void;
  onRemove?: (guideId: string) => void;
};

export function CachedGuidesList({
  guides,
  onSelect,
  onRemove,
}: CachedGuidesListProps) {
  if (guides.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </div>
        <p className="text-gray-600 font-medium">No cached guides</p>
        <p className="text-sm text-gray-400 mt-1">
          Save guides for offline access in your garage.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {guides.map((guide) => (
        <div
          key={guide.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
        >
          <button
            type="button"
            onClick={() => onSelect?.(guide.id)}
            className="flex-1 text-left"
          >
            <h4 className="font-medium text-gray-900 text-sm">{guide.title}</h4>
            <p className="text-xs text-gray-500">{guide.vehicleInfo}</p>
          </button>

          <div className="flex items-center gap-2">
            <CacheStatusBadge isCached />

            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(guide.id)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                aria-label="Remove from cache"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

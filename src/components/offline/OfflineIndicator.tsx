'use client';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';

/**
 * OfflineIndicator - Displays when user is offline
 *
 * Story 2.3: Offline State Detection & Indication
 * Shows a prominent but non-intrusive banner when offline.
 *
 * Features:
 * - Auto-hides when online
 * - Dismissible (optional)
 * - Clear messaging about available features
 */

type OfflineIndicatorProps = {
  /** Position of the indicator */
  position?: 'top' | 'bottom';
  /** Show available features while offline */
  showFeatures?: boolean;
  /** Custom class name */
  className?: string;
};

export function OfflineIndicator({
  position = 'top',
  showFeatures = false,
  className = '',
}: OfflineIndicatorProps) {
  const { isOffline } = useOnlineStatus();

  if (!isOffline) return null;

  const positionClasses = position === 'top'
    ? 'top-0 left-0 right-0'
    : 'bottom-0 left-0 right-0';

  return (
    <div
      className={`fixed ${positionClasses} z-50 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="bg-amber-500 text-white px-4 py-2">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Offline Icon */}
            <div className="flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
                />
              </svg>
            </div>

            <div>
              <p className="font-medium text-sm">You&apos;re offline</p>
              {showFeatures && (
                <p className="text-xs text-amber-100 mt-0.5">
                  Cached guides still work. AI features need internet.
                </p>
              )}
            </div>
          </div>

          {/* Optional: Connection retry button */}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex-shrink-0 text-xs font-medium px-3 py-1 bg-amber-600 hover:bg-amber-700 rounded transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact offline badge for inline use
 */
export function OfflineBadge() {
  const { isOffline } = useOnlineStatus();

  if (!isOffline) return null;

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
      <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
      Offline
    </span>
  );
}

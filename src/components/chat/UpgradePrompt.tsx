'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface UpgradePromptProps {
  resetDate?: Date | null;
  variant?: 'full' | 'compact' | 'inline';
  className?: string;
  callbackUrl?: string;
}

/**
 * Upgrade prompt shown to anonymous users who have reached their chat limit
 *
 * Epic 5, Story 5.9: Rate Limiting
 */
export function UpgradePrompt({
  resetDate,
  variant = 'full',
  className = '',
}: UpgradePromptProps) {
  const resetText = resetDate
    ? formatDistanceToNow(resetDate, { addSuffix: true })
    : 'next week';

  if (variant === 'inline') {
    return (
      <div className={`text-center py-4 ${className}`}>
        <p className="text-gray-600 text-sm mb-2">
          Free preview complete.{' '}
          <Link href="/known-issues" className="text-blue-600 hover:text-blue-700 font-medium">
            Browse known issues →
          </Link>
        </p>
        <p className="text-xs text-gray-400">
          Or wait until {resetText}
        </p>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={`bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 ${className}`}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-gray-900 text-sm">
              Free preview complete
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Browse known issues or return when the free limit resets
            </p>
          </div>
          <Link
            href="/known-issues"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            Browse issues
          </Link>
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div
      className={`bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-2xl p-8 text-center ${className}`}
    >
      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">
        Keep your Au7o conversation going.
      </h3>

      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Browse known issues for this vehicle, or return when the free preview
        resets.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/known-issues"
          className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25"
        >
          Browse known issues
        </Link>
      </div>

      {/* Features preview — matches the pricing brief's Au7o Pro tier */}
    </div>
  );
}

/**
 * Remaining chats indicator for anonymous users
 */
export function RemainingChatsIndicator({
  remaining,
  className = '',
}: {
  remaining: number;
  className?: string;
}) {
  if (remaining === Infinity) return null;

  const isLow = remaining <= 2;
  const isEmpty = remaining === 0;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${
        isEmpty
          ? 'bg-red-100 text-red-700'
          : isLow
          ? 'bg-yellow-100 text-yellow-700'
          : 'bg-gray-100 text-gray-600'
      } ${className}`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          isEmpty ? 'bg-red-500' : isLow ? 'bg-yellow-500' : 'bg-green-500'
        }`}
      />
      <span className="font-medium">
        {isEmpty ? 'No chats left' : `${remaining} chat${remaining !== 1 ? 's' : ''} left`}
      </span>
    </div>
  );
}

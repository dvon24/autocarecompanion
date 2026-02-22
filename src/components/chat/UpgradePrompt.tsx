'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface UpgradePromptProps {
  resetDate?: Date | null;
  variant?: 'full' | 'compact' | 'inline';
  className?: string;
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
          You&apos;ve used all your free chats.{' '}
          <Link href="/subscribe" className="text-blue-600 hover:text-blue-700 font-medium">
            Subscribe for unlimited
          </Link>
        </p>
        <p className="text-xs text-gray-400">
          Resets {resetText}
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
              Chat limit reached
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Resets {resetText}
            </p>
          </div>
          <Link
            href="/subscribe"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            Subscribe
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
        You&apos;ve used your 5 free chats this week
      </h3>

      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Subscribe to unlock unlimited AI diagnoses, maintenance tracking,
        smart notifications, and the AI garage assistant.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/subscribe"
          className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25"
        >
          Subscribe - $9.99/month
        </Link>
        <p className="text-sm text-gray-500">
          or wait until {resetText}
        </p>
      </div>

      {/* Features preview */}
      <div className="mt-8 pt-6 border-t border-blue-200/50">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-4">
          Subscriber benefits
        </p>
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-left">
          {[
            'Unlimited AI chats',
            'Vehicle garage',
            'Maintenance tracking',
            'Smart notifications',
            'AI garage assistant',
            'No ads',
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-sm">
              <svg
                className="w-4 h-4 text-green-500 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>
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

'use client';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';

/**
 * OfflineFeatureGuard - Graceful degradation for online-only features
 *
 * Story 2.5: Graceful Degradation for Online Features
 *
 * Wraps online-only features and shows helpful messages when offline.
 */

type OfflineFeatureGuardProps = {
  /** Feature name for the message */
  featureName: string;
  /** Description of what the feature does */
  description?: string;
  /** What users can do instead while offline */
  offlineAlternative?: string;
  /** Children to render when online */
  children: React.ReactNode;
  /** Render a disabled version instead of hiding completely */
  showDisabled?: boolean;
};

export function OfflineFeatureGuard({
  featureName,
  description,
  offlineAlternative,
  children,
  showDisabled = false,
}: OfflineFeatureGuardProps) {
  const { isOffline } = useOnlineStatus();

  if (!isOffline) {
    return <>{children}</>;
  }

  if (showDisabled) {
    return (
      <div className="relative">
        {/* Disabled content with overlay */}
        <div className="opacity-50 pointer-events-none" aria-hidden="true">
          {children}
        </div>
        {/* Offline message */}
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
          <div className="text-center p-4 max-w-xs">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-amber-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {featureName} requires internet
            </p>
            {offlineAlternative && (
              <p className="text-xs text-gray-500 mt-1">{offlineAlternative}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Full replacement message
  return (
    <div className="p-6 text-center bg-gray-50 rounded-xl border border-gray-200">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
        <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
        </svg>
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">
        {featureName} requires internet
      </h3>
      {description && (
        <p className="text-sm text-gray-500 mb-3">{description}</p>
      )}
      {offlineAlternative && (
        <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-200">
          <span className="font-medium">While offline:</span> {offlineAlternative}
        </p>
      )}
    </div>
  );
}

/**
 * OfflineDisabledButton - Button that disables when offline
 */
type OfflineDisabledButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Message to show in tooltip when disabled */
  offlineMessage?: string;
};

export function OfflineDisabledButton({
  children,
  offlineMessage = 'Requires internet connection',
  disabled,
  className = '',
  ...props
}: OfflineDisabledButtonProps) {
  const { isOffline } = useOnlineStatus();
  const isDisabled = disabled || isOffline;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={`${className} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isOffline ? offlineMessage : undefined}
    >
      {children}
      {isOffline && (
        <span className="ml-2 inline-flex">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
          </svg>
        </span>
      )}
    </button>
  );
}

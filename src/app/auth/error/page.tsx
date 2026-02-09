'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

/**
 * Auth Error Page
 *
 * Epic 4: User Accounts & Sync
 * Story 4.2: Sign In/Sign Up UI
 *
 * Displays authentication errors with helpful messages.
 */

const errorMessages: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'Access was denied. You may not have permission to sign in.',
  Verification: 'The verification link has expired or has already been used.',
  Default: 'An error occurred during authentication.',
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'Default';
  const errorMessage = errorMessages[error] || errorMessages.Default;

  return (
    <div className="relative text-center px-6">
      {/* Error Icon */}
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <h1 className="text-2xl font-semibold text-gray-900 mb-2">
        Authentication Error
      </h1>
      <p className="text-gray-500 mb-8 max-w-sm mx-auto">
        {errorMessage}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/auth/signin"
          className="px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-all duration-200"
        >
          Try again
        </Link>
        <Link
          href="/"
          className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-white font-[system-ui,sans-serif] relative overflow-hidden flex items-center justify-center">
      {/* Gradient blobs */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          transform: 'translate(20%, -30%)',
          opacity: 0.4,
        }}
      />

      <Suspense fallback={
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 animate-pulse" />
          <div className="h-6 w-48 bg-gray-100 rounded mx-auto mb-2 animate-pulse" />
          <div className="h-4 w-64 bg-gray-100 rounded mx-auto animate-pulse" />
        </div>
      }>
        <ErrorContent />
      </Suspense>
    </div>
  );
}

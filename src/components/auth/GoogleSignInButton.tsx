'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

/**
 * "Continue with Google" — the single biggest signup-conversion lever (one tap,
 * no password, no confirm, no checkbox friction). Renders only when Google OAuth
 * is actually configured: set NEXT_PUBLIC_GOOGLE_AUTH=1 in Vercel alongside
 * GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET so the button never shows dead.
 */
export function GoogleSignInButton({ callbackUrl }: { callbackUrl: string }) {
  const [loading, setLoading] = useState(false);
  if (process.env.NEXT_PUBLIC_GOOGLE_AUTH !== '1') return null;
  return (
    <button
      type="button"
      onClick={() => { setLoading(true); signIn('google', { callbackUrl }); }}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-xl bg-white text-gray-800 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-60"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z" />
        <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 010-4.22V7.05H2.18a11 11 0 000 9.9l3.66-2.84z" />
        <path fill="#EA4335" d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.44 14.97.5 12 .5A11 11 0 002.18 7.05l3.66 2.84C6.71 6.68 9.14 4.75 12 4.75z" />
      </svg>
      {loading ? 'Connecting…' : 'Continue with Google'}
    </button>
  );
}

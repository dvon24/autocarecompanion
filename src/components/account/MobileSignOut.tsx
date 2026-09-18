'use client';

import { signOut } from 'next-auth/react';

/**
 * Shared in-page sign out control for account and enrollment completion,
 * available at both phone and desktop widths.
 */
export default function MobileSignOut() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="mt-2 py-3 w-full bg-white border border-stone-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-stone-50 transition-colors"
    >
      Sign out
    </button>
  );
}
